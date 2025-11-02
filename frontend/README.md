# Hatchr Frontend 🎨

Modern React frontend for Hatchr - A project showcase and social platform for creators and innovators.

Built with React 18, Vite, Tailwind CSS, and Zustand state management.

## 📋 Features

- **Three-Column Feed Layout**: Perfectly centered content with Top Innovators and Trending Projects sidebars
- **Modern Profile Design**: Two-column layout with bio card sidebar (340-400px) and 2-column project grid
- **Avatar System**: Cloudinary-hosted avatars with smart fallback to ui-avatars.com for generated initials
- **Social Links Integration**: Display Twitter, LinkedIn, Instagram profiles with icon badges (lucide-react)
- **Rich Content Editor**: Editor.js integration with 11+ plugins for posts
- **Project Timeline**: Collapsible timeline view with color-coded post types
- **Media Carousel**: Fixed-width image/video display with navigation
- **Hatching System**: Special post type for project initialization (one-time only)
- **Points Display**: Real-time Hatch Points tracking and leaderboards
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Advanced Sorting**: Best, New, Upvotes, and Rising feed algorithms
- **OTP Verification**: Email verification flow with modals
- **Protected Routes**: Authentication-aware navigation

## 🛠️ Tech Stack

- **Framework**: React 18.2.0
- **Build Tool**: Vite 4.1.0
- **Styling**: Tailwind CSS 3.2.7
- **State Management**: Zustand 4.3.6
- **Router**: React Router v6.8.2
- **HTTP Client**: Axios 1.3.4
- **Rich Text Editor**: @editorjs/editorjs 2.28.0
- **Icons**: Lucide React 0.321.0
- **Image Handling**: React Dropzone 14.2.3

## 📁 Project Structure

```
frontend/src/
├── components/
│   ├── ChatBox.jsx            # Real-time messaging UI
│   ├── EditorJS.jsx           # Rich text editor wrapper
│   ├── EditorJSRenderer.jsx   # Display Editor.js content
│   ├── EditProfileModal.jsx   # Profile editing modal
│   ├── FixedWidthMedia.jsx    # 350px media display
│   ├── FollowersModal.jsx     # Followers/following lists
│   ├── ImageUpload.jsx        # Single image uploader
│   ├── MarkdownToolbar.jsx    # Legacy markdown toolbar
│   ├── MediaCarousel.jsx      # Multi-media carousel
│   ├── MultiMediaUpload.jsx   # Multi-file uploader
│   ├── Navbar.jsx             # Global navigation
│   ├── Notifications.jsx      # Notification center
│   ├── OTPVerification.jsx    # Email verification
│   ├── PointsToast.jsx        # Points notification
│   ├── PostCard.jsx           # Feed post display
│   ├── PostModal.jsx          # Create/edit post modal
│   ├── PostView.jsx           # Single post view
│   ├── ProfileHeader.jsx      # User profile header
│   ├── ProjectGrid.jsx        # Project grid layout
│   ├── ProjectModal.jsx       # Create project modal
│   ├── ProjectTimeline.jsx    # Project posts timeline
│   ├── ProtectedRoute.jsx     # Auth route wrapper
│   ├── RichTextEditor.jsx     # Legacy rich editor
│   ├── StatusSelector.jsx     # Project status picker
│   ├── TopInnovators.jsx      # Leaderboard sidebar
│   ├── TrendingProjects.jsx   # Trending sidebar
│   └── VerificationModal.jsx  # Email verification modal
│
├── pages/
│   ├── Feed.jsx               # Main feed with sorting
│   ├── ForgotPassword.jsx     # Password reset flow
│   ├── Login.jsx              # Login page
│   ├── PostView.jsx           # Single post page
│   ├── Profile.jsx            # User profile (2-col: bio card + projects grid)
│   ├── Project.jsx            # Project detail page
│   ├── Search.jsx             # Global search page
│   └── Signup.jsx             # Registration page
│
├── config/
│   └── postConfig.js          # Media display settings
│
├── hooks/
│   └── useImage.js            # Image loading hook
│
├── lib/
│   ├── api.js                 # API client (axios)
│   └── media.js               # Media utilities
│
├── store/
│   ├── useAuth.js             # Auth state (Zustand)
│   └── useTheme.js            # Theme state (Zustand)
│
├── utils/
│   ├── api.js                 # API helpers
│   └── auth.js                # Auth utilities
│
├── main.jsx                   # Application entry
└── index.css                  # Global styles
```

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- Backend API running on port 7000

### Installation

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration**

   Create `.env` file (if needed):
   ```env
   VITE_API_URL=http://localhost:7000/api
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   ```
   http://localhost:5173
   ```

## 🎨 Key Components

### Feed Layout (Feed.jsx)

Three-column CSS Grid layout:
```css
display: grid
grid-template-columns: 300px minmax(550px, 700px) 300px
justify-content: center
```

- **Left Sidebar**: Top Innovators (300px)
- **Center**: Main feed (550-700px responsive)
- **Right Sidebar**: Trending Projects (300px)

### Profile Layout (Profile.jsx)

Two-column Flexbox layout:
```css
display: flex
align-items: flex-start
gap: 2rem
```

- **Left Sidebar**: Bio card (340-400px fixed width)
  - Username badge
  - Avatar (Cloudinary with fallback)
  - Name
  - Project count and Hatch Points
  - Bio text
  - Social links (Twitter, LinkedIn, Instagram) with icons
  - Edit Profile button
  
- **Right Content**: Key Hatched Projects
  - 2-column CSS Grid (`repeat(2, 1fr)`)
  - First post from each project
  - Full PostCard component rendering

**Avatar System:**
- Primary: Cloudinary-hosted user avatar
- Fallback: ui-avatars.com API with user's name/username as initials
- Error handling with `onError` callback
- Loading state with pulse animation

### Editor.js Integration

**Plugins Used:**
- Header (h1-h6)
- List (ordered/unordered)
- Code (syntax highlighting)
- InlineCode
- Paragraph
- Quote
- Embed (YouTube, Twitter, etc.)
- Delimiter
- LinkTool
- Image
- Table

**Usage:**
```jsx
<EditorJS
  value={caption}
  onChange={setCaption}
  placeholder="Write your post..."
