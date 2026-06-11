from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from database import get_db
from models.script import Script, ScriptStatus
from models.user import User
from api.auth import get_current_user_dep

router = APIRouter()


async def get_admin_user(current_user: User = Depends(get_current_user_dep)) -> User:
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("/stats")
async def get_admin_stats(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    total_users = (await db.execute(select(func.count(User.id)))).scalar()
    total_scripts = (await db.execute(select(func.count(Script.id)))).scalar()
    completed = (await db.execute(
        select(func.count(Script.id)).where(Script.status == ScriptStatus.COMPLETED)
    )).scalar()
    failed = (await db.execute(
        select(func.count(Script.id)).where(Script.status == ScriptStatus.FAILED)
    )).scalar()

    return {
        "total_users": total_users,
        "total_scripts": total_scripts,
        "completed_scripts": completed,
        "failed_scripts": failed,
        "success_rate": round((completed / total_scripts * 100) if total_scripts > 0 else 0, 1),
    }


@router.get("/users")
async def list_users(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).order_by(desc(User.created_at)))
    users = result.scalars().all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "is_active": u.is_active,
            "is_admin": u.is_admin,
            "created_at": str(u.created_at),
        }
        for u in users
    ]


@router.get("/scripts")
async def list_all_scripts(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Script).order_by(desc(Script.created_at)).limit(100))
    scripts = result.scalars().all()
    return [
        {
            "id": s.id,
            "user_id": s.user_id,
            "title": s.title,
            "status": s.status.value,
            "os_type": s.os_type,
            "stack": s.stack,
            "created_at": str(s.created_at),
        }
        for s in scripts
    ]
