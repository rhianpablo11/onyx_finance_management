from sqlalchemy import Boolean, Column, Date, ForeignKey, Integer, String, Text, func
from app.core.database import Base

class Ia_insights(Base):
    __tablename__ = 'ia_insights'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    type_insight = Column(String, nullable=False)
    text_content = Column(Text, nullable=False)
    title = Column(String, nullable=False)
    created_at = Column(Date, server_default=func.current_date())
    is_read = Column(Boolean, default=False)
    
    def __repr__(self):
        return f"<AI_Insight(type={self.type_insight}, user_id={self.user_id}, title={self.title}, created_at={self.created_at}, is_read={self.is_read})>"