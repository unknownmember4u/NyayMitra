import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { UserPlus, AlertCircle, ShieldCheck } from 'lucide-react';

const Register = () => {
    const [role, setRole] = useState('user'); // 'user' or 'lawyer'
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        city: '',
        // Lawyer specific
        specialization: 'civil',
        experienceYears: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (role === 'user') {
                const userData = {
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                    city: formData.city,
                };
                await authService.registerUser(formData.email, formData.password, userData);
            } else {
                const lawyerData = {
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                    city: formData.city,
                    specialization: [formData.specialization],
                    experienceYears: parseInt(formData.experienceYears),
                    totalCases: 0,
                    winCases: 0,
                    rating: 5.0,
                };
                await authService.registerLawyer(formData.email, formData.password, lawyerData);
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 1rem' }}>
            <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
                <h2 className="m-b-1" style={{ textAlign: 'center' }}>Create Account</h2>
                <p className="text-muted m-b-2" style={{ textAlign: 'center' }}>Join NyayMitra Legal Network</p>

                {error && (
                    <div className="flex-between m-b-2" style={{
                        background: '#fee2e2',
                        color: '#991b1b',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem'
                    }}>
                        <div className="flex-between" style={{ gap: '0.5rem' }}>
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                <div className="flex-between m-b-2" style={{ background: 'var(--bg)', padding: '0.5rem', borderRadius: '0.5rem', gap: '0.5rem' }}>
                    <button
                        className="btn"
                        onClick={() => setRole('user')}
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            background: role === 'user' ? 'var(--white)' : 'transparent',
                            boxShadow: role === 'user' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            color: role === 'user' ? 'var(--primary)' : 'var(--text-muted)'
                        }}
                    >
                        I'm a Client
                    </button>
                    <button
                        className="btn"
                        onClick={() => setRole('lawyer')}
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            background: role === 'lawyer' ? 'var(--white)' : 'transparent',
                            boxShadow: role === 'lawyer' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            color: role === 'lawyer' ? 'var(--primary)' : 'var(--text-muted)'
                        }}
                    >
                        I'm a Lawyer
                    </button>
                </div>

                <form onSubmit={handleRegister}>
                    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="input-group">
                            <label>Full Name</label>
                            <input name="name" type="text" placeholder="John Doe" onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label>Phone Number</label>
                            <input name="phone" type="tel" placeholder="9876543210" onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Email Address</label>
                        <input name="email" type="email" placeholder="john@example.com" onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input name="password" type="password" placeholder="••••••••" onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <label>City (Indian Only)</label>
                        <input name="city" type="text" placeholder="Mumbai, Delhi, etc." onChange={handleChange} required />
                    </div>

                    {role === 'lawyer' && (
                        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="input-group">
                                <label>Specialization</label>
                                <select name="specialization" onChange={handleChange}>
                                    <option value="civil">Civil</option>
                                    <option value="criminal">Criminal</option>
                                    <option value="family">Family</option>
                                    <option value="consumer">Consumer</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Experience (Years)</label>
                                <input name="experienceYears" type="number" placeholder="5" onChange={handleChange} required />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : (
                            <>
                                <UserPlus size={18} />
                                <span>Register as {role === 'user' ? 'Client' : 'Lawyer'}</span>
                            </>
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    <span className="text-muted">Already have an account? </span>
                    <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login here</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
