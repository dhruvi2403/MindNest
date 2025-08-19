# MindNest Setup Instructions

## Overview
This document explains how to set up and run the MindNest mental health platform with all its components working properly.

## Issues Fixed

### 1. Assessment Page Issues ✅
- **Problem**: Only 2 questions were showing instead of 17-18
- **Solution**: Added proper assessment metadata endpoint (`/api/assessment/metadata`) with full question set
- **Problem**: Backend unavailable error on submission
- **Solution**: Added dynamic assessment submission endpoint (`/api/assessment/dynamic`) with fallback prediction logic

### 2. Therapist Onboarding Issues ✅
- **Problem**: Modal not opening after therapist signup
- **Solution**: Fixed API endpoints and ensured proper database schema
- **Problem**: Therapist profile data not being stored
- **Solution**: Fixed database operations and API integration

### 3. ML Service Integration ✅
- **Problem**: Python ML service not connected
- **Solution**: Created proper integration with fallback prediction logic

## System Architecture

```
Frontend (React) → Backend (Node.js) → Database (MongoDB)
                    ↓
              ML Service (Python/Flask)
```

## Prerequisites

1. **Node.js** (v16 or higher)
2. **Python** (v3.8 or higher)
3. **MongoDB** (running locally or cloud instance)
4. **npm** or **yarn**

## Installation Steps

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install Python ML service dependencies
cd ../scripts
pip install -r requirements.txt
```

### 2. Environment Setup

Create a `.env` file in the `backend` directory:

```env
MONGODB_URI=mongodb://localhost:27017/mindnest
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

### 3. Database Setup

Ensure MongoDB is running and accessible at the URI specified in your `.env` file.

## Running the System

### Option 1: Use the Startup Scripts (Recommended)

#### Windows
```bash
# Double-click or run in PowerShell
start_services.bat

# Or use PowerShell
.\start_services.ps1
```

#### Linux/Mac
```bash
# Make executable and run
chmod +x start_services.sh
./start_services.sh
```

### Option 2: Manual Startup

#### Terminal 1: Backend Server
```bash
cd backend
npm start
```

#### Terminal 2: ML Service
```bash
cd scripts
python start_ml_service.py
```

#### Terminal 3: Frontend
```bash
npm run dev
```

## Service URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **ML Service**: http://localhost:5001

## Testing the System

### 1. Assessment Flow
1. Sign up as a client user
2. Navigate to `/assessment`
3. Complete all 17-18 questions
4. View results with proper risk assessment

### 2. Therapist Onboarding Flow
1. Sign up as a therapist user
2. Complete the onboarding modal
3. Verify profile data is stored in database
4. Check that profile appears in therapist listings

## Troubleshooting

### Common Issues

#### 1. Assessment Only Shows 2 Questions
- Ensure backend is running on port 5000
- Check that `/api/assessment/metadata` endpoint is accessible
- Verify authentication token is valid

#### 2. Therapist Onboarding Modal Not Opening
- Check browser console for errors
- Ensure backend is running and accessible
- Verify user role is set to "therapist"

#### 3. ML Service Not Responding
- Ensure Python service is running on port 5001
- Check that all Python dependencies are installed
- Verify the service is accessible at `http://localhost:5001/predict`

#### 4. Database Connection Issues
- Verify MongoDB is running
- Check connection string in `.env` file
- Ensure network access to database

### Debug Commands

```bash
# Check if services are running
netstat -an | findstr :5000  # Windows
netstat -an | grep :5000     # Linux/Mac

# Check MongoDB connection
mongo --eval "db.runCommand('ping')"

# Test ML service
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{"answers":{"anxiety_1":2,"anxiety_2":1},"model_type":"ensemble"}'
```

## File Structure

```
3-auth-done-routeissue/
├── backend/                 # Node.js backend server
│   ├── routes/             # API endpoints
│   ├── lib/                # Database and auth utilities
│   └── server.js           # Main server file
├── components/              # React components
│   ├── pages/              # Page components
│   ├── modals/             # Modal components
│   └── ui/                 # UI components
├── scripts/                 # Python ML service
│   ├── ml_service.py       # Main ML service
│   ├── start_ml_service.py # ML service startup script
│   └── requirements.txt    # Python dependencies
├── start_services.bat      # Windows startup script
├── start_services.ps1      # PowerShell startup script
└── SETUP_INSTRUCTIONS.md   # This file
```

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all services are running
3. Check browser console and server logs
4. Ensure all dependencies are properly installed

## Updates

The system now includes:
- ✅ Full 17-18 question mental health assessment
- ✅ Proper ML service integration with fallback logic
- ✅ Working therapist onboarding flow
- ✅ Complete assessment results display
- ✅ Proper error handling and user feedback
