import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { FeaturedTalentsService } from '../services/featuredTalentsService';
const DynamicTalentCards = ({ isMobile }) => {
    const [featuredTalents, setFeaturedTalents] = useState([]);
    const [loadingTalents, setLoadingTalents] = useState(true);
    useEffect(() => {
        const loadFeaturedTalents = async () => {
            try {
                const talents = await FeaturedTalentsService.getFeaturedTalents();
                setFeaturedTalents(talents);
            }
            catch (error) {
                console.error('Erreur lors du chargement des talents:', error);
            }
            finally {
                setLoadingTalents(false);
            }
        };
        loadFeaturedTalents();
    }, []);
    if (loadingTalents) {
        return (_jsx("div", { style: { textAlign: 'center', padding: '40px' }, children: _jsx("p", { style: { color: '#666', fontSize: '1.1rem' }, children: "Chargement des talents..." }) }));
    }
    if (featuredTalents.length === 0) {
        return (_jsx("div", { style: { textAlign: 'center', padding: '40px' }, children: _jsx("p", { style: { color: '#666', fontSize: '1.1rem', fontStyle: 'italic' }, children: "Aucun talent mis en avant pour le moment." }) }));
    }
    return (_jsx("div", { style: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(600px, 1fr))',
            gap: '30px'
        }, children: featuredTalents.map((talent, index) => (_jsxs("div", { style: {
                background: '#ffffff',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                height: '200px'
            }, onMouseEnter: (e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
            }, onMouseLeave: (e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
            }, children: [_jsx("div", { style: {
                        width: '200px',
                        position: 'relative',
                        flexShrink: 0,
                        overflow: 'hidden'
                    }, children: _jsx("img", { src: talent.photoUrl || '/images/default-avatar.png', alt: talent.name, style: {
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }, onError: (e) => {
                            e.currentTarget.style.display = 'none';
                            const nextElement = e.currentTarget.nextElementSibling;
                            if (nextElement) {
                                nextElement.style.display = 'flex';
                            }
                        } }) }), _jsxs("div", { style: {
                        background: '#2c2c2c',
                        padding: '24px',
                        position: 'relative',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                    }, children: [_jsxs("p", { style: {
                                color: '#ffffff',
                                fontSize: '1.1rem',
                                lineHeight: '1.6',
                                marginBottom: '16px',
                                fontStyle: 'italic'
                            }, children: ["\"", talent.quote, "\""] }), _jsxs("p", { style: {
                                color: '#cccccc',
                                fontSize: '0.9rem',
                                marginBottom: '0'
                            }, children: [talent.name, ", ", talent.role] }), _jsx("div", { style: {
                                position: 'absolute',
                                bottom: '16px',
                                right: '16px',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }, onMouseEnter: (e) => {
                                e.currentTarget.style.transform = 'scale(1.1)';
                                e.currentTarget.style.background = '#ffcc00';
                            }, onMouseLeave: (e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.background = '#ffffff';
                            }, children: _jsx("span", { style: { color: '#2c2c2c', fontSize: '1.2rem', fontWeight: 'bold' }, children: "+" }) })] })] }, talent.id))) }));
};
export default DynamicTalentCards;
