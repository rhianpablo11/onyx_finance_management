from sqlalchemy import Column, Date, Float, ForeignKey, Integer, UniqueConstraint, func

from app.core.database import Base


class Balance_forecast(Base):
    __tablename__ = 'balance_forecast'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'),nullable=False, index=True)
    target_date = Column(Date, nullable=False)
    real_balance = Column(Float, nullable=True)
    predicted_balance = Column(Float, nullable=True)
    band_min = Column(Float, nullable=True)
    band_max = Column(Float, nullable=True)
    updated_at = Column(Date, server_default=func.now(), onupdate=func.now(), nullable=False)


    __table_args__ = (
        UniqueConstraint('user_id', 'target_date', name='uq_user_target_date'),
    )

    def __repr__(self):
        return f"<Balance_forecast(id={self.id}, date={self.date}, balance={self.balance})>"