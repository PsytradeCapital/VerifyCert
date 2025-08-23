import React, { useState, useMemo, useCallback } from 'react';
import { Certificate } from '../Certificate/CertificateCard';
import CertificateCard from '../Certificate/CertificateCard';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';

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

const CertificateList: React.FC<CertificateListProps> = ({
  certificates,
  isLoading = false,
  onCertificateAction,
  showBulkActions = false,
  className = ''
}) => {
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [selectedCertificates, setSelectedCertificates] = useState<Set<string>>(new Set());

  const filteredAndSortedCertificates = useMemo(() => {
    let filtered = certificates.filter(cert => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          cert.courseName.toLowerCase().includes(searchLower) ||
          cert.institutionName.toLowerCase().includes(searchLower) ||
          cert.recipientName.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status !== 'all') {
        const isValid = cert.isValid && !cert.isRevoked;
        if (filters.status === 'valid' && !isValid) return false;
        if (filters.status === 'invalid' && isValid) return false;
      }

      // Institution filter
      if (filters.institution && cert.institutionName !== filters.institution) {
        return false;
      }

      // Course filter
      if (filters.course && cert.courseName !== filters.course) {
        return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'date':
          comparison = a.issueDate - b.issueDate;
          break;
        case 'name':
          comparison = a.recipientName.localeCompare(b.recipientName);
          break;
        case 'course':
          comparison = a.courseName.localeCompare(b.courseName);
          break;
        case 'institution':
          comparison = a.institutionName.localeCompare(b.institutionName);
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [certificates, filters]);

  const handleFilterChange = useCallback((key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleCertificateSelect = useCallback((tokenId: string, selected: boolean) => {
    setSelectedCertificates(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(tokenId);
      } else {
        newSet.delete(tokenId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedCertificates.size === filteredAndSortedCertificates.length) {
      setSelectedCertificates(new Set());
    } else {
      setSelectedCertificates(new Set(filteredAndSortedCertificates.map(cert => cert.tokenId)));
    }
  }, [selectedCertificates.size, filteredAndSortedCertificates]);

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-48"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search certificates..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="valid">Valid</option>
            <option value="invalid">Invalid</option>
          </select>

          {/* Sort By */}
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="course">Sort by Course</option>
            <option value="institution">Sort by Institution</option>
          </select>

          {/* Sort Order */}
          <button
            onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {filters.sortOrder === 'asc' ? (
              <SortAsc className="w-4 h-4" />
            ) : (
              <SortDesc className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredAndSortedCertificates.length} of {certificates.length} certificates
        </p>
        
        {showBulkActions && filteredAndSortedCertificates.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {selectedCertificates.size === filteredAndSortedCertificates.length ? 'Deselect All' : 'Select All'}
            </button>
            {selectedCertificates.size > 0 && (
              <span className="text-sm text-gray-600">
                ({selectedCertificates.size} selected)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Certificate Grid */}
      {filteredAndSortedCertificates.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Filter className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedCertificates.map((certificate) => (
            <CertificateCard
              key={certificate.tokenId}
              certificate={certificate}
              onDownload={() => onCertificateAction?.('download', certificate)}
              onShare={() => onCertificateAction?.('share', certificate)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificateList;