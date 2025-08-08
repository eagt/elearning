import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  getCourses,
  getPresentations,
  getQuizzes,
  getTutorials,
  getScreenshots
} from '../../actions/content';
import {
  getContentEngagement,
  getUserStats,
  getContentStats
} from '../../actions/analytics';
import { setAlert } from '../../actions/alert';
import Spinner from '../layout/Spinner';

const CreatorDashboard = ({
  auth,
  content,
  analytics,
  getCourses,
  getPresentations,
  getQuizzes,
  getTutorials,
  getScreenshots,
  getContentEngagement,
  getUserStats,
  getContentStats,
  setAlert,
  history
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30');
  const [selectedContent, setSelectedContent] = useState(null);
  const [showContentDetails, setShowContentDetails] = useState(false);

  useEffect(() => {
    // Load content data
    loadContentData();
    
    // Load analytics data
    loadAnalyticsData();
  }, [timeRange]);

  const loadContentData = () => {
    getCourses();
    getPresentations();
    getQuizzes();
    getTutorials();
    getScreenshots();
  };

  const loadAnalyticsData = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));
    
    getContentEngagement({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
    
    getUserStats({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
  };

  const handleContentSelect = (content, type) => {
    setSelectedContent({ ...content, type });
    setShowContentDetails(true);
    
    // Load content stats
    getContentStats(type, content._id);
  };

  const handleCloseContentDetails = () => {
    setShowContentDetails(false);
    setSelectedContent(null);
  };

  const renderOverview = () => {
    if (content.loading || analytics.loading) {
      return <Spinner />;
    }

    const totalContent = [
      ...(content.courses || []),
      ...(content.presentations || []),
      ...(content.quizzes || []),
      ...(content.tutorials || []),
      ...(content.screenshots || [])
    ];

    const publishedContent = totalContent.filter(item => item.isPublished);
    const featuredContent = totalContent.filter(item => item.isFeatured);

    return (
      <div className="dashboard-overview">
        <div className="row mb-4">
          <div className="col-md-3 mb-4">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <h5 className="card-title">Total Content</h5>
                <h2 className="card-text">{totalContent.length}</h2>
                <p className="card-text">
                  {publishedContent.length} published
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-4">
            <div className="card bg-info text-white">
              <div className="card-body">
                <h5 className="card-title">Courses</h5>
                <h2 className="card-text">{content.courses?.length || 0}</h2>
                <p className="card-text">
                  {content.courses?.filter(c => c.isPublished).length || 0} published
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-4">
            <div className="card bg-success text-white">
              <div className="card-body">
                <h5 className="card-title">Presentations</h5>
                <h2 className="card-text">{content.presentations?.length || 0}</h2>
                <p className="card-text">
                  {content.presentations?.filter(p => p.isPublished).length || 0} published
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-4">
            <div className="card bg-warning text-white">
              <div className="card-body">
                <h5 className="card-title">Quizzes</h5>
                <h2 className="card-text">{content.quizzes?.length || 0}</h2>
                <p className="card-text">
                  {content.quizzes?.filter(q => q.isPublished).length || 0} published
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-6 mb-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">User Engagement</h5>
              </div>
              <div className="card-body">
                {analytics.userStats ? (
                  <div className="row text-center">
                    <div className="col-4">
                      <h3>{analytics.userStats.totalUsers}</h3>
                      <p className="text-muted">Total Users</p>
                    </div>
                    <div className="col-4">
                      <h3>{analytics.userStats.activeUsers}</h3>
                      <p className="text-muted">Active Users</p>
                    </div>
                    <div className="col-4">
                      <h3>{Math.round(analytics.userStats.averageTimeSpent / 60)}m</h3>
                      <p className="text-muted">Avg. Time</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted">No user data available</p>
                )}
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Content Performance</h5>
              </div>
              <div className="card-body">
                {analytics.userStats ? (
                  <div className="row text-center">
                    <div className="col-4">
                      <h3>{analytics.userStats.contentViews}</h3>
                      <p className="text-muted">Total Views</p>
                    </div>
                    <div className="col-4">
                      <h3>{analytics.userStats.contentCompletions}</h3>
                      <p className="text-muted">Completions</p>
                    </div>
                    <div className="col-4">
                      <h3>
                        {analytics.userStats.contentViews > 0 
                          ? Math.round((analytics.userStats.contentCompletions / analytics.userStats.contentViews) * 100) 
                          : 0}%
                      </h3>
                      <p className="text-muted">Completion Rate</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted">No content data available</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Top Content by Views</h5>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setActiveTab('content')}
                >
                  View All
                </button>
              </div>
              <div className="card-body">
                {analytics.userStats && analytics.userStats.topContent && analytics.userStats.topContent.length > 0 ? (
                  <div className="list-group">
                    {analytics.userStats.topContent.slice(0, 5).map((item, index) => (
                      <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{item.content?.title || 'Unknown Content'}</h6>
                          <small className="text-muted">
                            {item.contentType} • {item.views} views
                          </small>
                        </div>
                        <span className="badge bg-primary">{index + 1}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted">No content data available</p>
                )}
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-4">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Content</h5>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => history.push('/content-management')}
                >
                  Manage Content
                </button>
              </div>
              <div className="card-body">
                {totalContent.length > 0 ? (
                  <div className="list-group">
                    {totalContent
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .slice(0, 5)
                      .map((item, index) => (
                        <div 
                          key={index} 
                          className="list-group-item d-flex justify-content-between align-items-center"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleContentSelect(item, 
                            item.title ? (item.slides ? 'presentation' : 'course') : 
                            item.questions ? 'quiz' : item.steps ? 'tutorial' : 'screenshot'
                          )}
                        >
                          <div>
                            <h6 className="mb-1">{item.title}</h6>
                            <small className="text-muted">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </small>
                          </div>
                          <span className={`badge ${
                            item.isPublished ? 'bg-success' : 'bg-secondary'
                          }`}>
                            {item.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-center text-muted">No content available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (content.loading) {
      return <Spinner />;
    }

    const allContent = [
      ...(content.courses || []).map(item => ({ ...item, type: 'course' })),
      ...(content.presentations || []).map(item => ({ ...item, type: 'presentation' })),
      ...(content.quizzes || []).map(item => ({ ...item, type: 'quiz' })),
      ...(content.tutorials || []).map(item => ({ ...item, type: 'tutorial' })),
      ...(content.screenshots || []).map(item => ({ ...item, type: 'screenshot' }))
    ];

    return (
      <div className="dashboard-content">
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Content Management</h5>
            <div>
              <button 
                className="btn btn-sm btn-outline-primary mr-2"
                onClick={() => history.push('/content-management')}
              >
                Manage All Content
              </button>
              <button 
                className="btn btn-sm btn-primary"
                onClick={() => history.push('/content-management?create=true')}
              >
                Create New
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Views</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allContent
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 10)
                    .map((item, index) => (
                      <tr key={index}>
                        <td>
                          <a 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              handleContentSelect(item, item.type);
                            }}
                          >
                            {item.title}
                          </a>
                          {item.isFeatured && <span className="badge badge-warning ml-2">Featured</span>}
                        </td>
                        <td>
                          <span className={`badge ${
                            item.type === 'course' ? 'bg-primary' :
                            item.type === 'presentation' ? 'bg-info' :
                            item.type === 'quiz' ? 'bg-success' :
                            item.type === 'tutorial' ? 'bg-warning' :
                            'bg-secondary'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${item.isPublished ? 'bg-success' : 'bg-secondary'}`}>
                            {item.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td>{item.viewCount || 0}</td>
                        <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="btn-group">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleContentSelect(item, item.type)}
                            >
                              <i className="fas fa-chart-bar"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => history.push(`/${item.type}s/${item._id}/edit`)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => history.push(`/${item.type}s/${item._id}`)}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => {
    if (analytics.loading) {
      return <Spinner />;
    }

    return (
      <div className="dashboard-analytics">
        <div className="row mb-4">
          <div className="col-md-6 mb-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">User Statistics</h5>
              </div>
              <div className="card-body">
                {analytics.userStats ? (
                  <div>
                    <div className="row mb-3">
                      <div className="col-6">
                        <div className="card bg-light">
                          <div className="card-body text-center">
                            <h5 className="card-title">Total Users</h5>
                            <p className="card-text">{analytics.userStats.totalUsers}</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="card bg-light">
                          <div className="card-body text-center">
                            <h5 className="card-title">Active Users</h5>
                            <p className="card-text">{analytics.userStats.activeUsers}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <h6>User Distribution by Role</h6>
                    <div className="mb-3">
                      {Object.entries(analytics.userStats.userDistribution.byRole).map(([role, count]) => (
                        <div key={role} className="d-flex justify-content-between mb-1">
                          <span>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                          <span>{count}</span>
                        </div>
                      ))}
                    </div>
                    
                    <h6>User Distribution by Status</h6>
                    <div>
                      {Object.entries(analytics.userStats.userDistribution.byStatus).map(([status, count]) => (
                        <div key={status} className="d-flex justify-content-between mb-1">
                          <span>{status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}</span>
                          <span>{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted">No user data available</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="col-md-6 mb-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Content Engagement</h5>
              </div>
              <div className="card-body">
                {analytics.contentEngagement && analytics.contentEngagement.length > 0 ? (
                  <div>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Content</th>
                            <th>Views</th>
                            <th>Completions</th>
                            <th>Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.contentEngagement.slice(0, 5).map((item, index) => (
                            <tr key={index}>
                              <td>{item.contentId?.title || 'Unknown'}</td>
                              <td>{item.views}</td>
                              <td>{item.completions}</td>
                              <td>
                                {item.views > 0 
                                  ? Math.round((item.completions / item.views) * 100) + '%' 
                                  : '0%'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted">No engagement data available</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Top Content</h5>
          </div>
          <div className="card-body">
            {analytics.userStats && analytics.userStats.topContent && analytics.userStats.topContent.length > 0 ? (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Views</th>
                      <th>Completions</th>
                      <th>Completion Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.userStats.topContent.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <span className="badge bg-primary">{index + 1}</span>
                        </td>
                        <td>{item.content?.title || 'Unknown Content'}</td>
                        <td>
                          <span className={`badge ${
                            item.contentType === 'course' ? 'bg-primary' :
                            item.contentType === 'presentation' ? 'bg-info' :
                            item.contentType === 'quiz' ? 'bg-success' :
                            item.contentType === 'tutorial' ? 'bg-warning' :
                            'bg-secondary'
                          }`}>
                            {item.contentType}
                          </span>
                        </td>
                        <td>{item.views}</td>
                        <td>{item.completions || 0}</td>
                        <td>
                          {item.views > 0 
                            ? Math.round((item.completions / item.views) * 100) + '%' 
                            : '0%'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-muted">No content data available</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderContentDetails = () => {
    if (!selectedContent || !analytics.contentStats) {
      return null;
    }

    return (
      <div className={`modal ${showContentDetails ? 'd-block' : ''}`} tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {selectedContent.title} - Analytics
              </h5>
              <button type="button" className="close" onClick={handleCloseContentDetails}>
                <span>&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="row mb-4">
                <div className="col-md-3 mb-3">
                  <div className="card bg-primary text-white">
                    <div className="card-body text-center">
                      <h5 className="card-title">Views</h5>
                      <p className="card-text">{analytics.contentStats.totalViews}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="card bg-info text-white">
                    <div className="card-body text-center">
                      <h5 className="card-title">Unique Views</h5>
                      <p className="card-text">{analytics.contentStats.uniqueViews}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="card bg-success text-white">
                    <div className="card-body text-center">
                      <h5 className="card-title">Completions</h5>
                      <p className="card-text">{analytics.contentStats.completions}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="card bg-warning text-white">
                    <div className="card-body text-center">
                      <h5 className="card-title">Completion Rate</h5>
                      <p className="card-text">
                        {analytics.contentStats.totalViews > 0 
                          ? Math.round((analytics.contentStats.completions / analytics.contentStats.totalViews) * 100) + '%' 
                          : '0%'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-4">
                  <div className="card">
                    <div className="card-header">
                      <h6 className="mb-0">Average Progress</h6>
                    </div>
                    <div className="card-body">
                      <div className="progress" style={{ height: '25px' }}>
                        <div 
                          className="progress-bar" 
                          role="progressbar" 
                          style={{ width: `${analytics.contentStats.averageProgress}%` }}
                          aria-valuenow={analytics.contentStats.averageProgress} 
                          aria-valuemin="0" 
                          aria-valuemax="100"
                        >
                          {Math.round(analytics.contentStats.averageProgress)}%
                        </div>
                      </div>
                      <p className="text-center mt-2">
                        Average time spent: {Math.floor(analytics.contentStats.averageTimeSpent / 60)}m {Math.floor(analytics.contentStats.averageTimeSpent % 60)}s
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6 mb-4">
                  <div className="card">
                    <div className="card-header">
                      <h6 className="mb-0">Drop-off Points</h6>
                    </div>
                    <div className="card-body">
                      {analytics.contentStats.dropOffPoints && analytics.contentStats.dropOffPoints.length > 0 ? (
                        <div className="list-group">
                          {analytics.contentStats.dropOffPoints.slice(0, 3).map((point, index) => (
                            <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                              <span>{point.point}</span>
                              <span className="badge bg-danger">{point.count}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted">No significant drop-off points</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">User Progress Details</h6>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Status</th>
                          <th>Progress</th>
                          <th>Time Spent</th>
                          <th>Last Accessed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.contentStats.userProgress && analytics.contentStats.userProgress.length > 0 ? (
                          analytics.contentStats.userProgress
                            .sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed))
                            .slice(0, 10)
                            .map((progress, index) => (
                              <tr key={index}>
                                <td>{progress.userName}</td>
                                <td>
                                  <span className={`badge ${
                                    progress.status === 'completed' ? 'bg-success' :
                                    progress.status === 'in-progress' ? 'bg-warning' :
                                    'bg-secondary'
                                  }`}>
                                    {progress.status}
                                  </span>
                                </td>
                                <td>
                                  <div className="progress" style={{ height: '15px' }}>
                                    <div 
                                      className="progress-bar" 
                                      role="progressbar" 
                                      style={{ width: `${progress.progress}%` }}
                                      aria-valuenow={progress.progress} 
                                      aria-valuemin="0" 
                                      aria-valuemax="100"
                                    ></div>
                                  </div>
                                </td>
                                <td>
                                  {Math.floor(progress.timeSpent / 3600)}h {Math.floor((progress.timeSpent % 3600) / 60)}m
                                </td>
                                <td>{new Date(progress.lastAccessed).toLocaleDateString()}</td>
                              </tr>
                            ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="text-center text-muted">No user progress data available</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleCloseContentDetails}>
                Close
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => {
                  handleCloseContentDetails();
                  history.push(`/${selectedContent.type}s/${selectedContent._id}/edit`);
                }}
              >
                Edit Content
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="creator-dashboard">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3">Creator Dashboard</h1>
          <div className="form-group d-flex align-items-center mb-0">
            <label htmlFor="timeRange" className="mr-2 mb-0">Time Range:</label>
            <select 
              className="form-control" 
              id="timeRange"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>

        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'content' ? 'active' : ''}`}
              onClick={() => setActiveTab('content')}
            >
              Content
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
          </li>
        </ul>

        <div className="tab-content">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'content' && renderContent()}
          {activeTab === 'analytics' && renderAnalytics()}
        </div>
      </div>
      
      {renderContentDetails()}
    </div>
  );
};

CreatorDashboard.propTypes = {
  auth: PropTypes.object.isRequired,
  content: PropTypes.object.isRequired,
  analytics: PropTypes.object.isRequired,
  getCourses: PropTypes.func.isRequired,
  getPresentations: PropTypes.func.isRequired,
  getQuizzes: PropTypes.func.isRequired,
  getTutorials: PropTypes.func.isRequired,
  getScreenshots: PropTypes.func.isRequired,
  getContentEngagement: PropTypes.func.isRequired,
  getUserStats: PropTypes.func.isRequired,
  getContentStats: PropTypes.func.isRequired,
  setAlert: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  content: {
    courses: state.course.courses,
    presentations: state.presentation.presentations,
    quizzes: state.quiz.quizzes,
    tutorials: state.tutorial.tutorials,
    screenshots: state.screenshot.screenshots,
    loading: state.course.loading || state.presentation.loading || 
             state.quiz.loading || state.tutorial.loading || state.screenshot.loading
  },
  analytics: state.analytics
});

export default connect(mapStateToProps, {
  getCourses,
  getPresentations,
  getQuizzes,
  getTutorials,
  getScreenshots,
  getContentEngagement,
  getUserStats,
  getContentStats,
  setAlert
})(withRouter(CreatorDashboard));