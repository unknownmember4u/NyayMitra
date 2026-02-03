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
                    <div className="nav-actions">
                        {currentUser.name === 'Ashish Kamble' && (
                            <Link to="/admin" className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8125rem' }}>
                                Admin Panel
                            </Link>
                        )}
                        <div className="user-profile">
                            <User size={18} />
                            <span>{currentUser.name}</span>
                        </div>
                        <button onClick={handleLogout} className="btn btn-outline nav-logout-btn">
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
