import React, { useState } from 'react';

interface AvatarProps {
  size?: 'small' | 'medium' | 'large';
  src?: string;
  alt?: string;
  email?: string;
  onClick?: () => void;
  editable?: boolean;
  onImageChange?: (file: File) => void;
}

const Avatar: React.FC<AvatarProps> = ({ 
  size = 'medium', 
  src, 
  alt = 'Avatar', 
  email,
  onClick,
  editable = false,
  onImageChange
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Générer un avatar par défaut basé sur l'email
  const generateDefaultAvatar = (email: string) => {
    // Utiliser toujours la couleur jaune pour correspondre au design
    const color = '#ffcc00';
    const initials = email.substring(0, 2).toUpperCase();
    
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="${color}" rx="8" ry="8"/>
        <text x="50" y="50" font-family="Arial, sans-serif" font-size="36" 
              fill="#404040" text-anchor="middle" dy=".3em" font-weight="bold">${initials}</text>
      </svg>
    `)}`;
  };

  const sizeMap = {
    small: '32px',
    medium: '48px',
    large: '150px'
  };

  const avatarSrc = src || (email ? generateDefaultAvatar(email) : generateDefaultAvatar('user@example.com'));

  const handleImageClick = () => {
    if (editable && fileInputRef.current) {
      fileInputRef.current.click();
    } else if (onClick) {
      onClick();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImageChange) {
      onImageChange(file);
    }
  };

  return (
    <div style={{ 
      position: 'relative', 
      display: 'inline-block',
      width: sizeMap[size],
      height: sizeMap[size]
    }}>
      <img
        src={avatarSrc}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '4px',
          objectFit: 'cover',
          cursor: editable ? 'pointer' : onClick ? 'pointer' : 'default',
          border: editable && isHovered ? '2px solid #ffcc00' : '2px solid transparent',
          transition: 'all 0.2s ease'
        }}
        onClick={handleImageClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      
      {editable && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      )}
      
      {editable && isHovered && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          pointerEvents: 'none'
        }}>
          Changer l'avatar
        </div>
      )}
    </div>
  );
};

export default Avatar;
