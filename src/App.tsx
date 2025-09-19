// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import useAuth from './contexts/AuthContext';
import { useEffect } from 'react';
import NotificationProvider from './components/NotificationManager';

// 🚀 Services modernes : SendGrid + Google Calendar intégrés


// ⚠️ Adapte ces chemins si tes fichiers ne sont pas dans src/pages
import HomePage from './pages/HomePage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import TalentDashboard from './pages/TalentDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard.tsx';
// CoachDashboard supprimé - fonctionnalité non implémentée
import ProfilePage from './pages/ProfilePage';
import TalentsListPage from './pages/TalentsListPage.tsx';
import CoachTalentsPage from './pages/CoachTalentsPage';
import CoachRecruteursPage from './pages/CoachRecruteursPage';
import ModernMessagesPage from './pages/ModernMessagesPage';
import CreateJobPage from './pages/CreateJobPage';
import MyJobsPage from './pages/MyJobsPage';
import JobsListPage from './pages/JobsListPage.tsx';
import EditJobPage from './pages/EditJobPage';
import JobApplicationsPage from './pages/JobApplicationsPage';
import ApplyJobPage from './pages/ApplyJobPage.tsx';
import RecruiterApplicationsPage from './pages/RecruiterApplicationsPage';
import TalentApplicationsPage from './pages/TalentApplicationsPage';
import JobDetailsPage from './pages/JobDetailsPage';
import NotFoundPage from './pages/NotFoundPage';
import FeaturedTalentsManager from './components/FeaturedTalentsManager';
import CoachLogin from './components/CoachLogin';
import ForgotPassword from './components/ForgotPassword';
import CoachDashboard from './pages/CoachDashboard';
import CoachJobDetailsPage from './pages/CoachJobDetailsPage';
import CoachJobViewPage from './pages/CoachJobViewPage';
import BookingPage from './pages/BookingPage';
import TalentRecommendationsPage from './pages/TalentRecommendationsPage';
import TalentCoachesPage from './pages/TalentCoachesPage';
import TalentCoachProfilePage from './pages/TalentCoachProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import GoogleConfigPage from './pages/GoogleConfigPage';
import GoogleCalendarCallbackPage from './pages/GoogleCalendarCallbackPage';
import SendGridSetup from './pages/SendGridSetup';
import SendGridAdminPage from './pages/SendGridAdminPage';
import SendGridTemplateTestPage from './pages/SendGridTemplateTestPage';
import Footer from './components/Footer';
import LegalPage from './pages/LegalPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import CookiesPage from './pages/CookiesPage';
import ContactPage from './pages/ContactPage';
import CreateTestCoach from './pages/CreateTestCoach';
import FixCalendarLinks from './pages/FixCalendarLinks';

