from sqlalchemy import Column, Integer, String, ForeignKey, LargeBinary, Boolean
from app.core.database import Base
from sqlalchemy.orm import relationship

class User_crendentials(Base):
    __tablename__ = 'user_credentials'

    id = Column(Integer, primary_key=True, autoincrement = True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable = False)
    credential_id = Column(LargeBinary, unique = True, nullable = False)
    public_key = Column(LargeBinary, nullable=False)
    sign_count = Column(Integer, default=0)
    device_name = Column(String(255), nullable=True)
    user = relationship("User", back_populates="credentials")