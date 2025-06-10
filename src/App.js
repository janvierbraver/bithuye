// client/src/App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';

// Import your application components
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import ForgotPassword from './components/ForgotPassword';
import AdminDashboard from './components/adminDashboard';
import InstructorDashboard from './components/instructorDashboard';
import LearnerDashboard from './components/learnerDashboard';
import QuestionManagement from './components/QuestionManagement';
import LearnerCourseDetail from './components/LearnerCourseDetail';
import TakeExam from './components/TakeExam';
import HomePage from './components/HomePage';
import CertificateDisplay from './components/CertificateDisplay'; // <--- NEW: Import CertificateDisplay

function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userJson = localStorage.getItem('user');
        if (userJson) {
            try {
                const user = JSON.parse(userJson);
                if (user && user.id && user.role) {
                    setCurrentUser(user);
                } else {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    console.warn("Invalid user data in localStorage. Cleared.");
                }
            } catch (e) {
                console.error("Failed to parse user data from localStorage:", e);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
    }, []);

    const handleLoginSuccess = (userData) => {
        setCurrentUser(userData);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
        alert('You have been logged out.');
        navigate('/login');
    };

    const ProtectedRoute = ({ children, allowedRoles }) => {
        if (!currentUser) {
            return <Navigate to="/login" replace />;
        }

        if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
            console.warn(`User ${currentUser.email} with role '${currentUser.role}' attempted to access a restricted route.`);
            if (currentUser.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
            if (currentUser.role === 'instructor') return <Navigate to="/instructor-dashboard" replace />;
            if (currentUser.role === 'learner') return <Navigate to="/learner-dashboard" replace />;
            return <Navigate to="/" replace />;
        }

        return children;
    };

    return (
        <div style={{ /* No padding here, let HomePage manage its own layout */ }}>
            <Routes>
                {/* --- Public Routes --- */}
                <Route
                    path="/"
                    element={currentUser ? <Navigate to={`/${currentUser.role}-dashboard`} replace /> : <HomePage />}
                />
                <Route path="/register" element={<RegistrationForm />} />
                <Route
                    path="/login"
                    element={currentUser ? <Navigate to={`/${currentUser.role}-dashboard`} replace /> : <LoginForm onLoginSuccess={handleLoginSuccess} />}
                />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* --- Protected Dashboard Routes --- */}
                <Route
                    path="/admin-dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard onLogout={handleLogout} user={currentUser} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/instructor-dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['instructor']}>
                            <InstructorDashboard onLogout={handleLogout} user={currentUser} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/learner-dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['learner']}>
                            <LearnerDashboard onLogout={handleLogout} user={currentUser} />
                        </ProtectedRoute>
                    }
                />

                {/* Instructor Exam/Question Management Routes */}
                <Route
                    path="/instructor/exams/:examId/questions"
                    element={
                        <ProtectedRoute allowedRoles={['instructor']}>
                            <QuestionManagement user={currentUser} onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                />

                {/* Learner Course/Exam Routes */}
                <Route
                    path="/learner/courses/:courseId"
                    element={
                        <ProtectedRoute allowedRoles={['learner']}>
                            <LearnerCourseDetail user={currentUser} onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/learner/exams/:examId/take"
                    element={
                        <ProtectedRoute allowedRoles={['learner']}>
                            <TakeExam user={currentUser} onLogout={handleLogout} />
                        </ProtectedRoute>
                    }
                />
                {/* NEW: Certificate Display Route */}
                <Route
                    path="/learner/certificate/:examId"
                    element={
                        <ProtectedRoute allowedRoles={['learner']}>
                            <CertificateDisplay />
                        </ProtectedRoute>
                    }
                />

                {/* Catch-all for any unmatched routes */}
                <Route
                    path="*"
                    element={currentUser ? <Navigate to={`/${currentUser.role}-dashboard`} replace /> : <Navigate to="/" replace />}
                />
            </Routes>
        </div>
    );
}

export default App;