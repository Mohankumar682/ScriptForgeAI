from crewai import Task
from crewai import Agent

def create_analysis_task(coordinator: Agent, user_request: str, os_type: str, stack: str) -> Task:
    return Task(
        description=f"""
        Analyze the following user request and create a comprehensive plan:
        
        User Request: {user_request}
        Target OS: {os_type}
        Technology Stack: {stack}
        
        Your analysis should include:
        1. Core components needed
        2. Suggested agent delegation order
        3. Key technical requirements
        4. Potential challenges to address
        
        Provide a structured analysis in JSON format with keys: 
        components, delegation_plan, requirements, challenges
        """,
        agent=coordinator,
        expected_output="A structured JSON analysis of the user's installation requirements",
    )

def create_dependency_task(dep_agent: Agent, user_request: str, stack: str, analysis: str) -> Task:
    return Task(
        description=f"""
        Based on this request: "{user_request}"
        Stack: {stack}
        Analysis: {analysis}
        
        Identify ALL required dependencies:
        1. Primary tools and packages (with specific versions)
        2. Secondary/transitive dependencies
        3. Optional but recommended tools
        4. Development vs production dependencies
        
        Return a structured JSON with:
        - primary_deps: list of primary dependencies with versions
        - secondary_deps: list of secondary dependencies
        - recommended: list of recommended additional tools
        - dev_deps: development-only dependencies
        """,
        agent=dep_agent,
        expected_output="Comprehensive dependency list in JSON format",
    )

def create_os_task(os_agent: Agent, os_type: str, dependencies: str) -> Task:
    return Task(
        description=f"""
        Generate OS-specific installation commands for {os_type}.
        
        Dependencies to install: {dependencies}
        
        For {os_type}, provide:
        1. Package manager setup/update commands
        2. Specific installation commands for each dependency
        3. Environment variable configuration
        4. PATH setup commands
        5. Verification commands (to confirm successful installation)
        
        Format output as JSON with:
        - package_manager: the package manager being used
        - setup_commands: initial setup/update commands
        - install_commands: list of install commands per dependency
        - env_setup: environment variable commands
        - verify_commands: verification commands
        """,
        agent=os_agent,
        expected_output="OS-specific installation commands in JSON format",
    )

def create_security_task(security_agent: Agent, commands: str, packages: str) -> Task:
    return Task(
        description=f"""
        Perform a security audit on these installation commands and packages:
        
        Commands: {commands}
        Packages: {packages}
        
        Check for:
        1. Unsafe commands (rm -rf /, sudo misuse, etc.)
        2. Packages with known CVEs or malware
        3. Deprecated or unmaintained packages
        4. Insecure download sources (non-HTTPS, unverified)
        5. Privilege escalation risks
        
        Return JSON with:
        - risk_level: "low", "medium", or "high"
        - warnings: list of security warnings
        - blocked_commands: commands that should be removed
        - recommendations: security improvement suggestions
        - safe_commands: sanitized version of commands
        """,
        agent=security_agent,
        expected_output="Security audit report in JSON format",
    )

def create_compatibility_task(compat_agent: Agent, dependencies: str, os_type: str) -> Task:
    return Task(
        description=f"""
        Verify compatibility for these dependencies on {os_type}:
        {dependencies}
        
        Check:
        1. Version conflicts between packages
        2. OS/architecture compatibility
        3. Correct installation order (dependency graph)
        4. Known incompatibilities between tools
        
        Return JSON with:
        - compatible: boolean
        - conflicts: list of detected conflicts
        - installation_order: correct order for installation
        - version_adjustments: suggested version changes
        - notes: additional compatibility notes
        """,
        agent=compat_agent,
        expected_output="Compatibility analysis in JSON format",
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
    script_type = "Bash" if output_type == "bash" else "PowerShell" if output_type == "powershell" else "Docker"
    options = []
    if minimal:
        options.append("minimal installation (only essential packages)")
    if full_dev:
        options.append("full development setup (include all dev tools)")
    options_str = ", ".join(options) if options else "standard installation"

    return Task(
        description=f"""
        Generate a complete, production-ready {script_type} installation script.
        
        Original Request: {user_request}
        Target OS: {os_type}
        Script Type: {output_type}
        Install Options: {options_str}
        
        OS Commands: {os_commands}
        Security Report: {security_report}
        Compatibility Report: {compatibility_report}
        
        Requirements for the script:
        1. Add shebang line and script metadata header
        2. Include color-coded output (success=green, error=red, info=blue)
        3. Add error handling with exit codes
        4. Include progress indicators
        5. Add verification steps after each major installation
        6. Include rollback instructions as comments
        7. Add comprehensive inline comments
        8. Handle already-installed software gracefully
        9. Create a summary at the end showing what was installed
        
        Return the complete, ready-to-execute script as plain text (not JSON).
        The script should be immediately executable without modification.
        """,
        agent=script_agent,
        expected_output=f"Complete executable {script_type} installation script",
    )

def create_report_task(
    report_agent: Agent,
    user_request: str,
    dependencies: str,
    security_report: str,
    script_content: str,
) -> Task:
    return Task(
        description=f"""
        Generate a comprehensive installation report for:
        
        User Request: {user_request}
        Dependencies: {dependencies}
        Security Analysis: {security_report}
        Generated Script Preview: {script_content[:500]}...
        
        Create a detailed report including:
        1. Executive Summary (what will be installed and why)
        2. Tool-by-tool explanation (purpose and configuration)
        3. Dependency tree visualization (text-based)
        4. Step-by-step installation walkthrough
        5. Post-installation verification guide
        6. Troubleshooting guide (common issues and solutions)
        7. Environment optimization tips
        8. Next steps and recommended learning resources
        
        Format as structured markdown that is both human-readable and comprehensive.
        """,
        agent=report_agent,
        expected_output="Comprehensive markdown installation report",
    )
