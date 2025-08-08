# eLearning Platform API Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [Tenants](#tenants)
4. [Users](#users)
5. [Courses](#courses)
6. [Presentations](#presentations)
7. [Quizzes](#quizzes)
8. [Screenshots](#screenshots)
9. [Tutorials](#tutorials)
10. [Analytics](#analytics)
11. [Error Handling](#error-handling)
12. [Rate Limiting](#rate-limiting)
13. [Data Protection](#data-protection)

## Introduction

The eLearning Platform API provides a RESTful interface for interacting with the eLearning platform. The API is organized around REST, has predictable resource-oriented URLs, and uses HTTP response codes to indicate API errors.

### Base URL

```
https://api.elearning.com/v1
```

### Authentication

Most API endpoints require authentication using JWT (JSON Web Tokens). Include the JWT in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### API Versioning

The API is versioned using the URL path. The current version is v1.

## Authentication

### Register User

Register a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "Password123!",
  "role": "creator",
  "tenantId": "60d21b4667d0d8992e610c85"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d21b4667d0d8992e610c86",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "creator",
    "tenantId": "60d21b4667d0d8992e610c85"
  }
}
```

### Login User

Authenticate a user and get a JWT token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d21b4667d0d8992e610c86",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "creator",
    "tenantId": "60d21b4667d0d8992e610c85"
  }
}
```

### Refresh Token

Get a new JWT token using a refresh token.

**Endpoint:** `POST /auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Logout User

Invalidate the current JWT token.

**Endpoint:** `POST /auth/logout`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "msg": "User logged out successfully"
}
```

### Forgot Password

Request a password reset email.

**Endpoint:** `POST /auth/forgot-password`

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Response:**
```json
{
  "msg": "Password reset email sent"
}
```

### Reset Password

Reset a user's password using a reset token.

**Endpoint:** `POST /auth/reset-password/:token`

**Request Body:**
```json
{
  "password": "NewPassword123!"
}
```

**Response:**
```json
{
  "msg": "Password reset successfully"
}
```

## Tenants

### Create Tenant

Create a new tenant (organization).

**Endpoint:** `POST /tenants`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "name": "Example Organization",
  "slug": "example-org",
  "settings": {
    "theme": "default",
    "allowRegistration": true,
    "requireEmailVerification": false
  },
  "subscription": {
    "plan": "premium",
    "status": "active"
  }
}
```

**Response:**
```json
{
  "id": "60d21b4667d0d8992e610c85",
  "name": "Example Organization",
  "slug": "example-org",
  "settings": {
    "theme": "default",
    "allowRegistration": true,
    "requireEmailVerification": false
  },
  "subscription": {
    "plan": "premium",
    "status": "active",
    "startDate": "2021-06-23T00:00:00.000Z",
    "endDate": "2022-06-23T00:00:00.000Z"
  },
  "isActive": true,
  "createdAt": "2021-06-23T00:00:00.000Z",
  "updatedAt": "2021-06-23T00:00:00.000Z"
}
```

### Get Tenant

Get a tenant by ID or slug.

**Endpoint:** `GET /tenants/:id`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "id": "60d21b4667d0d8992e610c85",
  "name": "Example Organization",
  "slug": "example-org",
  "settings": {
    "theme": "default",
    "allowRegistration": true,
    "requireEmailVerification": false
  },
  "subscription": {
    "plan": "premium",
    "status": "active",
    "startDate": "2021-06-23T00:00:00.000Z",
    "endDate": "2022-06-23T00:00:00.000Z"
  },
  "isActive": true,
  "createdAt": "2021-06-23T00:00:00.000Z",
  "updatedAt": "2021-06-23T00:00:00.000Z"
}
```

### Update Tenant

Update a tenant's information.

**Endpoint:** `PUT /tenants/:id`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "name": "Updated Organization Name",
  "settings": {
    "theme": "dark",
    "allowRegistration": false
  }
}
```

**Response:**
```json
{
  "id": "60d21b4667d0d8992e610c85",
  "name": "Updated Organization Name",
  "slug": "example-org",
  "settings": {
    "theme": "dark",
    "allowRegistration": false,
    "requireEmailVerification": false
  },
  "subscription": {
    "plan": "premium",
    "status": "active",
    "startDate": "2021-06-23T00:00:00.000Z",
    "endDate": "2022-06-23T00:00:00.000Z"
  },
  "isActive": true,
  "createdAt": "2021-06-23T00:00:00.000Z",
  "updatedAt": "2021-06-23T00:00:00.000Z"
}
```

### Get Tenant Users

Get all users belonging to a tenant.

**Endpoint:** `GET /tenants/:id/users`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `search` (optional): Search term
- `role` (optional): Filter by role (admin, creator, learner)
- `isActive` (optional): Filter by active status (true/false)

**Response:**
```json
{
  "users": [
    {
      "id": "60d21b4667d0d8992e610c86",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "creator",
      "isActive": true,
      "createdAt": "2021-06-23T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

## Users

### Get Current User

Get the current authenticated user's profile.

**Endpoint:** `GET /users/me`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "id": "60d21b4667d0d8992e610c86",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "role": "creator",
  "tenantId": "60d21b4667d0d8992e610c85",
  "isActive": true,
  "createdAt": "2021-06-23T00:00:00.000Z",
  "updatedAt": "2021-06-23T00:00:00.000Z"
}
```

### Update User Profile

Update the current user's profile.

**Endpoint:** `PUT /users/me`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "phone": "+1234567890",
  "bio": "Updated bio"
}
```

**Response:**
```json
{
  "id": "60d21b4667d0d8992e610c86",
  "firstName": "Updated",
  "lastName": "Name",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "bio": "Updated bio",
  "role": "creator",
  "tenantId": "60d21b4667d0d8992e610c85",
  "isActive": true,
  "createdAt": "2021-06-23T00:00:00.000Z",
  "updatedAt": "2021-06-23T00:00:00.000Z"
}
```

### Change Password

Change the current user's password.

**Endpoint:** `PUT /users/me/password`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword123!"
}
```

**Response:**
```json
{
  "msg": "Password updated successfully"
}
```

### Get User by ID

Get a user by ID (admin only).

**Endpoint:** `GET /users/:id`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "id": "60d21b4667d0d8992e610c86",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "role": "creator",
  "tenantId": "60d21b4667d0d8992e610c85",
  "isActive": true,
  "createdAt": "2021-06-23T00:00:00.000Z",
  "updatedAt": "2021-06-23T00:00:00.000Z"
}
```

### Update User

Update a user's information (admin only).

**Endpoint:** `PUT /users/:id`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "role": "admin",
  "isActive": true
}
```

**Response:**
```json
{
  "id": "60d21b4667d0d8992e610c86",
  "firstName": "Updated",
  "lastName": "Name",
  "email": "john.doe@example.com",
  "role": "admin",
  "tenantId": "60d21b4667d0d8992e610c85",
  "isActive": true,
  "createdAt": "2021-06-23T00:00:00.000Z",
  "updatedAt": "2021-06-23T00:00:00.000Z"
}
```

### Delete User

Delete a user (admin only).

**Endpoint:** `DELETE /users/:id`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "msg": "User deleted successfully"
}
```

## Courses

### Create Course

Create a new course.

**Endpoint:** `POST /courses`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "title": "Introduction to Programming",
  "description": "Learn the basics of programming",
  "shortDescription": "A beginner-friendly introduction to programming",
  "category": "programming",
  "tags": ["programming", "beginner", "coding"],
  "isPublished": true,
  "estimatedTime": 120,
  "difficulty": "beginner",
  "prerequisites": ["Basic computer skills"],
  "learningObjectives": ["Understand programming concepts", "Write simple programs"],
  "targetAudience": ["Beginners", "Students"]
}
```

**Response:**
```json
{
  "id": "60d21b4667d0d8992e610c87",
  "title": "Introduction to Programming",
  "description": "Learn the basics of programming",
  "shortDescription": "A beginner-friendly introduction to programming",
  "thumbnail": "default-course-thumbnail.jpg",
  "category": "programming",
  "tags": ["programming", "beginner", "coding"],
  "isPublished": true,
  "isFeatured": false,
  "estimatedTime": 120,
  "difficulty": "beginner",
  "prerequisites": ["Basic computer skills"],
  "learningObjectives": ["Understand programming concepts", "Write simple programs"],
  "targetAudience": ["Beginners", "Students"],
  "tenantId": "60d21b4667d0d8992e610c85",
  "createdBy": "60d21b4667d0d8992e610c86",
  "presentations": [],
  "enrollmentCount": 0,
  "viewCount": 0,
  "createdAt": "2021-06-23T00:00:00.000Z",
  "updatedAt": "2021-06-23T00:00:00.000Z"
}
```

### Get Courses

Get all courses for the current tenant.

**Endpoint:** `GET /courses`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `search` (optional): Search term
- `category` (optional): Filter by category
- `tags` (optional): Filter by tags (comma-separated)
- `difficulty` (optional): Filter by difficulty (beginner, intermediate, advanced)
- `isPublished` (optional): Filter by published status (true/false)
- `isFeatured` (optional): Filter by featured status (true/false)
- `sort` (optional): Sort field (default: createdAt)
- `order` (optional): Sort order (asc/desc, default: desc)

**Response:**
```json
{
  "courses": [
    {
      "id": "60d21b4667d0d8992e610c87",
      "title": "Introduction to Programming",
      "description": "Learn the basics of programming",
      "shortDescription": "A beginner-friendly introduction to programming",
      "thumbnail": "default-course-thumbnail.jpg",
      "category": "programming",
      "tags": ["programming", "beginner", "coding"],
      "isPublished": true,
      "isFeatured": false,
      "estimatedTime": 120,
      "difficulty": "beginner",
      "tenantId": "60d21b4667d0d8992e610c85",
      "createdBy": "60d21b4667d0d8992e610c86",
      "enrollmentCount": 0,
      "viewCount": 0,
      "createdAt": "2021-06-23T00:00:00.000Z",
      "updatedAt": "2021-06-23T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### Get Course by ID

Get a course by ID.

**Endpoint:** `GET /courses/:id`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "id": "60d21b4667d0d8992e610c87",
  "title": "Introduction to Programming",
  "description": "Learn the basics of programming",
  "shortDescription": "A beginner-friendly introduction to programming",
  "thumbnail": "default-course-thumbnail.jpg",
  "category": "programming",
  "tags": ["programming", "beginner", "coding"],
  "isPublished": true,
  "isFeatured": false,
  "estimatedTime": 120,
  "difficulty": "beginner",
  "prerequisites": ["Basic computer skills"],
  "learningObjectives": ["Understand programming concepts", "Write simple programs"],
  "targetAudience": ["Beginners", "Students"],
  "tenantId": "60d21b4667d0d8992e610c85",
  "createdBy": "60d21b4667d0d8992e610c86",
  "presentations": [],
  "enrollmentCount": 0,
  "viewCount": 0,
  "createdAt": "2021-06-23T00:00:00.000Z",
  "updatedAt": "2021-06-23T00:00:00.000Z"
}
```

### Update Course

Update a course.

**Endpoint:** `PUT /courses/:id`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "title": "Updated Course Title",
  "description": "Updated course description",
  "isPublished": false
}
```

**Response:**
```json
{
  "id": "60d21b4667d0d8992e610c87",
  "title": "Updated Course Title",
  "description": "Updated course description",
  "shortDescription": "A beginner-friendly introduction to programming",
  "thumbnail": "default-course-thumbnail.jpg",
  "category": "programming",
  "tags": ["programming", "beginner", "coding"],
  "isPublished": false,
  "isFeatured": false,
  "estimatedTime": 120,
  "difficulty": "beginner",
  "prerequisites": ["Basic computer skills"],
  "learningObjectives": ["Understand programming concepts", "Write simple programs"],
  "targetAudience": ["Beginners", "Students"],
  "tenantId": "60d21b4667d0d8992e610c85",
  "createdBy": "60d21b4667d0d8992e610c86",
  "presentations": [],
  "enrollmentCount": 0,
  "viewCount": 0,
  "createdAt": "2021-06-23T00:00:00.000Z",
  "updatedAt": "2021-06-23T00:00:00.000Z"
}
```

### Delete Course

Delete a course.

**Endpoint:** `DELETE /courses/:id`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "msg": "Course deleted successfully"
}
```

### Enroll in Course

Enroll the current user in a course.

**Endpoint:** `POST /courses/:id/enroll`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "msg": "Enrolled in course successfully"
}
```

### Unenroll from Course

Unenroll the current user from a course.

**Endpoint:** `DELETE /courses/:id/enroll`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "msg": "Unenrolled from course successfully"
}
```

## Presentations

### Create Presentation

Create a new presentation.

**Endpoint:** `POST /presentations`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "title": "Introduction to Variables",
  "description": "Learn about variables in programming",
  "shortDescription": "Understanding variables and data types",
  "category": "programming",
  "tags": ["variables", "data types", "programming"],
  "settings": {
    "allowNavigation": true,
    "showProgress": true,
    "autoPlay": false
  },
  "isPublished": true,
  "estimatedTime": 30,
  "difficulty": "beginner",
  "prerequisites": ["Basic computer skills"],
  "learningObjectives": ["Understand variables", "Learn about data types"],
  "targetAudience": ["Beginners", "Students"]
}
```

**Response:**
```json
{
  "id": "60d21b4667d0d8992e610c88",
  "title": "Introduction to Variables",
  "description": "Learn about variables in programming",
  "shortDescription": "Understanding variables and data types",
  "thumbnail": "default-presentation-thumbnail.jpg",
  "category": "programming",
  "tags": ["variables", "data types", "programming"],
  "settings": {
    "allowNavigation": true,
    "showProgress": true,
    "autoPlay": false
  },
  "isPublished": true,
  "isFeatured": false,
  "estimatedTime": 30,
  "difficulty": "beginner",
  "prerequisites": ["Basic computer skills"],
  "learningObjectives": ["Understand variables", "Learn about data types"],
  "targetAudience": ["Beginners", "Students"],
  "tenantId": "60d21b4667d0d8992e610c85",
  "createdBy": "60d21b4667d0d8992e610c86",
  "courses": [],
  "slides": [],
  "branchingScenarios": [],
  "viewCount": 0,
  "completionCount": 0,
  "createdAt": "2021-06-23T00:00:00.000Z",
  "updatedAt": "2021-06-23T00:00:00.000Z"
}
```

### Get Presentations

Get all presentations for the current tenant.

**Endpoint:** `GET /presentations`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `search` (optional): Search term
- `category` (optional): Filter by category
- `tags` (optional): Filter by tags (comma-separated)
- `isPublished` (optional): Filter by published status (true/false)
- `sort` (optional): Sort field (default: createdAt)
- `order` (optional): Sort order (asc/desc, default: desc)

**Response:**
```json
{
  "presentations": [
    {
      "id": "60d21b4667d0d8992e610c88",
      "title": "Introduction to Variables",
      "description": "Learn about variables in programming",
      "shortDescription": "Understanding variables and data types",
      "thumbnail": "default-presentation-thumbnail.jpg",
      "category": "programming",
      "tags": ["variables", "data types", "programming"],
      "isPublished": true,
      "isFeatured": false,
      "estimatedTime": 30,
      "difficulty": "beginner",
      "tenantId": "60d21b4667d0d8992e610c85",
      "createdBy": "60d21b4667d0d8992e610c86",
      "viewCount": 0,
      "completionCount": 0,
      "createdAt": "2021-06-23T00:00:00.000Z",
      "updatedAt": "2021-06-23T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### Get Presentation by ID

Get a presentation by ID.

**Endpoint:** `GET /presentations/:id`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "id": "60d21b4667d0d8992e610c88",
  "title": "Introduction to Variables",
  "description": "Learn about variables in programming",
  "shortDescription": "Understanding variables and data types",
  "thumbnail": "default-presentation-thumbnail.jpg",
  "category": "programming",
  "tags": ["variables", "data types", "programming"],
  "settings": {
    "allowNavigation": true,
    "showProgress": true,
    "autoPlay": false
  },
  "isPublished": true,
  "isFeatured": false,
  "estimatedTime": 30,
  "difficulty": "beginner",
  "prerequisites": ["Basic computer skills"],
  "learningObjectives": ["Understand variables", "Learn about data types"],
  "targetAudience": ["Beginners", "Students"],
  "tenantId": "60d21b4667d0d8992e610c85",
  "createdBy": "60d21b4667d0d8992e610c86",
  "courses": [],
  "slides": [],
  "branchingScenarios": [],
  "viewCount": 0,
  "completionCount": 0,
  "createdAt": "2021-06-23T00:00:00.000Z",
  "updatedAt": "2021-06-23T00:00:00.000Z"
}
```

### Update Presentation

Update a presentation.

**Endpoint:** `PUT /presentations/:id`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "title": "Updated Presentation Title",
  "description": "Updated presentation description",
  "isPublished": false
}
```

**Response:**
```json
{
  "id": "60d21b4667d0d8992e610c88",
  "title": "Updated Presentation Title",
  "description": "Updated presentation description",
  "shortDescription": "Understanding variables and data types",
  "thumbnail": "default-presentation-thumbnail.jpg",
  "category": "programming",
  "tags": ["variables", "data types", "programming"],
  "settings": {
    "allowNavigation": true,
    "showProgress": true,
    "autoPlay": false
  },
  "isPublished": false,
  "isFeatured": false,
  "estimatedTime": 30,
  "difficulty": "beginner",
  "prerequisites": ["Basic computer skills"],
  "learningObjectives": ["Understand variables", "Learn about data types"],
  "targetAudience": ["Beginners", "Students"],
  "tenantId": "60d21b4667d0d8992e610c85",
  "createdBy": "60d21b4667d0d8992e610c86",
  "courses": [],
  "slides": [],
  "branchingScenarios": [],
  "viewCount": 0,
  "completionCount": 0,
  "createdAt": "2021-06-23T00:00:00.000Z",
  "updatedAt": "2021-06-23T00:00:00.000Z"
}
```

### Delete Presentation

Delete a presentation.

**Endpoint:** `DELETE /presentations/:id`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "msg": "Presentation deleted successfully"
}
```

### Add Slide to Presentation

Add a slide to a presentation.

**Endpoint:** `POST /presentations/:id/slides`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "title": "What is a Variable?",
  "content": "A variable is a named storage location in memory...",
  "layout": "content",
  "order": 1
}
```

**Response:**
```json
{
  "id": "60d21b4667d0d8992e610c88",
  "title": "Introduction to Variables",
  "description": "Learn about variables in programming",
  "slides": [
    {
      "id": "60d21b4667d0d8992e610c89",
      "title": "What is a Variable?",
      "content": "A variable is a named storage location in memory...",
      "backgroundImage": "",
      "backgroundColor": "#FFFFFF",
      "textColor": "#212121",
      "layout": "content",
      "order": 1,
      "media": [],
      "notes": "",
      "animation": "fade",
      "transition": "fade",
      "duration": 0,
      "hotspots": []
    }
  ],
  "branchingScenarios": [],
  "viewCount": 0,
  "completionCount": 0,
  "createdAt": "2021-06-23T00:00:00.000Z",
  "updatedAt": "2021-06-23T00:00:00.000Z"
}
```

### Update Slide in Presentation

Update a slide in a presentation.

**Endpoint:** `PUT /presentations/:id/slides/:slideId`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "title": "Updated Slide Title",
  "content": "Updated slide content"
}
```

**Response:**
```json
{
  "id": "60d21b4667d0d8992e610c88",
  "title": "Introduction to Variables",
  "description": "Learn about variables in programming",
  "slides": [
    {
      "id": "60d21b4667d0d8992e610c89",
      "title": "Updated Slide Title",
      "content": "Updated slide content",
      "backgroundImage": "",
      "backgroundColor": "#FFFFFF",
      "textColor": "#212121",
      "layout": "content",
      "order": 1,
      "media": [],
      "notes": "",
      "animation": "fade",
      "transition": "fade",
      "duration": 0,
      "hotspots": []
    }
  ],
  "branchingScenarios": [],
  "viewCount": 0,
  "completionCount": 0,
  "createdAt": "2021-06-23T00:00:00.000Z",
  "updatedAt": "2021-06-23T00:00:00.000Z"
}
```

### Delete Slide from Presentation

Delete a slide from a presentation.

**Endpoint:** `DELETE /presentations/:id/slides/:slideId`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "msg": "Slide deleted successfully"
}
```

### Add Hotspot to Slide

Add a hotspot to a slide.

**Endpoint:** `POST /presentations/:id/slides/:slideId/hotspots`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "title": "More Info",
  "description": "Click for more information about variables",
  "type": "info",
  "position": {
    "x": 50,
    "y": 50
  },
  "size": {
    "width": 30,
    "height": 30
  },
  "shape": "circle",
  "action": {
    "type": "popup",
    "content": "Variables are containers for storing data values."
  }
}
```

**Response:**
```json
{
  "id": "60d21b4667d0d8992e610c88",
  "title": "Introduction to Variables",
  "description": "Learn about variables in programming",
  "slides": [
    {
      "id": "60d21b4667d0d8992e610c89",
      "title": "What is a Variable?",
      "content": "A variable is a named storage location in memory...",
      "hotspots": [
        {
          "id": "60d21b4667d0d8992e610c90",
          "title": "More Info",
          "description": "Click for more information about variables",
          "type": "info",
          "position": {
            "x": 50,
            "y": 50
          },
          "size": {
            "width": 30,
            "height": 30
          },
          "shape": "circle",
          "style": {
            "backgroundColor": "rgba(0, 172, 193, 0.7)",
            "borderColor": "#00ACC1",
            "borderWidth": 2,
            "textColor": "#FFFFFF",
            "icon": "info"
          },
          "action": {
            "type": "popup",
            "content": "Variables are containers for storing data values."
          },
          "isActive": true,
          "order": 1
        }
      ]
    }
  ],
  "branchingScenarios": [],
  "viewCount": 0,
  "completionCount": 0,
  "createdAt": "2021-06-23T00:00:00.000Z",
  "updatedAt": "2021-06-23T00:00:00.000Z"
}
```

### Update Hotspot in Slide

Update a hotspot in a slide.

**Endpoint:** `PUT /presentations/:id/slides/:slideId/hotspots/:hotspotId`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "title": "Updated Hotspot Title",
  "description": "Updated hotspot description"
}
```

**Response:**
```json
{
  "id": "60d21b4667d0d8992e610c88",
  "title": "Introduction to Variables",
  "description": "Learn about variables in programming",
  "slides": [
    {
      "id": "60d21b4667d0d8992e610c89",
      "title": "What is a Variable?",
      "content": "A variable is a named storage location in memory...",
      "hotspots": [
        {
          "id": "60d21b4667d0d8992e610c90",
          "title": "Updated Hotspot Title",
          "description": "Updated hotspot description",
          "type": "info",
          "position": {
            "x": 50,
            "y": 50
          },
          "size": {
            "width": 30,
            "height": 30
          },
          "shape": "circle",
          "style": {
            "backgroundColor": "rgba(0, 172, 193, 0.7)",
            "borderColor": "#00ACC1",
            "borderWidth": 2,
            "textColor": "#FFFFFF",
            "icon": "info"
          },
          "action": {
            "type": "popup",
            "content": "Variables are containers for storing data values."
          },
          "isActive": true,
          "order": 1
        }
      ]
    }
  ],
  "branchingScenarios": [],
  "viewCount": 0,
  "completionCount": 0,
  "createdAt": "2021-06-23T00:00:00.000Z",
  "updatedAt": "2021-06-23T00:00:00.000Z"
}
```

### Delete Hotspot from Slide

Delete a hotspot from a slide.

**Endpoint:** `DELETE /presentations/:id/slides/:slideId/hotspots/:hotspotId`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "msg": "Hotspot deleted successfully"
}
```

### Add Branching Scenario to Presentation

Add a branching scenario to a presentation.

**Endpoint:** `POST /presentations/:id/branching-scenarios`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "name": "Beginner Path",
  "description": "Path for beginners",
  "startSlideId": "60d21b4667d0d8992e610c89",
  "endSlideIds": ["60d21b4667d0d8992e610c8a"],
  "conditions": [
    {
      "type": "quiz_score",
      "value": 80,
      "operator": "greater_than_or_equal"
    }
  ]
}
```

**Response:**
```json
{
  "id": "60d21b4667d0d8992e610c88",
  "title": "Introduction to Variables",
  "description": "Learn about variables in programming",
  "slides": [
    {
      "id": "60d21b4667d0d8992e610c89",
      "title": "What is a Variable?",
      "content": "A variable is a named storage location in memory..."
    }
  ],
  "branchingScenarios": [
    {
      "id": "60d21b4667d0d8992e610c91",
      "name": "Beginner Path",
      "description": "Path for beginners",
      "startSlideId": "60d21b4667d0d8992e610c89",
      "endSlideIds": ["60d21b4667d0d8992e610c8a"],
      "conditions": [
        {
          "type": "quiz_score",
          "value": 80,
          "operator": "greater_than_or_equal"
        }
      ],
      "isDefault": false,
      "isActive": true
    }
  ],
  "viewCount": 0,
  "completionCount": 0,
  "createdAt": "2021-06-23T00:00:00.000Z",
  "updatedAt": "2021-06-23T00:00:00.000Z"
}
```

### Update Branching Scenario in Presentation

Update a branching scenario in a presentation.

**Endpoint:** `PUT /presentations/:id/branching-scenarios/:scenarioId`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "name": "Updated Branching Scenario",
  "description": "Updated scenario description"
}
```

