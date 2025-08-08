import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import ResponsiveNavbar from '../ResponsiveNavbar';
import configureStore from 'redux-mock-store';

// Mock the actions
jest.mock('../../actions/auth', () => ({
  logout: jest.fn(),
  getCurrentTenant: jest.fn()
}));

// Mock the react-icons library
jest.mock('react-icons/fa', () => ({
  FaBars: () => <div data-testid="fa-bars">Bars Icon</div>,
  FaTimes: () => <div data-testid="fa-times">Times Icon</div>,
  FaUser: () => <div data-testid="fa-user">User Icon</div>,
  FaSignOutAlt: () => <div data-testid="fa-sign-out">Sign Out Icon</div>,
  FaHome: () => <div data-testid="fa-home">Home Icon</div>,
  FaBook: () => <div data-testid="fa-book">Book Icon</div>,
  FaChartBar: () => <div data-testid="fa-chart-bar">Chart Bar Icon</div>,
  FaUsers: () => <div data-testid="fa-users">Users Icon</div>,
  FaCog: () => <div data-testid="fa-cog">Cog Icon</div>,
  FaBell: () => <div data-testid="fa-bell">Bell Icon</div>,
  FaSearch: () => <div data-testid="fa-search">Search Icon</div>
}));

const mockStore = configureStore([]);

describe('ResponsiveNavbar Component', () => {
  let store;
  const mockLogout = jest.fn();
  const mockGetCurrentTenant = jest.fn();

  beforeEach(() => {
    // Reset mocks
    mockLogout.mockClear();
    mockGetCurrentTenant.mockClear();
    
    // Import the mocked functions
    const auth = require('../../actions/auth');
    auth.logout.mockImplementation(mockLogout);
    auth.getCurrentTenant.mockImplementation(mockGetCurrentTenant);
    
    // Create a fresh store for each test
    store = mockStore({
      auth: {
        isAuthenticated: true,
        user: {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: 'creator'
        },
        loading: false
      },
      tenant: {
        currentTenant: {
          _id: '1',
          name: 'Test Organization',
          slug: 'test-org',
          settings: {
            theme: 'default',
            customCSS: ''
          }
        },
        loading: false
      }
    });
  });

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <Router>
          <ResponsiveNavbar />
        </Router>
      </Provider>
    );
  };

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('displays user information when authenticated', () => {
    renderComponent();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('displays tenant information when available', () => {
    renderComponent();
    expect(screen.getByText('Test Organization')).toBeInTheDocument();
  });

  it('toggles mobile menu when menu button is clicked', () => {
    renderComponent();
    
    const menuButton = screen.getByTestId('fa-bars');
    fireEvent.click(menuButton);
    
    const mobileMenu = screen.getByTestId('mobile-menu');
    expect(mobileMenu).toHaveClass('show');
    
    const closeButton = screen.getByTestId('fa-times');
    fireEvent.click(closeButton);
    
    expect(mobileMenu).not.toHaveClass('show');
  });

  it('toggles sidebar when sidebar button is clicked', () => {
    renderComponent();
    
    const sidebarButton = screen.getByTestId('sidebar-toggle');
    fireEvent.click(sidebarButton);
    
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveClass('show');
    
    fireEvent.click(sidebarButton);
    
    expect(sidebar).not.toHaveClass('show');
  });

  it('calls logout function when logout button is clicked', async () => {
    renderComponent();
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  it('displays different navigation items based on user role', () => {
    // Test with creator role
    renderComponent();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Courses')).toBeInTheDocument();
    expect(screen.getByText('Presentations')).toBeInTheDocument();
    expect(screen.getByText('Quizzes')).toBeInTheDocument();
    expect(screen.getByText('Screenshots')).toBeInTheDocument();
    expect(screen.getByText('Tutorials')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    
    // Test with learner role
    store = mockStore({
      auth: {
        isAuthenticated: true,
        user: {
          id: '1',
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          role: 'learner'
        },
        loading: false
      },
      tenant: {
        currentTenant: {
          _id: '1',
          name: 'Test Organization',
          slug: 'test-org',
          settings: {
            theme: 'default',
            customCSS: ''
          }
        },
        loading: false
      }
    });
    
    renderComponent();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('My Courses')).toBeInTheDocument();
    expect(screen.getByText('My Progress')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('displays login and register buttons when not authenticated', () => {
    store = mockStore({
      auth: {
        isAuthenticated: false,
        user: null,
        loading: false
      },
      tenant: {
        currentTenant: null,
        loading: false
      }
    });
    
    renderComponent();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('displays loading spinner when loading', () => {
    store = mockStore({
      auth: {
        isAuthenticated: true,
        user: null,
        loading: true
      },
      tenant: {
        currentTenant: null,
        loading: true
      }
    });
    
    renderComponent();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('adds scrolled class to navbar when scrolled', () => {
    renderComponent();
    
    const navbar = screen.getByTestId('navbar');
    expect(navbar).not.toHaveClass('navbar-scrolled');
    
    // Simulate scroll
    window.scrollY = 100;
    fireEvent.scroll(window);
    
    expect(navbar).toHaveClass('navbar-scrolled');
  });

  it('closes mobile menu when a link is clicked', () => {
    renderComponent();
    
    // Open mobile menu
    const menuButton = screen.getByTestId('fa-bars');
    fireEvent.click(menuButton);
    
    const mobileMenu = screen.getByTestId('mobile-menu');
    expect(mobileMenu).toHaveClass('show');
    
    // Click a link
    const dashboardLink = screen.getByText('Dashboard');
    fireEvent.click(dashboardLink);
    
    expect(mobileMenu).not.toHaveClass('show');
  });

  it('closes sidebar when a link is clicked', () => {
    renderComponent();
    
    // Open sidebar
    const sidebarButton = screen.getByTestId('sidebar-toggle');
    fireEvent.click(sidebarButton);
    
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveClass('show');
    
    // Click a link
    const dashboardLink = screen.getByText('Dashboard');
    fireEvent.click(dashboardLink);
    
    expect(sidebar).not.toHaveClass('show');
  });
});