"""
Simple test script to verify authentication endpoints
Run this after installing dependencies and starting the server
"""
import asyncio
import httpx
import json


BASE_URL = "http://localhost:8000/api/auth"


async def test_auth_endpoints():
    """Test authentication endpoints"""
    async with httpx.AsyncClient() as client:
        print("Testing Authentication Endpoints...")
        print("=" * 50)
        
        # Test health check
        print("\n1. Testing health check...")
        try:
            response = await client.get(f"{BASE_URL}/health")
            print(f"Status: {response.status_code}")
            print(f"Response: {response.json()}")
        except Exception as e:
            print(f"Error: {e}")
        
        # Test signup
        print("\n2. Testing user signup...")
        signup_data = {
            "email": "test@example.com",
            "name": "Test User",
            "password": "testpass123"
        }
        try:
            response = await client.post(f"{BASE_URL}/signup", json=signup_data)
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                print(f"User created: {result['user']['email']}")
                access_token = result['tokens']['access_token']
                print("Signup successful!")
            else:
                print(f"Response: {response.json()}")
        except Exception as e:
            print(f"Error: {e}")
        
        # Test signin
        print("\n3. Testing user signin...")
        signin_data = {
            "email": "test@example.com",
            "password": "testpass123"
        }
        try:
            response = await client.post(f"{BASE_URL}/signin", json=signin_data)
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                access_token = result['tokens']['access_token']
                print(f"User signed in: {result['user']['email']}")
                print("Signin successful!")
                
                # Test protected endpoint
                print("\n4. Testing protected endpoint (/me)...")
                headers = {"Authorization": f"Bearer {access_token}"}
                me_response = await client.get(f"{BASE_URL}/me", headers=headers)
                print(f"Status: {me_response.status_code}")
                if me_response.status_code == 200:
                    user_info = me_response.json()
                    print(f"Current user: {user_info['email']}")
                else:
                    print(f"Response: {me_response.json()}")
            else:
                print(f"Response: {response.json()}")
        except Exception as e:
            print(f"Error: {e}")
        
        # Test forgot password
        print("\n5. Testing forgot password...")
        forgot_data = {
            "email": "test@example.com"
        }
        try:
            response = await client.post(f"{BASE_URL}/forgot-password", json=forgot_data)
            print(f"Status: {response.status_code}")
            print(f"Response: {response.json()}")
        except Exception as e:
            print(f"Error: {e}")
        
        print("\n" + "=" * 50)
        print("Authentication tests completed!")
        print("\nNote: Email functionality requires SMTP configuration in .env file")


if __name__ == "__main__":
    asyncio.run(test_auth_endpoints())
