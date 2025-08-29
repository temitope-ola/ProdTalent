import { useState, useEffect } from 'react';
import { JobService } from '../services/jobService';
export const useJobs = (recruiterId) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const loadJobs = async () => {
        setLoading(true);
        setError(null);
        try {
            let result;
            if (recruiterId) {
                result = await JobService.getRecruiterJobs(recruiterId);
            }
            else {
                result = await JobService.getAllActiveJobs();
            }
            if (result.success && result.data) {
                setJobs(result.data);
            }
            else {
                setError(result.error || 'Erreur lors du chargement des annonces');
            }
        }
        catch (err) {
            setError('Erreur lors du chargement des annonces');
            console.error('Error loading jobs:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const createJob = async (jobData) => {
        setLoading(true);
        setError(null);
        try {
            const result = await JobService.createJob(jobData);
            if (result.success) {
                await loadJobs(); // Reload jobs after creation
                return result.data;
            }
            else {
                setError(result.error || 'Erreur lors de la création');
                return null;
            }
        }
        catch (err) {
            setError('Erreur lors de la création de l\'annonce');
            console.error('Error creating job:', err);
            return null;
        }
        finally {
            setLoading(false);
        }
    };
    const updateJob = async (jobId, updates) => {
        setLoading(true);
        setError(null);
        try {
            const result = await JobService.updateJob(jobId, updates);
            if (result.success) {
                setJobs(prev => prev.map(job => job.id === jobId ? { ...job, ...updates } : job));
                return true;
            }
            else {
                setError(result.error || 'Erreur lors de la mise à jour');
                return false;
            }
        }
        catch (err) {
            setError('Erreur lors de la mise à jour');
            console.error('Error updating job:', err);
            return false;
        }
        finally {
            setLoading(false);
        }
    };
    const deleteJob = async (jobId) => {
        setLoading(true);
        setError(null);
        try {
            const result = await JobService.deleteJob(jobId);
            if (result.success) {
                setJobs(prev => prev.filter(job => job.id !== jobId));
                return true;
            }
            else {
                setError(result.error || 'Erreur lors de la suppression');
                return false;
            }
        }
        catch (err) {
            setError('Erreur lors de la suppression');
            console.error('Error deleting job:', err);
            return false;
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadJobs();
    }, [recruiterId]);
    return {
        jobs,
        loading,
        error,
        loadJobs,
        createJob,
        updateJob,
        deleteJob,
        setJobs
    };
};
export const useJobApplications = (jobId, talentId) => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const loadApplications = async () => {
        if (!jobId && !talentId)
            return;
        setLoading(true);
        setError(null);
        try {
            let result;
            if (jobId) {
                result = await JobService.getJobApplications(jobId);
            }
            else if (talentId) {
                result = await JobService.getUserApplications(talentId);
            }
            else {
                return;
            }
            if (result.success && result.data) {
                setApplications(result.data);
            }
            else {
                setError(result.error || 'Erreur lors du chargement des candidatures');
            }
        }
        catch (err) {
            setError('Erreur lors du chargement des candidatures');
            console.error('Error loading applications:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const updateApplicationStatus = async (applicationId, status) => {
        setLoading(true);
        setError(null);
        try {
            const result = await JobService.updateApplicationStatus(applicationId, status);
            if (result.success) {
                setApplications(prev => prev.map(app => app.id === applicationId ? { ...app, status: status, reviewedAt: new Date() } : app));
                return true;
            }
            else {
                setError(result.error || 'Erreur lors de la mise à jour');
                return false;
            }
        }
        catch (err) {
            setError('Erreur lors de la mise à jour du statut');
            console.error('Error updating application status:', err);
            return false;
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadApplications();
    }, [jobId, talentId]);
    return {
        applications,
        loading,
        error,
        loadApplications,
        updateApplicationStatus,
        setApplications
    };
};
