import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  getTenantAnalytics,
  getUserAnalytics,
  getContentAnalytics
} from '../../actions/analytics';
import Spinner from '../layout/Spinner';

const ResponsiveDashboard = ({
  auth: { user },
  tenant: { currentTenant },
  analytics: { tenantAnalytics, userAnalytics, contentAnalytics, loading },
  getTenantAnalytics,
  getUserAnalytics,
  getContentAnalytics
}) => {
  const [timeRange, setTimeRange] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user && currentTenant) {
      getTenantAnalytics(currentTenant._id, timeRange);
      getUserAnalytics(user._id, timeRange);
      getContentAnalytics(currentTenant._id, timeRange);
    }
  }, [user, currentTenant, timeRange, getTenantAnalytics, getUserAnalytics, getContentAnalytics]);

  const onChangeTimeRange = e => {
    setTimeRange(e.target.value);
  };

  const renderOverviewTab = () => (
    <div className="dashboard-overview">
      <div className="row">
        <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
          <div className="card dashboard-card bg-primary text-white h-100">
            <div className="card-body d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="card-title mb-0">Total Users</h5>
                <i className="fas fa-users fa-2x opacity-75"></i>
              </div>
              <h2 className="mb-0">
                {tenantAnalytics ? tenantAnalytics.totalUsers : '0'}
              </h2>
              <small className="mt-auto">
                <i className="fas fa-arrow-up mr-1"></i>
                {tenantAnalytics ? tenantAnalytics.userGrowth : '0'}% from last month
              </small>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
          <div className="card dashboard-card bg-success text-white h-100">
            <div className="card-body d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="card-title mb-0">Active Courses</h5>
                <i className="fas fa-book-open fa-2x opacity-75"></i>
              </div>
              <h2 className="mb-0">
                {contentAnalytics ? contentAnalytics.totalCourses : '0'}
              </h2>
              <small className="mt-auto">
                <i className="fas fa-arrow-up mr-1"></i>
                {contentAnalytics ? contentAnalytics.courseGrowth : '0'}% from last month
              </small>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
          <div className="card dashboard-card bg-info text-white h-100">
            <div className="card-body d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="card-title mb-0">Presentations</h5>
                <i className="fas fa-presentation fa-2x opacity-75"></i>
              </div>
              <h2 className="mb-0">
                {contentAnalytics ? contentAnalytics.totalPresentations : '0'}
              </h2>
              <small className="mt-auto">
                <i className="fas fa-arrow-up mr-1"></i>
                {contentAnalytics ? contentAnalytics.presentationGrowth : '0'}% from last month
              </small>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
          <div className="card dashboard-card bg-warning text-white h-100">
            <div className="card-body d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="card-title mb-0">Completion Rate</h5>
                <i className="fas fa-chart-line fa-2x opacity-75"></i>
              </div>
              <h2 className="mb-0">
                {tenantAnalytics ? `${tenantAnalytics.completionRate}%` : '0%'}
              </h2>
              <small className="mt-auto">
                <i className="fas fa-arrow-up mr-1"></i>
                {tenantAnalytics ? tenantAnalytics.completionGrowth : '0'}% from last month
              </small>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12 col-lg-8 mb-4">
          <div className="card h-100">
            <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-md-center">
              <h5 className="mb-3 mb-md-0">User Activity</h5>
              <div className="d-flex align-items-center">
                <span className="mr-2">Time Range:</span>
                <select 
                  className="form-control form-control-sm" 
                  value={timeRange} 
                  onChange={onChangeTimeRange}
                  style={{ width: 'auto' }}
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner />
                </div>
              ) : (
                <div className="activity-chart">
                  {/* Chart would go here - using placeholder div */}
                  <div className="chart-placeholder bg-light p-5 text-center rounded">
                    <i className="fas fa-chart-area fa-3x text-muted mb-3"></i>
                    <p className="text-muted">User Activity Chart</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Recent Activity</h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner />
                </div>
              ) : (
                <div className="recent-activity">
                  {userAnalytics && userAnalytics.recentActivity && userAnalytics.recentActivity.length > 0 ? (
                    <ul className="list-group list-group-flush">
                      {userAnalytics.recentActivity.slice(0, 5).map((activity, index) => (
                        <li key={index} className="list-group-item px-0">
                          <div className="d-flex justify-content-between">
                            <div>
                              <h6 className="mb-1">{activity.title}</h6>
                              <small className="text-muted">{activity.description}</small>
                            </div>
                            <small className="text-muted">
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </small>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted text-center py-3">No recent activity</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContentTab = () => (
    <div className="dashboard-content">
      <div className="row">
        <div className="col-12 col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Top Courses</h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner />
                </div>
              ) : (
                <div className="top-courses">
                  {contentAnalytics && contentAnalytics.topCourses && contentAnalytics.topCourses.length > 0 ? (
                    <ul className="list-group list-group-flush">
                      {contentAnalytics.topCourses.slice(0, 5).map((course, index) => (
                        <li key={index} className="list-group-item px-0">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">{course.title}</h6>
                              <div className="progress" style={{ height: '5px' }}>
                                <div 
                                  className="progress-bar bg-primary" 
                                  role="progressbar" 
                                  style={{ width: `${course.completionRate}%` }}
                                  aria-valuenow={course.completionRate} 
                                  aria-valuemin="0" 
                                  aria-valuemax="100"
                                ></div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="badge badge-primary">{course.enrollmentCount}</span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted text-center py-3">No courses found</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Top Presentations</h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner />
                </div>
              ) : (
                <div className="top-presentations">
                  {contentAnalytics && contentAnalytics.topPresentations && contentAnalytics.topPresentations.length > 0 ? (
                    <ul className="list-group list-group-flush">
                      {contentAnalytics.topPresentations.slice(0, 5).map((presentation, index) => (
                        <li key={index} className="list-group-item px-0">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">{presentation.title}</h6>
                              <div className="progress" style={{ height: '5px' }}>
                                <div 
                                  className="progress-bar bg-info" 
                                  role="progressbar" 
                                  style={{ width: `${presentation.completionRate}%` }}
                                  aria-valuenow={presentation.completionRate} 
                                  aria-valuemin="0" 
                                  aria-valuemax="100"
                                ></div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="badge badge-info">{presentation.viewCount}</span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted text-center py-3">No presentations found</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12 col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Top Quizzes</h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner />
                </div>
              ) : (
                <div className="top-quizzes">
                  {contentAnalytics && contentAnalytics.topQuizzes && contentAnalytics.topQuizzes.length > 0 ? (
                    <ul className="list-group list-group-flush">
                      {contentAnalytics.topQuizzes.slice(0, 5).map((quiz, index) => (
                        <li key={index} className="list-group-item px-0">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">{quiz.title}</h6>
                              <div className="progress" style={{ height: '5px' }}>
                                <div 
                                  className="progress-bar bg-success" 
                                  role="progressbar" 
                                  style={{ width: `${quiz.averageScore}%` }}
                                  aria-valuenow={quiz.averageScore} 
                                  aria-valuemin="0" 
                                  aria-valuemax="100"
                                ></div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="badge badge-success">{quiz.attemptCount}</span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted text-center py-3">No quizzes found</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Top Tutorials</h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner />
                </div>
              ) : (
                <div className="top-tutorials">
                  {contentAnalytics && contentAnalytics.topTutorials && contentAnalytics.topTutorials.length > 0 ? (
                    <ul className="list-group list-group-flush">
                      {contentAnalytics.topTutorials.slice(0, 5).map((tutorial, index) => (
                        <li key={index} className="list-group-item px-0">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">{tutorial.title}</h6>
                              <div className="progress" style={{ height: '5px' }}>
                                <div 
                                  className="progress-bar bg-warning" 
                                  role="progressbar" 
                                  style={{ width: `${tutorial.completionRate}%` }}
                                  aria-valuenow={tutorial.completionRate} 
                                  aria-valuemin="0" 
                                  aria-valuemax="100"
                                ></div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="badge badge-warning">{tutorial.viewCount}</span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted text-center py-3">No tutorials found</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="dashboard-users">
      <div className="row">
        <div className="col-12 col-lg-8 mb-4">
          <div className="card h-100">
            <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-md-center">
              <h5 className="mb-3 mb-md-0">User Growth</h5>
              <div className="d-flex align-items-center">
                <span className="mr-2">Time Range:</span>
                <select 
                  className="form-control form-control-sm" 
                  value={timeRange} 
                  onChange={onChangeTimeRange}
                  style={{ width: 'auto' }}
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner />
                </div>
              ) : (
                <div className="user-growth-chart">
                  {/* Chart would go here - using placeholder div */}
                  <div className="chart-placeholder bg-light p-5 text-center rounded">
                    <i className="fas fa-chart-line fa-3x text-muted mb-3"></i>
                    <p className="text-muted">User Growth Chart</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">User Demographics</h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner />
                </div>
              ) : (
                <div className="user-demographics">
                  {tenantAnalytics && tenantAnalytics.userDemographics ? (
                    <>
                      <div className="mb-4">
                        <h6 className="mb-2">Role Distribution</h6>
                        <div className="role-distribution">
                          {tenantAnalytics.userDemographics.roles.map((role, index) => (
                            <div key={index} className="mb-2">
                              <div className="d-flex justify-content-between mb-1">
                                <span>{role.name}</span>
                                <span>{role.percentage}%</span>
                              </div>
                              <div className="progress" style={{ height: '5px' }}>
                                <div 
                                  className="progress-bar bg-primary" 
                                  role="progressbar" 
                                  style={{ width: `${role.percentage}%` }}
                                  aria-valuenow={role.percentage} 
                                  aria-valuemin="0" 
                                  aria-valuemax="100"
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h6 className="mb-2">Activity Levels</h6>
                        <div className="activity-levels">
                          {tenantAnalytics.userDemographics.activityLevels.map((level, index) => (
                            <div key={index} className="mb-2">
                              <div className="d-flex justify-content-between mb-1">
                                <span>{level.name}</span>
                                <span>{level.percentage}%</span>
                              </div>
                              <div className="progress" style={{ height: '5px' }}>
                                <div 
                                  className={`progress-bar bg-${level.color}`} 
                                  role="progressbar" 
                                  style={{ width: `${level.percentage}%` }}
                                  aria-valuenow={level.percentage} 
                                  aria-valuemin="0" 
                                  aria-valuemax="100"
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted text-center py-3">No demographic data available</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Recent Users</h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner />
                </div>
              ) : (
                <div className="recent-users">
                  {tenantAnalytics && tenantAnalytics.recentUsers && tenantAnalytics.recentUsers.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Joined</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tenantAnalytics.recentUsers.slice(0, 10).map((user, index) => (
                            <tr key={index}>
                              <td>{user.firstName} {user.lastName}</td>
                              <td>{user.email}</td>
                              <td>
                                <span className="badge badge-info">{user.role}</span>
                              </td>
                              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                              <td>
                                <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted text-center py-3">No recent users</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="responsive-dashboard">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">Dashboard</h1>
          <div className="d-flex align-items-center">
            <span className="mr-2 d-none d-sm-inline">Time Range:</span>
            <select 
              className="form-control form-control-sm" 
              value={timeRange} 
              onChange={onChangeTimeRange}
              style={{ width: 'auto' }}
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
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
              className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              Users
            </button>
          </li>
        </ul>

        <div className="tab-content">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'content' && renderContentTab()}
          {activeTab === 'users' && renderUsersTab()}
        </div>
      </div>
    </div>
  );
};

ResponsiveDashboard.propTypes = {
  auth: PropTypes.object.isRequired,
  tenant: PropTypes.object.isRequired,
  analytics: PropTypes.object.isRequired,
  getTenantAnalytics: PropTypes.func.isRequired,
  getUserAnalytics: PropTypes.func.isRequired,
  getContentAnalytics: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  tenant: state.tenant,
  analytics: state.analytics
});

export default connect(mapStateToProps, {
  getTenantAnalytics,
  getUserAnalytics,
  getContentAnalytics
})(ResponsiveDashboard);