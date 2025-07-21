"""
Authentication routes
"""
from fastapi import APIRouter, HTTPException, status, Depends
from backend.schemas.auth import (
    UserSignupRequest,
    UserSigninRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ChangePasswordRequest,
    RefreshTokenRequest,
    AuthResponse,
    TokenResponse,
    MessageResponse,
    ErrorResponse,
    UserResponse
)
from backend.services.auth_service import auth_service
from backend.auth.dependencies import get_current_user


# Create router
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=AuthResponse)
async def signup(signup_data: UserSignupRequest):
    """
    Register a new user
    
    Args:
        signup_data: User signup information
        
    Returns:
        AuthResponse: User information and tokens
        
    Raises:
        HTTPException: If registration fails
    """
    success, message, auth_response = await auth_service.signup(signup_data)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
    
    return auth_response


@router.post("/signin", response_model=AuthResponse)
async def signin(signin_data: UserSigninRequest):
    """
    Authenticate user and return tokens
    
    Args:
        signin_data: User signin credentials
        
    Returns:
        AuthResponse: User information and tokens
        
    Raises:
        HTTPException: If authentication fails
    """
    success, message, auth_response = await auth_service.signin(signin_data)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=message
        )
    
    return auth_response


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(forgot_data: ForgotPasswordRequest):
    """
    Send password reset email
    
    Args:
        forgot_data: Email for password reset
        
    Returns:
        MessageResponse: Success message
        
    Raises:
        HTTPException: If request fails
    """
    success, message = await auth_service.forgot_password(forgot_data)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
    
    return MessageResponse(message=message)


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(reset_data: ResetPasswordRequest):
    """
    Reset user password using token
    
    Args:
        reset_data: Reset token and new password
        
    Returns:
        MessageResponse: Success message
        
    Raises:
        HTTPException: If reset fails
    """
    success, message = await auth_service.reset_password(reset_data)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
    
    return MessageResponse(message=message)


@router.post("/change-password", response_model=MessageResponse)
async def change_password(
    change_data: ChangePasswordRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Change password for authenticated user
    
    Args:
        change_data: Current and new password
        current_user: Current authenticated user
        
    Returns:
        MessageResponse: Success message
        
    Raises:
        HTTPException: If password change fails
    """
    success, message = await auth_service.change_password(current_user.id, change_data)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
    
    return MessageResponse(message=message)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_data: RefreshTokenRequest):
    """
    Refresh access token using refresh token
    
    Args:
        refresh_data: Refresh token
        
    Returns:
        TokenResponse: New access and refresh tokens
        
    Raises:
        HTTPException: If token refresh fails
    """
    success, message, tokens = await auth_service.refresh_token(refresh_data.refresh_token)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=message
        )
    
    return tokens


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserResponse = Depends(get_current_user)):
    """
    Get current user information
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        UserResponse: Current user information
    """
    return current_user


@router.post("/logout", response_model=MessageResponse)
async def logout(current_user: UserResponse = Depends(get_current_user)):
    """
    Logout user (client should discard tokens)
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        MessageResponse: Success message
    """
    # In a more sophisticated implementation, you might want to:
    # - Add tokens to a blacklist
    # - Store active sessions in database
    # - Implement token revocation
    
    return MessageResponse(message="Logged out successfully")


# Health check endpoint
@router.get("/health")
async def health_check():
    """
    Health check endpoint for authentication service
    
    Returns:
        dict: Health status
    """
    return {"status": "healthy", "service": "authentication"}
