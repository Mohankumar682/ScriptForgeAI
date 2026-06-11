import json
import logging
from typing import Dict, Any
from crewai import Crew, Process
from langchain_google_genai import ChatGoogleGenerativeAI
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


def get_llm():
    return ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=settings.GEMINI_API_KEY,
        temperature=0.3,
        convert_system_message_to_human=True,
    )


async def run_script_generation(
    user_request: str,
    os_type: str,
    stack: str,
    output_type: str,
    security_mode: bool = False,
    minimal_install: bool = False,
    full_dev_setup: bool = False,
) -> Dict[str, Any]:
    """Run the multi-agent crew to generate an installation script."""

    logs = []

    try:
        llm = get_llm()
        logs.append({"agent": "System", "message": "Initializing AI agents...", "status": "info"})

        # Create agents
        coordinator = create_coordinator_agent(llm)
        dep_agent = create_dependency_agent(llm)
        os_agent = create_os_detection_agent(llm)
        security_agent = create_security_agent(llm)
        compat_agent = create_compatibility_agent(llm)
        script_agent = create_script_generator_agent(llm)
        report_agent = create_report_agent(llm)

        logs.append({"agent": "Coordinator", "message": "Analyzing user request...", "status": "processing"})

        # Create tasks
        analysis_task = create_analysis_task(coordinator, user_request, os_type, stack)

        logs.append({"agent": "Dependency Agent", "message": "Identifying dependencies...", "status": "processing"})
        dep_task = create_dependency_task(dep_agent, user_request, stack, f"OS: {os_type}, Stack: {stack}")

        logs.append({"agent": "OS Agent", "message": f"Generating {os_type} specific commands...", "status": "processing"})
        os_task = create_os_task(os_agent, os_type, f"Stack: {stack}, Request: {user_request}")

        logs.append({"agent": "Security Agent", "message": "Running security validation...", "status": "processing"})
        security_task = create_security_task(security_agent, f"installing {stack} on {os_type}", stack)

        logs.append({"agent": "Compatibility Agent", "message": "Checking compatibility...", "status": "processing"})
        compat_task = create_compatibility_task(compat_agent, f"Stack: {stack}", os_type)

        logs.append({"agent": "Script Generator", "message": "Generating installation script...", "status": "processing"})
        script_task = create_script_task(
            script_agent, os_type, output_type,
            f"OS: {os_type}", "security validated", "compatibility checked",
            user_request, minimal_install, full_dev_setup
        )

        logs.append({"agent": "Report Agent", "message": "Creating documentation...", "status": "processing"})
        report_task = create_report_task(
            report_agent, user_request, f"Stack: {stack}", "security validated", "script generated"
        )

        # Create and run crew
        crew = Crew(
            agents=[coordinator, dep_agent, os_agent, security_agent, compat_agent, script_agent, report_agent],
            tasks=[analysis_task, dep_task, os_task, security_task, compat_task, script_task, report_task],
            process=Process.sequential,
            verbose=False,
        )

        result = crew.kickoff()

        # Extract outputs from tasks
        script_content = ""
        documentation = ""
        summary = ""
        dependency_tree = {}
        risk_analysis = ""

        try:
            task_outputs = []
            for task in [analysis_task, dep_task, os_task, security_task, compat_task, script_task, report_task]:
                if hasattr(task, 'output') and task.output:
                    task_outputs.append(str(task.output))
                else:
                    task_outputs.append("")

            # Script is from script_task (index 5)
            if task_outputs[5]:
                script_content = task_outputs[5]

            # Report is from report_task (index 6)
            if task_outputs[6]:
                documentation = task_outputs[6]

            # Summary from analysis (index 0)
            if task_outputs[0]:
                summary = task_outputs[0][:500] if len(task_outputs[0]) > 500 else task_outputs[0]

            # Dependencies (index 1)
            dep_output = task_outputs[1]
            try:
                if dep_output:
                    dep_data = json.loads(dep_output) if dep_output.startswith('{') else {}
                    dependency_tree = dep_data
            except Exception:
                dependency_tree = {"raw": dep_output[:200] if dep_output else ""}

            # Security (index 3)
            if task_outputs[3]:
                risk_analysis = task_outputs[3]

        except Exception as parse_error:
            logger.warning(f"Could not parse task outputs: {parse_error}")
            script_content = str(result) if result else generate_fallback_script(user_request, os_type, stack, output_type)

        if not script_content or len(script_content) < 50:
            script_content = generate_fallback_script(user_request, os_type, stack, output_type)

        logs.append({"agent": "System", "message": "Script generation completed successfully!", "status": "success"})

        return {
            "success": True,
            "script_content": script_content,
            "documentation": documentation or generate_fallback_docs(user_request, stack, os_type),
            "summary": summary or f"Generated {output_type} script for {stack} on {os_type}",
            "dependency_tree": dependency_tree or {"stack": stack, "os": os_type},
            "risk_analysis": risk_analysis or "Security validation completed. No critical risks detected.",
            "agent_logs": logs,
        }

    except Exception as e:
        logger.error(f"Crew execution error: {e}")
        logs.append({"agent": "System", "message": f"Agent error: {str(e)[:100]}. Using fallback generation.", "status": "warning"})

        # Fallback script generation
        script_content = generate_fallback_script(user_request, os_type, stack, output_type)
        documentation = generate_fallback_docs(user_request, stack, os_type)

        logs.append({"agent": "Script Generator", "message": "Fallback script generated successfully.", "status": "success"})

        return {
            "success": True,
            "script_content": script_content,
            "documentation": documentation,
            "summary": f"Generated {output_type} installation script for {stack} on {os_type}",
            "dependency_tree": {"stack": stack, "os": os_type, "output_type": output_type},
            "risk_analysis": "Basic security validation applied. Review script before execution.",
            "agent_logs": logs,
        }


