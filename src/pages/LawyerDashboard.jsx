import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { caseService } from '../services/caseService';
import { Briefcase, User, MapPin, AlertTriangle, MessageSquare, FileText, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { chatService } from '../services/chatService';

const LawyerDashboard = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [initiatingChat, setInitiatingChat] = useState(null);
    const [selectedCase, setSelectedCase] = useState(null); // For document viewer
    const [showDocs, setShowDocs] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(null);

    const handleChat = async (userId, caseId) => {
        setInitiatingChat(caseId);
        try {
            const chatId = await chatService.getChatId(currentUser.uid, userId, caseId);
            navigate(`/chat?chatId=${chatId}&name=Client Chat`);
        } catch (error) {
            console.error("Error initiating chat:", error);
        } finally {
            setInitiatingChat(null);
        }
    };

    const handleUpdateStatus = async (caseId, newStatus) => {
        setUpdatingStatus(caseId);
        try {
            await caseService.updateCaseStatus(caseId, newStatus);
            setCases(prev => prev.map(c => c.id === caseId ? { ...c, status: newStatus } : c));
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setUpdatingStatus(null);
        }
    };

    useEffect(() => {
        const fetchCases = async () => {
            try {
                const fetchedCases = await caseService.getLawyerCases(currentUser.uid);
                setCases(fetchedCases);
            } catch (error) {
                console.error("Error fetching lawyer cases:", error);
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
                    <h1>Lawyer Panel</h1>
                    <p className="text-muted">You are logged in as {currentUser.name}. Viewing your assigned cases.</p>
                </div>
                <div className="badge badge-medium" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Briefcase size={14} />
                    <span>{cases.length} Active Cases</span>
                </div>
            </div>

            {loading ? (
                <div>Loading assignments...</div>
            ) : cases.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <Briefcase size={48} style={{ color: 'var(--border)', marginBottom: '1rem' }} />
                    <h3>No cases assigned yet</h3>
                    <p className="text-muted">When a client assigns you to a case, it will appear here.</p>
                </div>
            ) : (
                <div className="grid">
                    {cases.map(item => (
                        <div key={item.id} className="card">
                            <div className="flex-between m-b-1">
                                <span className={`badge badge-${item.urgency}`}>{item.urgency} Urgency</span>
                                <span className={`badge badge-${item.status}`}>{item.status}</span>
                            </div>
                            <h3 className="m-b-1" style={{ textTransform: 'capitalize' }}>{item.category} Case</h3>

                            <div style={{
                                background: 'var(--bg)',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                marginBottom: '1rem',
                                fontSize: '0.875rem'
                            }}>
                                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Case Description:</p>
                                <p className="text-muted">{item.description}</p>
                            </div>

                            <div className="flex-between" style={{ fontSize: '0.875rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem' }}>
                                <div className="flex-between" style={{ gap: '0.5rem', color: 'var(--text-muted)' }}>
                                    <User size={14} />
                                    <span>Client: {item.userId.substring(0, 8)}...</span>
                                </div>
                                <div className="flex-between" style={{ gap: '0.5rem' }}>
                                    {item.documents?.length > 0 && (
                                        <button
                                            onClick={() => { setSelectedCase(item); setShowDocs(true); }}
                                            className="btn btn-outline"
                                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.8125rem' }}
                                        >
                                            <FileText size={14} />
                                            <span>Docs ({item.documents.length})</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleChat(item.userId, item.id)}
                                        className="btn btn-primary"
                                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.8125rem' }}
                                        disabled={initiatingChat === item.id}
                                    >
                                        <MessageSquare size={14} />
                                        <span>Chat</span>
                                    </button>
                                </div>
                            </div>

                            {item.status !== 'closed' && (
                                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                    <button
                                        onClick={() => handleUpdateStatus(item.id, 'closed')}
                                        className="btn btn-danger"
                                        style={{ width: '100%', justifyContent: 'center', fontSize: '0.8125rem' }}
                                        disabled={updatingStatus === item.id}
                                    >
                                        Close Case Engagement
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Document Viewer Modal */}
            {showDocs && selectedCase && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div className="card" style={{ maxWidth: '600px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
                        <div className="flex-between m-b-2">
                            <h3>Case Documents</h3>
                            <button onClick={() => setShowDocs(false)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {selectedCase.documents.map((doc, idx) => (
                                <div key={idx} className="card" style={{ background: 'var(--bg)', textAlign: 'center' }}>
                                    <FileText size={32} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                                    <p style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>{doc.name}</p>
                                    <a
                                        href={doc.data}
                                        download={doc.name}
                                        className="btn btn-primary"
                                        style={{ marginTop: '0.5rem', width: '100%', fontSize: '0.75rem', padding: '0.25rem' }}
                                    >
                                        Download
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LawyerDashboard;
