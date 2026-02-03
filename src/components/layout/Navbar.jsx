import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Scale, LogOut, User } from 'lucide-react';
import flagIcon from '../../assets/icons/Flag.png';
import lokAdalat from '../../assets/icons/lok-adalat.png';
import satyamev from '../../assets/icons/satyamev.jpeg';
import targetIcon from '../../assets/icons/target.jpeg';

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
        <header className="site-header">
            <div className="gov-top">
                <div className="gov-left">
                    <img src={flagIcon} alt="India Flag" className="flag" />
                    <div className="gov-text">
                        <span className="hi">न्याय विभाग</span>
                        <span className="en">DEPARTMENT OF JUSTICE</span>
                    </div>
                </div>
                <div className="gov-right">
                    <img src={targetIcon} alt="access" className="gov-small-icon" />
                    <img src={lokAdalat} alt="lok-adalat" className="gov-small-icon" />
                </div>
            </div>

            <nav className="navbar main-nav">
                <div className="container navbar-content">
                    <Link to="/" className="brand">
                        <img src={satyamev} alt="satyamev" className="brand-icon" />
                        <div className="brand-title">
                            <div className="big-title">NATIONAL LEGAL SERVICES</div>
                            <div className="big-title">AUTHORITY</div>
                        </div>
                    </Link>

                    <div className="search-wrap">
                        <input className="search-input" placeholder="Search" aria-label="Search" />
                        <button className="search-btn" aria-label="Search Button">🔍</button>
                    </div>

                    {/* Right side actions (login / user) */}
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
        </header>
    );
};

export default Navbar;
