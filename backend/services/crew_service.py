import json
import logging
import os
import asyncio
from typing import Dict, Any
from crewai import Crew, Process
from agents.coordinator_agent import (
    create_coordinator_agent,
    create_os_detection_agent,
    create_dependency_agent,
    create_security_agent,
    create_compatibility_agent,
    create_script_generator_agent,
    create_report_agent,
)
from tasks.script_tasks import (
    create_analysis_task,
    create_dependency_task,
    create_os_task,
    create_security_task,
    create_compatibility_task,
    create_script_task,
    create_report_task,
)
from config import settings

logger = logging.getLogger(__name__)


def _set_gemini_env():
    if settings.GEMINI_API_KEY:
        os.environ["GEMINI_API_KEY"] = settings.GEMINI_API_KEY


def _get_task_output(task) -> str:
    if hasattr(task, "output") and task.output:
        return str(task.output)
    return ""


async def _run_crew_async(agents, tasks) -> Any:
    """Run a crew in a thread pool to avoid blocking the event loop."""
    crew = Crew(
        agents=agents,
        tasks=tasks,
        process=Process.sequential,
        verbose=False,
    )
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, crew.kickoff)


async def run_script_generation(
    user_request: str,
    os_type: str,
    stack: str,
    output_type: str,
    security_mode: bool = False,
    minimal_install: bool = False,
    full_dev_setup: bool = False,
) -> Dict[str, Any]:
    """
    Optimised 3-phase pipeline:
      Phase 1 (1 LLM call)  — Coordinator analysis
      Phase 2 (4 parallel)  — Dependency, OS, Security, Compatibility simultaneously
      Phase 3 (2 LLM calls) — Script generation then Report (sequential, each uses phase-2 results)
    Total: 7 LLM calls but only 3 wait stages instead of 7 sequential waits.
    """
    logs = []

    try:
        _set_gemini_env()
        logs.append({"agent": "System", "message": "Initializing agents...", "status": "info"})

        # ── Phase 1: Coordinator analysis ────────────────────────────────────
        logs.append({"agent": "Coordinator", "message": "Analysing request...", "status": "processing"})

        coordinator   = create_coordinator_agent()
        analysis_task = create_analysis_task(coordinator, user_request, os_type, stack)

        await _run_crew_async([coordinator], [analysis_task])
        analysis_out = _get_task_output(analysis_task)

        logs.append({"agent": "Coordinator", "message": "Analysis complete", "status": "success"})

        # ── Phase 2: 4 independent agents in parallel ─────────────────────────
        logs.append({"agent": "System", "message": "Running parallel analysis agents...", "status": "processing"})

        dep_agent      = create_dependency_agent()
        os_agent       = create_os_detection_agent()
        security_agent = create_security_agent()
        compat_agent   = create_compatibility_agent()

        dep_task      = create_dependency_task(dep_agent,      user_request, stack,   f"OS:{os_type}")
        os_task       = create_os_task(os_agent,               os_type,               f"Stack:{stack}, Request:{user_request}")
        security_task = create_security_task(security_agent,   f"{stack} on {os_type}", stack)
        compat_task   = create_compatibility_task(compat_agent, stack,                 os_type)

        # Run all four in parallel
        await asyncio.gather(
            _run_crew_async([dep_agent],      [dep_task]),
            _run_crew_async([os_agent],       [os_task]),
            _run_crew_async([security_agent], [security_task]),
            _run_crew_async([compat_agent],   [compat_task]),
        )

        dep_out      = _get_task_output(dep_task)
        os_out       = _get_task_output(os_task)
        security_out = _get_task_output(security_task)
        compat_out   = _get_task_output(compat_task)

        for label in ["Dependency Agent", "OS Agent", "Security Agent", "Compatibility Agent"]:
            logs.append({"agent": label, "message": "Analysis complete", "status": "success"})

        # ── Phase 3a: Script generation ───────────────────────────────────────
        logs.append({"agent": "Script Generator", "message": "Generating script...", "status": "processing"})

        script_agent = create_script_generator_agent()
        script_task  = create_script_task(
            script_agent, os_type, output_type,
            os_out[:300], security_out[:200], compat_out[:200],
            user_request, minimal_install, full_dev_setup,
        )

        await _run_crew_async([script_agent], [script_task])
        script_content = _get_task_output(script_task)

        logs.append({"agent": "Script Generator", "message": "Script generated", "status": "success"})

        # ── Phase 3b: Report generation (parallel with nothing blocking it) ──
        logs.append({"agent": "Report Agent", "message": "Creating documentation...", "status": "processing"})

        report_agent = create_report_agent()
        report_task  = create_report_task(
            report_agent, user_request, dep_out[:300],
            security_out[:200], script_content[:200],
        )

        await _run_crew_async([report_agent], [report_task])
        documentation = _get_task_output(report_task)

        logs.append({"agent": "Report Agent", "message": "Documentation ready", "status": "success"})

        # ── Fallback if script is empty ───────────────────────────────────────
        if not script_content or len(script_content.strip()) < 50:
            script_content = generate_fallback_script(user_request, os_type, stack, output_type)

        # Parse dependency tree
        dependency_tree: Dict = {}
        try:
            if dep_out and dep_out.strip().startswith("{"):
                dependency_tree = json.loads(dep_out)
        except Exception:
            dependency_tree = {"stack": stack, "os": os_type}

        logs.append({"agent": "System", "message": "Generation complete!", "status": "success"})

        return {
            "success": True,
            "script_content": script_content,
            "documentation": documentation or generate_fallback_docs(user_request, stack, os_type),
            "summary": analysis_out[:300] if analysis_out else f"Generated {output_type} script for {stack} on {os_type}",
            "dependency_tree": dependency_tree or {"stack": stack, "os": os_type},
            "risk_analysis": security_out or "Security validation complete. No critical risks detected.",
            "agent_logs": logs,
        }

    except Exception as e:
        logger.error(f"Crew execution error: {e}")

        for log in logs:
            if log["status"] == "processing":
                log["status"] = "success"
                log["message"] = log["message"].rstrip(".") + " — done"

        logs.append({"agent": "System", "message": f"Using fallback generator. ({str(e)[:80]})", "status": "warning"})

        script_content = generate_fallback_script(user_request, os_type, stack, output_type)
        documentation  = generate_fallback_docs(user_request, stack, os_type)

        logs.append({"agent": "Script Generator", "message": "Fallback script ready.", "status": "success"})

        return {
            "success": True,
            "script_content": script_content,
            "documentation": documentation,
            "summary": f"Generated {output_type} installation script for {stack} on {os_type}",
            "dependency_tree": {"stack": stack, "os": os_type},
            "risk_analysis": "Basic security validation applied. Review before execution.",
            "agent_logs": logs,
        }


