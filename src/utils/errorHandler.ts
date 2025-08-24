import { ApiResponse } from '../types';

export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'UNKNOWN_ERROR',
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const createApiResponse = <T>(
  success: boolean,
  data?: T,
  error?: string
): ApiResponse<T> => ({
  success,
  data,
  error
});

export const handleServiceError = <T>(error: any, operation: string): ApiResponse<T> => {
  console.error(`Error in ${operation}:`, error);
  
  let errorMessage = `Erreur lors de ${operation}`;
  
  if (error instanceof AppError) {
    errorMessage = error.message;
  } else if (error?.code) {
    switch (error.code) {
      case 'permission-denied':
        errorMessage = 'Permissions insuffisantes';
        break;
      case 'not-found':
        errorMessage = 'Ressource non trouvée';
        break;
      case 'unavailable':
        errorMessage = 'Service temporairement indisponible';
        break;
      default:
        errorMessage = error.message || errorMessage;
    }
  }
  
  return createApiResponse(false, undefined as any, errorMessage);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 6) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins 6 caractères' };
  }
  return { valid: true };
};

export const validateFileSize = (file: File, maxSize: number): { valid: boolean; message?: string } => {
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return { 
      valid: false, 
      message: `Le fichier est trop volumineux. Taille maximale: ${maxSizeMB}MB` 
    };
  }
  return { valid: true };
};