**Response:**
```json
{
  "id": "60d21b4667d0d8992e610c88",
  "title": "Introduction to Variables",
  "description": "Learn about variables in programming",
  "slides": [
    {
      "id": "60d21b4667d0d8992e610c89",
      "title": "What is a Variable?",
      "content": "A variable is a named storage location in memory..."
    }
  ],
  "branchingScenarios": [
    {
      "id": "60d21b4667d0d8992e610c91",
      "name": "Updated Branching Scenario",
      "description": "Updated scenario description",
      "startSlideId": "60d21b4667d0d8992e610c89",
      "endSlideIds": ["60d21b4667d0d8992e610c8a"],
      "conditions": [
        {
          "type": "quiz_score",
          "value": 80,
          "operator": "greater_than_or_equal"
        }
      ],
      "isDefault": false,
      "isActive": true
    }
  ],
  "viewCount": 0,
  "completionCount": 0,
  "createdAt": "2021-06-23T00:00:00.000Z",
  "updatedAt": "2021-06-23T00:00:00.000Z"
}
```

### Delete Branching Scenario from Presentation

Delete a branching scenario from a presentation.

**Endpoint:** `DELETE /presentations/:id/branching-scenarios/:scenarioId`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "msg": "Branching scenario deleted successfully"
}
```

## Quizzes

### Create Quiz

Create a new quiz.

**Endpoint:** `POST /quizzes`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "title": "Variables Quiz",
  "description": "Test your knowledge of variables",
  "category": "programming",
  "tags": ["variables", "quiz"],
  "isPublished": true,
  "estimatedTime": 15,
  "difficulty": "beginner",
  "passingScore": 70,
  "allowRetakes": true,
  "maxAttempts": 3,
  "randomizeQuestions": true,
  "randomizeAnswers": true,
  "showResults": true,
  "showCorrectAnswers": true
}
```