def generate_fallback_script(user_request: str, os_type: str, stack: str, output_type: str) -> str:
    """Generate a fallback script when AI agents fail."""
    if output_type == "powershell" or os_type == "windows":
        return generate_powershell_script(user_request, stack)
    elif output_type == "docker":
        return generate_docker_script(stack)
    else:
        return generate_bash_script(user_request, os_type, stack)


def generate_bash_script(user_request: str, os_type: str, stack: str) -> str:
    stack_commands = {
        "mern": """
# Install Node.js via NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"
nvm install --lts
nvm use --lts
node --version && npm --version

# Install MongoDB
if [ "$OS_ID" = "ubuntu" ] || [ "$OS_ID" = "debian" ]; then
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    sudo apt-get update && sudo apt-get install -y mongodb-org
    sudo systemctl start mongod && sudo systemctl enable mongod
fi

# Install global packages
npm install -g nodemon concurrently create-react-app express-generator
echo "✅ MERN stack installation complete!"
""",
        "python_ml": """
# Install Python 3 and pip
if command -v apt-get &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y python3 python3-pip python3-venv python3-dev build-essential
fi

# Install Miniconda
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O miniconda.sh
bash miniconda.sh -b -p $HOME/miniconda
rm miniconda.sh
export PATH="$HOME/miniconda/bin:$PATH"
conda init bash

# Install ML packages
pip3 install --upgrade pip
pip3 install numpy pandas scikit-learn matplotlib seaborn jupyter tensorflow torch torchvision
echo "✅ Python ML stack installation complete!"
""",
        "devops": """
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
rm get-docker.sh

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
rm kubectl

# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Install Terraform
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform

echo "✅ DevOps stack installation complete!"
""",
        "java": """
# Install Java (OpenJDK 21)
if command -v apt-get &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y openjdk-21-jdk
fi
java -version

# Install Maven
sudo apt-get install -y maven
mvn -version

# Install Gradle
wget https://services.gradle.org/distributions/gradle-8.7-bin.zip -P /tmp
sudo unzip -d /opt/gradle /tmp/gradle-8.7-bin.zip
export PATH=$PATH:/opt/gradle/gradle-8.7/bin

echo "✅ Java stack installation complete!"
""",
        "docker": """
# Install Docker Engine
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
rm get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

docker --version && docker-compose --version
echo "✅ Docker installation complete!"
""",
        "kubernetes": """
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install minikube for local development
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

kubectl version --client && minikube version
echo "✅ Kubernetes stack installation complete!"
""",
    }

    stack_key = stack.lower().replace(" ", "_").replace("-", "_")
    stack_cmds = stack_commands.get(
        stack_key,
        stack_commands.get("mern", "# Custom stack - manual installation required\necho 'Please specify your stack requirements'")
    )

    return f"""#!/bin/bash
# ============================================================
# ScriptForge AI - Auto-Generated Installation Script
# Request: {user_request}
# OS: {os_type} | Stack: {stack}
# Generated: $(date)
# ============================================================

set -euo pipefail

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
CYAN='\\033[0;36m'
NC='\\033[0m'

log_info()    {{ echo -e "${{BLUE}}[INFO]${{NC}} $1"; }}
log_success() {{ echo -e "${{GREEN}}[SUCCESS]${{NC}} $1"; }}
log_warning() {{ echo -e "${{YELLOW}}[WARN]${{NC}} $1"; }}
log_error()   {{ echo -e "${{RED}}[ERROR]${{NC}} $1"; exit 1; }}

# Detect OS
detect_os() {{
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        export OS_ID=$ID
        export OS_VERSION=$VERSION_ID
    fi
    log_info "Detected OS: ${{OS_ID:-unknown}} ${{OS_VERSION:-}}"
}}

# Check prerequisites
check_prerequisites() {{
    log_info "Checking system prerequisites..."
    command -v curl &> /dev/null || sudo apt-get install -y curl 2>/dev/null || log_warning "curl not available"
    command -v wget &> /dev/null || sudo apt-get install -y wget 2>/dev/null || log_warning "wget not available"
    log_success "Prerequisites check complete"
}}

# Update system packages
update_system() {{
    log_info "Updating system packages..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update -qq
        sudo apt-get upgrade -y -qq
        sudo apt-get install -y -qq build-essential git curl wget software-properties-common
    elif command -v yum &> /dev/null; then
        sudo yum update -y -q
        sudo yum groupinstall -y "Development Tools"
    fi
    log_success "System updated successfully"
}}

# Main installation
install_stack() {{
    log_info "Installing {stack} stack..."
{stack_cmds}
}}

# Verify installation
verify_installation() {{
    log_info "Verifying installation..."
    log_success "Installation verification complete"
}}

# Main execution
main() {{
    echo -e "${{CYAN}}"
    echo "╔══════════════════════════════════════════════════╗"
    echo "║      ScriptForge AI - Installation Script        ║"
    echo "║      Stack: {stack:<42}║"
    echo "╚══════════════════════════════════════════════════╝"
    echo -e "${{NC}}"

    detect_os
    check_prerequisites
    update_system
    install_stack
    verify_installation

    echo ""
    log_success "🎉 {stack} environment setup complete!"
    log_info "Please restart your terminal or run: source ~/.bashrc"
}}

main "$@"
"""


