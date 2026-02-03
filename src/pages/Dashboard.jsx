import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { caseService } from '../services/caseService';
import { PlusCircle, FileText, Clock, UserCheck, MessageSquare, ChevronRight, Trophy } from 'lucide-react';
import { chatService } from '../services/chatService';
import { useNavigate } from 'react-router-dom';
import LawyerDashboard from './LawyerDashboard';

const UserDashboard = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [initiatingChat, setInitiatingChat] = useState(null);
    const [winningCase, setWinningCase] = useState(null);

    const handleWon = async (caseId, lawyerId) => {
        if (!window.confirm("Congratulations! Click OK to confirm you won this case. This will also update your lawyer's success rate.")) return;
        setWinningCase(caseId);
        try {
            await caseService.updateCaseStatus(caseId, 'won');
            if (lawyerId) {
                await caseService.updateLawyerStats(lawyerId, true);
            }
            setCases(prev => prev.map(c => c.id === caseId ? { ...c, status: 'won' } : c));
        } catch (error) {
            console.error("Error marking as won:", error);
        } finally {
            setWinningCase(null);
        }
    };

    const handleChat = async (lawyerId, caseId) => {
        setInitiatingChat(caseId);
        try {
            const chatId = await chatService.getChatId(currentUser.uid, lawyerId, caseId);
            navigate(`/chat?chatId=${chatId}&name=My Lawyer`);
        } catch (error) {
            console.error("Error initiating chat:", error);
        } finally {
            setInitiatingChat(null);
        }
    };

    useEffect(() => {
        const fetchCases = async () => {
            try {
                const fetchedCases = await caseService.getUserCases(currentUser.uid);
                setCases(fetchedCases);
            } catch (error) {
                console.error("Error fetching cases:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCases();
    }, [currentUser]);

    return (
        <div className="page">
            <div className="flex-between m-b-2">
                <div>
                    <h1>Welcome, {currentUser.name}</h1>
                    <p className="text-muted">Manage your legal cases and documents.</p>
                </div>

                <Link to="/create-case" className="btn btn-primary">
                    <PlusCircle size={18} />
                    <span>New Case</span>
                </Link>
            </div>

            {loading ? (
                <div>Loading your cases...</div>
            ) : cases.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <FileText size={48} style={{ color: 'var(--border)', marginBottom: '1rem' }} />
                    <h3>No cases found</h3>
                    <p className="text-muted">You haven't filed any cases yet.</p>
                    <Link to="/create-case" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                        Create your first case
                    </Link>
                </div>
            ) : (
                <div className="grid">
                    {cases.map(item => (
                        <div key={item.id} className="card">
                            <div className="flex-between m-b-1">
                                <span className={`badge badge-${item.urgency}`}>{item.urgency} Urgency</span>
                                <span className={`badge badge-${item.status}`}>{item.status}</span>
                            </div>
                            <h3 className="m-b-1" style={{ textTransform: 'capitalize' }}>
                                <Link to={`/case/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    {item.category} Case
                                </Link>
                            </h3>
                            <p className="text-muted m-b-1" style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                fontSize: '0.875rem'
                            }}>
                                {item.description}
                            </p>

                            <div className="flex-between" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem' }}>
                                <div className="flex-between" style={{ gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    <Clock size={14} />
                                    <span>{item.createdAt?.toDate().toLocaleDateString() || 'Just now'}</span>
                                </div>

                                {!item.lawyer && (
                                    <Link to={`/recommended-lawyers?caseId=${item.id}&category=${item.category}`} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8125rem' }}>
                                        <UserCheck size={14} />
                                        <span>Find Lawyer</span>
                                    </Link>
                                )}

                                {item.lawyer && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleChat(item.lawyer, item.id)}
                                            className="btn btn-outline"
                                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.8125rem' }}
                                            disabled={initiatingChat === item.id}
                                        >
                                            <MessageSquare size={14} />
                                            <span>{initiatingChat === item.id ? 'Loading...' : 'Chat with Lawyer'}</span>
                                        </button>

                                        {item.status !== 'won' && item.status !== 'closed' && (
                                            <button
                                                onClick={() => handleWon(item.id, item.lawyer)}
                                                className="btn btn-success"
                                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.8125rem', border: 'none' }}
                                                disabled={winningCase === item.id}
                                            >
                                                <Trophy size={14} />
                                                <span>I Won This Case!</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const Dashboard = () => {
    const { currentUser } = useAuth();

    if (currentUser.role === 'lawyer') {
        return <LawyerDashboard />;
    }

    return <UserDashboard />;
};

export default Dashboard;
