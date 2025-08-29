// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './contexts/AuthContext';
import { useEffect } from 'react';
import NotificationProvider from './components/NotificationManager';


// ⚠️ Adapte ces chemins si tes fichiers ne sont pas dans src/pages
import HomePage from './pages/HomePage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
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
import FeaturedTalentsManager from './components/FeaturedTalentsManager';
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
        borderRadius: '16px',
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
            borderRadius: '8px',
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
                borderRadius: '8px',
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
                borderRadius: '8px',
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
              borderRadius: '8px',
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
  if (loading) return null;                 // tu peux mettre un spinner ici
  if (!user) return <Navigate to="/" replace />;
  return children;
}



export default function App() {
  return (
    <NotificationProvider>
      <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/coach/login" element={<CoachLogin />} />

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
            <TalentMessagesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/coach/messages"
        element={
          <ProtectedRoute>
            <CoachMessagesPage />
          </ProtectedRoute>
        }
      />



      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <RecruiterMessagesPage />
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
            <JobApplicationsPage />
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

      <Route
        path="/recommendations"
        element={
          <ProtectedRoute>
            <RecruiterRecommendationsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/talent/recommendations"
        element={
          <ProtectedRoute>
            <TalentRecommendationsPage />
          </ProtectedRoute>
        }
      />

      {/* Route publique pour la réservation de créneaux */}
      <Route path="/book/:coachId" element={<BookingPage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </NotificationProvider>
  );
}