**Response:**
```json
{
  "id": "60d21b4667d0d8992e610c92",
  "title": "Variables Quiz",
  "description": "Test your knowledge of variables",
  "thumbnail": "default-quiz-thumbnail.jpg",
  "category": "programming",
  "tags": ["variables", "quiz"],
  "isPublished": true,
  "isFeatured": false,
  "estimatedTime": 15,
  "difficulty": "beginner",
  "passingScore": 70,
  "allowRetakes": true,
  "maxAttempts": 3,
  "randomizeQuestions": true,
  "randomizeAnswers": true,
  "showResults": true,
  "showCorrectAnswers": true,
  "tenantId": "60d21b4667d0d8992e610c85",
  "createdBy": "60d21b4667d0d8992e610c86",
  "questions": [],
  "attempts": 0,
  "completions": 0,
  "averageScore": 0,
  "createdAt": "2021-06-23T00:00:00.000Z",
  "updatedAt": "2021-06-23T00:00:00.000Z"
}
```

### Get Quizzes

Get all quizzes for the current tenant.

**Endpoint:** `GET /quizzes`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `search` (optional): Search term
- `category` (optional): Filter by category
- `tags` (optional): Filter by tags (comma-separated)
- `isPublished` (optional): Filter by published status (true/false)
- `sort` (optional): Sort field (default: createdAt)
- `order` (optional): Sort order (asc/desc, default: desc)

