import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { lawyerService } from '../services/lawyerService';
import { caseService } from '../services/caseService';
import { getRecommendedLawyers } from '../utils/aiLogic';
import { Star, Award, MapPin, Briefcase, Zap, CheckCircle, MessageSquare } from 'lucide-react';
import { chatService } from '../services/chatService';
import { useAuth } from '../context/AuthContext';

const RecommendedLawyers = () => {
    const { currentUser } = useAuth();
    const [searchParams] = useSearchParams();
    const caseId = searchParams.get('caseId');
    const category = searchParams.get('category');
    const navigate = useNavigate();

    const [lawyers, setLawyers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(null);
    const [initiatingChat, setInitiatingChat] = useState(null);

    useEffect(() => {
        const fetchAndRecommend = async () => {
            try {
                const allLawyers = await lawyerService.getAllLawyers();
                const recommendations = getRecommendedLawyers(allLawyers, category || 'civil');
                setLawyers(recommendations);
            } catch (error) {
                console.error("Error recommending lawyers:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAndRecommend();
    }, [category]);

    const handleAssign = async (lawyerId) => {
        setAssigning(lawyerId);
        try {
            await caseService.assignLawyer(caseId, lawyerId);
            alert("Lawyer assigned successfully!");
            navigate('/dashboard');
        } catch (error) {
            console.error("Error assigning lawyer:", error);
            alert("Failed to assign lawyer.");
        } finally {
            setAssigning(null);
        }
    };

    const handleChat = async (lawyerId, lawyerName) => {
        setInitiatingChat(lawyerId);
        try {
            const chatId = await chatService.getChatId(currentUser.uid, lawyerId, caseId);
            navigate(`/chat?chatId=${chatId}&name=${encodeURIComponent(lawyerName)}`);
        } catch (error) {
            console.error("Error initiating chat:", error);
            alert("Failed to start chat.");
        } finally {
            setInitiatingChat(null);
        }
    };

    if (loading) return <div className="page">Finding the best matches for your case...</div>;

    return (
        <div className="page">
            <div className="m-b-2">
                <h1 className="flex-between" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
                    <Zap size={28} color="var(--warning)" fill="var(--warning)" />
                    Top AI Recommendations
                </h1>
                <p className="text-muted">We've matched these lawyers based on your case type: <strong>{category}</strong></p>
            </div>

            {lawyers.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <h3>No matching lawyers found in this category.</h3>
                    <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        Back to Dashboard
                    </button>
                </div>
            ) : (
                <div className="grid">
                    {lawyers.map(lawyer => (
                        <div key={lawyer.id} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                background: 'var(--primary)',
                                color: 'white',
                                padding: '0.25rem 0.75rem',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                borderBottomLeftRadius: '0.5rem'
                            }}>
                                Match Score: {Math.round(lawyer.score)}
                            </div>

                            <div className="flex-between m-b-1" style={{ justifyContent: 'flex-start', gap: '1rem' }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    background: 'var(--bg)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem',
                                    fontWeight: 700,
                                    color: 'var(--primary)',
                                    border: '2px solid var(--primary)'
                                }}>
                                    {lawyer.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0 }}>{lawyer.name}</h3>
                                    <div className="flex-between" style={{ justifyContent: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                        <MapPin size={14} />
                                        <span>{lawyer.city}, India</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                <div className="flex-between" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                                    <Briefcase size={14} color="var(--primary)" />
                                    <span>{lawyer.experienceYears} Years Exp.</span>
                                </div>
                                <div className="flex-between" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                                    <Star size={14} color="var(--warning)" fill="var(--warning)" />
                                    <span>{lawyer.rating} / 5.0</span>
                                </div>
                                <div className="flex-between" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                                    <Award size={14} color="var(--success)" />
                                    <span>{Math.round((lawyer.winCases / lawyer.totalCases) * 100)}% Win Rate</span>
                                </div>
                            </div>

                            <div style={{
                                background: '#f0f9ff',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.8125rem',
                                color: '#0369a1',
                                marginBottom: '1.5rem',
                                display: 'flex',
                                gap: '0.5rem',
                                alignItems: 'center'
                            }}>
                                <CheckCircle size={16} />
                                <span>AI Reason: {lawyer.reason}</span>
                            </div>

                            <div className="flex-between" style={{ gap: '1rem' }}>
                                <button
                                    onClick={() => handleChat(lawyer.id, lawyer.name)}
                                    className="btn btn-outline"
                                    style={{ flex: 1, justifyContent: 'center' }}
                                    disabled={initiatingChat === lawyer.id}
                                >
                                    <MessageSquare size={18} />
                                    <span>{initiatingChat === lawyer.id ? 'Connecting...' : 'Message'}</span>
                                </button>

                                <button
                                    onClick={() => handleAssign(lawyer.id)}
                                    className="btn btn-primary"
                                    style={{ flex: 1, justifyContent: 'center' }}
                                    disabled={assigning === lawyer.id}
                                >
                                    {assigning === lawyer.id ? 'Assigning...' : 'Assign'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecommendedLawyers;
