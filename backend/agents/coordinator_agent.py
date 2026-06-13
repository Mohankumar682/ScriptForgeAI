from crewai import Agent

LLM_MODEL = "gemini/gemini-2.5-flash"

# Shared LLM config for all agents — concise, fast
_AGENT_DEFAULTS = dict(
    llm=LLM_MODEL,
    verbose=False,        # was True — eliminates per-step stdout overhead
    allow_delegation=False,
    max_iter=1,           # was 3 — single pass, no retries
    max_retry_limit=1,
)


def create_coordinator_agent() -> Agent:
    return Agent(
        role="Coordinator",
        goal="Analyze user request and produce a concise installation plan",
        backstory="Expert DevOps coordinator. Analyze requests and produce structured JSON plans. Be concise.",
        **{**_AGENT_DEFAULTS, "allow_delegation": False},
    )


def create_os_detection_agent() -> Agent:
    return Agent(
        role="OS Agent",
        goal="Generate OS-specific package manager commands for the target platform",
        backstory="OS and package manager expert for Ubuntu/Debian, Windows, and macOS. Return JSON only.",
        **_AGENT_DEFAULTS,
    )


def create_dependency_agent() -> Agent:
    return Agent(
        role="Dependency Agent",
        goal="List all required packages and versions for the requested stack",
        backstory="Software dependency expert. Return a concise JSON list of required packages.",
        **_AGENT_DEFAULTS,
    )


def create_security_agent() -> Agent:
    return Agent(
        role="Security Agent",
        goal="Identify security risks in the installation and return safe alternatives",
        backstory="DevSecOps expert. Return JSON with risk_level, warnings, and recommendations only.",
        **_AGENT_DEFAULTS,
    )


def create_compatibility_agent() -> Agent:
    return Agent(
        role="Compatibility Agent",
        goal="Verify version compatibility and correct installation order",
        backstory="Compatibility expert. Return JSON with conflicts and installation_order only.",
        **_AGENT_DEFAULTS,
    )


def create_script_generator_agent() -> Agent:
    return Agent(
        role="Script Generator",
        goal="Write a complete, executable installation script",
        backstory="Expert script writer. Write production-ready scripts with error handling and comments.",
        **_AGENT_DEFAULTS,
    )


def create_report_agent() -> Agent:
    return Agent(
        role="Report Agent",
        goal="Write a concise markdown installation guide",
        backstory="Technical writer. Create a brief, clear installation guide in markdown.",
        **_AGENT_DEFAULTS,
    )
