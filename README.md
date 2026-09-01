# AI Movie Hub - Full Stack Movie Recommendation App

![AI Movie Hub](https://img.shields.io/badge/Powered%20by-AI-blueviolet)
![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## 🎬 Overview

**AI Movie Hub** is a full-stack movie recommendation application powered by **artificial intelligence**. Discover movies, get personalized AI recommendations, search through thousands of films, and manage your wishlist.

### ✨ Key Features

- **🤖 AI-Powered Recommendations** - Get personalized movie suggestions using advanced AI technology (Google Gemini)
- **🔍 Smart Search** - Search through TMDB's extensive movie database
- **❤️ Wishlist Management** - Save movies to watch later
- **👤 User Authentication** - Secure login/signup with email
- **🎨 Beautiful UI** - Cinematic dark theme with smooth GSAP animations
- **📱 Responsive Design** - Works perfectly on all devices

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **Tailwind CSS** for styling
- **GSAP** for smooth animations and microinteractions
- **Shadcn/ui** for beautiful UI components
- **React Router** for navigation

### Backend
- **PostgreSQL Database** (via Supabase)
- **User Authentication** (Supabase Auth)
- **Edge Functions** (Deno runtime)
- **Row Level Security** (RLS) for data protection

### AI Integration
- **AI Gateway** with Google Gemini 2.5 Flash
- **TMDB API** for movie data

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm installed

### Installation

1. **Clone the repository**
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

The app will open at `http://localhost:8080`

## 🔑 Authentication Setup

The app uses Cloud for authentication, which is already configured and working. No additional setup needed!

**Auto-confirm emails are enabled** for faster testing - users can login immediately after signup without email verification.

### How Authentication Works:
- Users sign up with email and password
- Profiles are automatically created in the database
- Row Level Security (RLS) ensures users can only access their own data
- Session management is handled automatically

## 💾 Database Structure

The app uses two main tables:

### `profiles` table
- Stores user profile information
- Automatically created when users sign up
- Links to authentication system

### `wishlist` table
- Stores user movie wishlists
- Each entry links to a user and movie
- Protected by RLS policies

## 🎨 Design System

The app uses a **cinematic dark theme** with:
- Deep blacks and vibrant accent colors
- Gradient overlays and glows
- Smooth transitions and hover effects
- GSAP-powered microinteractions

Colors are defined in `src/index.css` using HSL values and semantic tokens.

## 🤖 AI Recommendations

AI recommendations are powered by Google Gemini:
- Click "Get AI Recommendations" on the homepage
- AI analyzes popular and trending films
- Returns personalized movie suggestions
- Uses TMDB API to fetch full movie details

**Rate Limits:**
- Free usage included per month
- If you hit rate limits (429 error), wait a few minutes
- If you run out of credits (402 error), add more in Settings → Usage

## 📡 API Integration

### TMDB API
- The app uses TMDB API key: your_api_key_here
- For production, consider using environment variables
- TMDB provides movie data, posters, ratings, etc.

## 🔒 Security

- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- Passwords are securely hashed by Supabase Auth
- API keys for AI are stored server-side
- Input validation on all forms

## ⚠️ Common Issues & Troubleshooting

### Backend Connectivity
**Issue:** "Will my backend still work if I go offline?"

**Answer:** No. Backend service requires internet connectivity. If you go offline:
- User authentication will fail
- Database operations will fail
- AI recommendations won't work
- TMDB API calls will fail

**Solution:** Ensure stable internet connection for development and production.

### Build Errors
If you see TypeScript errors:
```bash
npm run build
```
Fix any type errors shown before deploying.

### Rate Limiting
If AI recommendations fail with 429 error:
- You've exceeded the rate limit
- Wait a few minutes before trying again
- Consider spacing out AI requests

### TMDB API Errors
If movie data fails to load:
- Check your internet connection
- TMDB API might be down (rare)
- API key might have expired

### Authentication Issues
If users can't login:
- Check browser console for errors
- Verify RLS policies are set correctly

## 📚 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn UI components
│   ├── MovieCard.tsx   # Movie display card
│   ├── SearchBar.tsx   # Search input
│   └── Navbar.tsx      # Navigation bar
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state
├── lib/               # Utility libraries
│   ├── tmdb.ts        # TMDB API client
│   └── utils.ts       # Helper functions
├── pages/             # Route pages
│   ├── Index.tsx      # Homepage
│   ├── Auth.tsx       # Login/Signup
│   ├── MovieDetails.tsx
│   └── Wishlist.tsx
└── integrations/      # Auto-generated
    └── supabase/      # Supabase client (DO NOT EDIT)

supabase/
└── functions/         # Edge functions
    └── get-ai-recommendations/
        └── index.ts   # AI recommendation logic
```

## 🎯 Future Enhancements

Potential features to add:
- Forgot password functionality
- OTP-based authentication
- Social login (Google, Facebook)
- Movie reviews and ratings
- Watch history tracking
- Advanced filtering and sorting
- Recommendation tuning based on preferences

## 🐛 Known Limitations

1. **Express.js + MongoDB**: This app uses (Supabase/PostgreSQL), not Express.js + MongoDB. To use Express.js + MongoDB, you would need to:
   - Set up a separate Express.js server
   - Connect to MongoDB Atlas
   - Rewrite the edge functions as Express routes
   - Handle CORS and authentication manually

2. **Offline Mode**: No offline support - requires internet connection

**Created with❤️by Utkarsh Chauhan
