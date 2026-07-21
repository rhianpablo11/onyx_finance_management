import json
from sqlalchemy import create_engine, text
from decimal import Decimal
from datetime import datetime, date

# 🔗 Coloque aqui sua string de conexão
# Exemplo PostgreSQL:
# postgresql+psycopg2://usuario:senha@localhost:5432/seubanco
# Exemplo MySQL:
# mysql+pymysql://usuario:senha@localhost:3306/seubanco
DATABASE_URL = ""


# Cria engine
engine = create_engine(DATABASE_URL)

# Serializer completo (Decimal + datetime + fallback)
def serializer(obj):
    if isinstance(obj, Decimal):
        return float(obj)  # mantém número como número
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()  # formato padrão JSON (ISO 8601)
    return str(obj)  # fallback

# Query
query = text("SELECT * FROM expense WHERE user_id = :user_id")

with engine.connect() as conn:
    result = conn.execute(query, {"user_id": 1})
    
    # Converte resultado em lista de dict
    rows = [dict(row._mapping) for row in result]

# Salva JSON
with open("expenses_user_1.json", "w", encoding="utf-8") as f:
    json.dump(rows, f, indent=4, ensure_ascii=False, default=serializer)

print("✅ JSON gerado com sucesso: expenses_user_1.json")