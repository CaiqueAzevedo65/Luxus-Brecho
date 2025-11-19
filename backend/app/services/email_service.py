"""
Serviço para envio de emails.
Utiliza SMTP para enviar emails de confirmação e outros.
"""
import smtplib
import os
import json
from pathlib import Path
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

# Configurações de email (devem ser definidas nas variáveis de ambiente)
SMTP_HOST = os.getenv('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
SMTP_USER = os.getenv('SMTP_USER', '')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '')
FROM_EMAIL = os.getenv('FROM_EMAIL', SMTP_USER)
FROM_NAME = os.getenv('FROM_NAME', 'Luxus Brechó')


def get_app_url() -> str:
    """
    Obtém a URL base da aplicação.
    Prioridade:
    1. PRODUCTION_URL do .env (para produção - domínio real)
    2. APP_URL do .env (para desenvolvimento - pode ser customizado)
    3. network-config.json (IP da rede local)
    4. Fallback final para localhost:5000
    """
    # 1. Verifica se há URL de produção configurada
    production_url = os.getenv('PRODUCTION_URL', '').strip()
    if production_url:
        print(f"📧 Email Service usando PRODUCTION_URL: {production_url}")
        return production_url
    
    # 2. Verifica variável APP_URL customizada
    app_url_env = os.getenv('APP_URL', '').strip()
    if app_url_env:
        print(f"📧 Email Service usando APP_URL do .env: {app_url_env}")
        return app_url_env
    
    # 3. Tenta carregar do network-config.json (desenvolvimento local)
    try:
        config_path = Path(__file__).parent.parent.parent.parent / 'network-config.json'
        
        if config_path.exists():
            with open(config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)
                backend_config = config.get('backend', {})
                current_ip = backend_config.get('current_ip')
                port = backend_config.get('port', 5000)
                
                if current_ip:
                    app_url = f"http://{current_ip}:{port}"
                    print(f"📧 Email Service usando URL do network-config.json: {app_url}")
                    return app_url
    except Exception as e:
        print(f"⚠️  Erro ao ler network-config.json: {e}")
    
    # 4. Fallback final
    fallback_url = 'http://localhost:5000'
    print(f"⚠️  Email Service usando fallback: {fallback_url}")
    return fallback_url


# URL base da aplicação (carregada dinamicamente)
APP_URL = get_app_url()


def send_email(to_email: str, subject: str, html_content: str, text_content: Optional[str] = None) -> bool:
    """
    Envia email usando SMTP.
    
    Args:
        to_email: Email do destinatário
        subject: Assunto do email
        html_content: Conteúdo HTML do email
        text_content: Conteúdo em texto puro (opcional)
    
    Returns:
        True se email foi enviado com sucesso, False caso contrário
    """
    # Verifica se as configurações de email estão definidas
    if not SMTP_USER or not SMTP_PASSWORD:
        print("⚠️  Configurações de email não definidas. Email não será enviado.")
        print(f"   Para: {to_email}")
        print(f"   Assunto: {subject}")
        return False
    
    try:
        # Cria mensagem
        message = MIMEMultipart('alternative')
        message['From'] = f'{FROM_NAME} <{FROM_EMAIL}>'
        message['To'] = to_email
        message['Subject'] = subject
        
        # Adiciona conteúdo em texto puro
        if text_content:
            part1 = MIMEText(text_content, 'plain', 'utf-8')
            message.attach(part1)
        
        # Adiciona conteúdo HTML
        part2 = MIMEText(html_content, 'html', 'utf-8')
        message.attach(part2)
        
        # Conecta ao servidor SMTP e envia
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(message)
        
        print(f"✅ Email enviado com sucesso para {to_email}")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao enviar email para {to_email}: {e}")
        return False


