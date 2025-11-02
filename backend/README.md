# Hatchr Backend API 🚀

RESTful API backend for Hatchr - A project showcase and social platform for creators and innovators.

Built with Node.js, Express, MongoDB, and JWT authentication.

## 📋 Features

- **User Authentication**: JWT-based auth with email OTP verification
- **Project Management**: CRUD operations for projects with media uploads
- **Post System**: Multi-media posts with rich content (Editor.js format)
- **Engagement**: Upvote/downvote, commenting, and following system
- **Points System**: Hatch Points reward system for user activities
- **Search**: Full-text search for users, projects, and posts
- **Sorting**: Advanced feed sorting (Best, New, Upvotes, Rising)
- **Discovery**: Top innovators and trending projects algorithms
- **Media Storage**: Cloudinary integration for image/video uploads
- **Email Service**: Nodemailer for OTP verification

## 🛠️ Tech Stack

- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer
- **Media Storage**: Cloudinary
- **Email**: Nodemailer
- **Password Hashing**: bcryptjs

## 📁 Project Structure

```
backend/
├── config/
│   ├── cloudinary.js      # Cloudinary configuration
│   └── multer.js          # File upload middleware
│
├── middleware/
│   └── auth.js            # JWT authentication middleware
│
├── models/
│   ├── Chat.js            # Chat conversations
│   ├── Comment.js         # Post comments
│   ├── Message.js         # Chat messages
│   ├── Post.js            # User posts
│   ├── Project.js         # User projects
│   ├── Story.js           # User stories (24h)
│   └── User.js            # User accounts
│
├── routes/
│   ├── auth.js            # Authentication endpoints
│   ├── chats.js           # Chat management
│   ├── messages.js        # Messaging system
│   ├── posts.js           # Post CRUD operations
│   ├── projects.js        # Project management
│   ├── stories.js         # Story features
│   ├── test.js            # Test endpoints
│   └── users.js           # User profiles
│
├── utils/
│   ├── email.js           # Email sending utilities
│   ├── migrate-users.js   # Database migration scripts
│   ├── otp.js             # OTP generation/validation
│   └── points.js          # Points system logic
│
├── server.js              # Application entry point
├── package.json           # Dependencies
└── .env.example           # Environment variables template
```

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- MongoDB (local or Atlas)
- Cloudinary account
- Email service (Gmail/SMTP)

### Installation

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**

   Create `.env` file:
   ```env
   # Server Configuration
   PORT=7000
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb://localhost:27017/hatchr

   # Authentication
   JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters

   # Cloudinary (Media Storage)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Email Configuration (Gmail)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_specific_password
   EMAIL_FROM=noreply@hatchr.com

   # Optional: File Upload Directory (fallback)
   UPLOAD_DIR=uploads
   ```

3. **Start the server**
   ```bash
   # Development
   npm run dev  # with nodemon

   # Production
   npm start
   ```

4. **Verify server is running**
   ```
   Server running on port 7000
   Connected to MongoDB
   ```

## 📡 API Endpoints

Base URL: `http://localhost:7000/api`

### Authentication (`/api/auth`)

```
POST   /signup              - Register new user
POST   /login               - User login
POST   /verify-otp          - Verify email OTP
POST   /resend-otp          - Resend verification OTP
POST   /forgot-password     - Request password reset
POST   /reset-password      - Reset password with OTP
GET    /me                  - Get current user (protected)
```

### Posts (`/api/posts`)

```
GET    /                    - Get all posts (query: ?sort=best|new|upvotes|rising)
GET    /:id                 - Get single post
GET    /search              - Search posts (query: ?q=searchterm)
POST   /                    - Create post (protected, multipart)
POST   /:id/comment         - Add comment (protected)
POST   /:id/upvote          - Toggle upvote (protected)
POST   /:id/downvote        - Toggle downvote (protected)
DELETE /:id                 - Delete post (protected, owner only)
```

### Projects (`/api/projects`)

```
GET    /my                  - Get current user's projects (protected)
GET    /search              - Search projects (query: ?q=searchterm)
GET    /trending            - Get top 4 trending projects
GET    /user/:username      - Get projects by username
GET    /:id                 - Get project details with posts
POST   /                    - Create project (protected, multipart)
PUT    /:id                 - Update project (protected, owner only)
DELETE /:id                 - Delete project (protected, owner only)
```

### Users (`/api/users`)

```
GET    /top-innovators      - Get top 7 users by Hatch Points
GET    /search/all          - Search users (query: ?q=searchterm)
GET    /:username           - Get user profile
GET    /:userId/followers   - Get user's followers
GET    /:userId/following   - Get user's following
POST   /follow/:id          - Follow user (protected)
POST   /unfollow/:id        - Unfollow user (protected)
POST   /avatar              - Update avatar (protected, multipart)
PUT    /:id                 - Update profile (protected, self only)
```

