import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MessageCenter from '../components/MessageCenter';

interface UnifiedMessagesPageProps {
  userRole: 'talent' | 'coach' | 'recruteur';
  dashboardPath: string;
}

const UnifiedMessagesPage: React.FC<UnifiedMessagesPageProps> = ({ userRole, dashboardPath }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBack = () => {
    navigate(dashboardPath);
  };

  // Redirection si pas connecté
  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <MessageCenter 
      userRole={userRole}
      onBack={handleBack}
    />
  );
};

// Pages spécifiques pour chaque rôle
export const RecruiterUnifiedMessagesPage: React.FC = () => (
  <UnifiedMessagesPage userRole="recruteur" dashboardPath="/dashboard/recruteur" />
);

export const TalentUnifiedMessagesPage: React.FC = () => (
  <UnifiedMessagesPage userRole="talent" dashboardPath="/dashboard/talent" />
);

export const CoachUnifiedMessagesPage: React.FC = () => (
  <UnifiedMessagesPage userRole="coach" dashboardPath="/dashboard/coach" />
);

export default UnifiedMessagesPage;