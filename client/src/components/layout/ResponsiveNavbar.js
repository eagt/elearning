import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { logout } from '../../actions/auth';
import { getCurrentTenant } from '../../actions/tenant';

const ResponsiveNavbar = ({ 
  auth: { isAuthenticated, user, loading }, 
  tenant: { currentTenant },
  getCurrentTenant,
  logout,
  history 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      getCurrentTenant();
    }
  }, [isAuthenticated, user, getCurrentTenant]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const onLogout = () => {
    logout();
    history.push('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const authLinks = (
    <>
      <li className="nav-item">
        <Link className="nav-link" to="/dashboard" onClick={toggleMenu}>
          <i className="fas fa-home mr-1"></i> Dashboard
        </Link>
      </li>
      {user && user.role === 'creator' && (
        <>
          <li className="nav-item">
            <Link className="nav-link" to="/courses" onClick={toggleMenu}>
              <i className="fas fa-book mr-1"></i> Courses
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/presentations" onClick={toggleMenu}>
              <i className="fas fa-presentation mr-1"></i> Presentations
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/quizzes" onClick={toggleMenu}>
              <i className="fas fa-question-circle mr-1"></i> Quizzes
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/screenshots" onClick={toggleMenu}>
              <i className="fas fa-camera mr-1"></i> Screenshots
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/tutorials" onClick={toggleMenu}>
              <i className="fas fa-graduation-cap mr-1"></i> Tutorials
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/analytics" onClick={toggleMenu}>
              <i className="fas fa-chart-bar mr-1"></i> Analytics
            </Link>
          </li>
        </>
      )}
      {user && user.role === 'learner' && (
        <>
          <li className="nav-item">
            <Link className="nav-link" to="/my-courses" onClick={toggleMenu}>
              <i className="fas fa-book-open mr-1"></i> My Courses
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/my-progress" onClick={toggleMenu}>
              <i className="fas fa-chart-line mr-1"></i> My Progress
            </Link>
          </li>
        </>
      )}
      <li className="nav-item">
        <Link className="nav-link" to="/profile" onClick={toggleMenu}>
          <i className="fas fa-user mr-1"></i> Profile
        </Link>
      </li>
      <li className="nav-item">
        <a className="nav-link" href="#!" onClick={onLogout}>
          <i className="fas fa-sign-out-alt mr-1"></i> Logout
        </a>
      </li>
    </>
  );

  const guestLinks = (
    <>
      <li className="nav-item">
        <Link className="nav-link" to="/register" onClick={toggleMenu}>
          <i className="fas fa-user-plus mr-1"></i> Register
        </Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to="/login" onClick={toggleMenu}>
          <i className="fas fa-sign-in-alt mr-1"></i> Login
        </Link>
      </li>
    </>
  );

  return (
    <>
      <nav className={`navbar navbar-expand-lg navbar-dark bg-primary fixed-top ${isScrolled ? 'navbar-scrolled' : ''}`}>
        <div className="container-fluid">
          {isAuthenticated && (
            <button 
              className="btn btn-link text-white d-lg-none mr-2 p-0" 
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <i className="fas fa-bars"></i>
            </button>
          )}
          
          <Link className="navbar-brand" to="/">
            <i className="fas fa-graduation-cap mr-2"></i>
            <span className="d-none d-sm-inline">E-Learning Platform</span>
          </Link>
          
          <button 
            className="navbar-toggler" 
            type="button" 
            onClick={toggleMenu}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
            <ul className="navbar-nav ml-auto">
              {!loading && (
                <>
                  {isAuthenticated ? authLinks : guestLinks}
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Sidebar for mobile */}
      {isAuthenticated && (
        <>
          <div 
            className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} 
            onClick={toggleSidebar}
          ></div>
          <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
            <div className="sidebar-header d-flex justify-content-between align-items-center p-3 border-bottom">
              <h5 className="mb-0">
                <i className="fas fa-user-circle mr-2"></i>
                {user && `${user.firstName} ${user.lastName}`}
              </h5>
              <button 
                className="btn btn-link text-dark p-0" 
                onClick={toggleSidebar}
                aria-label="Close sidebar"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            {currentTenant && (
              <div className="sidebar-tenant p-3 border-bottom">
                <div className="d-flex align-items-center">
                  <div className="tenant-logo mr-3">
                    {currentTenant.logo ? (
                      <img 
                        src={currentTenant.logo} 
                        alt={currentTenant.name} 
                        className="rounded-circle"
                        width="40"
                        height="40"
                      />
                    ) : (
                      <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" 
                           style={{ width: '40px', height: '40px' }}>
                        <i className="fas fa-building text-primary"></i>
                      </div>
                    )}
                  </div>
                  <div>
                    <h6 className="mb-0">{currentTenant.name}</h6>
                    <small className="text-muted">{user && user.role}</small>
                  </div>
                </div>
              </div>
            )}
            
            <div className="sidebar-menu p-3">
              <ul className="list-unstyled">
                <li className="mb-2">
                  <Link 
                    className="btn btn-link text-dark p-0 d-flex align-items-center" 
                    to="/dashboard" 
                    onClick={toggleSidebar}
                  >
                    <i className="fas fa-home mr-3"></i>
                    <span>Dashboard</span>
                  </Link>
                </li>
                
                {user && user.role === 'creator' && (
                  <>
                    <li className="mb-2">
                      <Link 
                        className="btn btn-link text-dark p-0 d-flex align-items-center" 
                        to="/courses" 
                        onClick={toggleSidebar}
                      >
                        <i className="fas fa-book mr-3"></i>
                        <span>Courses</span>
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link 
                        className="btn btn-link text-dark p-0 d-flex align-items-center" 
                        to="/presentations" 
                        onClick={toggleSidebar}
                      >
                        <i className="fas fa-presentation mr-3"></i>
                        <span>Presentations</span>
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link 
                        className="btn btn-link text-dark p-0 d-flex align-items-center" 
                        to="/quizzes" 
                        onClick={toggleSidebar}
                      >
                        <i className="fas fa-question-circle mr-3"></i>
                        <span>Quizzes</span>
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link 
                        className="btn btn-link text-dark p-0 d-flex align-items-center" 
                        to="/screenshots" 
                        onClick={toggleSidebar}
                      >
                        <i className="fas fa-camera mr-3"></i>
                        <span>Screenshots</span>
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link 
                        className="btn btn-link text-dark p-0 d-flex align-items-center" 
                        to="/tutorials" 
                        onClick={toggleSidebar}
                      >
                        <i className="fas fa-graduation-cap mr-3"></i>
                        <span>Tutorials</span>
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link 
                        className="btn btn-link text-dark p-0 d-flex align-items-center" 
                        to="/analytics" 
                        onClick={toggleSidebar}
                      >
                        <i className="fas fa-chart-bar mr-3"></i>
                        <span>Analytics</span>
                      </Link>
                    </li>
                  </>
                )}
                
                {user && user.role === 'learner' && (
                  <>
                    <li className="mb-2">
                      <Link 
                        className="btn btn-link text-dark p-0 d-flex align-items-center" 
                        to="/my-courses" 
                        onClick={toggleSidebar}
                      >
                        <i className="fas fa-book-open mr-3"></i>
                        <span>My Courses</span>
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link 
                        className="btn btn-link text-dark p-0 d-flex align-items-center" 
                        to="/my-progress" 
                        onClick={toggleSidebar}
                      >
                        <i className="fas fa-chart-line mr-3"></i>
                        <span>My Progress</span>
                      </Link>
                    </li>
                  </>
                )}
                
                <li className="mb-2">
                  <Link 
                    className="btn btn-link text-dark p-0 d-flex align-items-center" 
                    to="/profile" 
                    onClick={toggleSidebar}
                  >
                    <i className="fas fa-user mr-3"></i>
                    <span>Profile</span>
                  </Link>
                </li>
                
                <li className="mb-2">
                  <a 
                    className="btn btn-link text-dark p-0 d-flex align-items-center" 
                    href="#!" 
                    onClick={() => {
                      onLogout();
                      toggleSidebar();
                    }}
                  >
                    <i className="fas fa-sign-out-alt mr-3"></i>
                    <span>Logout</span>
                  </a>
                </li>
              </ul>
            </div>
            
            <div className="sidebar-footer p-3 border-top mt-auto">
              <div className="text-center text-muted small">
                <p className="mb-1">E-Learning Platform v1.0</p>
                <p className="mb-0">&copy; {new Date().getFullYear()}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

ResponsiveNavbar.propTypes = {
  auth: PropTypes.object.isRequired,
  tenant: PropTypes.object.isRequired,
  getCurrentTenant: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  tenant: state.tenant
});

export default connect(mapStateToProps, { getCurrentTenant, logout })(withRouter(ResponsiveNavbar));