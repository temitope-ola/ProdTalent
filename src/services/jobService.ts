import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  addDoc,
  increment,
  arrayUnion,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { Job, Application, ApiResponse } from '../types';
import { COLLECTION_NAMES, JOB_STATUS, APPLICATION_STATUS } from '../constants';
import { handleServiceError, createApiResponse } from '../utils/errorHandler';

export class JobService {
  static async createJob(jobData: Omit<Job, 'id' | 'createdAt' | 'views' | 'applications'>): Promise<ApiResponse<string>> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAMES.JOBS), {
        ...jobData,
        views: 0,
        applications: [],
        createdAt: Timestamp.now()
      });
      return createApiResponse(true, docRef.id);
    } catch (error) {
      return handleServiceError(error, 'création de l\'annonce');
    }
  }

  static async getRecruiterJobs(recruiterId: string): Promise<ApiResponse<Job[]>> {
    try {
      const q = query(
        collection(db, COLLECTION_NAMES.JOBS),
        where('recruiterId', '==', recruiterId)
      );
      const querySnapshot = await getDocs(q);
      const jobs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Job[];
      
      const sortedJobs = jobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return createApiResponse(true, sortedJobs);
    } catch (error) {
      return handleServiceError(error, 'chargement des annonces du recruteur');
    }
  }

  static async getAllActiveJobs(): Promise<ApiResponse<Job[]>> {
    try {
      const q = query(
        collection(db, COLLECTION_NAMES.JOBS),
        where('status', '==', JOB_STATUS.ACTIVE)
      );
      const querySnapshot = await getDocs(q);
      const jobs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Job[];
      
      const sortedJobs = jobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return createApiResponse(true, sortedJobs);
    } catch (error) {
      return handleServiceError(error, 'chargement des annonces actives');
    }
  }

  static async getJobById(jobId: string): Promise<ApiResponse<Job>> {
    try {
      const docRef = doc(db, COLLECTION_NAMES.JOBS, jobId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const job: Job = {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date()
        } as Job;
        
        return createApiResponse(true, job);
      } else {
        return createApiResponse(false, null as any, 'Annonce non trouvée');
      }
    } catch (error) {
      return handleServiceError(error, 'chargement de l\'annonce');
    }
  }

  static async updateJob(jobId: string, jobData: Partial<Job>): Promise<ApiResponse<boolean>> {
    try {
      const docRef = doc(db, COLLECTION_NAMES.JOBS, jobId);
      await updateDoc(docRef, {
        ...jobData,
        updatedAt: Timestamp.now()
      });
      return createApiResponse(true, true);
    } catch (error) {
      return handleServiceError(error, 'mise à jour de l\'annonce');
    }
  }

  static async updateJobStatus(jobId: string, status: string): Promise<ApiResponse<boolean>> {
    try {
      const docRef = doc(db, COLLECTION_NAMES.JOBS, jobId);
      await updateDoc(docRef, { status });
      return createApiResponse(true, true);
    } catch (error) {
      return handleServiceError(error, 'mise à jour du statut');
    }
  }

  static async deleteJob(jobId: string): Promise<ApiResponse<boolean>> {
    try {
      const docRef = doc(db, COLLECTION_NAMES.JOBS, jobId);
      await deleteDoc(docRef);
      return createApiResponse(true, true);
    } catch (error) {
      return handleServiceError(error, 'suppression de l\'annonce');
    }
  }

  static async incrementJobViews(jobId: string): Promise<ApiResponse<boolean>> {
    try {
      const docRef = doc(db, COLLECTION_NAMES.JOBS, jobId);
      await updateDoc(docRef, {
        views: increment(1)
      });
      return createApiResponse(true, true);
    } catch (error) {
      return handleServiceError(error, 'incrémentation des vues');
    }
  }

  static async applyToJob(
    jobId: string, 
    talentId: string, 
    applicationData: Omit<Application, 'id' | 'jobId' | 'talentId' | 'status' | 'createdAt'>
  ): Promise<ApiResponse<string>> {
    try {
      const applicationRef = await addDoc(collection(db, COLLECTION_NAMES.APPLICATIONS), {
        jobId,
        talentId,
        ...applicationData,
        status: APPLICATION_STATUS.PENDING,
        createdAt: Timestamp.now()
      });

      const jobRef = doc(db, COLLECTION_NAMES.JOBS, jobId);
      await updateDoc(jobRef, {
        applications: arrayUnion(applicationRef.id)
      });

      return createApiResponse(true, applicationRef.id);
    } catch (error) {
      return handleServiceError(error, 'candidature');
    }
  }

  static async getJobApplications(jobId: string): Promise<ApiResponse<Application[]>> {
    try {
      const q = query(
        collection(db, COLLECTION_NAMES.APPLICATIONS),
        where('jobId', '==', jobId)
      );
      const querySnapshot = await getDocs(q);
      const applications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Application[];
      
      return createApiResponse(true, applications);
    } catch (error) {
      return handleServiceError(error, 'chargement des candidatures');
    }
  }

  static async getUserApplications(userId: string): Promise<ApiResponse<Application[]>> {
    try {
      const q = query(
        collection(db, COLLECTION_NAMES.APPLICATIONS),
        where('talentId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const applications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Application[];
      
      return createApiResponse(true, applications);
    } catch (error) {
      return handleServiceError(error, 'chargement des candidatures utilisateur');
    }
  }

  static async updateApplicationStatus(applicationId: string, status: string): Promise<ApiResponse<boolean>> {
    try {
      const docRef = doc(db, COLLECTION_NAMES.APPLICATIONS, applicationId);
      await updateDoc(docRef, { 
        status,
        reviewedAt: new Date()
      });
      return createApiResponse(true, true);
    } catch (error) {
      return handleServiceError(error, 'mise à jour du statut de candidature');
    }
  }
}