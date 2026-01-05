from app.core.database import Base
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func

class Chat_logs(Base):
    __tablename__ = 'chat_logs'

    id = Column(Integer, primary_key = True, autoincrement = True)
    user_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    message_user = Column(Text, nullable=False)
    ai_response = Column(JSONB, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())