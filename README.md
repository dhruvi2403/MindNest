# MindNest - Mental Health Wellness Platform

A comprehensive MERN stack mental health platform with AI-powered assessments using real clinical datasets.

## 🏗️ Architecture

- **Frontend**: React with Next.js (for v0 compatibility)
- **Backend**: Node.js API routes with JWT authentication
- **ML Service**: Python Flask with scikit-learn (Decision Tree & KNN)
- **Database**: MongoDB simulation (easily replaceable with real MongoDB)
- **Datasets**: Real mental health clinical data

## 📋 Prerequisites

Before installation, ensure you have:

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **pip** (Python package manager)
- **Git** (for cloning)

## 🚀 Quick Start

### 1. Install Dependencies

\`\`\`bash
# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r scripts/requirements.txt
\`\`\`

### 2. Environment Setup

Create a `.env.local` file in the root directory:

\`\`\`env
# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# MongoDB Connection (optional - uses in-memory simulation by default)
MONGODB_URI=mongodb://localhost:27017/mindnest

# ML Service URLs
ML_SERVICE_URL=http://localhost:5000
NEXT_PUBLIC_ML_SERVICE_URL=http://localhost:5000

# Development Settings
NODE_ENV=development
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

### 3. Start the Services

**Option A: Manual Start (Recommended for Development)**

Open 2 terminal windows:

**Terminal 1 - Python ML Service:**
\`\`\`bash
cd scripts
python ml_service_real_data.py
\`\`\`

**Terminal 2 - Next.js Frontend:**
\`\`\`bash
npm run dev
\`\`\`

**Option B: Using Setup Script**
\`\`\`bash
# Make setup script executable (Linux/Mac)
chmod +x scripts/setup.sh
./scripts/setup.sh

# Or run directly
bash scripts/setup.sh
\`\`\`

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **ML Service API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Python Dependencies Error
\`\`\`bash
# If pip install fails, try:
python -m pip install --upgrade pip
pip install -r scripts/requirements.txt --user

# For macOS with Homebrew Python:
pip3 install -r scripts/requirements.txt

# For conda users:
conda install scikit-learn pandas numpy flask flask-cors requests
\`\`\`

#### 2. Port Already in Use
\`\`\`bash
# If port 3000 is busy:
npm run dev -- -p 3001

# If port 5000 is busy, edit ml_service_real_data.py:
# Change: app.run(host='0.0.0.0', port=5000, debug=True)
# To: app.run(host='0.0.0.0', port=5001, debug=True)
# Then update .env.local ML_SERVICE_URL accordingly
\`\`\`

#### 3. Module Not Found Errors
\`\`\`bash
# Ensure you're in the correct directory
pwd  # Should show your project root

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# For Python modules:
pip install --force-reinstall -r scripts/requirements.txt
\`\`\`

#### 4. CORS Issues
The ML service includes CORS headers. If you still get CORS errors:
- Ensure both services are running
- Check that ML_SERVICE_URL in .env.local matches the Python service URL
- Try restarting both services

#### 5. Dataset Loading Issues
If the ML service can't load datasets:
- Check your internet connection (datasets are fetched from URLs)
- The service will retry automatically
- Check the console logs for specific error messages

### 6. JWT Secret Error
If you get JWT-related errors:
\`\`\`bash
# Generate a secure JWT secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy the output to JWT_SECRET in .env.local
\`\`\`

## 📁 Project Structure

\`\`\`
mindnest/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes (Node.js backend)
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── assessment/           # ML prediction endpoints
│   │   ├── therapists/           # Therapist directory API
│   │   └── profile/              # User profile API
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
├── components/                   # React components
│   ├── layout/                   # Layout components
│   ├── pages/                    # Page components
│   ├── assessment/               # Assessment-specific components
│   └── ui/                       # UI components (shadcn/ui)
├── contexts/                     # React contexts
│   └── AuthContext.tsx           # Authentication context
├── lib/                          # Utility libraries
│   ├── auth.ts                   # JWT utilities
│   ├── db.ts                     # Database utilities
│   └── utils.ts                  # General utilities
├── scripts/                      # Python ML service
│   ├── ml_service_real_data.py   # Main ML service
│   ├── requirements.txt          # Python dependencies
│   └── setup.sh                  # Setup script
├── public/                       # Static assets
├── .env.local                    # Environment variables
├── package.json                  # Node.js dependencies
└── README.md                     # This file
\`\`\`

## 🧠 ML Service Details

The ML service uses real mental health datasets and provides:

- **Decision Tree Classifier**: Interpretable predictions with feature importance
- **K-Nearest Neighbors**: Pattern-based predictions using similar cases
- **Ensemble Method**: Combines both models for improved accuracy
- **Real Clinical Data**: Trained on actual mental health assessment data

### API Endpoints

- `GET /health` - Service health check
- `POST /train` - Retrain models with latest data
- `POST /predict` - Get mental health risk prediction
- `GET /models/info` - Model information and status
- `GET /datasets/info` - Dataset information

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation and sanitization
- Secure environment variable handling

## 🎯 Features

### User Features
- **Comprehensive Assessment**: Evidence-based mental health questionnaire
- **AI-Powered Insights**: Personalized risk assessment and recommendations
- **Therapist Directory**: Find and connect with mental health professionals
- **Progress Tracking**: Monitor mental health journey over time
- **Secure Authentication**: Protected user accounts and data

### Clinical Features
- **Real Data Training**: Models trained on actual clinical datasets
- **Risk Stratification**: Low, Mild, Moderate, High risk categories
- **Evidence-Based Recommendations**: Clinically validated suggestions
- **Professional Integration**: Designed for healthcare provider use

## 🚀 Deployment

### Local Development
Follow the Quick Start guide above.

### Production Deployment

1. **Environment Variables**: Set production values in your hosting platform
2. **Database**: Replace simulation with real MongoDB
3. **ML Service**: Deploy Python service separately (e.g., Railway, Heroku)
4. **Frontend**: Deploy Next.js app (Vercel recommended)

### Docker Deployment (Optional)
\`\`\`bash
# Build and run with Docker Compose
docker-compose up --build

# Or build individual services
docker build -t mindnest-ml ./scripts
docker build -t mindnest-app .
\`\`\`

## 📊 Data Sources

The platform uses two real mental health datasets:
1. **General Mental Health Dataset**: Demographics, lifestyle factors, and mental health indicators
2. **Clinical Treatment Dataset**: Diagnosis, treatment outcomes, and clinical assessments

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Ensure all dependencies are properly installed
4. Verify environment variables are set correctly

For additional support, please open an issue in the repository.
