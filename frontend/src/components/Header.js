import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

const Header = ({ isDarkMode, setIsDarkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleNavigation = (path, e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(path, { replace: false });
  };

  return (
    <header className="app-header">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={(e) => handleNavigation('/', e)}>
          <span className="brand-text">Harmonium</span>
        </div>
        
        <nav className="navbar-links">
          <button 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={(e) => handleNavigation('/', e)}
          >
            <svg 
              className="nav-icon" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>Home</span>
          </button>

          <button 
            className={`nav-link ${isActive('/lessons') ? 'active' : ''}`}
            onClick={(e) => handleNavigation('/lessons', e)}
          >
            <svg 
              className="nav-icon" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            <span>Lessons</span>
          </button>

          <button 
            className={`nav-link ${isActive('/about') ? 'active' : ''}`}
            onClick={(e) => handleNavigation('/about', e)}
          >
            <svg 
              className="nav-icon" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <span>About</span>
          </button>

          <button 
            className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
            onClick={(e) => handleNavigation('/profile', e)}
          >
            <svg 
              className="nav-icon" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Profile</span>
          </button>

          <button 
            className={`nav-link ${isActive('/settings') ? 'active' : ''}`}
            onClick={(e) => handleNavigation('/settings', e)}
          >
            <svg 
              className="nav-icon" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span>Settings</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
