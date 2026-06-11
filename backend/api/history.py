from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from typing import List, Optional
from database import get_db
from models.script import Script, ScriptStatus
from models.user import User
from api.auth import get_current_user_dep
from pydantic import BaseModel

router = APIRouter()


class ScriptSummary(BaseModel):
    id: int
    title: str
    status: str
    os_type: str
    stack: str
    output_type: str
    summary: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True


@router.get("/history", response_model=dict)
async def get_history(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user_dep),
    db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * limit

    total_result = await db.execute(
        select(func.count(Script.id)).where(Script.user_id == current_user.id)
    )
    total = total_result.scalar()

    result = await db.execute(
        select(Script)
        .where(Script.user_id == current_user.id)
        .order_by(desc(Script.created_at))
        .offset(offset)
        .limit(limit)
    )
    scripts = result.scalars().all()

    return {
        "scripts": [
            {
                "id": s.id,
                "title": s.title,
                "status": s.status.value,
                "os_type": s.os_type,
                "stack": s.stack,
                "output_type": s.output_type,
                "summary": s.summary,
                "created_at": str(s.created_at),
            }
            for s in scripts
        ],
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
    }


@router.get("/history/{script_id}")
async def get_script_detail(
    script_id: int,
    current_user: User = Depends(get_current_user_dep),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Script).where(Script.id == script_id, Script.user_id == current_user.id)
    )
    script = result.scalar_one_or_none()

    if not script:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Script not found")

    return {
        "id": script.id,
        "title": script.title,
        "user_request": script.user_request,
        "status": script.status.value,
        "os_type": script.os_type,
        "stack": script.stack,
        "output_type": script.output_type,
        "security_mode": script.security_mode,
        "minimal_install": script.minimal_install,
        "full_dev_setup": script.full_dev_setup,
        "script_content": script.script_content,
        "documentation": script.documentation,
        "summary": script.summary,
        "dependency_tree": script.dependency_tree,
        "risk_analysis": script.risk_analysis,
        "agent_logs": script.agent_logs,
        "created_at": str(script.created_at),
    }


@router.delete("/history/{script_id}")
async def delete_script(
    script_id: int,
    current_user: User = Depends(get_current_user_dep),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Script).where(Script.id == script_id, Script.user_id == current_user.id)
    )
    script = result.scalar_one_or_none()

    if not script:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Script not found")

    await db.delete(script)
    await db.commit()
    return {"message": "Script deleted successfully"}
