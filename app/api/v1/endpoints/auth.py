from typing import Optional
from fastapi import APIRouter, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_client_ip, get_current_user, get_db
from app.models.user import User
from app.schemas.auth import Token, UserLogin, UserRead, UserRegister
from app.schemas.common import StandardResponse
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
