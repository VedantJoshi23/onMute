from pydantic import BaseModel
from enum import Enum

class UserMode(str, Enum):
    deaf = "Deaf"
    mute = "Mute"
    deaf_mute = "Deaf-Mute"

class UserCreate(BaseModel):
    mode: UserMode
    preferred_language: str = "en"  # Default language is English

class UserResponse(BaseModel):
    user_id: int
    mode: UserMode
    preferred_language: str

    class Config:
        orm_mode = True
