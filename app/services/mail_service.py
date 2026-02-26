import smtplib
from email.message import EmailMessage
from app.core.security import PASSWORD_EMAIL
from email.mime.text import MIMEText



def send_email(email: str, code: int):
    remetente = 'noreply.onyxfinancemanagement@gmail.com'
    destinatario = email

    assunto = 'Codigo de verificação'

    mensagem = str(code)

    try:
        msg = EmailMessage()
        msg['From'] = remetente
        msg['To'] = destinatario
        msg['Subject'] = assunto

        msg.attach(MIMEText(mensagem, 'plain'))
        msg.set_content(mensagem)


        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(remetente, PASSWORD_EMAIL)
        server.sendmail(remetente, destinatario, msg.as_string())

        print('enviado')
        return 'ok'
    except Exception as e:
        print('deu erro')
        print(e)
        return 'erro'
    finally:
        server.quit()
