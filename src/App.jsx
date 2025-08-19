import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from '../components/pages/LandingPage.jsx';
import AboutPage from '../components/pages/AboutPage.jsx';
import ContactPage from '../components/pages/ContactPage.jsx';
import LoginPage from '../components/pages/LoginPage.jsx';
import SignupPage from '../components/pages/SignupPage.jsx';
import Dashboard from '../components/pages/Dashboard.jsx';
import TherapistDashboard from '../components/pages/TherapistDashboard.jsx';
import AssessmentPage from '../components/pages/AssessmentPage.jsx';
import TherapistPage from '../components/pages/TherapistPage.jsx';
import ProfilePage from '../components/pages/ProfilePage.jsx';
import { AuthProvider, useAuth } from '@/contexts/AuthContext.jsx';
import { ChatbotProvider } from '../components/chatbot/ChatbotProvider.jsx';
import ChatbotWrapper from '../components/chatbot/ChatbotWrapper.jsx';
// import { Toaster } from '../components/ui/toaster.jsx';
import Navbar from '../components/layout/Navbar.jsx';
import TherapistNavbar from '../components/layout/TherapistNavbar.jsx';



// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}

// Public Route Component (redirect to dashboard if logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    if (user.role === "therapist") {
      return <Navigate to="/therapist-dashboard" />;
    }
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes - Client Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Protected Routes - Therapist Dashboard */}
      <Route
        path="/therapist-dashboard"
        element={
          <ProtectedRoute>
            <TherapistDashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Shared Protected Routes */}
      <Route
        path="/assessment"
        element={
          <ProtectedRoute>
            <AssessmentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/therapists"
        element={
          <ProtectedRoute>
            <TherapistPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ChatbotProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <ConditionalNavbar />
            <AppRoutes />
            <ChatbotWrapper />
          </div>
        </Router>
        {/* <Toaster /> */}
      </ChatbotProvider>
    </AuthProvider>
  );
}

// Component to conditionally render the appropriate navbar
function ConditionalNavbar() {
  const { user } = useAuth();
  const location = useLocation();
  const isPublicPage = ['/', '/about', '/contact'].includes(location.pathname);
  
  // Always show public navbar on public pages
  if (isPublicPage) {
    return <Navbar />;
  }
  
  // Show therapist navbar for therapist users
  if (user && user.role === 'therapist') {
    return <TherapistNavbar />;
  }
  
  // Show regular navbar for logged-in users
  if (user) {
    return <Navbar />;
  }
  
  // Show regular navbar for login/signup pages
  return <Navbar />;
}