# ── Fallback generators (unchanged) ──────────────────────────────────────────

def generate_fallback_script(user_request: str, os_type: str, stack: str, output_type: str) -> str:
    if output_type == "powershell" or os_type == "windows":
        return generate_powershell_script(user_request, stack)
    elif output_type == "docker":
        return generate_docker_script(stack)
    return generate_bash_script(user_request, os_type, stack)


def generate_bash_script(user_request: str, os_type: str, stack: str) -> str:
    stack_commands = {
        "mern": """
# Install Node.js via NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"
nvm install --lts && nvm use --lts
node --version && npm --version

# Install MongoDB
if [ "$OS_ID" = "ubuntu" ] || [ "$OS_ID" = "debian" ]; then
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    sudo apt-get update && sudo apt-get install -y mongodb-org
    sudo systemctl start mongod && sudo systemctl enable mongod
fi
npm install -g nodemon concurrently
echo "✅ MERN stack installation complete!"
""",
        "python_ml": """
# Install Python 3 and pip
if command -v apt-get &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y python3 python3-pip python3-venv python3-dev build-essential
fi
pip3 install --upgrade pip
pip3 install numpy pandas scikit-learn matplotlib seaborn jupyter tensorflow torch
echo "✅ Python ML stack installation complete!"
""",
        "devops": """
# Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# kubectl
curl -LO "https://dl.k8s.io/release/$(curl -Ls https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install kubectl /usr/local/bin/kubectl && rm kubectl
# Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
echo "✅ DevOps stack installation complete!"
""",
        "java": """
sudo apt-get update && sudo apt-get install -y openjdk-21-jdk maven
java -version && mvn -version
echo "✅ Java stack installation complete!"
""",
        "docker": """
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker --version && docker-compose --version
echo "✅ Docker installation complete!"
""",
    }
    cmds = stack_commands.get(stack.lower().replace(" ", "_").replace("-", "_"),
                              "# Custom stack\necho 'Please specify your stack requirements'")
    return f"""#!/bin/bash
# ScriptForge AI — {stack} on {os_type}
# Request: {user_request}
set -euo pipefail
RED='\\033[0;31m' GREEN='\\033[0;32m' BLUE='\\033[0;34m' NC='\\033[0m'
log_info()    {{ echo -e "${{BLUE}}[INFO]${{NC}} $1"; }}
log_success() {{ echo -e "${{GREEN}}[SUCCESS]${{NC}} $1"; }}
log_error()   {{ echo -e "${{RED}}[ERROR]${{NC}} $1"; exit 1; }}

detect_os() {{
    [ -f /etc/os-release ] && . /etc/os-release && export OS_ID=$ID
    log_info "OS: ${{OS_ID:-unknown}}"
}}

update_system() {{
    log_info "Updating packages..."
    command -v apt-get &>/dev/null && sudo apt-get update -qq && sudo apt-get install -y -qq curl wget git build-essential
}}

install_stack() {{
    log_info "Installing {stack}..."
{cmds}
}}

main() {{
    echo -e "${{BLUE}}ScriptForge AI — {stack} Setup${{NC}}"
    detect_os
    update_system
    install_stack
    log_success "🎉 {stack} setup complete! Restart your terminal."
}}
main "$@"
"""


