from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, JSON, Boolean, func
from database import Base
import enum

class ScriptStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class Script(Base):
    __tablename__ = "scripts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    user_request = Column(Text, nullable=False)
    os_type = Column(String, nullable=False)
    stack = Column(String, nullable=False)
    output_type = Column(String, nullable=False)
    security_mode = Column(Boolean, default=False)
    minimal_install = Column(Boolean, default=False)
    full_dev_setup = Column(Boolean, default=False)
    status = Column(Enum(ScriptStatus), default=ScriptStatus.PENDING)
    script_content = Column(Text, nullable=True)
    documentation = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    dependency_tree = Column(JSON, nullable=True)
    risk_analysis = Column(Text, nullable=True)
    agent_logs = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
