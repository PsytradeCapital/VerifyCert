import React, { useState, useMemo, useCallback } from 'react';
import { Certificate } from '../../CertificateCard';
import CertificateCard from '../../CertificateCard';
import { Button } from '../Button/Button';
import { Select } from '../Select';

export interface FilterOptions {
  search: string;
  status: 'all' | 'valid' | 'invalid';
  dateRange: 'all' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  institution: string;
  course: string;
  sortBy: 'date' | 'name' | 'course' | 'institution';
  sortOrder: 'asc' | 'desc';
  customDateStart?: Date;
  customDateEnd?: Date;
}

interface CertificateListProps {
  certificates: Certificate[];
  isLoading?: boolean;
  onCertificateAction?: (action: string, certificate: Certificate) => void;
  showBulkActions?: boolean;
  className?: string;
}

const defaultFilters: FilterOptions = {
  search: '',
  status: 'all',
  dateRange: 'all',
  institution: '',
  course: '',
  sortBy: 'date',
  sortOrder: 'desc',
};

export default function CertificateList({
  certificates,
  isLoading = false,
  onCertificateAction,
  showBulkActions = false,
  className = '',
}: CertificateListProps) {
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [selectedCertificates, setSelectedCertificates] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Get unique values for filter dropdowns
  const uniqueInstitutions = useMemo(() => {
    const institutions = [...new Set(certificates.map(cert => cert.institutionName))];
    return institutions.sort();
  }, [certificates]);

  const uniqueCourses = useMemo(() => {
    const courses = [...new Set(certificates.map(cert => cert.courseName))];
    return courses.sort();
  }, [certificates]);

  // Filter and sort certificates
  const filteredCertificates = useMemo(() => {
    let filtered = [...certificates];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(cert =>
        cert.recipientName.toLowerCase().includes(searchTerm) ||
        cert.courseName.toLowerCase().includes(searchTerm) ||
        cert.institutionName.toLowerCase().includes(searchTerm) ||
        cert.tokenId.toLowerCase().includes(searchTerm)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(cert => 
        filters.status === 'valid' ? cert.isValid : !cert.isValid
      );
    }

    // Institution filter
    if (filters.institution) {
      filtered = filtered.filter(cert => cert.institutionName === filters.institution);
    }

    // Course filter
    if (filters.course) {
      filtered = filtered.filter(cert => cert.courseName === filters.course);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (filters.dateRange) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'quarter':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        case 'custom':
          if (filters.customDateStart && filters.customDateEnd) {
            filtered = filtered.filter(cert => {
              const certDate = new Date(cert.issueDate * 1000);
              return certDate >= filters.customDateStart! && certDate <= filters.customDateEnd!;
            });
          }
          break;
        default:
          startDate = new Date(0);
      }

      if (filters.dateRange !== 'custom') {
        filtered = filtered.filter(cert => 
          new Date(cert.issueDate * 1000) >= startDate
        );
      }
    }

    // Sort certificates
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.recipientName.toLowerCase();
          bValue = b.recipientName.toLowerCase();
          break;
        case 'course':
          aValue = a.courseName.toLowerCase();
          bValue = b.courseName.toLowerCase();
          break;
        case 'institution':
          aValue = a.institutionName.toLowerCase();
          bValue = b.institutionName.toLowerCase();
          break;
        case 'date':
        default:
          aValue = a.issueDate;
          bValue = b.issueDate;
          break;
      }

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [certificates, filters]);

  // Handle filter changes
  const updateFilter = useCallback((key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Handle bulk selection
  const toggleCertificateSelection = useCallback((tokenId: string) => {
    setSelectedCertificates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tokenId)) {
        newSet.delete(tokenId);
      } else {
        newSet.add(tokenId);
      }
      return newSet;
    });
  }, []);

  const selectAllCertificates = useCallback(() => {
    setSelectedCertificates(new Set(filteredCertificates.map(cert => cert.tokenId)));
  }, [filteredCertificates]);

  const clearSelection = useCallback(() => {
    setSelectedCertificates(new Set());
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow ${className}`}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Certificates</h3>
                <p className="mt-1 text-sm text-gray-500">Loading certificates...</p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header with filters */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col space-y-4">
          {/* Title and view controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Certificates</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filteredCertificates.length} of {certificates.length} certificates
                {selectedCertificates.size > 0 && (
                  <span className="ml-2 text-blue-600">
                    ({selectedCertificates.size} selected)
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              {/* View mode toggle */}
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm font-medium rounded-l-md border ${
                    viewMode === 'list'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm font-medium rounded-r-md border-l-0 border ${
                    viewMode === 'grid'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>

              {/* Advanced filters toggle */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                </svg>
                Filters
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by recipient, course, institution, or certificate ID..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Advanced filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              {/* Status filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => updateFilter('status', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Certificates</option>
                  <option value="valid">Valid Only</option>
                  <option value="invalid">Invalid Only</option>
                </select>
              </div>

              {/* Institution filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                <select
                  value={filters.institution}
                  onChange={(e) => updateFilter('institution', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">All Institutions</option>
                  {uniqueInstitutions.map(inst => (
                    <option key={inst} value={inst}>{inst}</option>
                  ))}
                </select>
              </div>

              {/* Course filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select
                  value={filters.course}
                  onChange={(e) => updateFilter('course', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">All Courses</option>
                  {uniqueCourses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>

              {/* Date range filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => updateFilter('dateRange', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Custom date range */}
              {filters.dateRange === 'custom' && (
                <div className="md:col-span-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={filters.customDateStart?.toISOString().split('T')[0] || ''}
                        onChange={(e) => updateFilter('customDateStart', new Date(e.target.value))}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={filters.customDateEnd?.toISOString().split('T')[0] || ''}
                        onChange={(e) => updateFilter('customDateEnd', new Date(e.target.value))}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sort options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <div className="flex space-x-2">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => updateFilter('sortBy', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="date">Date</option>
                    <option value="name">Recipient</option>
                    <option value="course">Course</option>
                    <option value="institution">Institution</option>
                  </select>
                  <button
                    onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {filters.sortOrder === 'asc' ? (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Reset filters */}
              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="w-full inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}

          {/* Bulk actions */}
          {showBulkActions && selectedCertificates.size > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-blue-900">
                  {selectedCertificates.size} certificate{selectedCertificates.size !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={clearSelection}
                  className="text-sm text-blue-700 hover:text-blue-900"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Export Selected
                </button>
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Bulk Actions
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Certificate list/grid */}
      <div className="p-6">
        {filteredCertificates.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {filters.search || filters.status !== 'all' || filters.institution || filters.course || filters.dateRange !== 'all'
                ? 'No certificates match your filters'
                : 'No certificates found'
              }
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search || filters.status !== 'all' || filters.institution || filters.course || filters.dateRange !== 'all'
                ? 'Try adjusting your search terms or filters.'
                : 'Certificates will appear here once they are issued.'
              }
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCertificates.map((certificate) => (
              <div key={certificate.tokenId} className="relative">
                {showBulkActions && (
                  <div className="absolute top-4 left-4 z-10">
                    <input
                      type="checkbox"
                      checked={selectedCertificates.has(certificate.tokenId)}
                      onChange={() => toggleCertificateSelection(certificate.tokenId)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                )}
                <CertificateCard
                  certificate={certificate}
                  showQR={false}
                  isPublicView={false}
                  onDownload={() => onCertificateAction?.('download', certificate)}
                  onShare={() => onCertificateAction?.('share', certificate)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {showBulkActions && (
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                <input
                  type="checkbox"
                  checked={selectedCertificates.size === filteredCertificates.length && filteredCertificates.length > 0}
                  onChange={selectedCertificates.size === filteredCertificates.length ? clearSelection : selectAllCertificates}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Select all</span>
              </div>
            )}
            
            {filteredCertificates.map((certificate) => (
              <div key={certificate.tokenId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  {showBulkActions && (
                    <div className="flex-shrink-0 pt-1">
                      <input
                        type="checkbox"
                        checked={selectedCertificates.has(certificate.tokenId)}
                        onChange={() => toggleCertificateSelection(certificate.tokenId)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 truncate">
                          {certificate.recipientName}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {certificate.courseName} • {certificate.institutionName}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          certificate.isValid 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {certificate.isValid ? 'Valid' : 'Invalid'}
                        </span>
                        <span className="text-sm text-gray-500">#{certificate.tokenId}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Issued: {formatDate(certificate.issueDate)}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onCertificateAction?.('view', certificate)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => onCertificateAction?.('download', certificate)}
                          className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => onCertificateAction?.('share', certificate)}
                          className="text-green-600 hover:text-green-900 text-sm font-medium"
                        >
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}