**Response:**
```json
{
  "quizzes": [
    {
      "id": "60d21b4667d0d8992e610c92",
      "title": "Variables Quiz",
      "description": "Test your knowledge of variables",
      "thumbnail": "default-quiz-thumbnail.jpg",
      "category": "programming",
      "tags": ["variables", "quiz"],
      "isPublished": true,
      "isFeatured": false,
      "estimatedTime": 15,
      "difficulty": "beginner",
      "passingScore": 70,
      "tenantId": "60d21b4667d0d8992e610c85",
      "createdBy": "60d21b4667d0d8992e610c86",
      "attempts": 0,
      "completions": 0,
      "averageScore": 0,
      "createdAt": "2021-06-23T00:00:00.000Z",
      "updatedAt": "2021-06-23T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### Get Quiz by ID

Get a quiz by ID.

**Endpoint:** `GET /quizzes/:id`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "id": "60d21b4667d0d8992e610c92",
  "title": "Variables Quiz",
  "description": "Test your knowledge of variables",
  "thumbnail": "default-quiz-thumbnail.jpg",
  "category": "programming",
  "tags": ["variables", "quiz"],
  "isPublished": true,
  "isFeatured": false,
  "estimatedTime": 15,
  "difficulty": "beginner",
  "passingScore": 70,
  "allowRetakes": true,
  "maxAttempts": 3,
  "randomizeQuestions": true,
  "randomizeAnswers": true,
  "showResults": true,
  "showCorrectAnswers": true,
  "tenantId": "60d21b4667d0d8992e610c85",
  "createdBy": "60d21b4667d0d8992e610c86",
  "questions": [],
  "attempts": 0,
  "completions": 0,
  "averageScore": 0,
  "createdAt": "2021-06-23T00:00:00.000Z",
  "updatedAt": "2021-06-23T00:00:00.000Z"
}
```

