import React from 'react';
import {
  FiBell,
  FiUser,
  FiChevronDown,
  FiGrid,
  FiAlertTriangle,
  FiList,
  FiBarChart2,
  FiShield,
  FiCheckCircle,
} from 'react-icons/fi';

export default function Header({ activeTab, onSelectTab }) {
  const navItems = [
    { id: 'log', label: 'Log Deviation', icon: FiAlertTriangle },
    { id: 'registry', label: 'Deviations Registry', icon: FiList },
    { id: 'dashboard', label: 'Quality Dashboard', icon: FiBarChart2 },
  ];

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo" onClick={() => onSelectTab('log')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="url(#logo-grad)" />
              <path d="M7 20L14 8L21 20H7Z" fill="white" fillOpacity="0.9" />
              <defs>
                <linearGradient id="logo-grad" x1="0" y1="0" x2="28" y2="28">
                  <stop stopColor="#4F46E5" />
                  <stop offset="1" stopColor="#7C3AED" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="logo-text">AIVOA</span>
          <span className="logo-badge">QMS</span>
        </div>

        <nav className="main-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'nav-item--active' : ''}`}
              onClick={() => onSelectTab(item.id)}
            >
              <item.icon size={15} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="header-right">
        <div className="system-status-indicator">
          <span className="status-ping"></span>
          <span className="status-label">AIVOA Core Active</span>
        </div>
        <button className="header-icon-btn notification-btn" title="GMP Compliance Notifications">
          <FiBell size={18} />
          <span className="notification-dot"></span>
        </button>
        <div className="header-org">
          <FiShield size={14} className="text-accent" />
          <span>PharmaCorp API Mfg</span>
          <FiChevronDown size={14} />
        </div>
        <div className="header-avatar" title="Quality Assurance Officer">
          <FiUser size={16} />
        </div>
      </div>
    </header>
  );
}