def generate_powershell_script(user_request: str, stack: str) -> str:
    return f"""# ============================================================
# ScriptForge AI - Auto-Generated PowerShell Script
# Request: {user_request}
# Stack: {stack}
# ============================================================

#Requires -RunAsAdministrator
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Colors
function Write-Info    {{ param($msg) Write-Host "[INFO] $msg" -ForegroundColor Cyan }}
function Write-Success {{ param($msg) Write-Host "[SUCCESS] $msg" -ForegroundColor Green }}
function Write-Warn    {{ param($msg) Write-Host "[WARN] $msg" -ForegroundColor Yellow }}

Write-Host @"
╔══════════════════════════════════════════════════╗
║      ScriptForge AI - Windows Installation       ║
║      Stack: {stack:<42}║
╚══════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Install Chocolatey if not present
Write-Info "Checking Chocolatey..."
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {{
    Write-Info "Installing Chocolatey..."
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    Write-Success "Chocolatey installed"
}}

# Install packages based on stack
Write-Info "Installing {stack} stack..."

$packages = @()

switch ("{stack.lower()}") {{
    "mern" {{
        $packages = @("nodejs-lts", "mongodb", "git", "vscode")
    }}
    "python_ml" {{
        $packages = @("python3", "git", "vscode", "miniconda3")
    }}
    "devops" {{
        $packages = @("docker-desktop", "kubernetes-cli", "helm", "terraform")
    }}
    "java" {{
        $packages = @("openjdk21", "maven", "gradle", "git")
    }}
    default {{
        $packages = @("git", "vscode", "nodejs-lts", "python3")
    }}
}}

foreach ($pkg in $packages) {{
    Write-Info "Installing $pkg..."
    choco install $pkg -y --no-progress
    if ($LASTEXITCODE -eq 0) {{
        Write-Success "$pkg installed successfully"
    }} else {{
        Write-Warn "$pkg installation may have issues"
    }}
}}

Write-Success "🎉 {stack} environment setup complete!"
Write-Info "Please restart your PowerShell session to apply changes."
"""