### Update Quiz

Update a quiz.

**Endpoint:** `PUT /quizzes/:id`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "title": "Updated Quiz Title",
  "description": "Updated quiz description",
  "isPublished": false
}
```

**Response:**
```json
{
  "id": "60d21b4667d0d8992e610c92",
  "title": "Updated Quiz Title",
  "description": "Updated quiz description",
  "thumbnail": "default-quiz-thumbnail.jpg",
  "category": "programming",
  "tags": ["variables", "quiz"],
  "isPublished": false,
  "isFeatured": false,
  "estimatedTime": 15,
  "difficulty": "beginner",
  "passingScore": 70,
  "allowRetakes": true,
  "maxAttempts": 3,
  "randomizeQuestions": true,
  "randomizeAnswers": true,
  "showResults": true,
  "showCorrectAnswers": true,
  "tenantId": "60d21b4667d0d8992e610c85",
  "createdBy": "60d21b4667d0d8992e610c86",
  "questions": [],
  "attempts": 0,
  "completions": 0,
  "averageScore": 0,
  "createdAt": "2021-06-23T00:00:00.000Z",
  "updatedAt": "2021-06-23T00:00:00.000Z"
}
```

### Delete Quiz

Delete a quiz.

**Endpoint:** `DELETE /quizzes/:id`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "msg": "Quiz deleted successfully"
}
```

