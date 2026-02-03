import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import { Users, Briefcase, Award, TrendingUp, ShieldCheck, Mail, MapPin } from 'lucide-react';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [lawyers, setLawyers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userData, lawyerData] = await Promise.all([
                    adminService.getAllUsers(),
                    adminService.getAllLawyers()
                ]);
                setUsers(userData);
                setLawyers(lawyerData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="page">Loading NyayMitra Admin Panel...</div>;

    return (
        <div className="page">
            <div className="m-b-3">
                <h1 className="flex-between" style={{ justifyContent: 'flex-start', gap: '1rem' }}>
                    <ShieldCheck size={36} color="var(--primary)" />
                    Centralized Admin Dashboard
                </h1>
                <p className="text-muted">Welcome, Administrator. Overseeing NyayMitra platform metrics.</p>
            </div>

            <div className="grid m-b-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                <div className="card shadow-sm" style={{ borderLeft: '5px solid var(--primary)', padding: '1.5rem' }}>
                    <div className="flex-between">
                        <div>
                            <h4 className="text-muted m-b-0">Citizen Users</h4>
                            <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0' }}>{users.length}</h2>
                            <p className="small text-muted">Awaiting legal assistance</p>
                        </div>
                        <div style={{ background: 'var(--bg)', padding: '1.25rem', borderRadius: '1rem' }}>
                            <Users size={40} color="var(--primary)" />
                        </div>
                    </div>
                </div>

                <div className="card shadow-sm" style={{ borderLeft: '5px solid var(--success)', padding: '1.5rem' }}>
                    <div className="flex-between">
                        <div>
                            <h4 className="text-muted m-b-0">Legal Experts</h4>
                            <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0' }}>{lawyers.length}</h2>
                            <p className="small text-muted">Registered in network</p>
                        </div>
                        <div style={{ background: 'var(--bg)', padding: '1.25rem', borderRadius: '1rem' }}>
                            <Briefcase size={40} color="var(--success)" />
                        </div>
                    </div>
                </div>
            </div>

            <h2 className="m-b-2 flex-between" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                <TrendingUp size={24} color="var(--primary)" />
                Lawyer Performance & Track Records
            </h2>

            <div className="grid">
                {lawyers.map(lawyer => {
                    const winRate = lawyer.totalCases > 0 ? (lawyer.winCases / lawyer.totalCases) * 100 : 0;
                    return (
                        <div key={lawyer.id} className="card shadow-hover" style={{ padding: '1.5rem' }}>
                            <div className="flex-between m-b-2" style={{ alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{lawyer.name}</h3>
                                    <div className="flex-between" style={{ gap: '0.5rem', marginTop: '0.25rem' }}>
                                        <Mail size={12} className="text-muted" />
                                        <span className="text-muted small">{lawyer.email}</span>
                                    </div>
                                    <div className="flex-between" style={{ gap: '0.5rem' }}>
                                        <MapPin size={12} className="text-muted" />
                                        <span className="text-muted small">{lawyer.city}</span>
                                    </div>
                                </div>
                                <div className="badge badge-medium" style={{ background: 'rgba(128, 0, 0, 0.1)', color: 'var(--primary)', border: '1px solid var(--primary)' }}>
                                    <ShieldCheck size={14} style={{ marginRight: '5px' }} />
                                    {lawyer.trustScore !== undefined ? `${lawyer.trustScore} Trust` : 'Rating: Null'}
                                </div>
                            </div>

                            <div style={{ background: 'var(--bg)', padding: '1.25rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
                                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <h4 className="text-muted small uppercase m-b-0">Total Handles</h4>
                                        <h3 style={{ margin: 0, color: 'var(--text)' }}>{lawyer.totalCases || 0} Cases</h3>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <h4 className="text-muted small uppercase m-b-0">Successful Wins</h4>
                                        <h3 style={{ margin: 0, color: 'var(--success)' }}>{lawyer.winCases || 0} Wins</h3>
                                    </div>
                                </div>

                                {/* Progress Visualizer */}
                                <div style={{ marginTop: '1.25rem' }}>
                                    <div className="flex-between m-b-1">
                                        <span className="small font-bold" style={{ color: 'var(--text-muted)' }}>Winning Ratio</span>
                                        <span className="small font-bold" style={{ color: 'var(--success)' }}>{Math.round(winRate)}%</span>
                                    </div>
                                    <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${winRate}%`,
                                            height: '100%',
                                            background: 'linear-gradient(90deg, var(--primary), var(--success))',
                                            transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-between">
                                <span className="small text-muted">ID: {lawyer.enrollmentId || 'Not Provided'}</span>
                                <span className="badge badge-small" style={{ textTransform: 'uppercase', fontSize: '10px' }}>Active Expert</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AdminDashboard;
