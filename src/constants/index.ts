// Les hooks sont maintenant dans le dossier hooks, pas dans constants
// export { useProfile } from './useProfile';
// export { useJobs, useJobApplications } from './useJobs';
// export { useMessages } from './useMessages';
// export { useAppointments } from './useAppointments';

export const USER_ROLES = {
  TALENT: 'talent',
  RECRUITER: 'recruteur', 
  COACH: 'coach'
} as const;

export const JOB_TYPES = {
  FULLTIME: 'fulltime',
  PARTTIME: 'parttime',
  CONTRACT: 'contract', 
  INTERNSHIP: 'internship'
} as const;

export const JOB_STATUS = {
  ACTIVE: 'active',
  CLOSED: 'closed',
  DRAFT: 'draft'
} as const;

export const APPLICATION_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected'
} as const;

export const APPOINTMENT_STATUS = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
} as const;

export const COLLECTION_NAMES = {
  TALENT: 'Talent',
  RECRUITER: 'Recruteur',
  COACH: 'Coach',
  JOBS: 'Jobs',
  APPLICATIONS: 'Applications',
  MESSAGES: 'Messages',
  BOOKINGS: 'Bookings',
  COACH_AVAILABILITIES: 'CoachAvailabilities'
} as const;

export const ROUTES = {
  HOME: '/',
  REGISTER: '/register',
  TALENT_DASHBOARD: '/dashboard/talent',
  RECRUITER_DASHBOARD: '/dashboard/recruteur',
  COACH_DASHBOARD: '/dashboard/coach',
  PROFILE: '/profile',
  TALENTS: '/talents',
  JOBS: '/jobs',
  CREATE_JOB: '/create-job',
  MY_JOBS: '/my-jobs',
  APPLICATIONS: '/applications'
} as const;

export const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', 
  '14:00', '15:00', '16:00', '17:00'
] as const;

export const MAX_FILE_SIZE = {
  AVATAR: 2 * 1024 * 1024, // 2MB
  CV: 500 * 1024 // 500KB
} as const;