### Add Question to Quiz

Add a question to a quiz.

**Endpoint:** `POST /quizzes/:id/questions`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "type": "multiple_choice",
  "question": "What is a variable?",
  "explanation": "A variable is a named storage location in memory.",
  "points": 1,
  "order": 1,
  "options": [
    {
      "text": "A named storage location in memory",
      "isCorrect": true
    },
    {
      "text": "A type of function",
      "isCorrect": false
    },
    {
      "text": "A programming language",
      "isCorrect": false
    },
    {
      "text": "A data type",
      "isCorrect": false
    }
  ]
}
```

**Response:**
```json
{
  "id": "60d21b4667d0d8992e610c92",
  "title": "Variables Quiz",
  "description": "Test your knowledge of variables",
  "questions": [
    {
      "id": "60d21b4667d0d8992e610c93",
      "type": "multiple_choice",
      "question": "What is a variable?",
      "explanation": "A variable is a named storage location in memory.",
      "points": 1,
      "order": 1,
      "options": [
        {
          "id": "60d21b4667d0d8992e610c94",
          "text": "A named storage location in memory",
          "isCorrect": true,
          "order": 1
        },
        {
          "id": "60d21b4667d0d8992e610c95",
          "text": "A type of function",
          "isCorrect": false,
          "order": 2
        },
        {
          "id": "60d21b4667d0d8992e610c96",
          "text": "A programming language",
          "isCorrect": false,
          "order": 3
        },
        {
          "id": "60d21b4667d0d8992e610c97",
          "text": "A data type",
          "isCorrect": false,
          "order": 4
        }
      ]
    }
  ],
  "attempts": 0,
  "completions": 0,
  "averageScore": 0,
  "createdAt": "2021-06-23T00:00:00.000Z",
  "updatedAt": "2021-06-23T00:00:00.000Z"
}
```

### Update Question in Quiz

Update a question in a quiz.

**Endpoint:** `PUT /quizzes/:id/questions/:questionId`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "question": "Updated question text?",
  "explanation": "Updated explanation"
}
```

