# Hatching Feature - Project Initialization Posts

## Overview
The "Hatching" feature introduces a special type of post that serves as the project initialization announcement. When users create a new project, they are prompted to create a "Hatching" post to introduce their project to the community.

## Key Features

### 1. **Automatic Hatching Prompt**
- After creating a project, users are automatically shown a post creation modal
- The modal is specially styled with an orange/yellow gradient and 🐣 emoji
- Pre-configured as a "hatching" post type
- Users can skip this step if they prefer

### 2. **Post Type: Hatching**
- New post type added to the system: `'hatching'`
- Distinguished by:
  - 🐣 Emoji icon
  - Orange/yellow gradient background
  - Special positioning in timeline (always shown last)
  - Orange badge and styling

### 3. **Project Timeline with Collapsible Cards**
- **Expandable/Collapsible Design**: Posts shown as cards with expand/collapse functionality
- **Smart Sorting**: Latest posts first, Hatching post always at the end
- **Visual Timeline**: Vertical timeline with colored dots indicating post types
- **Responsive Cards**: Hover effects and smooth transitions

### 4. **Post Type Indicators**
Each post type has unique visual styling:
- 🐣 **Hatching**: Orange gradient background, orange dot
- 🎯 **Milestone**: Green background, green dot
- 📢 **Announcement**: Blue background, blue dot
- 📝 **Update**: Gray background, gray dot

## Component Structure

### ProjectModal.jsx
- Shows hatching modal after project creation
- Passes `hatchingMode={true}` to PostModal
- Handles skip and completion callbacks

### PostModal.jsx
- **New Props**:
  - `projectId`: Pre-select project for the post
  - `forcePostType`: Lock the post type (e.g., 'hatching')
  - `hatchingMode`: Enable special hatching UI
- **Special Hatching UI**:
  - Orange/yellow gradient header
  - "🐣 Hatch Your Project!" title
  - Hides project selector (pre-selected)
  - Hides post type selector (forced to 'hatching')

### ProjectTimeline.jsx
- New collapsible timeline component
- **Features**:
  - Expand/collapse individual posts
  - Click expanded card content to view full post
  - Media preview grid (up to 4 images)
  - Content preview with EditorJS renderer
  - Stats display (upvotes, downvotes, comments)
  - "View Full Post & Comments" button

### Project.jsx (Updated)
- Uses new ProjectTimeline component
- Shows PostModal for adding updates
- Cleaner interface with timeline view

## Post Model Updates

```javascript
type: {
  type: String,
  enum: ['update', 'announcement', 'milestone', 'hatching'],
  default: 'update'
},
isHatching: {
  type: Boolean,
  default: false
}
```

## Timeline Behavior

### Sorting Logic
```javascript
// Hatching posts always go to the end
if (a.type === 'hatching' && b.type !== 'hatching') return 1;
if (b.type === 'hatching' && a.type !== 'hatching') return -1;

// Otherwise sort by date (newest first)
return new Date(b.createdAt) - new Date(a.createdAt);
```

### Visual Layout
```
Timeline Line (left side)
├── 📝 Update 3 (Most recent)
│   └── Collapsible card with preview
├── 🎯 Milestone 2
│   └── Collapsible card with preview
├── 📢 Announcement 1
│   └── Collapsible card with preview
└── 🐣 Hatching (Always last)
    └── Collapsible card with preview
```

## User Flow

### Creating a Project
1. User clicks "Create Project"
2. Fills in project details (title, description, category, cover image)
3. Submits project form
4. **Hatching Modal Appears** with message:
   - "🐣 Hatch Your Project!"
   - "Introduce your project to the community"
5. User creates hatching post with:
   - Title
   - Media (images/videos)
   - Content (using EditorJS)
6. Post is created with `type: 'hatching'`
7. User is redirected to project page

### Viewing Project Timeline
1. Navigate to project page
2. See timeline with all posts
3. Latest posts shown first
4. Hatching post shown at the end
5. Click expand button (▼) to see more details
6. Click "View Full Post & Comments" to open full post view

### Interacting with Timeline Cards
- **Collapsed State**: Shows title, type badge, date, content preview
- **Expanded State**: Shows media grid, full content, stats, action button
- **Click Card**: Opens full post view (when collapsed)
- **Click Expand**: Toggles expanded state
- **Click "View Full Post"**: Opens post in full view with comments

## Styling Details

### Color Scheme
```javascript
// Hatching
background: 'bg-gradient-to-r from-orange-100 to-yellow-100'
border: 'border-orange-300'
badge: 'bg-orange-200 text-orange-800'
dot: 'bg-orange-500'

// Milestone
background: 'bg-green-50'
border: 'border-green-300'
badge: 'bg-green-200 text-green-800'
dot: 'bg-green-500'

// Announcement
background: 'bg-blue-50'
border: 'border-blue-300'
badge: 'bg-blue-200 text-blue-800'
dot: 'bg-blue-500'

// Update
background: 'bg-gray-50'
border: 'border-gray-200'
badge: 'bg-gray-200 text-gray-800'
dot: 'bg-gray-400'
```

## Benefits

✅ **Better Project Introduction**: Hatching posts provide a dedicated space for project introduction
✅ **Clear Timeline**: Visual timeline makes project progress easy to follow
✅ **Organized Updates**: Posts are sorted logically (latest first, hatching last)
✅ **Space-Efficient**: Collapsible cards save vertical space
✅ **Quick Navigation**: Expand/collapse for quick browsing, click to see full details
✅ **Visual Hierarchy**: Color-coded post types make scanning easier
✅ **Engagement**: Special hatching experience encourages quality first posts

## API Endpoints

No new endpoints required. Uses existing:
- `POST /api/projects` - Create project
- `POST /api/posts` - Create post (with `type: 'hatching'`)
- `GET /api/projects/:id` - Get project with posts

## Future Enhancements

- [ ] Badge for users with hatching posts
- [ ] Hatching post analytics
- [ ] Suggested content for hatching posts
- [ ] Hatching post templates
- [ ] Community reactions to hatching posts
- [ ] Trending hatching posts page
