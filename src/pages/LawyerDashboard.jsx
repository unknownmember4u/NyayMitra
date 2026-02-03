import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { caseService } from '../services/caseService';
import { Briefcase, User, MapPin, AlertTriangle } from 'lucide-react';

const LawyerDashboard = () => {
    const { currentUser } = useAuth();
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);

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

                            <div className="flex-between" style={{ fontSize: '0.875rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                <div className="flex-between" style={{ gap: '0.5rem', color: 'var(--text-muted)' }}>
                                    <User size={14} />
                                    <span>Client ID: {item.userId.substring(0, 8)}...</span>
                                </div>
                                {item.urgency === 'high' && (
                                    <div className="flex-between" style={{ gap: '0.5rem', color: 'var(--danger)', fontWeight: 600 }}>
                                        <AlertTriangle size={14} />
                                        <span>Prioritize</span>
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

export default LawyerDashboard;