**Response:**
```json
{
  "id": "60d21b4667d0d8992e610c92",
  "title": "Variables Quiz",
  "description": "Test your knowledge of variables",
  "questions": [
    {
      "id": "60d21b4667d0d8992e610c93",
      "type": "multiple_choice",
      "question": "Updated question text?",
      "explanation": "Updated explanation",
      "points": 1,
      "order": 1,
      "options": [
        {
          "id": "60d21b4667d0d8992e610c94",
          "text": "A named storage location in memory",
          "isCorrect": true,
          "order": 1
        },
        {
          "id": "60d21b4667d0d8992e610c95",
          "text": "A type of function",
          "isCorrect": false,
          "order": 2
        },
        {
          "id": "60d21b4667d0d8992e610c96",
          "text": "A programming language",
          "isCorrect": false,
          "order": 3
        },
        {
          "id": "60d21b4667d0d8992e610c97",
          "text": "A data type",
          "isCorrect": false,
          "order": 4
        }
      ]
    }
  ],
  "attempts": 0,
  "completions": 0,
  "averageScore": 0,
  "createdAt": "2021-06-23T00:00:00.000Z",
  "updatedAt": "2021-06-23T00:00:00.000Z"
}
```

### Delete Question from Quiz

Delete a question from a quiz.

**Endpoint:** `DELETE /quizzes/:id/questions/:questionId`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "msg": "Question deleted successfully"
}
```

### Submit Quiz Attempt

Submit a quiz attempt.

**Endpoint:** `POST /quizzes/:id/submit`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": "60d21b4667d0d8992e610c93",
      "answer": ["60d21b4667d0d8992e610c94"]
    }
  ]
}
```

**Response:**
```json
{
  "id": "60d21b4667d0d8992e610c