### Chats & Messages (`/api/chats`, `/api/messages`)

```
GET    /chats/:userId       - Get or create chat (protected)
GET    /messages/:chatId    - Get chat messages (protected)
POST   /messages            - Send message (protected, Socket.io broadcast)
```

### Stories (`/api/stories`)

```
GET    /                    - Get active stories
POST   /                    - Create story (protected, multipart, 24h expiry)
```

## 💾 Database Models

### User Schema
```javascript
{
  name: String,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  avatar: String,
  bio: String,
  hatchPoints: Number (default: 0),
  pointsHistory: Array,
  otp: { code, expiresAt },
  isEmailVerified: Boolean,
  resetPasswordOtp: { code, expiresAt },
  followers: [ObjectId],
  following: [ObjectId]
}
```

### Project Schema
```javascript
{
  user: ObjectId (ref: User),
  title: String,
  description: String,
  category: String,
  coverImage: String,
  posts: [ObjectId] (ref: Post),
  status: String (in-progress|completed|on-hold)
}
```

### Post Schema
```javascript
{
  user: ObjectId (ref: User),
  project: ObjectId (ref: Project),
  title: String,
  caption: String (JSON - Editor.js format),
  media: [{ url, type, contentType, order }],
  type: String (update|announcement|milestone|hatching),
  isHatching: Boolean,
  upvotes: [ObjectId],
  downvotes: [ObjectId],
  comments: [ObjectId] (ref: Comment)
}
```

## 🎯 Points System

### Point Values
```javascript
{
  project_created: 50,
  post_created: 20,
  received_upvote: 5,
  comment_made: 3
}
```

### Functions
- `awardPoints(userId, action, referenceId, referenceModel)`
- `getPointHistory(userId, page, limit)`
- `getPoints(userId)`

## 🔒 Authentication Middleware

Protected routes require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

Example usage:
```javascript
router.post('/protected-route', auth, async (req, res) => {
  // req.userId contains authenticated user's ID
  // req.user contains full user object
});
```

## 📤 File Upload

### Multipart Form Data

**Creating a Post:**
```javascript
FormData {
  media: File[] (max 10 files),
  title: String,
  caption: String (JSON),
  projectId: String,
  type: String (update|announcement|milestone)
}
```

**Creating a Project:**
```javascript
FormData {
  coverImage: File,
  title: String,
  description: String,
  category: String
}
```

## 🔍 Search & Sorting

### Feed Sorting Algorithms

**Best** (Default):
```
score = upvotes - downvotes + (comments × 0.5) + recency_boost
recency_boost = max(0, 10 - age_in_hours) × 0.1
```

**New**:
```
Sort by createdAt descending
```

**Upvotes**:
```
Sort by upvotes.length descending
```

**Rising**:
```
Only posts from last 48 hours
risingScore = (recent_upvotes + recent_comments) - recent_downvotes
Sort by risingScore descending
```

### Trending Projects Algorithm
```
score = sum(post_upvotes - post_downvotes + comments × 0.5) + (post_count × 2)
Top 4 projects by score
```

## 🔌 Real-time Communication (Socket.io)

The server exposes Socket.io for real-time messaging and notifications.

**Client Connection:**
```javascript
const socket = io('http://localhost:7000')

// Register user
socket.emit('register', userId)

// Listen for events
socket.on('notification', payload => {
  console.log('New notification:', payload)
})

socket.on('message', payload => {
  console.log('New message:', payload)
})
```

## 🛠️ Development

### Available Scripts

```bash
npm start          # Start server (production)
npm run dev        # Start with nodemon (development)
npm test           # Run tests (if configured)
```

### Environment Modes

- **Development**: Detailed error messages, CORS enabled
- **Production**: Minimal error exposure, optimized performance

## 🐛 Error Handling

The API uses standard HTTP status codes:

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

Error Response Format:
```json
{
  "success": false,
  "message": "Error description"
}
```

## 📝 Notes

- All timestamps use MongoDB's built-in `timestamps: true`
- Password reset OTPs expire after 10 minutes
- Email verification OTPs expire after 15 minutes
- Media files fallback to local storage if Cloudinary fails
- Socket.io setup exists for real-time messaging
- Stories expire after 24 hours (handled by client-side filtering)
- First post to a project is automatically marked as "hatching" post

## 🤝 Contributing

1. Follow existing code patterns
2. Add error handling for all operations
3. Validate input data thoroughly
4. Use meaningful variable names
5. Add comments for complex logic
6. Test endpoints before committing

## 📄 License

MIT License - See LICENSE file for details

---

**Part of the Hatchr platform** | [Frontend Repository](../frontend)
