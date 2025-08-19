# MindNest - MERN Stack Mental Health Platform

This is the converted MERN stack version of MindNest, a comprehensive mental health wellness platform that combines AI-powered assessments with professional therapy support.

## Project Structure

```
mindnest/
├── src/                          # React frontend (Vite)
│   ├── components/               # React components
│   │   ├── ui/                   # UI components (Button, Input, Card, etc.)
│   │   ├── pages/                # Page components
│   │   ├── layout/               # Layout components
│   │   └── chatbot/              # Chatbot components
│   ├── contexts/                 # React contexts (Auth, Chatbot)
│   ├── lib/                      # Utility functions
│   ├── App.jsx                   # Main App component
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
├── backend/                      # Express.js backend
│   ├── routes/                   # API routes
│   ├── lib/                      # Database and auth utilities
│   ├── server.js                 # Main server file
│   └── package.json              # Backend dependencies
├── scripts/                      # Python ML services (unchanged)
├── package.json                  # Frontend dependencies
├── vite.config.js                # Vite configuration
├── tailwind.config.js            # Tailwind CSS configuration
└── index.html                    # HTML entry point
```

## Features

- **User Authentication**: Secure login/signup with JWT tokens
- **AI-Powered Assessments**: Mental health questionnaires with ML analysis
- **Therapist Matching**: Find and connect with qualified mental health professionals
- **Chatbot Assistant**: AI-powered support and navigation
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Real-time Updates**: Live chat and notifications

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (running locally or cloud instance)
- Python 3.8+ (for ML services)

## Installation & Setup

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp env.example .env
```

Edit the `.env` file with your configuration:

```env
MONGODB_URI=mongodb://localhost:27017/mindnest
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
NODE_ENV=development
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Start MongoDB service
mongod
```

### 5. Start the Backend Server

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:5000`

### 6. Start the Frontend Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Available Scripts

### Frontend (Root Directory)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend (backend/ Directory)
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

### User Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Assessments
- `GET /api/assessment` - Get user assessments
- `POST /api/assessment` - Create new assessment

### Therapists
- `GET /api/therapists` - Get all verified therapists
- `GET /api/therapists/:id` - Get therapist by ID
- `GET /api/therapists/search/:specialization` - Search by specialization

### Chatbot
- `POST /api/chatbot/chat` - Send message to chatbot

## Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible UI components
- **Lucide React** - Icon library

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### ML Services (Python)
- **Scikit-learn** - Machine learning algorithms
- **Pandas** - Data manipulation
- **NumPy** - Numerical computing
- **Flask** - Web framework for ML services

## Development

### Frontend Development
The frontend uses Vite for fast development with hot module replacement. All React components are in JSX format.

### Backend Development
The backend uses Express.js with MongoDB. API routes are organized by feature in the `routes/` directory.

### Database
MongoDB schemas are defined in `backend/lib/db.js` with Mongoose models for Users, Therapists, and Assessments.

## Deployment

### Frontend
Build the frontend for production:
```bash
npm run build
```

The built files will be in the `dist/` directory.

### Backend
The backend can be deployed to any Node.js hosting service (Heroku, Railway, DigitalOcean, etc.).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
