"""
Authentication service layer containing business logic
"""
from typing import Optional, Tuple
from datetime import datetime
import alog
from backend.utils.database import get_db_session
from backend.utils.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    create_password_reset_token,
    verify_password_reset_token,
    verify_token
)
from backend.utils.email import send_password_reset_email
from backend.schemas.auth import (
    UserSignupRequest,
    UserSigninRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ChangePasswordRequest,
    TokenResponse,
    UserResponse,
    AuthResponse
)


class AuthService:
    """Authentication service class"""

    def __init__(self):
        pass

    async def signup(self, signup_data: UserSignupRequest) -> Tuple[bool, str, Optional[AuthResponse]]:
        """
        Register a new user

        Returns:
            Tuple[bool, str, Optional[AuthResponse]]: (success, message, auth_response)
        """
        try:
            async with get_db_session() as db:
                # Check if user already exists
                existing_user = await db.user.find_unique(
                    where={"email": signup_data.email}
                )

                if existing_user:
                    return False, "User with this email already exists", None

                # Hash password
                hashed_password = get_password_hash(signup_data.password)

                # Create user
                user = await db.user.create(
                    data={
                        "email": signup_data.email,
                        "name": signup_data.name,
                        "password": hashed_password
                    }
                )

                # Generate tokens
                access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
                refresh_token = create_refresh_token(data={"sub": str(user.id), "email": user.email})

                # Create response
                user_response = UserResponse(
                    id=user.id,
                    email=user.email,
                    name=user.name,
                    created_at=user.createdAt.isoformat(),
                    updated_at=user.updatedAt.isoformat()
                )

                tokens = TokenResponse(
                    access_token=access_token,
                    refresh_token=refresh_token
                )

                auth_response = AuthResponse(user=user_response, tokens=tokens)

                alog.info(f"User registered successfully: {user.email}")
                return True, "User registered successfully", auth_response

        except Exception as e:
            alog.error(f"Error during signup: {str(e)}")
            return False, "An error occurred during registration", None

    async def signin(self, signin_data: UserSigninRequest) -> Tuple[bool, str, Optional[AuthResponse]]:
        """
        Authenticate user and return tokens

        Returns:
            Tuple[bool, str, Optional[AuthResponse]]: (success, message, auth_response)
        """
        try:
            async with get_db_session() as db:
                # Find user by email
                user = await db.user.find_unique(
                    where={"email": signin_data.email}
                )

                if not user or not user.password:
                    return False, "Invalid email or password", None

                # Verify password
                if not verify_password(signin_data.password, user.password):
                    return False, "Invalid email or password", None

                # Generate tokens
                access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
                refresh_token = create_refresh_token(data={"sub": str(user.id), "email": user.email})

                # Create response
                user_response = UserResponse(
                    id=user.id,
                    email=user.email,
                    name=user.name,
                    created_at=user.createdAt.isoformat(),
                    updated_at=user.updatedAt.isoformat()
                )

                tokens = TokenResponse(
                    access_token=access_token,
                    refresh_token=refresh_token
                )

                auth_response = AuthResponse(user=user_response, tokens=tokens)

                alog.info(f"User signed in successfully: {user.email}")
                return True, "Signed in successfully", auth_response

        except Exception as e:
            alog.error(f"Error during signin: {str(e)}")
            return False, "An error occurred during sign in", None

    async def forgot_password(self, forgot_data: ForgotPasswordRequest) -> Tuple[bool, str]:
        """
        Send password reset email

        Returns:
            Tuple[bool, str]: (success, message)
        """
        try:
            async with get_db_session() as db:
                # Find user by email
                user = await db.user.find_unique(
                    where={"email": forgot_data.email}
                )

                if not user:
                    # Don't reveal if email exists or not for security
                    return True, "If the email exists, a password reset link has been sent"

                # Generate reset token
                reset_token = create_password_reset_token(user.email)

                # Send email
                email_sent = send_password_reset_email(user.email, reset_token)

                if email_sent:
                    alog.info(f"Password reset email sent to: {user.email}")
                    return True, "Password reset link has been sent to your email"
                else:
                    alog.error(f"Failed to send password reset email to: {user.email}")
                    return False, "Failed to send password reset email"

        except Exception as e:
            alog.error(f"Error during forgot password: {str(e)}")
            return False, "An error occurred while processing your request"

    async def reset_password(self, reset_data: ResetPasswordRequest) -> Tuple[bool, str]:
        """
        Reset user password using token

        Returns:
            Tuple[bool, str]: (success, message)
        """
        try:
            # Verify reset token
            email = verify_password_reset_token(reset_data.token)
            if not email:
                return False, "Invalid or expired reset token"

            async with get_db_session() as db:
                # Find user by email
                user = await db.user.find_unique(
                    where={"email": email}
                )

                if not user:
                    return False, "User not found"

                # Hash new password
                hashed_password = get_password_hash(reset_data.new_password)

                # Update user password
                await db.user.update(
                    where={"id": user.id},
                    data={"password": hashed_password}
                )

                alog.info(f"Password reset successfully for user: {user.email}")
                return True, "Password has been reset successfully"

        except Exception as e:
            alog.error(f"Error during password reset: {str(e)}")
            return False, "An error occurred while resetting password"

    async def change_password(self, user_id: int, change_data: ChangePasswordRequest) -> Tuple[bool, str]:
        """
        Change password for authenticated user

        Returns:
            Tuple[bool, str]: (success, message)
        """
        try:
            async with get_db_session() as db:
                # Find user
                user = await db.user.find_unique(
                    where={"id": user_id}
                )

                if not user or not user.password:
                    return False, "User not found"

                # Verify current password
                if not verify_password(change_data.current_password, user.password):
                    return False, "Current password is incorrect"

                # Hash new password
                hashed_password = get_password_hash(change_data.new_password)

                # Update user password
                await db.user.update(
                    where={"id": user.id},
                    data={"password": hashed_password}
                )

                alog.info(f"Password changed successfully for user: {user.email}")
                return True, "Password has been changed successfully"

        except Exception as e:
            alog.error(f"Error during password change: {str(e)}")
            return False, "An error occurred while changing password"

    async def refresh_token(self, refresh_token: str) -> Tuple[bool, str, Optional[TokenResponse]]:
        """
        Refresh access token using refresh token

        Returns:
            Tuple[bool, str, Optional[TokenResponse]]: (success, message, tokens)
        """
        try:
            # Verify refresh token
            payload = verify_token(refresh_token, "refresh")
            if not payload:
                return False, "Invalid refresh token", None

            user_id = payload.get("sub")
            email = payload.get("email")

            if not user_id or not email:
                return False, "Invalid token payload", None

            # Generate new tokens
            access_token = create_access_token(data={"sub": user_id, "email": email})
            new_refresh_token = create_refresh_token(data={"sub": user_id, "email": email})

            tokens = TokenResponse(
                access_token=access_token,
                refresh_token=new_refresh_token
            )

            return True, "Tokens refreshed successfully", tokens

        except Exception as e:
            alog.error(f"Error during token refresh: {str(e)}")
            return False, "An error occurred while refreshing token", None

    async def get_current_user(self, user_id: int) -> Optional[UserResponse]:
        """
        Get current user information

        Returns:
            Optional[UserResponse]: User information or None
        """
        try:
            async with get_db_session() as db:
                user = await db.user.find_unique(
                    where={"id": user_id}
                )

                if not user:
                    return None

                return UserResponse(
                    id=user.id,
                    email=user.email,
                    name=user.name,
                    created_at=user.createdAt.isoformat(),
                    updated_at=user.updatedAt.isoformat()
                )

        except Exception as e:
            alog.error(f"Error getting current user: {str(e)}")
            return None


# Global service instance
auth_service = AuthService()