// Composant de login admin simple
function AdminLogin() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Login admin simple - vous pouvez changer ces identifiants
    if (email === 'admin@prodtalent.com' && password === 'admin123') {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Identifiants incorrects');
    }
  };

  if (isLoggedIn) {
    return <AdminDashboard />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#1a1a1a',
        padding: '40px',
        borderRadius: '4px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ color: '#ffcc00', margin: '0 0 8px 0', fontSize: '28px' }}>
            ProdTalent
          </h1>
          <p style={{ color: '#f5f5f7', margin: 0, fontSize: '16px' }}>
            Administration
          </p>
        </div>

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            color: '#ff6b6b',
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#f5f5f7', display: 'block', marginBottom: '8px' }}>
              Email Admin
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#333',
                color: '#f5f5f7',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: '#f5f5f7', display: 'block', marginBottom: '8px' }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#333',
                color: '#f5f5f7',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#ffcc00',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Se connecter
          </button>
        </form>

        <div style={{ 
          marginTop: '16px', 
          textAlign: 'center',
          color: '#888',
          fontSize: '12px'
        }}>
          <p style={{ margin: '8px 0' }}>
            <strong>Identifiants de test :</strong>
          </p>
          <p style={{ margin: '4px 0' }}>Email: admin@prodtalent.com</p>
          <p style={{ margin: '4px 0' }}>Mot de passe: admin123</p>
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#f5f5f7'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '3px solid #333',
          borderTop: '3px solid #ffcc00',
          borderRadius: 4,
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }} />
        <h2 style={{ 
          color: '#ffcc00', 
          margin: '0 0 8px 0',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          ProdTalent
        </h2>
        <p style={{ 
          color: '#888', 
          margin: 0,
          fontSize: '14px'
        }}>
          Connexion en cours...
        </p>
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `
        }} />
      </div>
    );
  }
  
  if (!user) return <Navigate to="/" replace />;
  return children;
}



export default function App() {
  return (
    <HelmetProvider>
      <NotificationProvider>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ flex: 1 }}>
            <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/coach/login" element={<CoachLogin />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route
              path="/dashboard/talent"
              element={
                <ProtectedRoute>
                  <TalentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/recruteur"
              element={
                <ProtectedRoute>
                  <RecruiterDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/coach"
              element={
                <ProtectedRoute>
                  <CoachDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coach-test"
              element={
                <ProtectedRoute>
                  <CoachDashboard />
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
            <Route
              path="/profile/:userId"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/talents"
              element={
                <ProtectedRoute>
                  <TalentsListPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/coach/talents"
              element={
                <ProtectedRoute>
                  <CoachTalentsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/coach/recruteurs"
              element={
                <ProtectedRoute>
                  <CoachRecruteursPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/talent/messages"
              element={
                <ProtectedRoute>
                  <ModernMessagesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/coach/messages"
              element={
                <ProtectedRoute>
                  <ModernMessagesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <ModernMessagesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/create-job"
              element={
                <ProtectedRoute>
                  <CreateJobPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-jobs"
              element={
                <ProtectedRoute>
                  <MyJobsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/jobs"
              element={
                <ProtectedRoute>
                  <JobsListPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/jobs/:jobId"
              element={
                <ProtectedRoute>
                  <JobDetailsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/coach/jobs/:jobId"
              element={
                <ProtectedRoute>
                  <CoachJobViewPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/jobs/:jobId/apply"
              element={
                <ProtectedRoute>
                  <ApplyJobPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/edit-job/:jobId"
              element={
                <ProtectedRoute>
                  <EditJobPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/applications"
              element={
                <ProtectedRoute>
                  <RecruiterApplicationsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-applications"
              element={
                <ProtectedRoute>
                  <TalentApplicationsPage />
                </ProtectedRoute>
              }
            />

            {/* Route des recommandations talent */}
            <Route
              path="/talent/recommendations"
              element={
                <ProtectedRoute>
                  <TalentRecommendationsPage />
                </ProtectedRoute>
              }
            />

            {/* Route des coaches pour talent */}
            <Route
              path="/talent/coaches"
              element={
                <ProtectedRoute>
                  <TalentCoachesPage />
                </ProtectedRoute>
              }
            />

            {/* Route du profil détaillé d'un coach */}
            <Route
              path="/talent/coach/:coachId"
              element={
                <ProtectedRoute>
                  <TalentCoachProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Route publique pour la réservation de créneaux */}
            <Route path="/book/:coachId" element={<BookingPage />} />
            
            {/* Route de configuration Google */}
            <Route path="/google-config" element={<GoogleConfigPage />} />
            {/* Route temporaire pour créer un coach de test */}
            <Route path="/create-test-coach" element={<CreateTestCoach />} />
            {/* Route pour corriger les liens calendar manquants */}
            <Route path="/fix-calendar-links" element={<FixCalendarLinks />} />
            <Route path="/calendar-callback" element={<GoogleCalendarCallbackPage />} />
            <Route path="/sendgrid-setup" element={<SendGridSetup />} />
            <Route path="/sendgrid-admin" element={<SendGridAdminPage />} />
            <Route path="/sendgrid-template-test" element={<SendGridTemplateTestPage />} />

            {/* Pages légales */}
            <Route path="/legal" element={<LegalPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/cookies" element={<CookiesPage />} />
            <Route path="/contact" element={<ContactPage />} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </div>
          <Footer />
        </div>
      </NotificationProvider>
    </HelmetProvider>
  );
}
