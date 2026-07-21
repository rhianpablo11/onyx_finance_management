from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.chat_logs import Chat_logs


def create_new_chat_log(text_typed: str, db: Session, user_id: int, ai_json_response: dict):
    new_chat_log = Chat_logs(
        user_id=user_id,
        message_user=text_typed,
        ai_response=ai_json_response
    )

    db.add(new_chat_log)
    db.commit()
    db.refresh(new_chat_log)


def get_chat_logs_by_user_id(db: Session, user_id: int):
    stmt = (select(Chat_logs)
            .where(Chat_logs.user_id == user_id)
            .order_by(Chat_logs.created_at.desc()))
    chat_logs = db.execute(stmt).scalars().all()
    chat_history = []
    for log in chat_logs:
        chat_response_formated = f"Foi criada uma nova transação com valor de R$ {log.ai_response.get('transaction_value', 0)}, ela ta na categoria {log.ai_response.get('transaction_category', 'N/A')}, e foi marcada como efetuada na data {log.ai_response.get('transaction_date', 'N/A')} e paga utilizando {log.ai_response.get('transaction_payment_method', 'N/A')}"

        chat_history.append({
            "id": log.id,
            "message_user": log.message_user,
            "ai_response": chat_response_formated, 
            "created_at": log.created_at
        })

    return chat_history
