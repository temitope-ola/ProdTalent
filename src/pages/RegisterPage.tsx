import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../contexts/AuthContext';
import PasswordInput from '../components/PasswordInput';

type Role = 'talent' | 'recruteur' | 'coach';

export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = React.useState<Role>('talent');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSuccess(null);
    
    // Validation
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setBusy(false);
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setBusy(false);
      return;
    }
    
    try {
      await signUp(email, password, role);
      setSuccess('Compte créé avec succès ! Vérifiez votre email pour confirmer votre compte.');
      setTimeout(() => {
        navigate(`/dashboard/${role}`, { replace: true });
      }, 2000);
    } catch (err: any) {
      console.error('Erreur auth:', err);
      if (err.message.includes('User already registered')) {
        setError('Un compte existe déjà avec cet email');
      } else {
        setError(err.message || 'Une erreur est survenue');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#f5f5f7',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: '#1a1a1a',
        padding: '40px',
        borderRadius: '16px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ 
            color: '#ffcc00',
            fontSize: '2rem',
            fontWeight: '700',
            marginBottom: '8px'
          }}>
            ProdTalent
          </h1>
          <p style={{ 
            color: '#61bfac',
            fontSize: '0.9rem',
            margin: 0
          }}>
            Un produit d'Edacy
          </p>
        </div>

        <h2 style={{ 
          color: '#f5f5f7',
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          Créer votre compte
        </h2>

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

        {success && (
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(97, 191, 172, 0.1)',
            color: '#61bfac',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#f5f5f7', display: 'block', marginBottom: '8px' }}>
              Rôle *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
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
            >
              <option value="talent">Talent</option>
              <option value="recruteur">Recruteur</option>
              <option value="coach">Coach</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#f5f5f7', display: 'block', marginBottom: '8px' }}>
              Email *
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

          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#f5f5f7', display: 'block', marginBottom: '8px' }}>
              Mot de passe *
            </label>
            <PasswordInput
              value={password}
              onChange={setPassword}
              required
              style={{
                backgroundColor: '#333',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: '#f5f5f7', display: 'block', marginBottom: '8px' }}>
              Confirmer le mot de passe *
            </label>
            <PasswordInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Confirmer le mot de passe"
              required
              style={{
                backgroundColor: '#333',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: busy ? '#666' : '#ffcc00',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: busy ? 'not-allowed' : 'pointer',
              marginBottom: '16px'
            }}
          >
            {busy ? 'Création du compte...' : 'Créer mon compte'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffcc00',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}
