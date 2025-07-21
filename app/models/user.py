from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.ext.declarative import declarative_base
import enum

Base = declarative_base()

class UserMode(enum.Enum):
    deaf = "Deaf"
    mute = "Mute"
    deaf_mute = "Deaf-Mute"

class User(Base):
    __tablename__ = 'users'

    user_id = Column(Integer, primary_key=True, index=True)
    mode = Column(Enum(UserMode), default=UserMode.deaf)  # Default mode is Deaf
    preferred_language = Column(String, default="en")  # Default language is English