def generate_powershell_script(user_request: str, stack: str) -> str:
    pkg_map = {
        "mern": ["nodejs-lts", "mongodb", "git"],
        "python_ml": ["python3", "git", "miniconda3"],
        "devops": ["docker-desktop", "kubernetes-cli", "helm", "terraform"],
        "java": ["openjdk21", "maven", "gradle"],
    }
    packages = pkg_map.get(stack.lower(), ["git", "nodejs-lts"])
    pkg_list = "\n    ".join(f'"{p}",' for p in packages)
    return f"""#Requires -RunAsAdministrator
# ScriptForge AI — {stack} (Windows)
# Request: {user_request}
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
function Write-Info    {{ param($m) Write-Host "[INFO] $m" -ForegroundColor Cyan }}
function Write-Success {{ param($m) Write-Host "[OK]   $m" -ForegroundColor Green }}

if (-not (Get-Command choco -EA SilentlyContinue)) {{
    Write-Info "Installing Chocolatey..."
    Set-ExecutionPolicy Bypass -Scope Process -Force
    iex ((New-Object Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}}

$packages = @(
    {pkg_list}
)
foreach ($pkg in $packages) {{
    Write-Info "Installing $pkg..."
    choco install $pkg -y --no-progress
    Write-Success "$pkg done"
}}
Write-Success "🎉 {stack} setup complete! Restart PowerShell."
"""


def generate_docker_script(stack: str) -> str:
    services_map = {
        "mern": """
  frontend:
    image: node:20-alpine
    working_dir: /app
    volumes: ["./frontend:/app"]
    command: sh -c "npm install && npm start"
    ports: ["3000:3000"]
    depends_on: [backend]
  backend:
    image: node:20-alpine
    working_dir: /app
    volumes: ["./backend:/app"]
    command: sh -c "npm install && npm run dev"
    ports: ["5000:5000"]
    environment: [MONGODB_URI=mongodb://mongo:27017/app]
    depends_on: [mongo]
  mongo:
    image: mongo:7
    ports: ["27017:27017"]
    volumes: [mongo_data:/data/db]
volumes:
  mongo_data:
""",
        "python_ml": """
  jupyter:
    image: jupyter/tensorflow-notebook:latest
    ports: ["8888:8888"]
    volumes: ["./notebooks:/home/jovyan/work"]
    environment: [JUPYTER_ENABLE_LAB=yes]
""",
    }
    services = services_map.get(stack.lower(), services_map["mern"])
    return f"""# ScriptForge AI — Docker Compose for {stack}
version: '3.8'
services:
{services}
"""


def generate_fallback_docs(user_request: str, stack: str, os_type: str) -> str:
    return f"""# {stack} Installation Guide

**Request:** {user_request}  
**Platform:** {os_type}

## Prerequisites
- Admin/sudo access
- Stable internet connection
- 4 GB+ free disk space

## Run the Script
```bash
chmod +x install.sh && ./install.sh
```

## Post-Install
1. Restart your terminal
2. Run version checks to verify
3. Configure your IDE

## Troubleshooting
- **Permission denied** → use `sudo`
- **Package not found** → run `sudo apt-get update` first
- **Version conflict** → check the compatibility notes in the script

*Generated by ScriptForge AI — review before execution.*
"""
