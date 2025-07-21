"""
Email utilities for sending password reset emails
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import alog
from backend.config.settings import settings


def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None
) -> bool:
    """
    Send an email using SMTP
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        html_content: HTML content of the email
        text_content: Plain text content (optional)
    
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    if not all([settings.smtp_server, settings.smtp_username, settings.smtp_password, settings.email_from]):
        alog.warning("Email configuration is incomplete. Cannot send email.")
        return False
    
    try:
        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.email_from_name} <{settings.email_from}>"
        msg["To"] = to_email
        
        # Add text content if provided
        if text_content:
            text_part = MIMEText(text_content, "plain")
            msg.attach(text_part)
        
        # Add HTML content
        html_part = MIMEText(html_content, "html")
        msg.attach(html_part)
        
        # Connect to server and send email
        with smtplib.SMTP(settings.smtp_server, settings.smtp_port) as server:
            if settings.smtp_use_tls:
                server.starttls()
            server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(msg)
        
        alog.info(f"Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        alog.error(f"Failed to send email to {to_email}: {str(e)}")
        return False


def send_password_reset_email(email: str, reset_token: str) -> bool:
    """
    Send password reset email
    
    Args:
        email: User's email address
        reset_token: Password reset token
    
    Returns:
        bool: True if email was sent successfully
    """
    # In a real application, you would have a proper frontend URL
    reset_url = f"http://localhost:3000/reset-password?token={reset_token}"
    
    subject = f"Password Reset - {settings.app_name}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Password Reset</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Password Reset Request</h2>
            
            <p>Hello,</p>
            
            <p>You have requested to reset your password for {settings.app_name}. 
            Click the button below to reset your password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_url}" 
                   style="background-color: #2563eb; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 5px; display: inline-block;">
                    Reset Password
                </a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">{reset_url}</p>
            
            <p><strong>This link will expire in {settings.password_reset_token_expire_minutes} minutes.</strong></p>
            
            <p>If you didn't request this password reset, please ignore this email.</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
                This email was sent by {settings.app_name}. 
                Please do not reply to this email.
            </p>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    Password Reset Request
    
    Hello,
    
    You have requested to reset your password for {settings.app_name}.
    
    Please visit the following link to reset your password:
    {reset_url}
    
    This link will expire in {settings.password_reset_token_expire_minutes} minutes.
    
    If you didn't request this password reset, please ignore this email.
    
    ---
    This email was sent by {settings.app_name}.
    """
    
    return send_email(email, subject, html_content, text_content)
