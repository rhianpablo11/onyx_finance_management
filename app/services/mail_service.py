from datetime import datetime, timezone
import smtplib
from email.message import EmailMessage
from app.core.security import PASSWORD_EMAIL, API_SELF_URL
from email.mime.text import MIMEText



def send_email(email: str, code: int, name: str = ''):
    remetente = 'noreply.onyxfinancemanagement@gmail.com'
    destinatario = email
    print('ate aq de boa')
    year = datetime.now(timezone.utc).year
    print('ate aq de boa' + str(year))
    assunto = 'Onyx - Seu código de verificação'
    print(assunto)
    html_content = f"""
    <!DOCTYPE html>
    <html lang="pt-BR">
    <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #1b1b1b; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                        <tr>
                            <td style="background: #040404;
                                        background: radial-gradient(circle,rgba(4, 4, 4, 1) 15%, rgba(68, 56, 136, 1) 100%); padding: 30px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 32px;">Onyx</h1>
                                <p style="color: #a1a1aa; margin: 5px 0 0 0; font-size: 14px;">Finance Management</p>
                            </td>
                        </tr>
                        
                        <tr>
                            <td style="padding: 40px 30px; text-align: center; background-image: url('{API_SELF_URL}/static/logo-onyx-watermark.png'); background-repeat: no-repeat; background-position: center center; background-size: 40%;">
                                
                                <h2 style="color: #18181b; margin-top: 0;">Olá {name}, falta pouco para acessar sua conta!</h2>
                                
                                <p style="color: #52525b; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                                    Recebemos um pedido de verificação para o seu email. Use o código de 6 dígitos abaixo para continuar:
                                </p>
                                
                                <div style="background-color: #f3e8ff; border: 2px dashed #a855f7; border-radius: 8px; padding: 20px; display: inline-block; margin-bottom: 30px;">
                                    <span style="font-size: 32px; font-weight: bold; color: #7e22ce; letter-spacing: 5px;">
                                        {code}
                                    </span>
                                </div>
                                
                                <p style="color: #71717a; font-size: 14px;">
                                    Este código <strong>expira em 5 minutos</strong>. Se você não solicitou este código, pode ignorar este email com segurança.
                                </p>
                                
                            </td>
                        </tr>
                        
                        <tr>
                            <td style="background-color: #f4f4f5; padding: 20px; text-align: center; border-top: 1px solid #e4e4e7;">
                                <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
                                    © {year} Onyx Finance Management. Todos os direitos reservados.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """


    print('passeio por ca tb')
    mensagem = str(f"Olá {name}! Seu código de verificação do Onyx é: {code}. Ele expira em 5 minutos.")
    server = None
    print('antes dos oi')
    try:
        msg = EmailMessage()
        print('criei o objeto')
        msg['From'] = remetente
        msg['To'] = destinatario
        msg['Subject'] = assunto
        print('oi')
        msg.set_content(mensagem)
        msg.add_alternative(html_content, subtype='html')
        print('oi')

        server = smtplib.SMTP('smtp.gmail.com', 587)
        print('oi')
        server.starttls()
        print('oi')
        server.login(remetente, PASSWORD_EMAIL)
        print('oi')
        server.send_message(msg)

        print('enviado')
        return 'ok'
    except Exception as e:
        print('deu erro')
        print(e)
        return 'erro'
    finally:
        if server is not None:
            server.quit()
