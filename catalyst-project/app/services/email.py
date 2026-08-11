import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.core.config import settings

logger = logging.getLogger(__name__)


def send_password_reset_email(email_to: str, token: str, user_name: str) -> bool:
    """
    Sends a password reset email to user using Google SMTP.
    If SMTP credentials are not configured, prints the reset link to server logs for dev testing.
    """
    reset_link = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password?token={token}"

    logger.info(f"Generated password reset link for {email_to}: {reset_link}")

    # Check if SMTP is configured
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning(
            "SMTP credentials (SMTP_USER / SMTP_PASSWORD) are not set in .env! "
            f"Reset link for testing: {reset_link}"
        )
        return False

    sender_email = settings.EMAILS_FROM_EMAIL or settings.SMTP_USER
    sender_name = settings.EMAILS_FROM_NAME or "Nepal Opportunity Map"

    subject = "Password Reset Request - Nepal Opportunity Map"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4fbf7;
                color: #1e293b;
                margin: 0;
                padding: 20px;
            }}
            .container {{
                max-width: 580px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 16px;
                padding: 32px;
                border: 1px solid #d1fae5;
                box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.1);
            }}
            .logo {{
                font-size: 20px;
                font-weight: 800;
                color: #047857;
                margin-bottom: 24px;
                display: flex;
                align-items: center;
                gap: 8px;
            }}
            .button {{
                display: inline-block;
                background-color: #059669;
                color: #ffffff !important;
                font-weight: 700;
                padding: 14px 28px;
                border-radius: 10px;
                text-decoration: none;
                margin: 24px 0;
            }}
            .footer {{
                margin-top: 32px;
                padding-top: 16px;
                border-top: 1px solid #e2e8f0;
                font-size: 12px;
                color: #64748b;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">
                🇳🇵 Nepal Opportunity Map
            </div>
            <h2>Password Reset Request</h2>
            <p>Hello <strong>{user_name}</strong>,</p>
            <p>We received a request to reset your password for your account (<code>{email_to}</code>). Click the button below to set a new password:</p>
            
            <p style="text-align: center;">
                <a href="{reset_link}" class="button">Reset Password</a>
            </p>
            
            <p style="font-size: 13px; color: #475569;">
                If you didn't request a password reset, you can safely ignore this email. This link will expire in <strong>{settings.RESET_TOKEN_EXPIRE_MINUTES} minutes</strong>.
            </p>
            <p style="font-size: 12px; color: #94a3b8; word-break: break-all;">
                If the button above doesn't work, copy and paste this URL into your web browser:<br>
                <a href="{reset_link}">{reset_link}</a>
            </p>
            <div class="footer">
                Nepal Municipality Spatial Intelligence Engine • Automated Security Notification
            </div>
        </div>
    </body>
    </html>
    """

    plain_content = f"""
    Hello {user_name},

    We received a request to reset your password for Nepal Opportunity Map.
    Reset your password by following this link:
    {reset_link}

    This link expires in {settings.RESET_TOKEN_EXPIRE_MINUTES} minutes.
    If you did not request this reset, please ignore this email.
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{sender_name} <{sender_email}>"
    msg["To"] = email_to

    msg.attach(MIMEText(plain_content, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    try:
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(sender_email, [email_to], msg.as_string())
        server.quit()
        logger.info(f"Password reset email sent successfully to {email_to}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {email_to} via SMTP: {e}", exc_info=True)
        return False
