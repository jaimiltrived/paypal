import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.deps import get_db
from app.core.database import Base
from app.core.security import create_access_token
from app.main import app
from app.models.user import Role, User
from app.services.auth_service import AuthService

TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    auth_service = AuthService(session)
    auth_service.ensure_default_roles()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db_session: Session) -> Generator[TestClient, None, None]:
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def admin_headers(db_session: Session) -> dict[str, str]:
    auth = AuthService(db_session)
    admin_user = auth.user_repo.get_by_email("admin@payops.ai")
    if not admin_user:
        from app.schemas.auth import UserRegister
        admin_user = auth.register_user(
            UserRegister(
                email="admin@payops.ai",
                password="AdminPassword123!",
                full_name="System Admin",
                role_name="admin",
            )
        )
    token = create_access_token(subject=admin_user.id, role="admin")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def operator_headers(db_session: Session) -> dict[str, str]:
    auth = AuthService(db_session)
    op_user = auth.user_repo.get_by_email("operator@payops.ai")
    if not op_user:
        from app.schemas.auth import UserRegister
        op_user = auth.register_user(
            UserRegister(
                email="operator@payops.ai",
                password="OperatorPassword123!",
                full_name="Payment Operator",
                role_name="operator",
            )
        )
    token = create_access_token(subject=op_user.id, role="operator")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def user_headers(db_session: Session) -> dict[str, str]:
    auth = AuthService(db_session)
    std_user = auth.user_repo.get_by_email("customer@example.com")
    if not std_user:
        from app.schemas.auth import UserRegister
        std_user = auth.register_user(
            UserRegister(
                email="customer@example.com",
                password="CustomerPassword123!",
                full_name="Standard Customer",
                role_name="user",
            )
        )
    token = create_access_token(subject=std_user.id, role="user")
    return {"Authorization": f"Bearer {token}"}

