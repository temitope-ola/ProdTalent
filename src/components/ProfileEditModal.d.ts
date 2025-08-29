import React from 'react';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: any) => void;
}

declare const ProfileEditModal: React.FC<ProfileEditModalProps>;
export default ProfileEditModal;