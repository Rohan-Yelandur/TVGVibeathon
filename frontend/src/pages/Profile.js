import React from 'react';
import './Profile.css';

const Profile = () => {
  return (
    <div className="profile-page">
      <div className="profile-container glass-card bounce-in">
        <div className="profile-header">
          <div className="profile-avatar">
            <svg 
              className="avatar-icon" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h1>My Profile</h1>
          <p className="profile-subtitle">Manage your personal information and preferences</p>
        </div>

        <div className="profile-content">
          <div className="profile-section glass-card">
            <h2 className="section-title">Personal Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Username</label>
                <div className="info-value">MusicMaster2025</div>
              </div>
              <div className="info-item">
                <label>Email</label>
                <div className="info-value">user@example.com</div>
              </div>
              <div className="info-item">
                <label>Member Since</label>
                <div className="info-value">October 2025</div>
              </div>
              <div className="info-item">
                <label>Skill Level</label>
                <div className="info-value">Intermediate</div>
              </div>
            </div>
            <button className="edit-button">Edit Profile</button>
          </div>

          <div className="profile-section glass-card">
            <h2 className="section-title">Performance Stats</h2>
            <div className="stats-grid">
              <div className="stat-card glass-card">
                <div className="stat-icon">🎸</div>
                <div className="stat-value">47</div>
                <div className="stat-label">Guitar Sessions</div>
              </div>
              <div className="stat-card glass-card">
                <div className="stat-icon">🎹</div>
                <div className="stat-value">32</div>
                <div className="stat-label">Piano Sessions</div>
              </div>
              <div className="stat-card glass-card">
                <div className="stat-icon">⏱️</div>
                <div className="stat-value">24h</div>
                <div className="stat-label">Total Practice</div>
              </div>
              <div className="stat-card glass-card">
                <div className="stat-icon">🏆</div>
                <div className="stat-value">12</div>
                <div className="stat-label">Achievements</div>
              </div>
            </div>
          </div>

          <div className="profile-section glass-card">
            <h2 className="section-title">Recent Activity</h2>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">🎸</div>
                <div className="activity-details">
                  <div className="activity-title">Played Guitar</div>
                  <div className="activity-time">2 hours ago</div>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">🎹</div>
                <div className="activity-details">
                  <div className="activity-title">Piano Practice Session</div>
                  <div className="activity-time">Yesterday</div>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">🏆</div>
                <div className="activity-details">
                  <div className="activity-title">Earned "Rhythm Master" Badge</div>
                  <div className="activity-time">3 days ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Profile);
