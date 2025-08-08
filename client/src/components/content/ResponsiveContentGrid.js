import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Spinner from '../layout/Spinner';

const ResponsiveContentGrid = ({
  items,
  loading,
  title,
  emptyMessage,
  itemType,
  showFilters = true,
  showPagination = true,
  pagination,
  onPageChange,
  onFilterChange,
  onSortChange,
  currentFilters,
  currentSort
}) => {
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [filters, setFilters] = useState(currentFilters || {});
  const [sort, setSort] = useState(currentSort || 'createdAt_desc');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setFilters(currentFilters || {});
    setSort(currentSort || 'createdAt_desc');
  }, [currentFilters, currentSort]);

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSort(newSort);
    if (onSortChange) {
      onSortChange(newSort);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleFilterChange('search', searchTerm);
  };

  const handlePageChange = (page) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  const renderGridItem = (item) => {
    switch (itemType) {
      case 'course':
        return renderCourseItem(item);
      case 'presentation':
        return renderPresentationItem(item);
      case 'quiz':
        return renderQuizItem(item);
      case 'screenshot':
        return renderScreenshotItem(item);
      case 'tutorial':
        return renderTutorialItem(item);
      default:
        return renderDefaultItem(item);
    }
  };

  const renderListItem = (item) => {
    switch (itemType) {
      case 'course':
        return renderCourseListItem(item);
      case 'presentation':
        return renderPresentationListItem(item);
      case 'quiz':
        return renderQuizListItem(item);
      case 'screenshot':
        return renderScreenshotListItem(item);
      case 'tutorial':
        return renderTutorialListItem(item);
      default:
        return renderDefaultListItem(item);
    }
  };

  const renderCourseItem = (course) => (
    <div key={course._id} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
      <div className="card content-card h-100">
        <div className="card-img-top-wrapper">
          <img 
            src={course.thumbnail || '/img/default-course-thumbnail.jpg'} 
            className="card-img-top" 
            alt={course.title}
          />
          <div className="card-badge">
            <span className={`badge ${course.isPublished ? 'badge-success' : 'badge-warning'}`}>
              {course.isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{course.title}</h5>
          <p className="card-text text-muted small flex-grow-1">
            {course.shortDescription || course.description.substring(0, 100) + '...'}
          </p>
          <div className="d-flex justify-content-between align-items-center mt-auto">
            <div>
              <span className="badge badge-info mr-1">
                <i className="fas fa-book-open mr-1"></i> {course.modules?.length || 0}
              </span>
              <span className="badge badge-primary">
                <i className="fas fa-users mr-1"></i> {course.enrollmentCount || 0}
              </span>
            </div>
            <Link to={`/courses/${course._id}`} className="btn btn-sm btn-primary">
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPresentationItem = (presentation) => (
    <div key={presentation._id} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
      <div className="card content-card h-100">
        <div className="card-img-top-wrapper">
          <img 
            src={presentation.thumbnail || '/img/default-presentation-thumbnail.jpg'} 
            className="card-img-top" 
            alt={presentation.title}
          />
          <div className="card-badge">
            <span className={`badge ${presentation.isPublished ? 'badge-success' : 'badge-warning'}`}>
              {presentation.isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{presentation.title}</h5>
          <p className="card-text text-muted small flex-grow-1">
            {presentation.shortDescription || presentation.description.substring(0, 100) + '...'}
          </p>
          <div className="d-flex justify-content-between align-items-center mt-auto">
            <div>
              <span className="badge badge-info mr-1">
                <i className="fas fa-presentation mr-1"></i> {presentation.slides?.length || 0}
              </span>
              <span className="badge badge-primary">
                <i className="fas fa-eye mr-1"></i> {presentation.viewCount || 0}
              </span>
            </div>
            <Link to={`/presentations/${presentation._id}`} className="btn btn-sm btn-primary">
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuizItem = (quiz) => (
    <div key={quiz._id} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
      <div className="card content-card h-100">
        <div className="card-img-top-wrapper">
          <div className="card-img-top bg-light d-flex align-items-center justify-content-center" style={{ height: '150px' }}>
            <i className="fas fa-question-circle fa-3x text-primary"></i>
          </div>
          <div className="card-badge">
            <span className={`badge ${quiz.isPublished ? 'badge-success' : 'badge-warning'}`}>
              {quiz.isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{quiz.title}</h5>
          <p className="card-text text-muted small flex-grow-1">
            {quiz.shortDescription || quiz.description.substring(0, 100) + '...'}
          </p>
          <div className="d-flex justify-content-between align-items-center mt-auto">
            <div>
              <span className="badge badge-info mr-1">
                <i className="fas fa-question mr-1"></i> {quiz.questions?.length || 0}
              </span>
              <span className="badge badge-primary">
                <i className="fas fa-check-circle mr-1"></i> {quiz.attemptCount || 0}
              </span>
            </div>
            <Link to={`/quizzes/${quiz._id}`} className="btn btn-sm btn-primary">
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const renderScreenshotItem = (screenshot) => (
    <div key={screenshot._id} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
      <div className="card content-card h-100">
        <div className="card-img-top-wrapper">
          <img 
            src={screenshot.imageUrl} 
            className="card-img-top" 
            alt={screenshot.title}
          />
          <div className="card-badge">
            <span className={`badge ${screenshot.isPublic ? 'badge-success' : 'badge-warning'}`}>
              {screenshot.isPublic ? 'Public' : 'Private'}
            </span>
          </div>
        </div>
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{screenshot.title}</h5>
          <p className="card-text text-muted small flex-grow-1">
            {screenshot.description.substring(0, 100) + '...'}
          </p>
          <div className="d-flex justify-content-between align-items-center mt-auto">
            <div>
              <span className="badge badge-info mr-1">
                <i className="fas fa-comment mr-1"></i> {screenshot.annotations?.length || 0}
              </span>
              <span className="badge badge-primary">
                <i className="fas fa-eye mr-1"></i> {screenshot.viewCount || 0}
              </span>
            </div>
            <Link to={`/screenshots/${screenshot._id}`} className="btn btn-sm btn-primary">
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTutorialItem = (tutorial) => (
    <div key={tutorial._id} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
      <div className="card content-card h-100">
        <div className="card-img-top-wrapper">
          <img 
            src={tutorial.thumbnail || '/img/default-tutorial-thumbnail.jpg'} 
            className="card-img-top" 
            alt={tutorial.title}
          />
          <div className="card-badge">
            <span className={`badge ${tutorial.isPublished ? 'badge-success' : 'badge-warning'}`}>
              {tutorial.isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{tutorial.title}</h5>
          <p className="card-text text-muted small flex-grow-1">
            {tutorial.shortDescription || tutorial.description.substring(0, 100) + '...'}
          </p>
          <div className="d-flex justify-content-between align-items-center mt-auto">
            <div>
              <span className="badge badge-info mr-1">
                <i className="fas fa-images mr-1"></i> {tutorial.steps?.length || 0}
              </span>
              <span className="badge badge-primary">
                <i className="fas fa-eye mr-1"></i> {tutorial.viewCount || 0}
              </span>
            </div>
            <Link to={`/tutorials/${tutorial._id}`} className="btn btn-sm btn-primary">
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDefaultItem = (item) => (
    <div key={item._id} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
      <div className="card content-card h-100">
        <div className="card-img-top-wrapper">
          <div className="card-img-top bg-light d-flex align-items-center justify-content-center" style={{ height: '150px' }}>
            <i className="fas fa-file fa-3x text-primary"></i>
          </div>
        </div>
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{item.title}</h5>
          <p className="card-text text-muted small flex-grow-1">
            {item.description.substring(0, 100) + '...'}
          </p>
          <div className="d-flex justify-content-between align-items-center mt-auto">
            <div>
              <span className="badge badge-primary">
                <i className="fas fa-eye mr-1"></i> {item.viewCount || 0}
              </span>
            </div>
            <Link to={`/${itemType}s/${item._id}`} className="btn btn-sm btn-primary">
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCourseListItem = (course) => (
    <div key={course._id} className="list-group-item">
      <div className="d-flex flex-column flex-md-row">
        <div className="list-item-image mr-md-3 mb-2 mb-md-0">
          <img 
            src={course.thumbnail || '/img/default-course-thumbnail.jpg'} 
            className="img-fluid rounded" 
            alt={course.title}
            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
          />
        </div>
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h5 className="mb-1">{course.title}</h5>
              <p className="mb-1 text-muted">{course.shortDescription || course.description.substring(0, 150) + '...'}</p>
              <div>
                <span className={`badge ${course.isPublished ? 'badge-success' : 'badge-warning'} mr-2`}>
                  {course.isPublished ? 'Published' : 'Draft'}
                </span>
                <span className="badge badge-info mr-2">
                  <i className="fas fa-book-open mr-1"></i> {course.modules?.length || 0} modules
                </span>
                <span className="badge badge-primary">
                  <i className="fas fa-users mr-1"></i> {course.enrollmentCount || 0} enrolled
                </span>
              </div>
            </div>
            <div className="d-flex flex-column align-items-end">
              <small className="text-muted mb-2">
                {new Date(course.createdAt).toLocaleDateString()}
              </small>
              <Link to={`/courses/${course._id}`} className="btn btn-sm btn-primary">
                View
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPresentationListItem = (presentation) => (
    <div key={presentation._id} className="list-group-item">
      <div className="d-flex flex-column flex-md-row">
        <div className="list-item-image mr-md-3 mb-2 mb-md-0">
          <img 
            src={presentation.thumbnail || '/img/default-presentation-thumbnail.jpg'} 
            className="img-fluid rounded" 
            alt={presentation.title}
            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
          />
        </div>
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h5 className="mb-1">{presentation.title}</h5>
              <p className="mb-1 text-muted">{presentation.shortDescription || presentation.description.substring(0, 150) + '...'}</p>
              <div>
                <span className={`badge ${presentation.isPublished ? 'badge-success' : 'badge-warning'} mr-2`}>
                  {presentation.isPublished ? 'Published' : 'Draft'}
                </span>
                <span className="badge badge-info mr-2">
                  <i className="fas fa-presentation mr-1"></i> {presentation.slides?.length || 0} slides
                </span>
                <span className="badge badge-primary">
                  <i className="fas fa-eye mr-1"></i> {presentation.viewCount || 0} views
                </span>
              </div>
            </div>
            <div className="d-flex flex-column align-items-end">
              <small className="text-muted mb-2">
                {new Date(presentation.createdAt).toLocaleDateString()}
              </small>
              <Link to={`/presentations/${presentation._id}`} className="btn btn-sm btn-primary">
                View
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuizListItem = (quiz) => (
    <div key={quiz._id} className="list-group-item">
      <div className="d-flex flex-column flex-md-row">
        <div className="list-item-image mr-md-3 mb-2 mb-md-0 d-flex align-items-center justify-content-center bg-light rounded" 
             style={{ width: '80px', height: '80px' }}>
          <i className="fas fa-question-circle fa-2x text-primary"></i>
        </div>
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h5 className="mb-1">{quiz.title}</h5>
              <p className="mb-1 text-muted">{quiz.shortDescription || quiz.description.substring(0, 150) + '...'}</p>
              <div>
                <span className={`badge ${quiz.isPublished ? 'badge-success' : 'badge-warning'} mr-2`}>
                  {quiz.isPublished ? 'Published' : 'Draft'}
                </span>
                <span className="badge badge-info mr-2">
                  <i className="fas fa-question mr-1"></i> {quiz.questions?.length || 0} questions
                </span>
                <span className="badge badge-primary">
                  <i className="fas fa-check-circle mr-1"></i> {quiz.attemptCount || 0} attempts
                </span>
              </div>
            </div>
            <div className="d-flex flex-column align-items-end">
              <small className="text-muted mb-2">
                {new Date(quiz.createdAt).toLocaleDateString()}
              </small>
              <Link to={`/quizzes/${quiz._id}`} className="btn btn-sm btn-primary">
                View
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderScreenshotListItem = (screenshot) => (
    <div key={screenshot._id} className="list-group-item">
      <div className="d-flex flex-column flex-md-row">
        <div className="list-item-image mr-md-3 mb-2 mb-md-0">
          <img 
            src={screenshot.imageUrl} 
            className="img-fluid rounded" 
            alt={screenshot.title}
            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
          />
        </div>
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h5 className="mb-1">{screenshot.title}</h5>
              <p className="mb-1 text-muted">{screenshot.description.substring(0, 150) + '...'}</p>
              <div>
                <span className={`badge ${screenshot.isPublic ? 'badge-success' : 'badge-warning'} mr-2`}>
                  {screenshot.isPublic ? 'Public' : 'Private'}
                </span>
                <span className="badge badge-info mr-2">
                  <i className="fas fa-comment mr-1"></i> {screenshot.annotations?.length || 0} annotations
                </span>
                <span className="badge badge-primary">
                  <i className="fas fa-eye mr-1"></i> {screenshot.viewCount || 0} views
                </span>
              </div>
            </div>
            <div className="d-flex flex-column align-items-end">
              <small className="text-muted mb-2">
                {new Date(screenshot.createdAt).toLocaleDateString()}
              </small>
              <Link to={`/screenshots/${screenshot._id}`} className="btn btn-sm btn-primary">
                View
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTutorialListItem = (tutorial) => (
    <div key={tutorial._id} className="list-group-item">
      <div className="d-flex flex-column flex-md-row">
        <div className="list-item-image mr-md-3 mb-2 mb-md-0">
          <img 
            src={tutorial.thumbnail || '/img/default-tutorial-thumbnail.jpg'} 
            className="img-fluid rounded" 
            alt={tutorial.title}
            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
          />
        </div>
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h5 className="mb-1">{tutorial.title}</h5>
              <p className="mb-1 text-muted">{tutorial.shortDescription || tutorial.description.substring(0, 150) + '...'}</p>
              <div>
                <span className={`badge ${tutorial.isPublished ? 'badge-success' : 'badge-warning'} mr-2`}>
                  {tutorial.isPublished ? 'Published' : 'Draft'}
                </span>
                <span className="badge badge-info mr-2">
                  <i className="fas fa-images mr-1"></i> {tutorial.steps?.length || 0} steps
                </span>
                <span className="badge badge-primary">
                  <i className="fas fa-eye mr-1"></i> {tutorial.viewCount || 0} views
                </span>
              </div>
            </div>
            <div className="d-flex flex-column align-items-end">
              <small className="text-muted mb-2">
                {new Date(tutorial.createdAt).toLocaleDateString()}
              </small>
              <Link to={`/tutorials/${tutorial._id}`} className="btn btn-sm btn-primary">
                View
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDefaultListItem = (item) => (
    <div key={item._id} className="list-group-item">
      <div className="d-flex flex-column flex-md-row">
        <div className="list-item-image mr-md-3 mb-2 mb-md-0 d-flex align-items-center justify-content-center bg-light rounded" 
             style={{ width: '80px', height: '80px' }}>
          <i className="fas fa-file fa-2x text-primary"></i>
        </div>
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h5 className="mb-1">{item.title}</h5>
              <p className="mb-1 text-muted">{item.description.substring(0, 150) + '...'}</p>
              <div>
                <span className="badge badge-primary">
                  <i className="fas fa-eye mr-1"></i> {item.viewCount || 0} views
                </span>
              </div>
            </div>
            <div className="d-flex flex-column align-items-end">
              <small className="text-muted mb-2">
                {new Date(item.createdAt).toLocaleDateString()}
              </small>
              <Link to={`/${itemType}s/${item._id}`} className="btn btn-sm btn-primary">
                View
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPagination = () => {
    if (!showPagination || !pagination) return null;

    const { page, limit, total, pages } = pagination;
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(pages, page + 2);

    return (
      <nav aria-label="Content pagination" className="mt-4">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              <i className="fas fa-chevron-left"></i>
              <span className="sr-only">Previous</span>
            </button>
          </li>
          
          {startPage > 1 && (
            <li className="page-item">
              <button className="page-link" onClick={() => handlePageChange(1)}>
                1
              </button>
            </li>
          )}
          
          {startPage > 2 && (
            <li className="page-item disabled">
              <span className="page-link">...</span>
            </li>
          )}
          
          {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(pageNum => (
            <li key={pageNum} className={`page-item ${page === pageNum ? 'active' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </button>
            </li>
          ))}
          
          {endPage < pages - 1 && (
            <li className="page-item disabled">
              <span className="page-link">...</span>
            </li>
          )}
          
          {endPage < pages && (
            <li className="page-item">
              <button className="page-link" onClick={() => handlePageChange(pages)}>
                {pages}
              </button>
            </li>
          )}
          
          <li className={`page-item ${page === pages ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => handlePageChange(page + 1)}
              disabled={page === pages}
            >
              <i className="fas fa-chevron-right"></i>
              <span className="sr-only">Next</span>
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="responsive-content-grid">
      <div className="container-fluid">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <h2 className="h4 mb-3 mb-md-0">{title}</h2>
          
          <div className="d-flex flex-column flex-md-row align-items-md-center">
            <div className="mb-2 mb-md-0 mr-md-2">
              <form onSubmit={handleSearchSubmit} className="form-inline">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <div className="input-group-append">
                    <button className="btn btn-outline-primary" type="submit">
                      <i className="fas fa-search"></i>
                    </button>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="d-flex">
              <div className="btn-group mr-2" role="group">
                <button
                  type="button"
                  className={`btn btn-outline-primary ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <i className="fas fa-th"></i>
                </button>
                <button
                  type="button"
                  className={`btn btn-outline-primary ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <i className="fas fa-list"></i>
                </button>
              </div>
              
              <div className="form-group mb-0">
                <select
                  className="form-control form-control-sm"
                  value={sort}
                  onChange={handleSortChange}
                >
                  <option value="createdAt_desc">Newest First</option>
                  <option value="createdAt_asc">Oldest First</option>
                  <option value="title_asc">Title (A-Z)</option>
                  <option value="title_desc">Title (Z-A)</option>
                  <option value="viewCount_desc">Most Viewed</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {showFilters && (
          <div className="card mb-4">
            <div className="card-body">
              <div className="row">
                <div className="col-12 col-md-3 mb-3 mb-md-0">
                  <div className="form-group">
                    <label htmlFor="categoryFilter">Category</label>
                    <select
                      className="form-control form-control-sm"
                      id="categoryFilter"
                      value={filters.category || ''}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                    >
                      <option value="">All Categories</option>
                      <option value="general">General</option>
                      <option value="business">Business</option>
                      <option value="technology">Technology</option>
                      <option value="education">Education</option>
                      <option value="health">Health</option>
                    </select>
                  </div>
                </div>
                
                <div className="col-12 col-md-3 mb-3 mb-md-0">
                  <div className="form-group">
                    <label htmlFor="statusFilter">Status</label>
                    <select
                      className="form-control form-control-sm"
                      id="statusFilter"
                      value={filters.status || ''}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                      <option value="">All Status</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>
                
                <div className="col-12 col-md-3 mb-3 mb-md-0">
                  <div className="form-group">
                    <label htmlFor="dateFilter">Date Range</label>
                    <select
                      className="form-control form-control-sm"
                      id="dateFilter"
                      value={filters.dateRange || ''}
                      onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    >
                      <option value="">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                    </select>
                  </div>
                </div>
                
                <div className="col-12 col-md-3 d-flex align-items-end">
                  <button
                    className="btn btn-sm btn-outline-secondary w-100"
                    onClick={() => {
                      setFilters({});
                      setSearchTerm('');
                      if (onFilterChange) {
                        onFilterChange({});
                      }
                    }}
                  >
                    <i className="fas fa-times mr-1"></i> Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {items && items.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <div className="row">
                {items.map(item => renderGridItem(item))}
              </div>
            ) : (
              <div className="list-group">
                {items.map(item => renderListItem(item))}
              </div>
            )}
            
            {renderPagination()}
          </>
        ) : (
          <div className="text-center py-5">
            <i className="fas fa-folder-open fa-3x text-muted mb-3"></i>
            <h5 className="text-muted">{emptyMessage || 'No content found'}</h5>
            <p className="text-muted">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>
    </div>
  );
};

ResponsiveContentGrid.propTypes = {
  items: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  emptyMessage: PropTypes.string,
  itemType: PropTypes.string.isRequired,
  showFilters: PropTypes.bool,
  showPagination: PropTypes.bool,
  pagination: PropTypes.object,
  onPageChange: PropTypes.func,
  onFilterChange: PropTypes.func,
  onSortChange: PropTypes.func,
  currentFilters: PropTypes.object,
  currentSort: PropTypes.string
};

export default ResponsiveContentGrid;