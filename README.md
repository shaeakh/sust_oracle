<img src="https://github.com/user-attachments/assets/c52c3b74-36e6-4012-98c3-9ca713c96441">

API Documentation
Overview
This documentation covers the endpoints for authentication, user management, scheduling, session handling, user statistics, and admin statistics.

Authentication APIs
1. Registration
POST /auth/registration
Request Body:
{
    "email": "nixondebantu@gmail.com",
    "username": "Nixon Deb Antu",
    "password": "123456789"
}

Response:
{
    "message": "Registration successful. OTP sent to your email. Please verify your email to complete the registration process."
}


2. Email Verification
POST /auth/registration-verify
Request Body:
{
    "email": "nixondebantu@gmail.com",
    "otp": "870084"
}

Response:
{
    "message": "OTP is invalid or has expired"
}


3. Resend Verification OTP
POST /auth/resend-verification
Request Body:
{
    "email": "nixondebantu@gmail.com"
}

Response:
{
    "message": "OTP sent to your email. Please verify your email to complete the registration process."
}


4. Login
POST /auth/login
Request Body:
{
    "email": "nixondebantu@gmail.com",
    "password": "123456789",
    "remember": false
}

Response:
{
    "message": "Login successful",
    "token": "<JWT_TOKEN>"
}


5. Forgot Password
POST /auth/forgot-password
Request Body:
{
    "email": "xetesiw507@bflcafe.com"
}

Response:
{
    "message": "OTP sent to your email. Please enter the OTP to reset your password."
}


6. Validate Reset OTP
POST /auth/validate-reset-otp
Request Body:
{
    "email": "xetesiw507@bflcafe.com",
    "otp": 322901
}

Response:
{
    "message": "Password reset successful. Please check your email for your new password."
}


User APIs
1. Get Profile Info
GET /user/profile
Authorization: Bearer Token
Response:
{
    "uid": 3,
    "user_name": "Nixon Deb Antu",
    "user_email": "nixondebantu@gmail.com",
    "isverified": true
}


2. Update User Info
PUT /user/profile
Authorization: Bearer Token
Request Body:
{
    "bio": "Hi I am Nixon"
}

Response:
{
    "uid": 1,
    "user_name": "Nixon Deb Antu",
    "bio": "Hi I am Nixon"
}


3. Get All Users
GET /user/all-users
Authorization: Bearer Token
Response:
[
    {
        "uid": 2,
        "user_name": "Shaeakh Ahmed Chowdhury"
    },
    {
        "uid": 1,
        "user_name": "Nixon Deb Antu"
    }
]


Schedules APIs
1. Get All Schedules
GET /schedules
Authorization: Bearer Token
Response:
[
    {
        "id": 3,
        "user_id": 1,
        "start_time": "2024-12-09T04:00:00.000Z",
        "end_time": "2024-12-09T06:00:00.000Z",
        "min_duration": 30,
        "max_duration": 120,
        "auto_approve": true
    }
]


2. Create Schedule
POST /schedules
Authorization: Bearer Token
Request Body:
{
    "start_time": "2024-12-09T10:00:00+05:30",
    "end_time": "2024-12-09T12:00:00+05:30",
    "min_duration": 30,
    "max_duration": 120,
    "auto_approve": true
}

Response:
{
    "id": 3,
    "user_id": 1,
    "start_time": "2024-12-09T04:00:00.000Z",
    "end_time": "2024-12-09T06:00:00.000Z"
}


Sessions APIs
1. Get User Sessions
GET /session
Authorization: Bearer Token
Response:
[
    {
        "id": 1,
        "host_id": 3,
        "guest_id": 2,
        "title": "Let's talk"
    }
]


2. Create Session
POST /session
Authorization: Bearer Token
Request Body:
{
    "schedule_id": 33,
    "start_time": "2024-12-19T17:30:00",
    "end_time": "2024-12-19T18:00:00",
    "title": "Let's talk"
}

Response:
{
    "id": 3,
    "host_id": 1,
    "guest_id": 3,
    "title": "Let's talk"
}


User Stats APIs
1. Get Daily Stats
GET /userstats/session-history
Authorization: Bearer Token
Response:
[
    {
        "date": "2024-12-10",
        "meeting_count": 1
    }
]


Admin Stats APIs
1. Generate Insightful Report
POST /adminstat/generate-insightful-report
Authorization: Bearer Token
Response:
{
    "success": true,
    "report": "## Session Data Analysis Report\n\n### Key Insights:\n- Highest meetings on December 9, 2024.\n- Average meeting duration: 45 minutes.\n\n### Recommendations:\n- Consider optimizing meeting times.\n"
}