def send_confirmation_email(to_email: str, nome: str, token: str, is_admin: bool = False) -> bool:
    """
    Envia email de confirmação de cadastro.
    
    Args:
        to_email: Email do destinatário
        nome: Nome do usuário
        token: Token de confirmação
        is_admin: Se True, envia email específico para administrador
    
    Returns:
        True se email foi enviado com sucesso
    """
    confirmation_url = f"{APP_URL}/api/users/confirm-email/{token}"
    
    if is_admin:
        subject = "Confirmação de Conta Administrador - Luxus Brechó"
        welcome_text = "Você foi adicionado como administrador do Luxus Brechó!"
        role_text = "Como administrador, você terá acesso total ao sistema de gerenciamento."
    else:
        subject = "Confirme seu email - Luxus Brechó"
        welcome_text = "Bem-vindo(a) ao Luxus Brechó!"
        role_text = "Estamos felizes em tê-lo(a) conosco!"
    
    # Conteúdo em texto puro
    text_content = f"""
Olá {nome}!

{welcome_text}

{role_text}

Para ativar sua conta, por favor confirme seu email clicando no link abaixo:

{confirmation_url}

Este link é válido por 24 horas.

Se você não criou esta conta, ignore este email.

Atenciosamente,
Equipe Luxus Brechó
    """
    
    # Conteúdo HTML
    html_content = f"""
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirme seu email</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="padding: 40px 40px 20px 40px; text-align: center; background-color: #E91E63; border-radius: 8px 8px 0 0;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 2px;">LUXUS</h1>
                                <p style="margin: 5px 0 0 0; color: #ffffff; font-size: 14px; letter-spacing: 4px;">BRECHÓ</p>
                            </td>
                        </tr>
                        
                        <!-- Conteúdo -->
                        <tr>
                            <td style="padding: 40px;">
                                <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Olá {nome}!</h2>
                                
                                <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                    {welcome_text}
                                </p>
                                
                                <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                    {role_text}
                                </p>
                                
                                <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                    Para ativar sua conta, por favor confirme seu email clicando no botão abaixo:
                                </p>
                                
                                <!-- Botão -->
                                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td align="center" style="padding: 0 0 30px 0;">
                                            <a href="{confirmation_url}" style="display: inline-block; padding: 16px 40px; background-color: #E91E63; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
                                                Confirmar Email
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                
                                <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px; line-height: 1.6;">
                                    Ou copie e cole o link abaixo no seu navegador:
                                </p>
                                
                                <p style="margin: 0 0 30px 0; color: #E91E63; font-size: 12px; line-height: 1.6; word-break: break-all;">
                                    {confirmation_url}
                                </p>
                                
                                <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px; line-height: 1.6;">
                                    ⏰ Este link é válido por <strong>24 horas</strong>.
                                </p>
                                
                                <p style="margin: 0; color: #999999; font-size: 14px; line-height: 1.6;">
                                    Se você não criou esta conta, ignore este email.
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                                <p style="margin: 0; color: #999999; font-size: 12px;">
                                    Atenciosamente,<br>
                                    <strong>Equipe Luxus Brechó</strong>
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
    
    return send_email(to_email, subject, html_content, text_content)


def send_welcome_email(to_email: str, nome: str) -> bool:
    """
    Envia email de boas-vindas após confirmação.
    
    Args:
        to_email: Email do destinatário
        nome: Nome do usuário
    
    Returns:
        True se email foi enviado com sucesso
    """
    subject = "Bem-vindo ao Luxus Brechó!"
    
    text_content = f"""
Olá {nome}!

Sua conta foi ativada com sucesso!

Agora você pode aproveitar todas as funcionalidades do Luxus Brechó.

Atenciosamente,
Equipe Luxus Brechó
    """
    
    html_content = f"""
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bem-vindo!</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="padding: 40px 40px 20px 40px; text-align: center; background-color: #E91E63; border-radius: 8px 8px 0 0;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 2px;">LUXUS</h1>
                                <p style="margin: 5px 0 0 0; color: #ffffff; font-size: 14px; letter-spacing: 4px;">BRECHÓ</p>
                            </td>
                        </tr>
                        
                        <!-- Conteúdo -->
                        <tr>
                            <td style="padding: 40px;">
                                <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">🎉 Bem-vindo(a), {nome}!</h2>
                                
                                <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                    Sua conta foi <strong>ativada com sucesso</strong>!
                                </p>
                                
                                <p style="margin: 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                    Agora você pode aproveitar todas as funcionalidades do <strong>Luxus Brechó</strong>.
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                                <p style="margin: 0; color: #999999; font-size: 12px;">
                                    Atenciosamente,<br>
                                    <strong>Equipe Luxus Brechó</strong>
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
    
    return send_email(to_email, subject, html_content, text_content)


def send_password_reset_email(to_email: str, nome: str, token: str) -> bool:
    """
    Envia email de recuperação de senha.
    
    Args:
        to_email: Email do destinatário
        nome: Nome do usuário
        token: Token de recuperação
    
    Returns:
        True se email foi enviado com sucesso
    """
    # Usa variável de ambiente para URL do frontend
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    reset_url = f"{frontend_url}/redefinir-senha/{token}"
    subject = "Recuperação de Senha - Luxus Brechó"
    
    text_content = f"""
Olá {nome}!

Recebemos uma solicitação para redefinir a senha da sua conta no Luxus Brechó.

Para criar uma nova senha, clique no link abaixo:
{reset_url}

Este link é válido por 1 hora.

Se você não solicitou a redefinição de senha, ignore este email.

Atenciosamente,
Equipe Luxus Brechó
    """
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    <table role="presentation" style="width: 600px; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <tr>
                            <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #E91E63 0%, #c2185b 100%);">
                                <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">LUXUS BRECHÓ</h1>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 40px 30px;">
                                <h2 style="margin: 0 0 20px 0; color: #333333;">Recuperação de Senha</h2>
                                <p style="margin: 0 0 20px 0; color: #666666;">Olá <strong>{nome}</strong>!</p>
                                <p style="margin: 0 0 30px 0; color: #666666;">Para redefinir sua senha, clique no botão abaixo:</p>
                                <table role="presentation" style="margin: 0 auto;">
                                    <tr>
                                        <td style="border-radius: 8px; background: #E91E63;">
                                            <a href="{reset_url}" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-weight: bold;">Redefinir Senha</a>
                                        </td>
                                    </tr>
                                </table>
                                <p style="margin: 30px 0 0 0; color: #999999; font-size: 14px;">Este link é válido por 1 hora.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    
    return send_email(to_email, subject, html_content, text_content)
