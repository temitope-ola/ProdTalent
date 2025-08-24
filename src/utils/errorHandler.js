export class AppError extends Error {
    constructor(message, code = 'UNKNOWN_ERROR', statusCode = 500) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = 'AppError';
    }
}
export const createApiResponse = (success, data, error) => ({
    success,
    data,
    error
});
export const handleServiceError = (error, operation) => {
    console.error(`Error in ${operation}:`, error);
    let errorMessage = `Erreur lors de ${operation}`;
    if (error instanceof AppError) {
        errorMessage = error.message;
    }
    else if (error?.code) {
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
    return createApiResponse(false, undefined, errorMessage);
};
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
export const validatePassword = (password) => {
    if (password.length < 6) {
        return { valid: false, message: 'Le mot de passe doit contenir au moins 6 caractères' };
    }
    return { valid: true };
};
export const validateFileSize = (file, maxSize) => {
    if (file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024);
        return {
            valid: false,
            message: `Le fichier est trop volumineux. Taille maximale: ${maxSizeMB}MB`
        };
    }
    return { valid: true };
};
