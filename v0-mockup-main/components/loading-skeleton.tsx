// components/ui/loading-skeleton.tsx
import React from 'react'

interface LoadingSkeletonProps {
  className?: string
  rows?: number
  variant?: 'card' | 'text' | 'button' | 'avatar'
}

export function LoadingSkeleton({ className = '', rows = 1, variant = 'text' }: LoadingSkeletonProps) {
  const baseClasses = 'animate-pulse bg-muted rounded'
  
  const variantClasses = {
    card: 'h-32 w-full',
    text: 'h-4 w-full',
    button: 'h-10 w-24',
    avatar: 'h-10 w-10 rounded-full'
  }

  if (variant === 'card') {
    return (
      <div className={`${baseClasses} ${variantClasses.card} ${className}`}>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
          <div className="h-3 bg-muted-foreground/20 rounded w-1/2"></div>
          <div className="h-3 bg-muted-foreground/20 rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {Array.from({ length: rows }).map((_, i) => (
        <div 
          key={i} 
          className={`${baseClasses} ${variantClasses[variant]} ${i > 0 ? 'mt-2' : ''}`}
        />
      ))}
    </div>
  )
}

// components/ui/search-filter-bar.tsx
import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, X, SortAsc, SortDesc } from 'lucide-react'
import { FilterOptions, SortOptions, NCCDLevel } from '@/lib/types'

interface SearchFilterBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  filters: FilterOptions
  onFilterChange: (key: keyof FilterOptions, value: any) => void
  sortOptions: SortOptions
  onSortChange: (field: SortOptions['field'], direction?: SortOptions['direction']) => void
  onClearFilters: () => void
  className?: string
  showSort?: boolean
  showNCCDFilter?: boolean
  showStatusFilter?: boolean
  showConfidenceFilter?: boolean
}

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  sortOptions,
  onSortChange,
  onClearFilters,
  className = '',
  showSort = true,
  showNCCDFilter = true,
  showStatusFilter = true,
  showConfidenceFilter = true
}: SearchFilterBarProps) {
  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== ''
  )

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search adjustments, evidence, or students..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        {hasActiveFilters && (
          <Button variant="outline" onClick={onClearFilters} size="sm">
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {showNCCDFilter && (
          <Select value={filters.nccdLevel || ''} onValueChange={(value) => 
            onFilterChange('nccdLevel', value || undefined)
          }>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-1" />
              <SelectValue placeholder="NCCD Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Levels</SelectItem>
              <SelectItem value="Quality Differentiated Teaching Practice">QDTP</SelectItem>
              <SelectItem value="Supplementary">Supplementary</SelectItem>
              <SelectItem value="Substantial">Substantial</SelectItem>
              <SelectItem value="Extensive">Extensive</SelectItem>
            </SelectContent>
          </Select>
        )}

        {showStatusFilter && (
          <Select value={filters.status || ''} onValueChange={(value) => 
            onFilterChange('status', value || undefined)
          }>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        )}

        {showConfidenceFilter && (
          <Select 
            value={filters.confidence ? `${filters.confidence.min}-${filters.confidence.max}` : ''} 
            onValueChange={(value) => {
              if (value) {
                const [min, max] = value.split('-').map(Number)
                onFilterChange('confidence', { min, max })
              } else {
                onFilterChange('confidence', undefined)
              }
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Confidence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Confidence</SelectItem>
              <SelectItem value="80-100">High (80-100%)</SelectItem>
              <SelectItem value="60
