import bcrypt
from datetime import datetime , timezone , timedelta
from typing import Any
from app.core.config import settings
from jose import JWTError , jwt
from app.models.user import UserRole

from fastapi.security import OAuth2PasswordBearer


# OAuth2 Configuration

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
)

#password hashing 

def hash_password(password: str) -> str:
    """
    Hash a plain-text password using bcrypt.
    """
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()

    hashed_password = bcrypt.hashpw(password_bytes, salt)

    return hashed_password.decode("utf-8")


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verify a plain-text password against the stored bcrypt hash.
    """
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )

#JWT configuration 

WWW_AUTHENTICATE_SCHEME = "Bearer"   
TOKEN_TYPE = "bearer"   

#JWT Token Creation 

def create_access_token(
        *,
        subject:str,
        role:UserRole,
) -> str:

    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    payload = {
        "sub": subject,
        "role": role.value,
        "exp": expire,
    }

    encoded_jwt = jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
    return encoded_jwt

#   JWT Token Verfication 

def decode_access_token(
        token:str,
) -> dict[str,Any] :
    
    payload = jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.ALGORITHM],
    )
    return payload

    




