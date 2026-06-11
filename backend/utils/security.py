import re
from typing import List, Tuple

DANGEROUS_PATTERNS = [
    r"rm\s+-rf\s+/(?:\s|$)",
    r"rm\s+-rf\s+/\*",
    r":\(\)\{.*\}",
    r"dd\s+if=/dev/zero",
    r"mkfs\.",
    r">\s*/dev/sd[a-z]",
    r"chmod\s+-R\s+777\s+/",
    r"wget\s+http://(?!packages\.|archive\.|security\.)",
    r"curl\s+http://(?!packages\.|archive\.|security\.)",
    r"eval\s+\$\(",
]

def sanitize_input(text: str) -> str:
    """Sanitize user input to prevent injection attacks."""
    text = re.sub(r'[<>"\';]', '', text)
    text = text.strip()
    return text[:2000]

def check_script_safety(script_content: str) -> Tuple[bool, List[str]]:
    """Check script for dangerous patterns."""
    warnings = []
    for pattern in DANGEROUS_PATTERNS:
        if re.search(pattern, script_content, re.IGNORECASE):
            warnings.append(f"Dangerous pattern detected: {pattern}")
    return len(warnings) == 0, warnings
