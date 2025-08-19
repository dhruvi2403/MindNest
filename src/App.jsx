import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../components/pages/LandingPage.jsx';
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
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
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
  // return (
  //   <div className="min-h-screen bg-background">
  //     <AuthProvider>
  //       <ChatbotProvider>
  //         <Router>
  //           <AppRoutes />
  //           <ChatbotWrapper />
  //         </Router>
  //       </ChatbotProvider>
  //     </AuthProvider>
  //     {/* <Toaster /> */}
  //   </div>
  // );
  return (
    <AuthProvider>
      <ChatbotProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Navbar />   {/* Now Navbar is safely inside AuthProvider */}
            <AppRoutes />
            <ChatbotWrapper />
          </div>
        </Router>
        {/* <Toaster /> */}
      </ChatbotProvider>
    </AuthProvider>
  );
}
