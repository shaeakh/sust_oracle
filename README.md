# ER Diagram
<img src="https://github.com/user-attachments/assets/c52c3b74-36e6-4012-98c3-9ca713c96441">
# **Project Overview: Meeting Management System**  

Welcome to our Meeting Management System, a comprehensive web-based platform designed to streamline scheduling, meeting management, and real-time collaboration. This project leverages modern web technologies and microservices to provide an intuitive experience for managing professional meetings and user interactions.

---

## **Tech Stack**  

### **Frontend**  
- **TypeScript**  
- **Next.js**  

### **Backend**  
- **JavaScript**  
- **Express.js**  

### **Database**  
- **PostgreSQL**  

### **Microservices**  
- **NodeMailer** - For transactional emails  
- **Socket.io** - Real-time data streaming  
- **OpenAI API** - Personalized report generation  

---

## **Core Features**  

1. **Authentication & Security**  
   - Secure login and registration with full validation  
   - Email verification for account activation  

2. **Role-based Meeting Management**  
   - Hosts manage meetings while guests book sessions  
   - Access permissions based on roles  

3. **Time Zone & Localization**  
   - Schedule meetings in local time zones  
   - Automatic UTC conversion for global compatibility  

4. **Interactive Dashboard**  
   - Visual meeting schedule with time slot management  
   - Real-time updates and meeting summaries  

5. **Session Management**  
   - Hosts can edit or delete sessions anytime  
   - Sessions marked as "Available" or "Booked"  

6. **Slot Booking Algorithm**  
   - Priority-based meeting requests  
   - Requests sorted by guest acceptance rates for fairness  

7. **Community & Networking**  
   - Discover new people to meet  
   - View detailed user profiles  

8. **Real-time Chat**  
   - One-on-one messaging with real-time updates  
   - Seamless data synchronization using Socket.io  

9. **Meeting Requests & Unique Links**  
   - Unique session booking links for easy sharing  
   - Personalized request submissions  

10. **Analytics & Insights**  
    - **Admin Analytics:** Daily meeting summaries and user stats  
    - **User Analytics:** Meeting summaries, acceptance ratios, and popular meeting times  

11. **Notifications & Alerts**  
    - Push notifications and email alerts for new requests  
    - Real-time session updates  

12. **Personalized Reports**  
    - Automated report generation using OpenAI API  
    - Downloadable insights for business analysis  

---

## **Bonus Features**  

1. **Admin Panel**  
   - Advanced management interface for platform administrators  

2. **Conflict Resolution**  
   - Built-in conflict management for overlapping schedules  

3. **Real-time Notifications**  
   - Email alerts to hosts upon receiving requests  


# API Documentation

## Overview
This documentation covers the endpoints for authentication, user management, scheduling, session handling, user statistics, and admin statistics.

---

## **Authentication APIs**

### **1. Registration**
**POST** `/auth/registration`

**Request Body**:
```json
{
    "email": "nixondebantu@gmail.com",
    "username": "Nixon Deb Antu",
    "password": "123456789"
}
```

**Response**:
```json
{
    "message": "Registration successful. OTP sent to your email. Please verify your email to complete the registration process."
}
```

---

### **2. Email Verification**
**POST** `/auth/registration-verify`

**Request Body**:
```json
{
    "email": "nixondebantu@gmail.com",
    "otp": "870084"
}
```

**Response**:
```json
{
    "message": "OTP is invalid or has expired"
}
```

---

### **3. Resend Verification OTP**
**POST** `/auth/resend-verification`

**Request Body**:
```json
{
    "email": "nixondebantu@gmail.com"
}
```

**Response**:
```json
{
    "message": "OTP sent to your email. Please verify your email to complete the registration process."
}
```

---

### **4. Login**
**POST** `/auth/login`

**Request Body**:
```json
{
    "email": "nixondebantu@gmail.com",
    "password": "123456789",
    "remember": false
}
```

**Response**:
```json
{
    "message": "Login successful",
    "token": "<JWT_TOKEN>"
}
```

---

### **5. Forgot Password**
**POST** `/auth/forgot-password`

**Request Body**:
```json
{
    "email": "xetesiw507@bflcafe.com"
}
```

**Response**:
```json
{
    "message": "OTP sent to your email. Please enter the OTP to reset your password."
}
```

---

### **6. Validate Reset OTP**
**POST** `/auth/validate-reset-otp`

**Request Body**:
```json
{
    "email": "xetesiw507@bflcafe.com",
    "otp": 322901
}
```

**Response**:
```json
{
    "message": "Password reset successful. Please check your email for your new password."
}
```

---

## **User APIs**

### **1. Get Profile Info**
**GET** `/user/profile`

**Authorization**: Bearer Token

**Response**:
```json
{
    "uid": 3,
    "user_name": "Nixon Deb Antu",
    "user_email": "nixondebantu@gmail.com",
    "isverified": true
}
```

---

### **2. Update User Info**
**PUT** `/user/profile`

**Authorization**: Bearer Token

**Request Body**:
```json
{
    "bio": "Hi I am Nixon"
}
```

**Response**:
```json
{
    "uid": 1,
    "user_name": "Nixon Deb Antu",
    "bio": "Hi I am Nixon"
}
```

---

### **3. Get All Users**
**GET** `/user/all-users`

**Authorization**: Bearer Token

**Response**:
```json
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
```

---

## **Schedules APIs**

### **1. Get All Schedules**
**GET** `/schedules`

**Authorization**: Bearer Token

**Response**:
```json
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
```

---

### **2. Create Schedule**
**POST** `/schedules`

**Authorization**: Bearer Token

**Request Body**:
```json
{
    "start_time": "2024-12-09T10:00:00+05:30",
    "end_time": "2024-12-09T12:00:00+05:30",
    "min_duration": 30,
    "max_duration": 120,
    "auto_approve": true
}
```

**Response**:
```json
{
    "id": 3,
    "user_id": 1,
    "start_time": "2024-12-09T04:00:00.000Z",
    "end_time": "2024-12-09T06:00:00.000Z"
}
```

---

## **Sessions APIs**

### **1. Get User Sessions**
**GET** `/session`

**Authorization**: Bearer Token

**Response**:
```json
[
    {
        "id": 1,
        "host_id": 3,
        "guest_id": 2,
        "title": "Let's talk"
    }
]
```

---

### **2. Create Session**
**POST** `/session`

**Authorization**: Bearer Token

**Request Body**:
```json
{
    "schedule_id": 33,
    "start_time": "2024-12-19T17:30:00",
    "end_time": "2024-12-19T18:00:00",
    "title": "Let's talk"
}
```

**Response**:
```json
{
    "id": 3,
    "host_id": 1,
    "guest_id": 3,
    "title": "Let's talk"
}
```

---

## **User Stats APIs**

### **1. Get Daily Stats**
**GET** `/userstats/session-history`

**Authorization**: Bearer Token

**Response**:
```json
[
    {
        "date": "2024-12-10",
        "meeting_count": 1
    }
]
```

---

## **Admin Stats APIs**

### **1. Generate Insightful Report**
**POST** `/adminstat/generate-insightful-report`

**Authorization**: Bearer Token

**Response**:
```json
{
    "success": true,
    "report": "## Session Data Analysis Report\n\n### Key Insights:\n- Highest meetings on December 9, 2024.\n- Average meeting duration: 45 minutes.\n\n### Recommendations:\n- Consider optimizing meeting times.\n"
}
```


# Team Intro : SUST_Oracle

**Nixon Deb Antu**

**Shaeakh Ahmed Chowdhury**

**Arnob Sen**

