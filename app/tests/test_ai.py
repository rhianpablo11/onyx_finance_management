from unittest.mock import patch



# 1. AQUI ESTÁ O SEGREDO: Falsificamos apenas o analisador de texto, não o controller inteiro!
@patch("app.controllers.transaction_controller.analyze_transaction_text") 
def test_api_ia_cria_transacao_com_sucesso(mock_gemini, auth_client, db_session):
    """
    O Caminho Feliz: O usuário manda um áudio/texto e a IA devolve o JSON perfeitinho.
    """
    # 2. O clone falso precisa ter a estrutura exata das chaves do ai_processor
    mock_gemini.return_value = {
        "amount": 45.90,
        "is_installment": False,
        "installments_count": 1,
        "is_recurrent": False,
        "type": False, # Despesa
        "category": "Alimentação",
        "description": "Pedi uma pizza no ifood",
        "first_payment_date": "2026-03-17",
        "payment_method": "PIX",
        "last_payment_date": "2026-03-17",
        "type_of_installment": "único",
        "name": "Ifood Pizza"
    }

    # O Frontend manda o texto do usuário
    payload = {"message": "Pedi uma pizza no ifood de 45 e 90 no pix"}
    response = auth_client.post("/transactions/create", json=payload)
    
    assert response.status_code in [200, 201]
    
    # 3. Verifica se o seu controller pegou a análise da IA e SALVOU no banco de verdade!
    from app.models.expense import Expense
    transacao_salva = db_session.query(Expense).filter(Expense.name == "Ifood Pizza").first()
    
    assert transacao_salva is not None
    assert float(transacao_salva.value) == 45.90
    assert transacao_salva.payment_method == "PIX"


@patch("app.controllers.transaction_controller.analyze_transaction_text") 
def test_api_ia_alucinacao_nao_quebra_sistema(mock_gemini, auth_client, db_session):
    """
    O Caminho Triste (Caos): A IA deu a louca, a internet caiu ou a cota esgotou.
    """
    # 1. O ai_processor retorna None quando o Google Gemini falha
    mock_gemini.return_value = None

    payload = {"message": "abobrinha voadora"}
    response = auth_client.post("/transactions/create", json=payload)
    
    # 2. Como a sua rota tem um except que retorna 200 OK com mensagem amigável, testamos isso:
    assert response.status_code == 200
    assert "Houve um erro" in response.json()["text_response"]
    
    # 3. Garante que nenhuma abobrinha foi salva no banco de dados!
    from app.models.expense import Expense
    transacoes = db_session.query(Expense).all()
    # Verifica se o banco continua zerado
    assert len(transacoes) == 0