/>
```

### Post Types

Color-coded badges:
- **Hatching** 🔥 (Orange) - Project initialization (one-time)
- **Update** 📝 (Blue) - Regular project updates
- **Announcement** 📢 (Yellow) - Important notices
- **Milestone** 🎯 (Green) - Achievement markers

### Media Configuration (postConfig.js)

```javascript
export const FIXED_WIDTH = 350  // Max image/video width (px)
export const BAR_COLOR = '#0a0a0a'  // Side bar color
```

## 🔐 Authentication Flow

1. **Signup** → Email sent with OTP
2. **OTP Verification** → Account activated
3. **Login** → JWT token stored in localStorage
4. **Protected Routes** → Auto-redirect if not authenticated
5. **Forgot Password** → OTP-based reset

### Auth Store (Zustand)

```javascript
const { user, login, logout, checkAuth } = useAuthStore()

// Check authentication
useEffect(() => {
  checkAuth()
}, [])
```

## 📡 API Integration

### Base Configuration

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:7000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Auto-attach JWT token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### Example API Calls

```javascript
// Get feed with sorting
const { data } = await api.get('/posts', { 
  params: { sort: 'best' } 
})

// Create post (multipart)
const formData = new FormData()
formData.append('title', title)
formData.append('caption', JSON.stringify(caption))
files.forEach(file => formData.append('media', file))

await api.post('/posts', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})

// Update profile with social links
await api.put(`/users/${userId}`, {
  name: 'John Doe',
  bio: 'Full-stack developer',
  socialLinks: {
    twitter: 'https://twitter.com/johndoe',
    linkedin: 'https://linkedin.com/in/johndoe',
    instagram: '@johndoe'
  }
})

// Get user profile with projects
const { data: user } = await api.get(`/users/${username}`)
const { data: projects } = await api.get(`/projects/user/${username}`)
// Projects include populated posts with user data for avatars
```

## 🎯 Points System Integration

### Display Points

```jsx
<div className="text-orange-400">
  🔥 {user.hatchPoints || 0} Hatch Points
</div>
```

### Top Innovators

Fetched from `/users/top-innovators`:
- Top 7 users by Hatch Points
- Ranked display with medals
- Empty state handling

## 🔍 Search & Sorting

### Feed Sorting Options

```javascript
const sorts = ['best', 'new', 'upvotes', 'rising']
```

### Search Implementation

```javascript
// Search all content types
const searchAll = async (query) => {
  const [users, projects, posts] = await Promise.all([
    api.get('/users/search/all', { params: { q: query } }),
    api.get('/projects/search', { params: { q: query } }),
    api.get('/posts/search', { params: { q: query } })
  ])
}
```

## 🛠️ Development

### Available Scripts

```bash
npm run dev        # Start dev server (port 5173)
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Environment Modes

- **Development**: Hot module replacement, source maps
- **Production**: Minified, optimized, tree-shaken

## 📱 Responsive Design

### Breakpoints (Tailwind)

```javascript
sm: '640px'   // Small devices
md: '768px'   // Tablets
lg: '1024px'  // Laptops
xl: '1280px'  // Desktops
2xl: '1536px' // Large screens
```

### Mobile Layout

- Single-column feed
- Hidden sidebars (collapsible)
- Bottom navigation
- Touch-optimized carousels

## 🎨 Styling

### Tailwind Configuration

```javascript
// tailwind.config.cjs
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'hatchr-orange': '#fb923c',
        'hatchr-dark': '#0a0a0a'
      }
    }
  }
}
```

### Custom CSS

```css
/* index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-lg;
  }
}
```

## 🐛 Common Issues

### API Connection Errors

- Ensure backend is running on port 7000
- Check CORS settings in backend
- Verify JWT token is being sent

### Editor.js Not Loading

- Check all plugins are installed
- Ensure Editor.js version is 2.28+
- Validate caption JSON format

### Media Upload Failures

- Check Cloudinary configuration
- Verify file size limits (< 10MB)
- Ensure multipart form data headers

## 📝 Notes

- Backend API must be running on port 7000
- JWT token stored in localStorage
- Editor.js content stored as JSON
- Media display uses fixed 350px width
- Hatching posts restricted to project initialization
- Points updates are real-time from backend

## 🤝 Contributing

1. Follow React best practices
2. Use functional components with hooks
3. Maintain Tailwind CSS consistency
4. Add prop-types for components
5. Test responsive layouts
6. Document complex logic

## 📄 License

MIT License - See LICENSE file for details

---

**Part of the Hatchr platform** | [Backend Repository](../backend)
