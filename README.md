# Dark Theme Blog Website

A beautiful, responsive blog website built with React, Vite, Firebase, and shadcn/ui. Features a dark theme, admin dashboard, and user comments.

## Features

- 🌙 Beautiful dark theme design
- 📱 Fully responsive layout
- 🔒 Secure admin dashboard for creating blog posts
- 💬 User authentication for commenting
- 🎨 Modern UI components with shadcn/ui
- 🔥 Real-time updates with Firebase

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd blog-website
```

2. Install dependencies:
```bash
npm install
```

3. Create a Firebase project and enable:
   - Authentication (Email/Password)
   - Firestore Database
   - Storage

4. Create a `.env` file in the root directory and add your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

5. Update the admin email in `src/components/Navbar.tsx` and `src/components/ProtectedRoute.tsx`:
```typescript
user.email === 'your-admin-email@example.com'
```

6. Start the development server:
```bash
npm run dev
```

## Usage

### Admin
1. Sign in with your admin email
2. Access the admin dashboard at `/admin`
3. Create new blog posts with title and content

### Users
1. Browse blog posts on the home page
2. Click on a post to read the full content
3. Sign in to leave comments on posts

## Technologies Used

- React + TypeScript
- Vite
- Firebase (Auth, Firestore)
- shadcn/ui
- Tailwind CSS
- React Router DOM

## License

MIT
