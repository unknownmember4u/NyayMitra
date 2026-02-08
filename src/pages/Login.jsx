import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { seedDatabase } from '../utils/seedDb';
import flowDiagram from '../assets/icons/diagram-export-04-02-2026-22_09_39.png';
import { LogIn, AlertCircle, Database } from 'lucide-react';


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authService.login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 className="m-b-2" style={{ textAlign: 'center' }}>Welcome to NyayMitra</h2>

                {error && (
                    <div className="flex-between" style={{
                        background: '#fee2e2',
                        color: '#991b1b',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        marginBottom: '1rem',
                        fontSize: '0.875rem'
                    }}>
                        <div className="flex-between" style={{ gap: '0.5rem' }}>
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="e.g. john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : (
                            <>
                                <LogIn size={18} />
                                <span>Login</span>
                            </>
                        )}
                    </button>
                </form>

                <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create one</Link>
                </p>
            </div>

            {/* Test Credentials & Features Panel */}
            <div className="grid" style={{
                marginTop: '1rem',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
                width: '100%',
                maxWidth: '900px'
            }}>
                {/* Credentials */}
                <div className="card" style={{ background: 'var(--bg-card)' }}>
                    <h3 className="m-b-1 text-primary">Test Credentials 🧪</h3>
                    <p className="text-muted small m-b-1">Click to auto-fill credentials.</p>

                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        <div>
                            <strong className="small text-muted">LAWYERS (Pass@1234)</strong>
                            <div className="flex-wrap" style={{ gap: '0.5rem', marginTop: '0.25rem' }}>
                                <button className="badge" onClick={() => { setEmail('ashishkamble@gmail.com'); setPassword('Pass@1234'); }}>ashishkamble</button>
                                <button className="badge" onClick={() => { setEmail('abhinaycoding@gmail.com'); setPassword('Pass@1234'); }}>abhinaycoding</button>
                                <button className="badge" onClick={() => { setEmail('prakashgond@gmail.com'); setPassword('Pass@1234'); }}>prakashgond</button>
                                <button className="badge" onClick={() => { setEmail('abhishek@gmail.com'); setPassword('Pass@1234'); }}>abhishek</button>
                            </div>
                        </div>

                        <div>
                            <strong className="small text-muted">CLIENT (Pass@1234)</strong>
                            <div className="flex-wrap" style={{ gap: '0.5rem', marginTop: '0.25rem' }}>
                                <button className="badge" onClick={() => { setEmail('prakash@gmail.com'); setPassword('Pass@1234'); }}>prakash</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features List */}
                <div className="card" style={{ background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(var(--primary-rgb), 0.05) 100%)' }}>
                    <h3 className="m-b-1 text-primary">NyayMitra Features 🚀</h3>
                    <ul style={{
                        paddingLeft: '1.2rem',
                        fontSize: '0.85rem',
                        lineHeight: '1.6',
                        color: 'var(--text-muted)'
                    }}>
                        <li>🎙️ <strong>Voice-to-Text Registration</strong> (Local Demo)</li>
                        <li>🤖 <strong>AI Engine (Gemini 2.5 Flash)</strong> for Urgency & Category Detection</li>
                        <li>🔐 <strong>Role-Based Access</strong> (Client, Lawyer, Admin)</li>
                        <li>🧹 <strong>Report Cleaning & Summarization</strong></li>
                        <li>💬 <strong>Real-time Chat</strong> between Client & Lawyer</li>
                        <li>📈 <strong>Progress Tracking</strong> for Case Status</li>
                        <li>🛡️ <strong>Secure Document Storage</strong></li>
                        <li>⭐ <strong>Exponential Smoothing</strong> for Lawyer Ratings</li>
                    </ul>
                </div>

                {/* Application Flow */}
                <div className="card" style={{ background: 'var(--bg-card)', gridColumn: '1 / -1' }}> {/* Span full width if grid allows */}
                    <h3 className="m-b-1 text-primary">Application Workflow 🔄</h3>
                    <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg)', borderRadius: '0.5rem' }}>
                        <img
                            src={flowDiagram}
                            alt="NyayMitra Application Flow"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '400px',
                                objectFit: 'contain',
                                borderRadius: '0.25rem'
                            }}
                        />
                    </div>
                </div>
            </div>

            <button className="btn btn-outline" onClick={seedDatabase} style={{ fontSize: '0.75rem', marginTop: '1rem' }}>
                <Database size={14} />
                Seed Sample Lawyers to Firestore
            </button>
        </div>
    );
};

export default Login;
