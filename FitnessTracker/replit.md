# replit.md

## Overview

FitTrack is a modern fitness tracking web application built with React, Express.js, and PostgreSQL. The application allows users to log workouts, track exercises, view workout history, and monitor fitness progress over time. It features a responsive design with a clean, intuitive interface optimized for both desktop and mobile devices.

## System Architecture

The application follows a full-stack architecture with clear separation between frontend and backend:

**Frontend Architecture:**
- React 18 with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight alternative to React Router)
- TanStack Query for server state management and caching
- Tailwind CSS for styling with shadcn/ui component library
- React Hook Form with Zod for form validation

**Backend Architecture:**
- Express.js server with TypeScript
- RESTful API design
- Drizzle ORM for database operations
- PostgreSQL database (using Neon serverless)
- Session-based architecture (session handling configured)

**Database Design:**
- Three main tables: exercises, workouts, and workout_exercises
- Relational structure with proper foreign key relationships
- Support for various exercise types (strength, cardio, yoga)

## Key Components

**Frontend Components:**
- Layout components (Navigation, MobileHeader) for responsive navigation
- Page components (Dashboard, LogWorkout, History, Progress)
- UI components from shadcn/ui for consistent design
- Custom hooks for mobile detection and toast notifications
- Workout-specific components (ExerciseSearch, WorkoutCalendar, ProgressChart)

**Backend Components:**
- Route handlers for exercises and workouts in `/server/routes.ts`
- Storage layer with interface abstraction in `/server/storage.ts`
- Vite integration for development environment
- Database schema definitions in `/shared/schema.ts`

**Shared Components:**
- Type definitions and Zod schemas for data validation
- Database table definitions using Drizzle ORM

## Data Flow

1. **Exercise Management:**
   - Users can search and filter exercises by category or name
   - Exercise data includes muscle groups, categories, and descriptions
   - Support for strength training, cardio, and yoga exercises

2. **Workout Logging:**
   - Users create workouts with multiple exercises
   - Each exercise can have sets, reps, weight, distance, duration, and pace
   - Workouts include metadata like duration, calories, and notes

3. **Progress Tracking:**
   - Historical workout data visualization
   - Progress charts showing workout frequency and performance
   - Calendar view for workout history

4. **API Communication:**
   - RESTful endpoints for CRUD operations
   - Query-based filtering for exercises and workouts
   - Error handling and validation at API level

## External Dependencies

**Frontend Dependencies:**
- @radix-ui/* components for accessible UI primitives
- @tanstack/react-query for server state management
- recharts for data visualization
- lucide-react for icons
- tailwindcss for styling
- wouter for routing

**Backend Dependencies:**
- express for web server
- drizzle-orm for database operations
- @neondatabase/serverless for PostgreSQL connection
- connect-pg-simple for session storage
- zod for runtime type validation

**Development Dependencies:**
- vite for build tooling
- typescript for type checking
- tsx for TypeScript execution
- esbuild for production builds

## Deployment Strategy

**Development:**
- Vite dev server with HMR for frontend development
- Express server with tsx for backend development
- Environment-based configuration for database connections

**Production Build:**
- Vite builds frontend assets to `dist/public`
- esbuild bundles backend code to `dist/index.js`
- Single production command serves both frontend and backend

**Database:**
- Drizzle migrations stored in `./migrations`
- Database schema defined in TypeScript
- Environment variable configuration for database URL

**Hosting Considerations:**
- Designed for deployment on platforms supporting Node.js
- Static asset serving integrated into Express server
- Environment variable support for configuration

## Production Deployment Features

**Security Measures:**
- Rate limiting (100 requests per 15 minutes per IP)
- Security headers (XSS protection, content type validation, frame protection)
- Input validation and sanitization with Zod schemas
- Production error handling (sensitive info hidden in production)
- Firebase Authentication with email/password

**Performance Optimizations:**
- Database connection pooling with Neon PostgreSQL
- Efficient API design with proper caching headers
- Mobile-first responsive design
- Optimized bundle size with Vite

**User Experience:**
- Complete authentication flow (sign-up, sign-in, sign-out)
- Mobile responsive navigation
- Real-time workout tracking
- Progress visualization with charts
- Calendar view for workout history

## Deployment Ready Checklist

✅ **Authentication System**
- Firebase Authentication configured
- User registration and login working
- Protected routes implemented
- Sign-out functionality on both desktop and mobile

✅ **Database & API**
- PostgreSQL database with proper schema
- RESTful API endpoints with validation
- Error handling and logging
- Rate limiting protection

✅ **Security**
- Input sanitization
- SQL injection protection via Drizzle ORM
- XSS protection headers
- Production error handling

✅ **Mobile Experience**
- Responsive design for all screen sizes
- Mobile navigation menu
- Touch-friendly interface
- Fast loading times

## Changelog

```
Changelog:
- July 05, 2025. Initial setup with PostgreSQL database
- July 05, 2025. Added Firebase Authentication system
- July 05, 2025. Implemented complete user authentication flow
- July 05, 2025. Added production security measures and rate limiting
- July 05, 2025. App ready for public deployment with full feature set
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```