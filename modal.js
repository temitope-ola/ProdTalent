import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext'; // On suppose que tu as un contexte Auth

const Modal = ({ closeModal }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, signUp } = useAuth();

  const handleLogin = () => {
    login(email, password);
    closeModal();
  };

  const handleSignUp = () => {
    signUp(email, password);
    closeModal();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-btn" onClick={closeModal}>X</span>
        <h2>Se connecter ou s'inscrire</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Se connecter</button>
        <button onClick={handleSignUp}>S'inscrire</button>
      </div>
    </div>
  );
};

export default Modal;
