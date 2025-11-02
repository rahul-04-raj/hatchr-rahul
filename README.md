# Hatchr 🐣 - Project Showcase & Social Platform

Hatchr is a full-stack social media platform designed for creators, developers, and innovators to showcase their projects, share updates, and build a community around their work. Built with React, Node.js, Express, and MongoDB.

## 🌟 Features

### Core Features
- **Project Management**: Create and manage multiple projects with custom cover images and categories
- **Hatching System**: Special "hatching" post type for project initialization with unique orange theme
- **Project Timeline**: Collapsible timeline view showing all project updates with color-coded post types
- **Rich Content Editor**: Integrated Editor.js with support for headers, lists, code blocks, quotes, embeds, and more
- **Multi-Media Support**: Upload up to 10 images/videos per post with carousel navigation
- **Smart Sorting**: Feed sorting by Best, New, Upvotes, and Rising algorithms
- **Discovery Features**: "Top Innovators" and "Trending Projects" sidebars for community discovery
- **Hatch Points System**: Earn points for creating projects, posts, receiving upvotes, and making comments

### Post Types
- 🐣 **Hatching**: One-time project initialization post (orange theme)
- 📝 **Update**: Regular project updates (blue theme)
- 📢 **Announcement**: Important announcements (yellow theme)
- 🎯 **Milestone**: Project milestones (green theme)

### Social Features
- **Authentication**: Secure JWT-based authentication with email verification
- **User Profiles**: Customizable profiles with avatar, bio, social links (Twitter, LinkedIn, Instagram), and follower system
- **Profile Layout**: Modern two-column design with bio card sidebar and 2-column project grid
- **Avatar System**: Cloudinary-hosted avatars with ui-avatars.com fallback for initials
- **Engagement**: Upvote/downvote system and commenting on posts
- **Real-time Notifications**: Stay updated on interactions
- **Search**: Search for users, projects, and posts across the platform

## Project Structure

### Backend (`/backend`)

```
backend/
├── config/                 # Configuration files
│   ├── cloudinary.js      # Cloudinary integration for image uploads
│   └── multer.js          # File upload middleware configuration
│
├── middleware/
│   └── auth.js            # JWT authentication middleware
│
├── models/                 # MongoDB/Mongoose models
│   ├── Chat.js            # Chat model for messaging
│   ├── Comment.js         # Comment model for posts
│   ├── Message.js         # Message model for chat system
│   ├── Post.js            # Post model for user posts
│   ├── Project.js         # Project model for user projects
│   ├── Story.js          # Story model for user stories
│   └── User.js            # User model for authentication
│
├── routes/                 # API route handlers
│   ├── auth.js            # Authentication routes (login, signup)
│   ├── chats.js           # Chat related routes
│   ├── messages.js        # Message related routes
│   ├── posts.js           # Post CRUD operations
│   ├── projects.js        # Project management routes
│   ├── stories.js         # Story related routes
│   └── users.js           # User profile routes
│
├── uploads/               # Local file upload directory (fallback)
├── utils/                 # Utility functions
│   └── email.js           # Email service utilities
│
├── server.js              # Main application entry point
└── package.json           # Project dependencies and scripts
```

