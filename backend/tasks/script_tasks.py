from crewai import Task, Agent


def create_analysis_task(coordinator: Agent, user_request: str, os_type: str, stack: str) -> Task:
    return Task(
        description=(
            f"Analyze: '{user_request}' | OS: {os_type} | Stack: {stack}. "
            "Return JSON: {components, requirements, challenges}"
        ),
        agent=coordinator,
        expected_output="JSON with components, requirements, challenges",
    )


def create_dependency_task(dep_agent: Agent, user_request: str, stack: str, context: str) -> Task:
    return Task(
        description=(
            f"List dependencies for '{stack}' stack. Request: '{user_request}'. "
            "Return JSON: {primary_deps, dev_deps, recommended}"
        ),
        agent=dep_agent,
        expected_output="JSON dependency list",
    )


def create_os_task(os_agent: Agent, os_type: str, context: str) -> Task:
    return Task(
        description=(
            f"Generate {os_type} install commands for: {context}. "
            "Return JSON: {package_manager, setup_commands, install_commands, verify_commands}"
        ),
        agent=os_agent,
        expected_output="JSON with OS-specific install commands",
    )


def create_security_task(security_agent: Agent, commands: str, packages: str) -> Task:
    return Task(
        description=(
            f"Security check for: {packages} on {commands}. "
            "Return JSON: {risk_level, warnings, recommendations}"
        ),
        agent=security_agent,
        expected_output="JSON security report",
    )


def create_compatibility_task(compat_agent: Agent, dependencies: str, os_type: str) -> Task:
    return Task(
        description=(
            f"Check compatibility of '{dependencies}' on {os_type}. "
            "Return JSON: {compatible, conflicts, installation_order}"
        ),
        agent=compat_agent,
        expected_output="JSON compatibility report",
    )


def create_script_task(
    script_agent: Agent,
    os_type: str,
    output_type: str,
    os_commands: str,
    security_report: str,
    compatibility_report: str,
    user_request: str,
    minimal: bool = False,
    full_dev: bool = False,
) -> Task:
    script_type = {"bash": "Bash", "powershell": "PowerShell", "docker": "Docker Compose"}.get(output_type, "Bash")
    opts = []
    if minimal:
        opts.append("minimal")
    if full_dev:
        opts.append("full-dev")
    opts_str = ", ".join(opts) or "standard"

    return Task(
        description=(
            f"Write a complete {script_type} script for: '{user_request}'. "
            f"OS: {os_type}, Options: {opts_str}. "
            "Include: shebang, color output, error handling, verification steps, inline comments. "
            "Return plain text script only."
        ),
        agent=script_agent,
        expected_output=f"Complete executable {script_type} script",
    )


def create_report_task(
    report_agent: Agent,
    user_request: str,
    dependencies: str,
    security_report: str,
    script_content: str,
) -> Task:
    return Task(
        description=(
            f"Write a markdown guide for: '{user_request}'. "
            f"Dependencies: {dependencies}. "
            "Include: overview, what gets installed, usage, troubleshooting. Keep it concise."
        ),
        agent=report_agent,
        expected_output="Concise markdown installation guide",
    )
