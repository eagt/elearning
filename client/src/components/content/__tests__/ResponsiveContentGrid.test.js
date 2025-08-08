import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import ResponsiveContentGrid from '../ResponsiveContentGrid';

// Mock the Spinner component
jest.mock('../../layout/Spinner', () => () => <div data-testid="spinner">Loading...</div>);

describe('ResponsiveContentGrid Component', () => {
  const mockItems = [
    {
      _id: '1',
      title: 'Test Course 1',
      description: 'This is a test course description',
      shortDescription: 'Short description',
      thumbnail: '/img/test-thumbnail.jpg',
      isPublished: true,
      modules: [{}, {}],
      enrollmentCount: 10,
      createdAt: '2023-01-01T00:00:00.000Z'
    },
    {
      _id: '2',
      title: 'Test Course 2',
      description: 'This is another test course description',
      shortDescription: 'Another short description',
      thumbnail: '/img/test-thumbnail-2.jpg',
      isPublished: false,
      modules: [{}],
      enrollmentCount: 5,
      createdAt: '2023-01-02T00:00:00.000Z'
    }
  ];

  const mockPagination = {
    page: 1,
    limit: 10,
    total: 2,
    pages: 1
  };

  const mockOnPageChange = jest.fn();
  const mockOnFilterChange = jest.fn();
  const mockOnSortChange = jest.fn();

  const renderComponent = (props = {}) => {
    const defaultProps = {
      items: mockItems,
      loading: false,
      title: 'Test Courses',
      emptyMessage: 'No courses found',
      itemType: 'course',
      showFilters: true,
      showPagination: true,
      pagination: mockPagination,
      onPageChange: mockOnPageChange,
      onFilterChange: mockOnFilterChange,
      onSortChange: mockOnSortChange,
      currentFilters: {},
      currentSort: 'createdAt_desc'
    };

    return render(
      <Router>
        <ResponsiveContentGrid {...defaultProps} {...props} />
      </Router>
    );
  };

  beforeEach(() => {
    // Reset mocks
    mockOnPageChange.mockClear();
    mockOnFilterChange.mockClear();
    mockOnSortChange.mockClear();
  });

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText('Test Courses')).toBeInTheDocument();
  });

  it('displays loading spinner when loading', () => {
    renderComponent({ loading: true });
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('displays empty message when no items', () => {
    renderComponent({ items: [] });
    expect(screen.getByText('No courses found')).toBeInTheDocument();
  });

  it('displays items in grid view by default', () => {
    renderComponent();
    expect(screen.getByText('Test Course 1')).toBeInTheDocument();
    expect(screen.getByText('Test Course 2')).toBeInTheDocument();
    
    // Check for grid view elements
    const gridItems = screen.getAllByTestId('content-card');
    expect(gridItems.length).toBe(2);
  });

  it('displays items in list view when list view is selected', () => {
    renderComponent();
    
    // Switch to list view
    const listButton = screen.getByTestId('list-view-button');
    fireEvent.click(listButton);
    
    expect(screen.getByText('Test Course 1')).toBeInTheDocument();
    expect(screen.getByText('Test Course 2')).toBeInTheDocument();
    
    // Check for list view elements
    const listItems = screen.getAllByTestId('list-group-item');
    expect(listItems.length).toBe(2);
  });

  it('displays search bar and handles search input', () => {
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    expect(searchInput.value).toBe('test search');
  });

  it('handles search form submission', () => {
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText('Search...');
    const searchButton = screen.getByTestId('search-button');
    
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    fireEvent.click(searchButton);
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({ search: 'test search' });
  });

  it('displays sort dropdown and handles sort change', () => {
    renderComponent();
    
    const sortSelect = screen.getByTestId('sort-select');
    fireEvent.change(sortSelect, { target: { value: 'title_asc' } });
    
    expect(mockOnSortChange).toHaveBeenCalledWith('title_asc');
  });

  it('displays filters and handles filter changes', () => {
    renderComponent();
    
    const categoryFilter = screen.getByTestId('category-filter');
    fireEvent.change(categoryFilter, { target: { value: 'technology' } });
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({ category: 'technology' });
    
    const statusFilter = screen.getByTestId('status-filter');
    fireEvent.change(statusFilter, { target: { value: 'published' } });
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({ category: 'technology', status: 'published' });
  });

  it('handles clear filters button', () => {
    renderComponent({
      currentFilters: {
        category: 'technology',
        status: 'published'
      }
    });
    
    const clearButton = screen.getByTestId('clear-filters-button');
    fireEvent.click(clearButton);
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({});
  });

  it('displays pagination and handles page change', () => {
    renderComponent({
      pagination: {
        page: 2,
        limit: 10,
        total: 25,
        pages: 3
      }
    });
    
    const nextPageButton = screen.getByTestId('next-page-button');
    fireEvent.click(nextPageButton);
    
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
    
    const prevPageButton = screen.getByTestId('prev-page-button');
    fireEvent.click(prevPageButton);
    
    expect(mockOnPageChange).toHaveBeenCalledWith(1);
  });

  it('disables pagination buttons at boundaries', () => {
    renderComponent({
      pagination: {
        page: 1,
        limit: 10,
        total: 25,
        pages: 3
      }
    });
    
    const prevPageButton = screen.getByTestId('prev-page-button');
    expect(prevPageButton).toBeDisabled();
    
    const nextPageButton = screen.getByTestId('next-page-button');
    expect(nextPageButton).not.toBeDisabled();
  });

  it('displays correct badges for published and draft items', () => {
    renderComponent();
    
    const publishedBadge = screen.getByText('Published');
    expect(publishedBadge).toHaveClass('badge-success');
    
    const draftBadge = screen.getByText('Draft');
    expect(draftBadge).toHaveClass('badge-warning');
  });

  it('displays view button for each item', () => {
    renderComponent();
    
    const viewButtons = screen.getAllByText('View');
    expect(viewButtons.length).toBe(2);
  });

  it('navigates to item detail page when view button is clicked', () => {
    const { container } = renderComponent();
    
    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);
    
    // Check if navigation occurred (this would require more complex mocking for actual navigation)
    expect(container.innerHTML).toContain('href="/courses/1"');
  });

  it('displays different content for different item types', () => {
    const { rerender } = renderComponent({ itemType: 'course' });
    expect(screen.getByText('Test Course 1')).toBeInTheDocument();
    
    rerender(
      <Router>
        <ResponsiveContentGrid
          items={[
            {
              _id: '1',
              title: 'Test Presentation',
              description: 'This is a test presentation',
              shortDescription: 'Short description',
              thumbnail: '/img/test-thumbnail.jpg',
              isPublished: true,
              slides: [{}, {}],
              viewCount: 15,
              createdAt: '2023-01-01T00:00:00.000Z'
            }
          ]}
          loading={false}
          title="Test Presentations"
          emptyMessage="No presentations found"
          itemType="presentation"
          showFilters={true}
          showPagination={true}
          pagination={mockPagination}
          onPageChange={mockOnPageChange}
          onFilterChange={mockOnFilterChange}
          onSortChange={mockOnSortChange}
          currentFilters={{}}
          currentSort="createdAt_desc"
        />
      </Router>
    );
    
    expect(screen.getByText('Test Presentation')).toBeInTheDocument();
    expect(screen.getByTestId('presentation-icon')).toBeInTheDocument();
  });

  it('hides filters when showFilters is false', () => {
    renderComponent({ showFilters: false });
    
    const filtersCard = screen.queryByTestId('filters-card');
    expect(filtersCard).not.toBeInTheDocument();
  });

  it('hides pagination when showPagination is false', () => {
    renderComponent({ showPagination: false });
    
    const pagination = screen.queryByTestId('pagination');
    expect(pagination).not.toBeInTheDocument();
  });

  it('handles pagination with ellipsis for many pages', () => {
    renderComponent({
      pagination: {
        page: 5,
        limit: 10,
        total: 100,
        pages: 10
      }
    });
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('...')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});