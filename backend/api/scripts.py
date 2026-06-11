from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
from models.script import Script, ScriptStatus
from models.user import User
from api.auth import get_current_user_dep
from services.crew_service import run_script_generation
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class ScriptRequest(BaseModel):
    title: str
    user_request: str
    os_type: str = "ubuntu"
    stack: str = "mern"
    output_type: str = "bash"
    security_mode: bool = False
    minimal_install: bool = False
    full_dev_setup: bool = False


class ScriptResponse(BaseModel):
    id: int
    title: str
    status: str
    os_type: str
    stack: str
    output_type: str
    script_content: Optional[str] = None
    documentation: Optional[str] = None
    summary: Optional[str] = None
    dependency_tree: Optional[dict] = None
    risk_analysis: Optional[str] = None
    agent_logs: Optional[list] = None
    created_at: str

    class Config:
        from_attributes = True


@router.post("/generate-script", response_model=ScriptResponse)
async def generate_script(
    request: ScriptRequest,
    current_user: User = Depends(get_current_user_dep),
    db: AsyncSession = Depends(get_db),
):
    # Create script record
    script = Script(
        user_id=current_user.id,
        title=request.title,
        user_request=request.user_request,
        os_type=request.os_type,
        stack=request.stack,
        output_type=request.output_type,
        security_mode=request.security_mode,
        minimal_install=request.minimal_install,
        full_dev_setup=request.full_dev_setup,
        status=ScriptStatus.PROCESSING,
    )
    db.add(script)
    await db.commit()
    await db.refresh(script)

    try:
        result = await run_script_generation(
            user_request=request.user_request,
            os_type=request.os_type,
            stack=request.stack,
            output_type=request.output_type,
            security_mode=request.security_mode,
            minimal_install=request.minimal_install,
            full_dev_setup=request.full_dev_setup,
        )

        script.status = ScriptStatus.COMPLETED
        script.script_content = result.get("script_content", "")
        script.documentation = result.get("documentation", "")
        script.summary = result.get("summary", "")
        script.dependency_tree = result.get("dependency_tree", {})
        script.risk_analysis = result.get("risk_analysis", "")
        script.agent_logs = result.get("agent_logs", [])

    except Exception as e:
        logger.error(f"Script generation failed: {e}")
        script.status = ScriptStatus.FAILED
        script.agent_logs = [{"agent": "System", "message": str(e), "status": "error"}]

    await db.commit()
    await db.refresh(script)

    return ScriptResponse(
        id=script.id,
        title=script.title,
        status=script.status.value,
        os_type=script.os_type,
        stack=script.stack,
        output_type=script.output_type,
        script_content=script.script_content,
        documentation=script.documentation,
        summary=script.summary,
        dependency_tree=script.dependency_tree,
        risk_analysis=script.risk_analysis,
        agent_logs=script.agent_logs,
        created_at=str(script.created_at),
    )


@router.post("/analyze-request")
async def analyze_request(
    request: dict,
    current_user: User = Depends(get_current_user_dep),
):
    """Quick analysis of user request without full generation."""
    user_request = request.get("user_request", "")

    analysis = {
        "detected_stack": detect_stack(user_request),
        "detected_os": detect_os(user_request),
        "estimated_time": "2-5 minutes",
        "complexity": get_complexity(user_request),
        "suggestions": get_suggestions(user_request),
    }
    return analysis


@router.post("/validate-script")
async def validate_script(
    request: dict,
    current_user: User = Depends(get_current_user_dep),
):
    """Validate a script for security issues."""
    script_content = request.get("script_content", "")

    dangerous_patterns = [
        "rm -rf /", "rm -rf /*", ":(){ :|:& };:", "dd if=/dev/zero",
        "mkfs.", "> /dev/sda", "chmod -R 777 /", "wget http://",
        "curl http://", "eval $(", "base64 -d",
    ]

    warnings = []
    for pattern in dangerous_patterns:
        if pattern in script_content:
            warnings.append(f"Potentially dangerous pattern detected: {pattern}")

    return {
        "is_safe": len(warnings) == 0,
        "warnings": warnings,
        "line_count": len(script_content.split("\n")),
        "size_bytes": len(script_content.encode()),
    }


@router.get("/download-script/{script_id}")
async def download_script(
    script_id: int,
    current_user: User = Depends(get_current_user_dep),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Script).where(Script.id == script_id, Script.user_id == current_user.id)
    )
    script = result.scalar_one_or_none()

    if not script:
        raise HTTPException(status_code=404, detail="Script not found")

    return {
        "script_content": script.script_content,
        "documentation": script.documentation,
        "filename": f"{script.title.lower().replace(' ', '_')}_{script.os_type}.sh",
    }


def detect_stack(text: str) -> str:
    text_lower = text.lower()
    if any(w in text_lower for w in ["mern", "mongodb", "react", "express", "node"]):
        return "mern"
    if any(w in text_lower for w in ["python", "ml", "machine learning", "tensorflow", "pytorch"]):
        return "python_ml"
    if any(w in text_lower for w in ["devops", "ci/cd", "pipeline", "terraform", "ansible"]):
        return "devops"
    if any(w in text_lower for w in ["java", "spring", "maven", "gradle"]):
        return "java"
    if any(w in text_lower for w in ["docker", "container"]):
        return "docker"
    if any(w in text_lower for w in ["kubernetes", "k8s", "kubectl"]):
        return "kubernetes"
    return "custom"


def detect_os(text: str) -> str:
    text_lower = text.lower()
    if any(w in text_lower for w in ["ubuntu", "debian", "linux"]):
        return "ubuntu"
    if any(w in text_lower for w in ["windows", "win", "powershell"]):
        return "windows"
    if any(w in text_lower for w in ["mac", "macos", "osx", "brew"]):
        return "macos"
    return "ubuntu"


def get_complexity(text: str) -> str:
    word_count = len(text.split())
    if word_count < 10:
        return "simple"
    elif word_count < 30:
        return "moderate"
    return "complex"


def get_suggestions(text: str) -> list:
    suggestions = ["Consider specifying exact version requirements"]
    if "development" in text.lower():
        suggestions.append("Add --dev flag for development dependencies")
    if "production" in text.lower():
        suggestions.append("Consider using Docker for production deployments")
    return suggestions