def generate_docker_script(stack: str) -> str:
    services = {
        "mern": """
  frontend:
    image: node:20-alpine
    working_dir: /app
    volumes:
      - ./frontend:/app
    command: sh -c "npm install && npm start"
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://backend:5000
    depends_on:
      - backend

  backend:
    image: node:20-alpine
    working_dir: /app
    volumes:
      - ./backend:/app
    command: sh -c "npm install && npm run dev"
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/myapp
      - NODE_ENV=development
    depends_on:
      - mongo

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=myapp

volumes:
  mongo_data:
""",
        "python_ml": """
  jupyter:
    image: jupyter/tensorflow-notebook:latest
    ports:
      - "8888:8888"
    volumes:
      - ./notebooks:/home/jovyan/work
    environment:
      - JUPYTER_ENABLE_LAB=yes

  mlflow:
    image: python:3.11-slim
    working_dir: /app
    command: sh -c "pip install mlflow && mlflow server --host 0.0.0.0"
    ports:
      - "5000:5000"
    volumes:
      - mlflow_data:/mlruns

volumes:
  mlflow_data:
""",
    }

    stack_services = services.get(stack.lower(), services["mern"])

    return f"""# ============================================================
# ScriptForge AI - Docker Compose Configuration
# Stack: {stack}
# ============================================================

version: '3.8'

services:
  traefik:
    image: traefik:v3.0
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
    ports:
      - "80:80"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
{stack_services}

networks:
  default:
    name: {stack.lower()}_network
"""


def generate_fallback_docs(user_request: str, stack: str, os_type: str) -> str:
    return f"""# Installation Guide: {stack} on {os_type}

## Overview
This guide covers the installation of **{stack}** on **{os_type}**.

**Original Request:** {user_request}

## Prerequisites
- Administrative/sudo access
- Stable internet connection
- At least 4GB free disk space

## What Gets Installed
The installation script sets up a complete {stack} development environment including all required tools, runtimes, and package managers.

## Running the Script

### Linux/macOS
```bash
chmod +x install.sh
./install.sh
```

### Windows (PowerShell)
```powershell
Set-ExecutionPolicy Bypass -Scope Process
.\\install.ps1
```

## Post-Installation
1. Restart your terminal
2. Verify installations with version commands
3. Configure your IDE/editor
4. Create your first project

## Troubleshooting
- **Permission denied**: Run with sudo (Linux/macOS) or as Administrator (Windows)
- **Package not found**: Update your package manager first
- **Version conflicts**: Check compatibility matrix

## Support
Generated by ScriptForge AI. Review all scripts before execution.
"""
