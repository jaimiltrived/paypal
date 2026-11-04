from typing import Optional
from fastapi import APIRouter, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_client_ip, get_current_user, get_db, oauth2_scheme
from app.core.security import create_access_token, revoke_token
from app.models.user import User
from app.schemas.auth import Token, UserLogin, UserRead, UserRegister
from app.schemas.common import StandardResponse
from app.services.audit_service import AuditService
from app.services.auth_service import AuthService

router = APIRouter()


@router.post(
    "/register",
    response_model=StandardResponse[UserRead],
    summary="Register a new user account",
)
def register_user(
    payload: UserRegister,
    request: Request,
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    client_ip = get_client_ip(request)
    created_user = service.register_user(payload, ip_address=client_ip)
    return StandardResponse(
        message="User successfully registered.",
        data=UserRead.model_validate(created_user),
    )


@router.post(
    "/login",
    response_model=Token,
    summary="User login with JWT token issue",
)
def login(
    request: Request,
    payload: UserLogin,
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    client_ip = get_client_ip(request)
    return service.authenticate_user(
        email=payload.email,
        password=payload.password,
        ip_address=client_ip,
    )


@router.post(
    "/token",
    response_model=Token,
    include_in_schema=False,
)
def login_oauth2_form(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    client_ip = get_client_ip(request)
    return service.authenticate_user(
        email=form_data.username,
        password=form_data.password,
        ip_address=client_ip,
    )


@router.get(
    "/me",
    response_model=StandardResponse[UserRead],
    summary="Retrieve current authenticated user",
)
def get_me(current_user: User = Depends(get_current_user)):
    return StandardResponse(
        data=UserRead.model_validate(current_user),
    )


@router.post(
    "/logout",
    response_model=StandardResponse[dict],
    summary="Revoke active JWT token and terminate server session",
)
def logout(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if token:
        revoke_token(token)

    client_ip = get_client_ip(request)
    audit_service = AuditService(db)
    audit_service.log_action(
        action="LOGOUT",
        entity_type="user",
        entity_id=current_user.id,
        user_id=current_user.id,
        ip_address=client_ip,
    )

    return StandardResponse(
        message="Successfully signed out. JWT session has been revoked.",
        data={"user_id": current_user.id, "revoked": True},
    )


@router.post(
    "/refresh",
    response_model=Token,
    summary="Refresh authenticated JWT token and cycle credentials",
)
def refresh_token(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Revoke old token
    if token:
        revoke_token(token)

    role_name = current_user.role.name if current_user.role else "user"
    new_token = create_access_token(subject=current_user.id, role=role_name)

    client_ip = get_client_ip(request)
    audit_service = AuditService(db)
    audit_service.log_action(
        action="TOKEN_REFRESH",
        entity_type="user",
        entity_id=current_user.id,
        user_id=current_user.id,
        ip_address=client_ip,
    )

    return Token(
        access_token=new_token,
        token_type="bearer",
        expires_in_minutes=60,
        user_id=current_user.id,
        email=current_user.email,
        role=role_name,
    )