### Frontend (`/frontend`)

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ChatBox.jsx           # Chat interface
│   │   ├── EditProfileModal.jsx  # Profile editing modal
│   │   ├── ImageUpload.jsx       # Image upload component
│   │   ├── Navbar.jsx            # Navigation bar
│   │   ├── Notifications.jsx     # Notifications component
│   │   ├── PostCard.jsx          # Post display component
│   │   ├── PostModal.jsx         # Post creation/editing modal
│   │   ├── PostView.jsx          # Detailed post view
│   │   ├── ProfileHeader.jsx     # Profile header component
│   │   ├── ProjectGrid.jsx       # Project display grid
│   │   ├── ProjectModal.jsx      # Project creation modal
│   │   ├── ProjectTimeline.jsx   # Project timeline view
│   │   ├── ProtectedRoute.jsx    # Route protection wrapper
│   │   ├── StatusSelector.jsx    # Status selection component
│   │   └── VerificationModal.jsx # Email verification modal
│   │
│   ├── hooks/            # Custom React hooks
│   │   └── useImage.js   # Image loading and management hook
│   │
│   ├── lib/             # Utility libraries
│   │   ├── api.js       # API client configuration
│   │   └── media.js     # Media handling utilities
│   │
│   ├── pages/           # Main application pages
│   │   ├── Feed.jsx     # Main feed page
│   │   ├── Login.jsx    # Login page
│   │   ├── Profile.jsx  # User profile page
│   │   ├── Project.jsx  # Project detail page
│   │   └── Signup.jsx   # Registration page
│   │
│   ├── store/          # State management
│   │   ├── useAuth.js  # Authentication state
│   │   └── useTheme.js # Theme management
│   │
│   ├── utils/          # Utility functions
│   │   ├── api.js      # API utilities
│   │   └── auth.js     # Authentication utilities
│   │
│   ├── index.css       # Global styles
│   └── main.jsx        # Application entry point
│
├── index.html          # HTML entry point
├── package.json        # Project dependencies and scripts
├── postcss.config.cjs  # PostCSS configuration
└── tailwind.config.cjs # Tailwind CSS configuration
```

## 🎨 UI/UX Highlights

- **Three-Column Layout**: Perfectly centered feed with Top Innovators (left) and Trending Projects (right) sidebars
- **Profile Page Design**: Modern two-column layout with fixed-width bio card (340-400px) and flexible 2-column project grid
- **Avatar System**: Cloudinary integration with smart fallback to ui-avatars.com for generated initials
- **Social Links Integration**: Display and edit Twitter, LinkedIn, and Instagram profiles with icon badges
- **Fixed-Width Media Display**: All images maintain consistent 350px width with stylized side bars
- **Responsive Carousel**: Swipe-enabled media carousel with navigation arrows and indicators
- **Collapsible Timeline**: Expandable post cards in project timelines for clean organization
- **Smart Grid System**: CSS Grid layout with `300px minmax(550px, 700px) 300px` for perfect centering
- **Color-Coded Posts**: Visual distinction between post types with themed colors
- **Sticky Sidebars**: Persistent Top Innovators and Trending Projects while scrolling
- **Mobile Responsive**: Seamless experience across all device sizes

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer with Cloudinary integration
- **Email**: Nodemailer for OTP verification
- **Real-time**: Socket.io (optional for future features)

### Frontend
- **Framework**: React 18 with Vite
- **State Management**: Zustand
- **Styling**: Tailwind CSS v3
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Rich Text Editor**: Editor.js v2.28+ with plugins
  - Header, List, Code, InlineCode, Paragraph
  - Quote, Embed, Delimiter, LinkTool
- **Icons**: Heroicons (via Tailwind)
- **Image Handling**: Custom hooks with progressive loading

## 🚀 Quick Start

### Prerequisites
- Node.js v18 or higher
- MongoDB database (local or MongoDB Atlas)
- Cloudinary account for media storage
- Email service (Gmail/SMTP) for OTP verification

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/reedotexe/hatchr-rahul-ree.git
   cd hatchr-rahul-ree
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

   Create `.env` file in backend directory:
   ```env
   PORT=7000
   MONGODB_URI=mongodb://localhost:27017/hatchr
   JWT_SECRET=your_super_secret_jwt_key_here
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Email Configuration (for OTP)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_specific_password
   EMAIL_FROM=noreply@hatchr.com
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

   Create `.env` file in frontend directory:
   ```env
   VITE_API_URL=http://localhost:7000
   ```

4. **Start Development Servers**

   Terminal 1 (Backend):
   ```bash
   cd backend
   node server.js
   ```

   Terminal 2 (Frontend):
   ```bash
   cd frontend
   npm run dev
   ```

5. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:7000

## 📡 API Reference

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/signup` | Register new user | No |
| POST | `/login` | User login | No |
| POST | `/verify-otp` | Verify email OTP | No |
| POST | `/resend-otp` | Resend verification OTP | No |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/reset-password` | Reset password with OTP | No |
| GET | `/me` | Get current user | Yes |

### Posts Routes (`/api/posts`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all posts (with sorting: ?sort=best\|new\|upvotes\|rising) | No |
| GET | `/:id` | Get single post details | No |
| GET | `/search` | Search posts (?q=query) | No |
| POST | `/` | Create new post (multipart: media, title, caption, projectId, type) | Yes |
| POST | `/:id/comment` | Add comment to post | Yes |
| POST | `/:id/upvote` | Toggle upvote on post | Yes |
| POST | `/:id/downvote` | Toggle downvote on post | Yes |
| DELETE | `/:id` | Delete post | Yes (owner) |

### Projects Routes (`/api/projects`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/my` | Get current user's projects | Yes |
| GET | `/search` | Search projects (?q=query) | No |
| GET | `/trending` | Get top 4 trending projects | No |
| GET | `/user/:username` | Get projects by username with populated user data in posts | No |
| GET | `/:id` | Get project details with posts | No |
| POST | `/` | Create new project (multipart: coverImage, title, description, category) | Yes |
| PUT | `/:id` | Update project | Yes (owner) |
| DELETE | `/:id` | Delete project and all posts | Yes (owner) |

### Users Routes (`/api/users`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/top-innovators` | Get top 7 users by Hatch Points | No |
| GET | `/search/all` | Search users (?q=query) | No |
| GET | `/:username` | Get user profile with populated followers/following | No |
| GET | `/:userId/followers` | Get user's followers list | No |
| GET | `/:userId/following` | Get user's following list | No |
| POST | `/follow/:id` | Follow a user | Yes |
| POST | `/unfollow/:id` | Unfollow a user | Yes |
| POST | `/avatar` | Update user avatar (Cloudinary) | Yes |
| PUT | `/:id` | Update user profile (name, bio, username, socialLinks) | Yes (self) |

### Points System

**Earning Points:**
- Create Project: +50 points
- Create Post: +20 points
- Receive Upvote: +5 points
- Make Comment: +3 points

**Sorting Algorithms:**
- **Best**: `score = upvotes - downvotes + (comments × 0.5) + recency_boost`
- **New**: Sort by `createdAt` descending
- **Upvotes**: Sort by upvote count
- **Rising**: Calculate velocity from last 24-48h engagement

## 📁 Project Configuration

### Important Configuration Files

**`frontend/src/config/postConfig.js`**
```javascript
export const POST_CONFIG = {
  FIXED_WIDTH: 350,        // Media width in pixels
  BAR_COLOR: '#0a0a0a'     // Side bar color for images
};
```

**Post Types (`frontend/src/components/PostModal.jsx`)**
- Hatching posts only available for project initialization
- Updates available anytime within a project
- First post automatically tagged as "hatching"

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add: amazing feature description'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Coding Standards
- Use meaningful variable and function names
- Follow existing code structure and patterns
- Add comments for complex logic
- Test thoroughly before submitting PR

## 🐛 Known Issues & Future Enhancements

### Planned Features
- [ ] Real-time chat between users
- [ ] Story feature (24-hour content)
- [ ] Advanced search with filters
- [ ] Project collaboration features
- [ ] Achievement badges system
- [ ] Dark mode theme
- [ ] Email notifications for interactions

### Bug Reports
Please report bugs via GitHub Issues with:
- Detailed description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **reedotexe** - *Initial work* - [GitHub](https://github.com/reedotexe)

## 🙏 Acknowledgments

- Editor.js for the rich text editor
- Cloudinary for media hosting
- Tailwind CSS for styling framework
- MongoDB for database solution

---

**Built with ❤️ by the Hatchr team**