import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './contexts/AuthContext';
import NotificationProvider from './components/NotificationManager';
// ⚠️ Adapte ces chemins si tes fichiers ne sont pas dans src/pages
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import TalentDashboard from './pages/TalentDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
// CoachDashboard supprimé - fonctionnalité non implémentée
import ProfilePage from './pages/ProfilePage';
import TalentsListPage from './pages/TalentsListPage';
import CoachTalentsPage from './pages/CoachTalentsPage';
import CoachRecruteursPage from './pages/CoachRecruteursPage';
import TalentMessagesPage from './pages/TalentMessagesPage';
import CoachMessagesPage from './pages/CoachMessagesPage';
import RecruiterMessagesPage from './pages/RecruiterMessagesPage';
import CreateJobPage from './pages/CreateJobPage';
import MyJobsPage from './pages/MyJobsPage';
import JobsListPage from './pages/JobsListPage';
import EditJobPage from './pages/EditJobPage';
import JobApplicationsPage from './pages/JobApplicationsPage';
import ApplyJobPage from './pages/ApplyJobPage';
import RecruiterApplicationsPage from './pages/RecruiterApplicationsPage';
import TalentApplicationsPage from './pages/TalentApplicationsPage';
import RecruiterRecommendationsPage from './pages/RecruiterRecommendationsPage';
import TalentRecommendationsPage from './pages/TalentRecommendationsPage';
import NotFoundPage from './pages/NotFoundPage';
import CoachLogin from './components/CoachLogin';
import CoachDashboard from './pages/CoachDashboard';
import BookingPage from './pages/BookingPage';
import AdminDashboard from './pages/AdminDashboard';
// Composant de login admin simple
function AdminLogin() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const handleLogin = (e) => {
        e.preventDefault();
        // Login admin simple - vous pouvez changer ces identifiants
        if (email === 'admin@prodtalent.com' && password === 'admin123') {
            setIsLoggedIn(true);
            setError('');
        }
        else {
            setError('Identifiants incorrects');
        }
    };
    if (isLoggedIn) {
        return _jsx(AdminDashboard, {});
    }
    return (_jsx("div", { style: {
            minHeight: '100vh',
            background: '#0a0a0a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }, children: _jsxs("div", { style: {
                background: '#1a1a1a',
                padding: '40px',
                borderRadius: '16px',
                maxWidth: '400px',
                width: '100%',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }, children: [_jsxs("div", { style: { textAlign: 'center', marginBottom: '32px' }, children: [_jsx("h1", { style: { color: '#ffcc00', margin: '0 0 8px 0', fontSize: '28px' }, children: "ProdTalent" }), _jsx("p", { style: { color: '#f5f5f7', margin: 0, fontSize: '16px' }, children: "Administration" })] }), error && (_jsx("div", { style: {
                        padding: '12px',
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        color: '#ff6b6b',
                        borderRadius: '8px',
                        marginBottom: '16px'
                    }, children: error })), _jsxs("form", { onSubmit: handleLogin, children: [_jsxs("div", { style: { marginBottom: '16px' }, children: [_jsx("label", { style: { color: '#f5f5f7', display: 'block', marginBottom: '8px' }, children: "Email Admin" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, style: {
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: '#333',
                                        color: '#f5f5f7',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px'
                                    } })] }), _jsxs("div", { style: { marginBottom: '24px' }, children: [_jsx("label", { style: { color: '#f5f5f7', display: 'block', marginBottom: '8px' }, children: "Mot de passe" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, style: {
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: '#333',
                                        color: '#f5f5f7',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px'
                                    } })] }), _jsx("button", { type: "submit", style: {
                                width: '100%',
                                padding: '14px',
                                backgroundColor: '#ffcc00',
                                color: '#000',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }, children: "Se connecter" })] }), _jsxs("div", { style: {
                        marginTop: '16px',
                        textAlign: 'center',
                        color: '#888',
                        fontSize: '12px'
                    }, children: [_jsx("p", { style: { margin: '8px 0' }, children: _jsx("strong", { children: "Identifiants de test :" }) }), _jsx("p", { style: { margin: '4px 0' }, children: "Email: admin@prodtalent.com" }), _jsx("p", { style: { margin: '4px 0' }, children: "Mot de passe: admin123" })] })] }) }));
}
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading)
        return null; // tu peux mettre un spinner ici
    if (!user)
        return _jsx(Navigate, { to: "/", replace: true });
    return children;
}
export default function App() {
    return (_jsx(NotificationProvider, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) }), _jsx(Route, { path: "/admin", element: _jsx(AdminLogin, {}) }), _jsx(Route, { path: "/coach/login", element: _jsx(CoachLogin, {}) }), _jsx(Route, { path: "/dashboard/talent", element: _jsx(ProtectedRoute, { children: _jsx(TalentDashboard, {}) }) }), _jsx(Route, { path: "/dashboard/recruteur", element: _jsx(ProtectedRoute, { children: _jsx(RecruiterDashboard, {}) }) }), _jsx(Route, { path: "/dashboard/coach", element: _jsx(ProtectedRoute, { children: _jsx(CoachDashboard, {}) }) }), _jsx(Route, { path: "/profile", element: _jsx(ProtectedRoute, { children: _jsx(ProfilePage, {}) }) }), _jsx(Route, { path: "/profile/:userId", element: _jsx(ProtectedRoute, { children: _jsx(ProfilePage, {}) }) }), _jsx(Route, { path: "/talents", element: _jsx(ProtectedRoute, { children: _jsx(TalentsListPage, {}) }) }), _jsx(Route, { path: "/coach/talents", element: _jsx(ProtectedRoute, { children: _jsx(CoachTalentsPage, {}) }) }), _jsx(Route, { path: "/coach/recruteurs", element: _jsx(ProtectedRoute, { children: _jsx(CoachRecruteursPage, {}) }) }), _jsx(Route, { path: "/talent/messages", element: _jsx(ProtectedRoute, { children: _jsx(TalentMessagesPage, {}) }) }), _jsx(Route, { path: "/coach/messages", element: _jsx(ProtectedRoute, { children: _jsx(CoachMessagesPage, {}) }) }), _jsx(Route, { path: "/messages", element: _jsx(ProtectedRoute, { children: _jsx(RecruiterMessagesPage, {}) }) }), _jsx(Route, { path: "/create-job", element: _jsx(ProtectedRoute, { children: _jsx(CreateJobPage, {}) }) }), _jsx(Route, { path: "/my-jobs", element: _jsx(ProtectedRoute, { children: _jsx(MyJobsPage, {}) }) }), _jsx(Route, { path: "/jobs", element: _jsx(ProtectedRoute, { children: _jsx(JobsListPage, {}) }) }), _jsx(Route, { path: "/jobs/:jobId", element: _jsx(ProtectedRoute, { children: _jsx(JobApplicationsPage, {}) }) }), _jsx(Route, { path: "/jobs/:jobId/apply", element: _jsx(ProtectedRoute, { children: _jsx(ApplyJobPage, {}) }) }), _jsx(Route, { path: "/edit-job/:jobId", element: _jsx(ProtectedRoute, { children: _jsx(EditJobPage, {}) }) }), _jsx(Route, { path: "/applications", element: _jsx(ProtectedRoute, { children: _jsx(RecruiterApplicationsPage, {}) }) }), _jsx(Route, { path: "/my-applications", element: _jsx(ProtectedRoute, { children: _jsx(TalentApplicationsPage, {}) }) }), _jsx(Route, { path: "/recommendations", element: _jsx(ProtectedRoute, { children: _jsx(RecruiterRecommendationsPage, {}) }) }), _jsx(Route, { path: "/talent/recommendations", element: _jsx(ProtectedRoute, { children: _jsx(TalentRecommendationsPage, {}) }) }), _jsx(Route, { path: "/book/:coachId", element: _jsx(BookingPage, {}) }), _jsx(Route, { path: "*", element: _jsx(NotFoundPage, {}) })] }) }));
}
