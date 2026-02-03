import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Scale, LogOut, User } from 'lucide-react';

const Navbar = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await authService.logout();
            navigate('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <Link to="/" className="logo flex-between" style={{ gap: '0.5rem' }}>
                    <Scale size={24} />
                    <span>NyayMitra</span>
                </Link>

                {currentUser ? (
                    <div className="flex-between" style={{ gap: '1.5rem' }}>
                        <div className="flex-between" style={{ gap: '0.25rem', color: 'var(--text-muted)' }}>
                            <User size={18} />
                            <span style={{ fontSize: '0.875rem' }}>{currentUser.name} ({currentUser.role})</span>
                        </div>
                        <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem' }}>
                            <LogOut size={16} />
                            <span>Logout</span>
                        </button>
                    </div>
                ) : (
                    <Link to="/login" className="btn btn-primary">Login</Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
