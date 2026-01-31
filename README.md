![frontend](https://github.com/Vsathe99/Course_Recommendation_system/blob/deploy/frontend/src/assets/readme.png)

## Course & Resource Recommendation System using RAG and Hybrid Recommendation Models

## 📖Table Of Contents
- Overview

- Quick Start

- Features

- Architecture & Core Components

- Project Structure

- REST API Endpoints

- Technology Stack

- Project Highlights & Learning Outcomes

- Use Cases

- Skills Demonstrated

- Troubleshooting

- Database / Data Cleanup

## 🎯Overview
Modern learners are overwhelmed by the volume of educational content available across platforms such as GitHub and YouTube. Traditional recommendation systems struggle with cold-start users, while purely content-based approaches fail to adapt to evolving user preferences.

This project addresses these challenges by designing and implementing a hybrid recommendation system that combines:

- Retrieval-Augmented Generation (RAG) for cold-start users

- Collaborative + content-based filtering using LightFM for personalized recommendations

The system dynamically evolves from semantic, LLM-driven recommendations to data-driven personalization as user interaction data grows.
## ⚡Quick Start

- [Node.js v18+](https://nodejs.org) 
- [Python v3.9+](https://www.python.org)  
- [Docker & Docker Compose](https://docs.docker.com)  
- [MongoDB](https://www.mongodb.com)  
- [Gemini API Key](https://ai.google.dev)  
- [GitHub OAuth](https://docs.github.com/en/apps/oauth-apps)  
- [Google OAuth ](https://developers.google.com/identity)  

### Step 0: Clone the Repository

``` 
git clone https://github.com/Vsathe99/Course_Recommendation_system 
cd Course_Recommendation_system 
```

### Step 1: Backend (Node.js – Auth & LLM)
create a  .env file  
```
PORT =
NODE_ENV =
MONGO_URI =
JWT_SECRET =
REFRESH_SECRET =
FRONTEND_URL =
GEMINI_API_KEY =
EMAIL_USER =
EMAIL_PASS =
GOOGLE_CLIENT_ID = 
GOOGLE_CLIENT_SECRET =
GOOGLE_REDIRECT_URI =
GITHUB_CLIENT_ID =
GITHUB_CLIENT_SECRET =
GITHUB_REDIRECT_URI =
```

```
cd backend
npm install
npm run dev
```
Runs on:
http://localhost:5000

### Step 2: Recommendation Engine (FastAPI – RecMind, Python via Conda)
create a  .env file  
```
GITHUB_TOKEN =
YOUTUBE_API_KEY =
DATA_DIR =
MAX_PER_SOURCE =
MONGO_URL =
DB_NAME =
ENV =
```
Create and activate a Conda environment:
```
conda create -n recmind python=3.9 -y
conda activate recmind
```

Install dependencies and start services:
```
cd recmind
pip install -r requirements.txt
docker-compose up --build
```

Runs on:
http://localhost:8000

### Step 3: Frontend (React + Vite)
create a  .env file  
```
VITE_API_URL =
VITE_RAG_API_URL =
```
```
cd frontend
npm install
npm run dev
```

Runs on:
http://localhost:5173
## ⭐Features

<details> <summary><strong>🧠 Backend AI & Recommendation System</strong></summary>

| Feature                         | Details                                                                      |
| ------------------------------- | ---------------------------------------------------------------------------- |
| Hybrid Recommendation Engine    | Combines content-based filtering, collaborative filtering, and LLM reasoning |
| Cold-Start Recommendation (RAG) | Uses Retrieval-Augmented Generation with FAISS vector search for new users   |
| Personalized Recommendations    | User-specific ranking using LightFM hybrid collaborative filtering           |
| Semantic Search Engine          | FAISS-based vector similarity search for contextual retrieval                |
| LLM-Powered Reasoning           | Gemini-powered contextual explanation and refinement                         |
| Topic-Based Exploration         | Resource discovery grouped by extracted learning topics                      |
| Zero-Shot Recommendations       | Suggests relevant resources without prior user history                       |
| Recommendation Ranking Pipeline | Semantic → CF → re-ranking stages                                            |
| Dockerized Deployment           | Fully containerized backend services                                         |
| REST API Layer                  | Clean API contracts between services                                         |
| Scalable Data Ingestion         | Automated ingestion from YouTube and GitHub                                  |
| Model Training Pipeline         | Scheduled training for collaborative filtering models                        |

</details>

<details> <summary><strong>🔐 Authentication & User Management</strong></summary>

| Feature                         | Details                                   |
| ------------------------------- | ----------------------------------------- |
| Email & Password Authentication | Secure registration with hashed passwords |
| Email Verification System       | Token-based email verification workflow   |
| OAuth Login                     | Social login using Google and GitHub      |
| JWT-Based Authentication        | Stateless session management              |
| Protected Routes                | Role-based access control                 |
| Session Handling                | Secure login, logout, token refresh       |

</details>

<details> <summary><strong>🖥️ Frontend Web Application</strong></summary>

| Feature                   | Details                                  |
| ------------------------- | ---------------------------------------- |
| React + Vite              | Fast modern frontend                     |
| Responsive UI             | Mobile-friendly design                   |
| Authentication Pages      | Login, Signup, OAuth, Email Verification |
| Topic Explorer            | Topic-based browsing                     |
| LLM Suggestion Modal      | AI explanations for recommendations      |
| Liked Resources Dashboard | Liked items overview                     |
| Protected Routes          | Auth-guarded navigation                  |
| Global State Management   | Redux-based state                        |
| Axios API Layer           | Centralized API handling                 |
| Animated Lists            | Smooth UI interactions 

</details>

## Core Components

1. Retrieval-Augmented Generation (RAG)

- Used for new users with no historical data

- Retrieves GitHub repositories and YouTube videos

- Generates embeddings using Gemini

- Stores embeddings in FAISS vector index

- LLM generates contextual, explainable recommendations

2. Vector Database (FAISS)

- Topic-wise semantic indexing

- Enables fast nearest-neighbor search

- Automatically built if missing

3. User Interaction Tracking

- Captures implicit feedback:

    - Clicks

    - Likes

    - Saves

    - Ratings

- Stored in MongoDB for offline training

4. Hybrid Recommendation Engine (LightFM)

Trained once sufficient interaction data is available

- Combines:

    - Collaborative filtering

    - Content-based features
## 📂Folder Structure
```
Final_year_project/
├── backend/
│   ├── .dockerignore
│   ├── .env
│   ├── .env.prod
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   ├── config/
│   │   ├── db.js
│   │   └── oauth.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── llmController.js
│   │   ├── userLikedResourses.js
│   │   └── userSavedResourses.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── interaction.js
│   │   ├── items.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── llmRoutes.js
│   │   └── userItems.js
│   └── utils/
│       ├── geminiClient.js
│       ├── generateTokens.js
│       └── sendEmail.js
├── frontend/
│   ├── .env
│   ├── .gitignore
│   ├── components.json
│   ├── eslint.config.js
│   ├── index.html
│   ├── jsconfig.json
│   ├── package.json
│   ├── README.md
│   ├── vercel.json
│   ├── vite.config.js
│   ├── public/
│   └── src/
│       ├── App.jsx
│       ├── index.css
│       ├── main.jsx
│       ├── api/
│       │   ├── axios.js
│       │   └── user.js
│       ├── assets/
│       ├── components/
│       │   ├── ContentModal.jsx
│       │   ├── LiquidEther.jsx
│       │   ├── LlmSuggestionModal.jsx
│       │   ├── ResultCard.jsx
│       │   ├── UserAvatar.jsx
│       │   ├── UserMenu.jsx
│       │   ├── AnimatedList/
│       │   │   ├── AnimatedList.css
│       │   │   └── AnimatedList.jsx
│       │   └── ProtectedRoutes/
│       │       └── ProtectedRoute.jsx
│       ├── lib/
│       │   └── utils.js
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   ├── OAuthSuccess.jsx
│       │   ├── Signup.jsx
│       │   ├── TopicExplorer.jsx
│       │   └── VerifyEmail.jsx
│       └── store/
│           ├── authSlice.js
│           ├── store.js
│           └── userSlice.js
└── recmind/
    ├── .env
    ├── .env.prod
    ├── docker-compose.local.yml
    ├── docker-compose.yml
    ├── requirements.txt
    ├── backend/
    │   ├── __init__.py
    │   ├── api.py
    │   ├── config.py
    │   ├── Dockerfile
    │   ├── main.py
    │   ├── __pycache__/
    │   ├── core/
    │   │   ├── __pycache__/
    │   │   ├── db.py
    │   │   ├── embedding.py
    │   │   ├── faiss_store.py
    │   │   ├── paths.py
    │   │   └── utils.py
    │   ├── data/
    │   │   ├── faiss/
    │   │   ├── model/
    │   │   └── raw/
    │   ├── ingestion/
    │   │   ├── __pycache__/
    │   │   ├── __init__.py
    │   │   ├── github_client.py
    │   │   └── youtube_client.py
    │   ├── recommender/
    │   │   ├── __pycache__/
    │   │   ├── builder.py
    │   │   ├── cf.py
    │   │   ├── rank.py
    │   │   ├── routes.py
    │   │   ├── search.py
    │   │   └── zero_shot.py
    │   └── scripts/
    │       ├── __pycache__/
    │       ├── test.py
    │       └── train_all_cf.py
    ├── infra/
    └── tests/
```

## 🔧 REST API Endpoints
## Overview
This project contains two backend services:
1. **Node.js Backend** - Authentication, LLM suggestions, and user item management
2. **Python Backend (RecMind)** - Recommendation engine with collaborative filtering and zero-shot ranking

---

<details>
<summary><strong>Click to view key endpoints</strong></summary>
  
## Node.js Backend Endpoints

### Base URL
```
http://localhost:5000/api
```

---

## Auth Routes (`/auth`)

### 1. Register User
**Endpoint:** `POST /auth/register`

**Requirements:**
- Method: POST
- Authentication: Not Required
- Content-Type: application/json

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation:**
- `name`: Required, must not be empty
- `email`: Required, must be valid email format
- `password`: Required, minimum 6 characters

**Response (201 - Success):**
```json
{
  "message": "Registered successfully. Verify your email.",
  "requiresVerification": true,
  "email": "john@example.com"
}
```

**Response (409 - Email Exists but Not Verified):**
```json
{
  "message": "Email registered but not verified",
  "requiresVerification": true,
  "email": "john@example.com"
}
```

**Response (400 - User Already Exists):**
```json
{
  "message": "User already exists"
}
```

**Response (500 - Server Error):**
```json
{
  "message": "Registration failed"
}
```

---

### 2. Verify Email
**Endpoint:** `POST /auth/verify-email`

**Requirements:**
- Method: POST
- Authentication: Not Required
- Content-Type: application/json

**Request Body:**
```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

**Validation:**
- `email`: Required, must be valid email format
- `code`: Required, must be exactly 6 digits

**Response (200 - Success):**
```json
{
  "message": "Email verified successfully"
}
```

**Response (400 - Invalid Verification):**
```json
{
  "message": "Invalid verification"
}
```

**Response (500 - Server Error):**
```json
{
  "message": "Verification failed"
}
```

---

### 3. Login
**Endpoint:** `POST /auth/login`

**Requirements:**
- Method: POST
- Authentication: Not Required
- Content-Type: application/json

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation:**
- `email`: Required, must be valid email format
- `password`: Required, must not be empty

**Response (200 - Success):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (400 - Invalid Credentials):**
```json
{
  "message": "Invalid credentials"
}
```

**Response (403 - Email Not Verified):**
```json
{
  "message": "Please verify your email"
}
```

**Response (500 - Server Error):**
```json
{
  "message": "Login failed"
}
```

**Additional:**
- Sets `refreshToken` as HTTP-Only cookie (7 days expiration)

---

### 4. Refresh Token
**Endpoint:** `POST /auth/refresh`

**Requirements:**
- Method: POST
- Authentication: Not Required (uses refresh token from cookies)
- Content-Type: application/json

**Request:**
- No body required
- Requires valid `refreshToken` cookie

**Response (200 - Success):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (401 - Unauthorized):**
```json
{
  "message": "Unauthorized"
}
```

**Response (401 - Token Expired):**
```json
{
  "message": "Token expired"
}
```

---

### 5. Logout
**Endpoint:** `POST /auth/logout`

**Requirements:**
- Method: POST
- Authentication: Not Required
- Content-Type: application/json

**Request:**
- No body required

**Response (200 - Success):**
```json
{
  "message": "Logged out successfully"
}
```

**Additional:**
- Clears `refreshToken` cookie

---

### 6. Google OAuth Login
**Endpoint:** `GET /auth/google`

**Requirements:**
- Method: GET
- Authentication: Not Required
- Redirects to Google OAuth consent screen

**Environment Variables Required:**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`

**Scopes:** `profile email`

---

### 7. Google OAuth Callback
**Endpoint:** `GET /auth/google/callback`

**Requirements:**
- Method: GET
- Authentication: Not Required
- Query Parameter: `code` (Authorization code from Google)

**Response (302 - Redirect):**
```
{FRONTEND_URL}/oauth-success?token={accessToken}
```

**Response (400 - Missing Code):**
```json
{
  "message": "Code missing"
}
```

**Response (500 - Server Error):**
```json
{
  "message": "Google auth failed"
}
```

---

### 8. GitHub OAuth Login
**Endpoint:** `GET /auth/github`

**Requirements:**
- Method: GET
- Authentication: Not Required
- Redirects to GitHub OAuth authorization page

**Environment Variables Required:**
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_REDIRECT_URI`

**Scopes:** `user:email`

---

### 9. GitHub OAuth Callback
**Endpoint:** `GET /auth/github/callback`

**Requirements:**
- Method: GET
- Authentication: Not Required
- Query Parameter: `code` (Authorization code from GitHub)

**Response (302 - Redirect):**
```
{FRONTEND_URL}/oauth-success?token={accessToken}
```

**Response (400 - Missing Code):**
```json
{
  "message": "Authorization code missing"
}
```

**Response (400 - Email Not Available):**
```json
{
  "message": "GitHub email not available"
}
```

**Response (500 - Server Error):**
```json
{
  "message": "GitHub authentication failed"
}
```

---

### 10. Get Current User Info
**Endpoint:** `GET /auth/me`

**Requirements:**
- Method: GET
- Authentication: Required (Bearer Token in Authorization header)
- Header: `Authorization: Bearer {accessToken}`

**Response (200 - Success):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "avatar": "https://example.com/avatar.jpg",
  "provider": "google|github|local",
  "providerId": "provider_specific_id",
  "verified": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Response (401 - Unauthorized):**
```json
{
  "message": "Unauthorized"
}
```

---

## LLM Routes (`/llm`)

### 1. Get LLM Suggestions
**Endpoint:** `POST /llm/suggestions`

**Requirements:**
- Method: POST
- Authentication: Required (Bearer Token in Authorization header)
- Content-Type: application/json
- Header: `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "items": [
    {
      "id": "item_id_1",
      "name": "React Tutorial",
      "desc": "Learn React basics",
      "url": "https://example.com",
      "source": "youtube"
    },
    {
      "id": "item_id_2",
      "name": "JavaScript Guide",
      "desc": "Complete JS guide",
      "url": "https://example.com/js",
      "source": "github"
    }
  ]
}
```

**Validation:**
- `items`: Required, must be an array
- `items` array: Must contain at least 1 item, max 10 items processed
- Each item should have: `id`, `name`, `desc`, `url`, `source`

**Response (200 - Success):**
```json
[
  {
    "id": "item_id_1",
    "name": "React Tutorial",
    "url": "https://example.com",
    "reason": "This resource is highly relevant because it covers the fundamentals with practical examples and is suitable for beginners."
  },
  {
    "id": "item_id_2",
    "name": "JavaScript Guide",
    "url": "https://example.com/js",
    "reason": "This provides in-depth coverage with advanced concepts and real-world applications."
  }
]
```

**Response (400 - Missing Items):**
```json
{
  "error": "Items are required"
}
```

**Response (500 - Server Error):**
```json
{
  "error": "Failed to generate suggestions"
}
```

**Requirements for this endpoint:**
- Gemini API key configured in environment
- Items array should not be empty
- Max 10 items recommended for optimal performance

---

## User Items Routes (`/items`)

### 1. Get Saved Items
**Endpoint:** `GET /items/user/saved`

**Requirements:**
- Method: GET
- Authentication: Required (Bearer Token in Authorization header)
- Header: `Authorization: Bearer {accessToken}`

**Query Parameters:** None

**Response (200 - Success):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "source": "github",
    "ext_id": "external_id_123",
    "title": "React Repository",
    "desc": "A popular React library",
    "url": "https://github.com/facebook/react",
    "topic": "react",
    "popularity": 95,
    "difficulty": "intermediate",
    "numeric_id": 1001,
    "created_at": "2024-01-01T00:00:00Z",
    "liked": true,
    "saved": true,
    "rating": 4.8
  }
]
```

**Response (500 - Server Error):**
```json
{
  "error": "Failed to fetch saved items"
}
```

**Notes:**
- Returns items sorted by most recently updated first
- Includes join data from items collection
- Only returns items where `saved: true`

---

### 2. Get Liked Items
**Endpoint:** `GET /items/user/liked`

**Requirements:**
- Method: GET
- Authentication: Required (Bearer Token in Authorization header)
- Header: `Authorization: Bearer {accessToken}`

**Query Parameters:** None

**Response (200 - Success):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "source": "youtube",
    "ext_id": "external_id_456",
    "title": "Web Development Tutorial",
    "desc": "Complete web dev course",
    "url": "https://youtube.com/watch?v=dQw4w9WgXcQ",
    "topic": "web-development",
    "popularity": 87,
    "difficulty": "beginner",
    "numeric_id": 1002,
    "created_at": "2024-01-15T00:00:00Z",
    "liked": true,
    "saved": false,
    "rating": 4.5
  }
]
```

**Response (500 - Server Error):**
```json
{
  "error": "Failed to fetch liked items"
}
```

**Notes:**
- Returns items sorted by most recently updated first
- Includes join data from items collection
- Only returns items where `liked: true`

---

---

## Python Backend Endpoints (RecMind)

### Base URL
```
http://localhost:8000/api
```

---

## Recommendations Routes

### 1. Get Recommendations
**Endpoint:** `GET /recommendations`

**Requirements:**
- Method: GET
- Authentication: Not Required (uses query parameters for user context)
- Content-Type: application/json

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `user_id` | string | Yes | - | Unique user identifier |
| `topic` | string | Yes | - | Topic to get recommendations for (e.g., "machine-learning", "web development") |
| `q` | string | Yes | - | Search query for semantic search |
| `k` | integer | No | 10 | Number of recommendations to return (max: 100) |
| `alpha` | float | No | 0.5 | Blending factor for hybrid ranking (0: pure zero-shot, 1: pure collaborative filtering) |

**Example Request:**
```
GET /recommendations?user_id=user123&topic=machine-learning&q=neural%20networks&k=10&alpha=0.5
```

**Response (200 - Success):**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "title": "Neural Networks Deep Dive",
    "url": "https://github.com/example/nn-repo",
    "source": "github",
    "desc": "Comprehensive guide to neural networks with PyTorch examples",
    "score": 0.92,
    "used_cf": true
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "title": "Machine Learning Basics",
    "url": "https://youtube.com/watch?v=example",
    "source": "youtube",
    "desc": "Tutorial covering ML fundamentals",
    "score": 0.85,
    "used_cf": true
  }
]
```

**Response (500 - Server Error):**
```json
{
  "detail": "Failed to build FAISS index for topic 'machine-learning'"
}
```

**Notes:**
- Uses FAISS vector store for semantic search
- Hybrid ranking combines zero-shot classification with collaborative filtering
- If FAISS index doesn't exist, automatically triggers RAG pipeline to build it
- Zero-shot ranker analyzes content relevance
- Collaborative filtering requires trained CF model for the topic

**Required Environment:**
- MongoDB connection
- FAISS index for the topic (auto-generated if missing)
- Gemini API for embeddings
- Training data for collaborative filtering

---

### 2. Log Interaction
**Endpoint:** `POST /interactions`

**Requirements:**
- Method: POST
- Authentication: Not Required (uses query parameters)
- Content-Type: application/json

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | Unique user identifier |
| `item_id` | string | Yes | Item/resource identifier |
| `event` | string | Yes | Event type (e.g., "view", "click", "like", "save", "rate") |
| `dwell_time_ms` | integer | No | Time spent viewing (in milliseconds) |

**Example Request:**
```
POST /interactions?user_id=user123&item_id=507f1f77bcf86cd799439011&event=view&dwell_time_ms=5000
```

**Response (200 - Success):**
```json
{
  "ok": true
}
```

**Notes:**
- Logs user interactions for collaborative filtering training
- `dwell_time_ms` optional for tracking engagement
- Events are stored in MongoDB for later model training
- Used to improve future recommendations for the user

---

## Common Headers

### Authorization Header (Protected Endpoints)
```
Authorization: Bearer {accessToken}
```

---

## Error Handling

### Common HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created (successful registration) |
| 302 | Redirect (OAuth callbacks) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (email not verified) |
| 409 | Conflict (resource already exists) |
| 500 | Internal Server Error |

---

## Environment Variables Required

### Node.js Backend
```
NODE_ENV=production
JWT_SECRET=your_jwt_secret
REFRESH_SECRET=your_refresh_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:5000/api/auth/github/callback
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost/yourdb
GEMINI_API_KEY=your_gemini_api_key
SMTP_HOST=your_email_host
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASSWORD=your_email_password
```

### Python Backend
```
MONGODB_URI=mongodb://localhost/yourdb
GEMINI_API_KEY=your_gemini_api_key
MAX_PER_SOURCE=100
```

---

## Request/Response Headers

### Standard Request Headers
```
Content-Type: application/json
Accept: application/json
```

### Authentication
```
Authorization: Bearer {accessToken}
```

### Cookies (set by server)
- `refreshToken`: HTTP-Only, Secure, SameSite=Strict (login/register)
- Expires: 7 days

---

## Rate Limiting
Currently not implemented. Recommended for production deployment.

---

## CORS Configuration
Frontend: `http://localhost:5173` (development)
Production: Configure based on deployment URL

---

## Database Models

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  avatar: String,
  provider: String (google|github|local),
  providerId: String,
  verified: Boolean,
  verificationCode: String,
  refreshToken: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Items Model
```javascript
{
  _id: ObjectId,
  source: String (github|youtube),
  ext_id: String,
  title: String,
  desc: String,
  url: String,
  topic: String,
  popularity: Number,
  difficulty: String,
  numeric_id: Number,
  created_at: Date
}
```

### Interaction Model
```javascript
{
  _id: ObjectId,
  user_id: String,
  item_id: ObjectId,
  saved: Boolean,
  liked: Boolean,
  rating: Number,
  created_at: Date,
  updated_at: Date
}
```

---

## Testing Recommendations

### Tools
- Postman or Insomnia for endpoint testing
- Thunder Client (VS Code extension)
- cURL for command-line testing

### Test Flow
1. Register → Verify Email → Login
2. Get auth token from login
3. Use token to access protected endpoints
4. Test OAuth flows in browser
5. Test LLM suggestions with sample items
6. Test recommendations with different topics

</details>

## 🎓Skills Demonstrated

- Skills Demonstrated

- System architecture design

- Retrieval-Augmented Generation (RAG)

- Recommendation systems (CF + content-based)

- LLM integration in production systems

- REST API design

- Authentication and authorization

- AWS with Docker-based deployment

- Full-stack development
