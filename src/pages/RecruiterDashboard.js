import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
import { useNotifications } from '../components/NotificationManager';
import Avatar from '../components/Avatar';
export default function RecruiterDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { showNotification } = useNotifications();
    const [profile, setProfile] = useState(null);
    const [talents, setTalents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filteredTalents, setFilteredTalents] = useState([]);
    const [activeFilters, setActiveFilters] = useState({
        availability: '',
        skills: '',
        experience: '',
        location: '',
        contractType: ''
    });
    // Métriques simplifiées
    const [jobStats, setJobStats] = useState({
        activeJobs: 0,
        pendingApplications: 0
    });
    const [messagesCount, setMessagesCount] = useState(0);
    // Redirection si l'utilisateur n'est pas un recruteur
    useEffect(() => {
        if (user && user.role !== 'recruteur') {
            navigate(`/dashboard/${user.role}`, { replace: true });
        }
    }, [user, navigate]);
    // Charger le profil et les talents
    useEffect(() => {
        if (user) {
            loadProfile();
            loadTalents();
            loadJobStats();
            loadMessagesCount();
        }
    }, [user]);
    // Filtrer les talents quand les filtres changent
    useEffect(() => {
        applyFilters();
    }, [talents, activeFilters]);
    // Fonction pour appliquer les filtres
    const applyFilters = () => {
        let filtered = talents;
        // Filtre par disponibilité
        if (activeFilters.availability) {
            filtered = filtered.filter(talent => talent.availability === activeFilters.availability);
        }
        // Filtre par compétences
        if (activeFilters.skills) {
            filtered = filtered.filter(talent => {
                if (!talent.skills)
                    return false;
                // Convertir les compétences du talent en array
                let talentSkills = [];
                if (Array.isArray(talent.skills)) {
                    talentSkills = talent.skills.map(skill => skill.toLowerCase());
                }
                else {
                    talentSkills = talent.skills.toLowerCase().split(/[,\s]+/).filter(skill => skill.trim());
                }
                // Définir les groupes de compétences
                const skillGroups = {
                    'Frontend': ['react', 'vue', 'angular', 'javascript', 'typescript', 'html', 'css', 'sass', 'bootstrap', 'tailwind'],
                    'Backend': ['node', 'python', 'java', 'php', 'c#', 'ruby', 'go', 'rust', 'sql', 'mongodb', 'postgresql'],
                    'Fullstack': ['fullstack', 'full-stack', 'full stack'],
                    'Mobile': ['react native', 'flutter', 'ios', 'android', 'swift', 'kotlin'],
                    'DevOps': ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'ci/cd', 'jenkins', 'gitlab'],
                    'Data': ['python', 'r', 'sql', 'pandas', 'numpy', 'machine learning', 'data science', 'analytics'],
                    'AI': ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural networks', 'tensorflow', 'pytorch', 'openai', 'chatgpt', 'gpt', 'llm', 'nlp', 'computer vision', 'robotics'],
                    'Product': ['product management', 'product owner', 'scrum', 'agile', 'kanban', 'user research', 'user experience', 'ux', 'product strategy', 'roadmap', 'backlog', 'sprint', 'stakeholder'],
                    'Entrepreneuriat': ['entrepreneur', 'startup', 'business', 'strategy', 'marketing', 'sales', 'growth', 'fundraising', 'pitch', 'business plan', 'market research', 'customer development', 'lean startup'],
                    'Design': ['figma', 'sketch', 'adobe', 'ui/ux', 'design', 'photoshop', 'illustrator', 'invision', 'prototyping']
                };
                // Si c'est un groupe, vérifier si le talent a au moins une compétence du groupe
                if (skillGroups[activeFilters.skills]) {
                    const groupSkills = skillGroups[activeFilters.skills];
                    return groupSkills.some(groupSkill => talentSkills.some(talentSkill => talentSkill.includes(groupSkill) || groupSkill.includes(talentSkill)));
                }
                // Sinon, chercher une correspondance directe
                return talentSkills.some(skill => skill.includes(activeFilters.skills.toLowerCase()) ||
                    activeFilters.skills.toLowerCase().includes(skill));
            });
        }
        // Filtre par expérience
        if (activeFilters.experience) {
            filtered = filtered.filter(talent => talent.experience === activeFilters.experience);
        }
        // Filtre par localisation
        if (activeFilters.location) {
            filtered = filtered.filter(talent => talent.location === activeFilters.location);
        }
        // Filtre par type de contrat
        if (activeFilters.contractType) {
            filtered = filtered.filter(talent => talent.contractType === activeFilters.contractType);
        }
        setFilteredTalents(filtered);
    };
    // Fonction pour générer les options de filtres intelligentes
    const generateFilterOptions = () => {
        const options = {
            availability: new Set(),
            skills: new Set(),
            experience: new Set(),
            location: new Set(),
            contractType: new Set()
        };
        // Compter les occurrences pour ne garder que les éléments pertinents
        const skillCounts = {};
        const locationCounts = {};
        talents.forEach(talent => {
            if (talent.availability)
                options.availability.add(talent.availability);
            if (talent.experience)
                options.experience.add(talent.experience);
            if (talent.contractType)
                options.contractType.add(talent.contractType);
            // Compter les compétences
            if (talent.skills) {
                let skillsArray = [];
                if (Array.isArray(talent.skills)) {
                    skillsArray = talent.skills;
                }
                else {
                    skillsArray = talent.skills.split(/[,\s]+/).filter(skill => skill.trim());
                }
                skillsArray.forEach(skill => {
                    const cleanSkill = skill.trim().toLowerCase();
                    skillCounts[cleanSkill] = (skillCounts[cleanSkill] || 0) + 1;
                });
            }
            // Compter les localisations
            if (talent.location) {
                const cleanLocation = talent.location.trim().toLowerCase();
                locationCounts[cleanLocation] = (locationCounts[cleanLocation] || 0) + 1;
            }
        });
        // Ne garder que les compétences avec au moins 2 occurrences (pertinentes)
        const relevantSkills = Object.entries(skillCounts)
            .filter(([_, count]) => count >= 2)
            .map(([skill, count]) => ({ skill, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10) // Limiter à 10 compétences max
            .map(item => item.skill);
        // Ne garder que les localisations avec au moins 2 occurrences
        const relevantLocations = Object.entries(locationCounts)
            .filter(([_, count]) => count >= 2)
            .map(([location, count]) => ({ location, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5) // Limiter à 5 localisations max
            .map(item => item.location);
        // Regrouper les compétences similaires
        const groupedSkills = groupSimilarSkills(relevantSkills);
        return {
            availability: Array.from(options.availability).sort(),
            skills: groupedSkills,
            experience: Array.from(options.experience).sort(),
            location: relevantLocations,
            contractType: Array.from(options.contractType).sort()
        };
    };
    // Fonction pour regrouper les compétences similaires
    const groupSimilarSkills = (skills) => {
        const skillGroups = {
            'Frontend': ['react', 'vue', 'angular', 'javascript', 'typescript', 'html', 'css', 'sass', 'bootstrap', 'tailwind'],
            'Backend': ['node', 'python', 'java', 'php', 'c#', 'ruby', 'go', 'rust', 'sql', 'mongodb', 'postgresql'],
            'Fullstack': ['fullstack', 'full-stack', 'full stack'],
            'Mobile': ['react native', 'flutter', 'ios', 'android', 'swift', 'kotlin'],
            'DevOps': ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'ci/cd', 'jenkins', 'gitlab'],
            'Data': ['python', 'r', 'sql', 'pandas', 'numpy', 'machine learning', 'data science', 'analytics'],
            'AI': ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural networks', 'tensorflow', 'pytorch', 'openai', 'chatgpt', 'gpt', 'llm', 'nlp', 'computer vision', 'robotics'],
            'Product': ['product management', 'product owner', 'scrum', 'agile', 'kanban', 'user research', 'user experience', 'ux', 'product strategy', 'roadmap', 'backlog', 'sprint', 'stakeholder'],
            'Entrepreneuriat': ['entrepreneur', 'startup', 'business', 'strategy', 'marketing', 'sales', 'growth', 'fundraising', 'pitch', 'business plan', 'market research', 'customer development', 'lean startup'],
            'Design': ['figma', 'sketch', 'adobe', 'ui/ux', 'design', 'photoshop', 'illustrator', 'invision', 'prototyping']
        };
        const grouped = [];
        const usedSkills = new Set();
        // D'abord, essayer de regrouper
        Object.entries(skillGroups).forEach(([groupName, groupSkills]) => {
            const matchingSkills = skills.filter(skill => groupSkills.some(groupSkill => skill.includes(groupSkill) || groupSkill.includes(skill)));
            if (matchingSkills.length >= 2) {
                grouped.push(groupName);
                matchingSkills.forEach(skill => usedSkills.add(skill));
            }
        });
        // Ajouter les compétences non groupées qui sont pertinentes
        skills.forEach(skill => {
            if (!usedSkills.has(skill) && skill.length > 2) {
                grouped.push(skill);
            }
        });
        return grouped.slice(0, 8); // Limiter à 8 groupes max
    };
    // Fermer le menu profil quand on clique ailleurs
    useEffect(() => {
        const handleClickOutside = (event) => {
            const target = event.target;
            if (!target.closest('[data-profile-menu]')) {
                setShowProfileMenu(false);
            }
        };
        if (showProfileMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showProfileMenu]);
    const loadProfile = async () => {
        if (!user)
            return;
        setLoading(true);
        try {
            console.log('🔄 Chargement du profil Firebase...', { userId: user.id, role: user.role });
            const userProfile = await FirestoreService.getCurrentProfile(user.id, user.role);
            console.log('✅ Profil chargé:', userProfile);
            setProfile(userProfile);
        }
        catch (error) {
            console.error('❌ Erreur lors du chargement du profil:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const loadTalents = async () => {
        if (!user)
            return;
        try {
            console.log('🔄 Chargement des talents Firebase...');
            const talentsList = await FirestoreService.getAllTalents();
            console.log('✅ Talents chargés:', talentsList.length, 'talents trouvés');
            setTalents(talentsList);
        }
        catch (error) {
            console.error('❌ Erreur lors du chargement des talents:', error);
        }
    };
    // Fonction pour naviguer vers le profil d'un talent
    const handleTalentClick = (talentId) => {
        navigate(`/profile/${talentId}`);
    };
    const loadJobStats = async () => {
        if (!user)
            return;
        try {
            console.log('🔄 Chargement des statistiques jobs...');
            // Charger les annonces du recruteur
            const recruiterJobs = await FirestoreService.getRecruiterJobs(user.id);
            // Compter toutes les candidatures
            let totalApplications = 0;
            for (const job of recruiterJobs) {
                try {
                    const jobApplications = await FirestoreService.getJobApplications(job.id);
                    totalApplications += jobApplications.length;
                    console.log(`📊 Annonce "${job.title}": ${jobApplications.length} candidatures`);
                }
                catch (error) {
                    console.error(`Erreur lors du chargement des candidatures pour l'annonce ${job.id}:`, error);
                }
            }
            setJobStats({
                activeJobs: recruiterJobs.length,
                pendingApplications: totalApplications
            });
            console.log('✅ Stats jobs chargées (données réelles)');
        }
        catch (error) {
            console.error('❌ Erreur lors du chargement des stats:', error);
            // En cas d'erreur, utiliser des valeurs par défaut
            setJobStats({
                activeJobs: 0,
                pendingApplications: 0
            });
        }
    };
    const loadMessagesCount = async () => {
        if (!user)
            return;
        try {
            console.log('🔄 Chargement du nombre de messages...');
            // Charger les messages de l'utilisateur
            const userMessages = await FirestoreService.getUserMessages(user.id);
            setMessagesCount(userMessages.length);
            console.log('✅ Nombre de messages chargé (données réelles)');
        }
        catch (error) {
            console.error('❌ Erreur lors du chargement des messages:', error);
            // En cas d'erreur, utiliser une valeur par défaut
            setMessagesCount(0);
        }
    };
    if (loading) {
        return (_jsx("div", { style: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                color: '#f5f5f7'
            }, children: "Chargement..." }));
    }
    if (!user) {
        navigate('/', { replace: true });
        return null;
    }
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/', { replace: true });
        }
        catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    };
    const handleOpenMessages = () => {
        navigate('/messages');
    };
    const handleOpenApplications = () => {
        navigate('/applications');
    };
    const handleViewMyJobs = () => {
        navigate('/my-jobs');
    };
    // Fonction pour calculer le temps écoulé
    const getTimeAgo = (date) => {
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        if (diffInHours < 1)
            return 'À l\'instant';
        if (diffInHours < 24)
            return `Il y a ${diffInHours}h`;
        if (diffInHours < 48)
            return 'Hier';
        return `Il y a ${Math.floor(diffInHours / 24)}j`;
    };
    // Fonction pour gérer les filtres
    const handleFilterChange = (filterType, value) => {
        setActiveFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };
    const clearFilter = (filterType) => {
        setActiveFilters(prev => ({
            ...prev,
            [filterType]: ''
        }));
    };
    const handleProfileClick = () => {
        setShowProfileMenu(!showProfileMenu);
    };
    const handleProfileAction = (action) => {
        setShowProfileMenu(false);
        switch (action) {
            case 'profile':
                navigate('/profile');
                break;
            case 'logout':
                handleLogout();
                break;
        }
    };
    return (_jsx("div", { style: {
            minHeight: '100vh',
            backgroundColor: '#0a0a0a',
            color: '#f5f5f7',
            display: 'flex',
            justifyContent: 'center'
        }, children: _jsxs("div", { style: {
                width: '100%',
                maxWidth: '1200px',
                padding: '20px'
            }, children: [_jsxs("div", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px',
                        padding: '12px 16px',
                        backgroundColor: '#1a1a1a',
                        borderRadius: '4px'
                    }, children: [_jsxs("div", { children: [_jsx("h1", { style: { margin: 0, fontSize: '20px', fontWeight: '600' }, children: "Dashboard Recruteur" }), _jsx("p", { style: { margin: 0, color: '#888', fontSize: '12px' }, children: "G\u00E9rez vos offres et candidatures" })] }), _jsxs("div", { style: { position: 'relative' }, "data-profile-menu": true, children: [_jsxs("div", { onClick: handleProfileClick, style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '6px 10px',
                                        backgroundColor: '#333',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s'
                                    }, onMouseEnter: (e) => e.currentTarget.style.backgroundColor = '#444', onMouseLeave: (e) => e.currentTarget.style.backgroundColor = '#333', children: [_jsx(Avatar, { src: profile?.avatarUrl, alt: user?.email ? user.email.split('@')[0] : 'Utilisateur', size: "small" }), _jsx("span", { style: { fontSize: '13px', color: '#f5f5f7' }, children: user?.email ? user.email.split('@')[0] : 'Utilisateur' }), _jsx("span", { style: {
                                                fontSize: '10px',
                                                color: '#888',
                                                transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                                                transition: 'transform 0.2s'
                                            }, children: "\u25BC" })] }), showProfileMenu && (_jsxs("div", { style: {
                                        position: 'absolute',
                                        top: '100%',
                                        right: 0,
                                        marginTop: '5px',
                                        backgroundColor: '#1a1a1a',
                                        borderRadius: '4px',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                        border: '1px solid #333',
                                        minWidth: '180px',
                                        zIndex: 1000
                                    }, children: [_jsxs("div", { onClick: () => handleProfileAction('profile'), style: {
                                                padding: '10px 14px',
                                                cursor: 'pointer',
                                                borderBottom: '1px solid #333',
                                                transition: 'background-color 0.2s'
                                            }, onMouseEnter: (e) => e.currentTarget.style.backgroundColor = '#333', onMouseLeave: (e) => e.currentTarget.style.backgroundColor = '#1a1a1a', children: [_jsx("div", { style: { fontSize: '13px', color: '#f5f5f7' }, children: "\uD83D\uDC64 Mon profil" }), _jsx("div", { style: { fontSize: '11px', color: '#888', marginTop: '2px' }, children: user?.email })] }), _jsx("div", { onClick: () => handleProfileAction('logout'), style: {
                                                padding: '10px 14px',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.2s'
                                            }, onMouseEnter: (e) => e.currentTarget.style.backgroundColor = '#333', onMouseLeave: (e) => e.currentTarget.style.backgroundColor = '#1a1a1a', children: _jsx("div", { style: { fontSize: '13px', color: '#f5f5f7' }, children: "\uD83D\uDEAA Se d\u00E9connecter" }) })] }))] })] }), _jsxs("div", { style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '20px',
                        marginBottom: '30px'
                    }, children: [_jsxs("div", { style: {
                                padding: '20px',
                                backgroundColor: '#1a1a1a',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                border: 'none'
                            }, onClick: handleOpenApplications, children: [_jsxs("h3", { style: { margin: '0 0 10px 0', color: '#ffcc00' }, children: ["Candidatures (", jobStats.pendingApplications, ")"] }), _jsx("p", { style: { margin: 0, color: '#888', fontSize: '14px' }, children: "Consultez et g\u00E9rez les candidatures re\u00E7ues" })] }), _jsxs("div", { style: {
                                padding: '20px',
                                backgroundColor: '#1a1a1a',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'transform 0.2s'
                            }, onClick: handleViewMyJobs, children: [_jsxs("h3", { style: { margin: '0 0 10px 0', color: '#ffcc00' }, children: ["Mes annonces (", jobStats.activeJobs, ")"] }), _jsx("p", { style: { margin: 0, color: '#888', fontSize: '14px' }, children: "G\u00E9rez vos offres d'emploi et candidatures" })] }), _jsxs("div", { style: {
                                padding: '20px',
                                backgroundColor: '#1a1a1a',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'transform 0.2s'
                            }, onClick: handleOpenMessages, children: [_jsxs("h3", { style: { margin: '0 0 10px 0', color: '#ffcc00' }, children: ["Messages (", messagesCount || 0, ")"] }), _jsx("p", { style: { margin: 0, color: '#888', fontSize: '14px' }, children: "Communiquez avec les talents" })] })] }), _jsxs("div", { style: {
                        backgroundColor: '#1a1a1a',
                        borderRadius: '4px',
                        padding: '20px',
                        paddingLeft: '0px' // Padding réduit pour mieux aligner
                    }, children: [_jsxs("div", { style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '10px',
                                paddingLeft: '20px'
                            }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '16px' }, children: [_jsxs("div", { onClick: () => setShowFilters(!showFilters), style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '8px 12px',
                                                paddingLeft: '16px', // Padding encore augmenté pour aligner l'icône
                                                backgroundColor: '#333',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.2s'
                                            }, onMouseEnter: (e) => e.currentTarget.style.backgroundColor = '#444', onMouseLeave: (e) => e.currentTarget.style.backgroundColor = '#333', children: [_jsxs("div", { style: {
                                                        width: '16px',
                                                        height: '16px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'space-between'
                                                    }, children: [_jsx("div", { style: { width: '100%', height: '2px', backgroundColor: '#ffcc00' } }), _jsx("div", { style: { width: '75%', height: '2px', backgroundColor: '#ffcc00' } }), _jsx("div", { style: { width: '50%', height: '2px', backgroundColor: '#ffcc00' } })] }), _jsx("span", { style: { fontSize: '14px', color: '#ffcc00' }, children: showFilters ? 'Fermer' : 'Filtrer' })] }), !showFilters && (_jsxs("h2", { style: { margin: 0, color: '#ffcc00' }, children: ["Tous les talents (", talents.length, ")"] }))] }), _jsx("span", { style: { fontSize: '14px', color: '#888' }, children: "Page 1" })] }), _jsxs("div", { style: { display: 'flex', gap: '20px' }, children: [_jsx("div", { style: {
                                        width: showFilters ? '250px' : '0px',
                                        overflow: 'hidden',
                                        transition: 'width 0.3s ease',
                                        backgroundColor: '#1a1a1a',
                                        borderRadius: '4px',
                                        padding: showFilters ? '25px' : '0px',
                                        height: 'fit-content'
                                    }, children: showFilters && (_jsx(_Fragment, { children: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '16px' }, children: [generateFilterOptions().skills.length > 0 && (_jsxs("div", { children: [_jsx("div", { style: {
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                marginBottom: '8px'
                                                            }, children: _jsxs("span", { style: { fontSize: '14px', color: '#f5f5f7', fontWeight: '500' }, children: ["Comp\u00E9tences (", generateFilterOptions().skills.length, ")"] }) }), _jsx("div", { style: {
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: '6px'
                                                            }, children: generateFilterOptions().skills.map((skill) => (_jsxs("div", { onClick: () => handleFilterChange('skills', skill), style: {
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'flex-start',
                                                                    padding: '8px 12px',
                                                                    backgroundColor: activeFilters.skills === skill ? '#ffcc00' : '#333',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                    transition: 'background-color 0.2s',
                                                                    position: 'relative'
                                                                }, onMouseEnter: (e) => {
                                                                    if (activeFilters.skills !== skill) {
                                                                        e.currentTarget.style.backgroundColor = '#444';
                                                                    }
                                                                }, onMouseLeave: (e) => {
                                                                    if (activeFilters.skills !== skill) {
                                                                        e.currentTarget.style.backgroundColor = '#333';
                                                                    }
                                                                }, children: [_jsx("span", { style: {
                                                                            fontSize: '12px',
                                                                            color: activeFilters.skills === skill ? '#1a1a1a' : '#f5f5f7',
                                                                            fontWeight: activeFilters.skills === skill ? '600' : '400'
                                                                        }, children: skill }), activeFilters.skills === skill && (_jsx("span", { onClick: (e) => {
                                                                            e.stopPropagation();
                                                                            clearFilter('skills');
                                                                        }, style: {
                                                                            position: 'absolute',
                                                                            top: '-4px',
                                                                            right: '-4px',
                                                                            fontSize: '10px',
                                                                            color: '#1a1a1a',
                                                                            backgroundColor: '#ffcc00',
                                                                            borderRadius: '50%',
                                                                            width: '16px',
                                                                            height: '16px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            cursor: 'pointer',
                                                                            fontWeight: 'bold'
                                                                        }, children: "\u2715" }))] }, skill))) })] })), generateFilterOptions().availability.length > 0 && (_jsxs("div", { children: [_jsx("div", { style: {
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                marginBottom: '8px'
                                                            }, children: _jsxs("span", { style: { fontSize: '14px', color: '#f5f5f7', fontWeight: '500' }, children: ["Disponibilit\u00E9 (", generateFilterOptions().availability.length, ")"] }) }), _jsx("div", { style: {
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: '6px'
                                                            }, children: generateFilterOptions().availability.map((availability) => (_jsxs("div", { onClick: () => handleFilterChange('availability', availability), style: {
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'flex-start',
                                                                    padding: '8px 12px',
                                                                    backgroundColor: activeFilters.availability === availability ? '#ffcc00' : '#333',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                    transition: 'background-color 0.2s',
                                                                    position: 'relative'
                                                                }, onMouseEnter: (e) => {
                                                                    if (activeFilters.availability !== availability) {
                                                                        e.currentTarget.style.backgroundColor = '#444';
                                                                    }
                                                                }, onMouseLeave: (e) => {
                                                                    if (activeFilters.availability !== availability) {
                                                                        e.currentTarget.style.backgroundColor = '#333';
                                                                    }
                                                                }, children: [_jsx("span", { style: {
                                                                            fontSize: '12px',
                                                                            color: activeFilters.availability === availability ? '#1a1a1a' : '#f5f5f7',
                                                                            fontWeight: activeFilters.availability === availability ? '600' : '400'
                                                                        }, children: availability }), activeFilters.availability === availability && (_jsx("span", { onClick: (e) => {
                                                                            e.stopPropagation();
                                                                            clearFilter('availability');
                                                                        }, style: {
                                                                            position: 'absolute',
                                                                            top: '-4px',
                                                                            right: '-4px',
                                                                            fontSize: '10px',
                                                                            color: '#1a1a1a',
                                                                            backgroundColor: '#ffcc00',
                                                                            borderRadius: '50%',
                                                                            width: '16px',
                                                                            height: '16px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            cursor: 'pointer',
                                                                            fontWeight: 'bold'
                                                                        }, children: "\u2715" }))] }, availability))) })] })), generateFilterOptions().experience.length > 0 && (_jsxs("div", { children: [_jsx("div", { style: {
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                marginBottom: '8px'
                                                            }, children: _jsxs("span", { style: { fontSize: '14px', color: '#f5f5f7', fontWeight: '500' }, children: ["Exp\u00E9rience (", generateFilterOptions().experience.length, ")"] }) }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '6px' }, children: generateFilterOptions().experience.map((experience) => (_jsxs("div", { onClick: () => handleFilterChange('experience', experience), style: {
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    padding: '6px 8px',
                                                                    backgroundColor: activeFilters.experience === experience ? '#ffcc00' : '#333',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                    transition: 'background-color 0.2s'
                                                                }, onMouseEnter: (e) => {
                                                                    if (activeFilters.experience !== experience) {
                                                                        e.currentTarget.style.backgroundColor = '#444';
                                                                    }
                                                                }, onMouseLeave: (e) => {
                                                                    if (activeFilters.experience !== experience) {
                                                                        e.currentTarget.style.backgroundColor = '#333';
                                                                    }
                                                                }, children: [_jsx("span", { style: {
                                                                            fontSize: '12px',
                                                                            color: activeFilters.experience === experience ? '#1a1a1a' : '#f5f5f7'
                                                                        }, children: experience }), activeFilters.experience === experience && (_jsx("span", { onClick: (e) => {
                                                                            e.stopPropagation();
                                                                            clearFilter('experience');
                                                                        }, style: {
                                                                            fontSize: '10px',
                                                                            color: '#1a1a1a',
                                                                            cursor: 'pointer',
                                                                            marginLeft: 'auto'
                                                                        }, children: "\u2715" }))] }, experience))) })] })), generateFilterOptions().location.length > 0 && (_jsxs("div", { children: [_jsx("div", { style: {
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                marginBottom: '8px'
                                                            }, children: _jsxs("span", { style: { fontSize: '14px', color: '#f5f5f7', fontWeight: '500' }, children: ["Localisation (", generateFilterOptions().location.length, ")"] }) }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '6px' }, children: generateFilterOptions().location.map((location) => (_jsxs("div", { onClick: () => handleFilterChange('location', location), style: {
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    padding: '6px 8px',
                                                                    backgroundColor: activeFilters.location === location ? '#ffcc00' : '#333',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                    transition: 'background-color 0.2s'
                                                                }, onMouseEnter: (e) => {
                                                                    if (activeFilters.location !== location) {
                                                                        e.currentTarget.style.backgroundColor = '#444';
                                                                    }
                                                                }, onMouseLeave: (e) => {
                                                                    if (activeFilters.location !== location) {
                                                                        e.currentTarget.style.backgroundColor = '#333';
                                                                    }
                                                                }, children: [_jsx("span", { style: {
                                                                            fontSize: '12px',
                                                                            color: activeFilters.location === location ? '#1a1a1a' : '#f5f5f7'
                                                                        }, children: location }), activeFilters.location === location && (_jsx("span", { onClick: (e) => {
                                                                            e.stopPropagation();
                                                                            clearFilter('location');
                                                                        }, style: {
                                                                            fontSize: '10px',
                                                                            color: '#1a1a1a',
                                                                            cursor: 'pointer',
                                                                            marginLeft: 'auto'
                                                                        }, children: "\u2715" }))] }, location))) })] })), generateFilterOptions().contractType.length > 0 && (_jsxs("div", { children: [_jsx("div", { style: {
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                marginBottom: '8px'
                                                            }, children: _jsxs("span", { style: { fontSize: '14px', color: '#f5f5f7', fontWeight: '500' }, children: ["Type de contrat (", generateFilterOptions().contractType.length, ")"] }) }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '6px' }, children: generateFilterOptions().contractType.map((contractType) => (_jsxs("div", { onClick: () => handleFilterChange('contractType', contractType), style: {
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    padding: '6px 8px',
                                                                    backgroundColor: activeFilters.contractType === contractType ? '#ffcc00' : '#333',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                    transition: 'background-color 0.2s'
                                                                }, onMouseEnter: (e) => {
                                                                    if (activeFilters.contractType !== contractType) {
                                                                        e.currentTarget.style.backgroundColor = '#444';
                                                                    }
                                                                }, onMouseLeave: (e) => {
                                                                    if (activeFilters.contractType !== contractType) {
                                                                        e.currentTarget.style.backgroundColor = '#333';
                                                                    }
                                                                }, children: [_jsx("span", { style: {
                                                                            fontSize: '12px',
                                                                            color: activeFilters.contractType === contractType ? '#1a1a1a' : '#f5f5f7'
                                                                        }, children: contractType }), activeFilters.contractType === contractType && (_jsx("span", { onClick: (e) => {
                                                                            e.stopPropagation();
                                                                            clearFilter('contractType');
                                                                        }, style: {
                                                                            fontSize: '10px',
                                                                            color: '#1a1a1a',
                                                                            cursor: 'pointer',
                                                                            marginLeft: 'auto'
                                                                        }, children: "\u2715" }))] }, contractType))) })] })), generateFilterOptions().skills.length === 0 &&
                                                    generateFilterOptions().availability.length === 0 &&
                                                    generateFilterOptions().experience.length === 0 &&
                                                    generateFilterOptions().location.length === 0 &&
                                                    generateFilterOptions().contractType.length === 0 && (_jsx("div", { style: {
                                                        textAlign: 'center',
                                                        color: '#888',
                                                        fontSize: '12px',
                                                        padding: '20px'
                                                    }, children: "Aucun filtre disponible pour le moment" }))] }) })) }), _jsxs("div", { style: { flex: 1 }, children: [showFilters && (_jsx("div", { style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'flex-start',
                                                marginBottom: '20px',
                                                marginTop: '-40px' // Aligner vraiment le titre avec le bouton "Fermer"
                                            }, children: _jsxs("h2", { style: { margin: 0, color: '#ffcc00' }, children: ["Tous les talents (", talents.length, ")"] }) })), _jsx("div", { style: {
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                                gap: '16px',
                                                marginTop: showFilters ? '30px' : '0px' // Aligner les cartes avec le menu du filtre
                                            }, children: filteredTalents.map((talent) => (_jsxs("div", { style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    padding: '10px',
                                                    paddingLeft: '16px', // Padding augmenté pour aligner avec l'icône du bouton
                                                    backgroundColor: '#333',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    transition: 'background-color 0.2s',
                                                    height: '65px'
                                                }, onClick: () => handleTalentClick(talent.id), onMouseEnter: (e) => e.currentTarget.style.backgroundColor = '#444', onMouseLeave: (e) => e.currentTarget.style.backgroundColor = '#333', children: [_jsx("div", { style: { marginRight: '12px', flexShrink: 0 }, children: _jsx(Avatar, { src: talent.avatarUrl, alt: talent.displayName || 'Talent', size: "small" }) }), _jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsx("h4", { style: {
                                                                    margin: '0 0 4px 0',
                                                                    fontSize: '14px',
                                                                    color: '#f5f5f7',
                                                                    fontWeight: 'bold',
                                                                    whiteSpace: 'nowrap',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis'
                                                                }, children: talent.displayName || 'Talent' }), _jsx("div", { style: { fontSize: '11px', color: '#888', lineHeight: '1.3' }, children: _jsxs("div", { children: [getTimeAgo(talent.createdAt), " \u2022 0 candidatures"] }) })] }), _jsx("div", { style: {
                                                            marginLeft: '12px',
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }, children: _jsx("span", { style: {
                                                                padding: '2px 8px',
                                                                backgroundColor: '#ffcc00',
                                                                color: '#1a1a1a',
                                                                borderRadius: '4px',
                                                                fontSize: '10px',
                                                                fontWeight: 'bold',
                                                                whiteSpace: 'nowrap'
                                                            }, children: "Disponible" }) })] }, talent.id))) })] })] })] })] }) }));
}
