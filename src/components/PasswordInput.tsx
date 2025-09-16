import React, { useState } from 'react';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export default function PasswordInput({
  value,
  onChange,
  placeholder = "Mot de passe",
  required = false,
  style = {},
  disabled = false
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const defaultStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 45px 12px 12px',
    fontSize: '14px',
    border: '1px solid #333',
    borderRadius: '4px',
    backgroundColor: '#111',
    color: '#f5f5f7',
    outline: 'none',
    ...style
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%'
  };

  const eyeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    transition: 'color 0.2s ease'
  };

  return (
    <div style={containerStyle}>
      <input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        style={defaultStyle}
      />
      <button
        type="button"
        onClick={togglePasswordVisibility}
        style={eyeButtonStyle}
        onMouseEnter={(e) => e.currentTarget.style.color = '#f5f5f7'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#888'}
        aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
      >
        {showPassword ? '🙈' : '👁️'}
      </button>
    </div>
  );
}