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
              <SelectItem value="60-79">Medium (60-79%)</SelectItem>
              <SelectItem value="0-59">Low (0-59%)</SelectItem>
            </SelectContent>
          </Select>
        )}

        {showSort && (
          <div className="flex gap-1">
            <Select value={sortOptions.field} onValueChange={(field) => 
              onSortChange(field as SortOptions['field'])
            }>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="confidence">Confidence</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSortChange(sortOptions.field, 
                sortOptions.direction === 'asc' ? 'desc' : 'asc'
              )}
            >
              {sortOptions.direction === 'asc' ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1">
          {filters.nccdLevel && (
            <Badge variant="secondary" className="text-xs">
              Level: {filters.nccdLevel === 'Quality Differentiated Teaching Practice' ? 'QDTP' : filters.nccdLevel}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-3 w-3 p-0"
                onClick={() => onFilterChange('nccdLevel', undefined)}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary" className="text-xs">
              Status: {filters.status}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-3 w-3 p-0"
                onClick={() => onFilterChange('status', undefined)}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          {filters.confidence && (
            <Badge variant="secondary" className="text-xs">
              Confidence: {filters.confidence.min}-{filters.confidence.max}%
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-3 w-3 p-0"
                onClick={() => onFilterChange('confidence', undefined)}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

// components/ui/adjustment-card.tsx
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Edit, Archive } from 'lucide-react'
import { Adjustment } from '@/lib/types'

interface AdjustmentCardProps {
  adjustment: Adjustment
  linkedEvidenceCount?: number
  onView?: (adjustment: Adjustment) => void
  onEdit?: (adjustment: Adjustment) => void
  onArchive?: (adjustment: Adjustment) => void
  showActions?: boolean
  compact?: boolean
}

export function AdjustmentCard({
  adjustment,
  linkedEvidenceCount = 0,
  onView,
  onEdit,
  onArchive,
  showActions = true,
  compact = false
}: AdjustmentCardProps) {
  const getNCCDLevelColor = (level: string) => {
    switch (level) {
      case "Quality Differentiated Teaching Practice": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "Supplementary": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "Substantial": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "Extensive": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600 dark:text-green-400"
    if (confidence >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  return (
    <Card className={`hover:bg-muted/50 transition-colors ${compact ? 'p-3' : ''}`}>
      <CardContent className={compact ? 'p-4' : 'p-4'}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h4 className={`font-medium leading-5 ${compact ? 'text-sm' : ''}`}>
              {adjustment.description}
            </h4>
            {adjustment.studentName && (
              <p className="text-xs text-muted-foreground mt-1">
                Student: {adjustment.studentName}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1 ml-3">
            <Badge 
              className={`text-xs ${getNCCDLevelColor(adjustment.nccdLevelIndicator)} border-0`}
            >
              {adjustment.nccdLevelIndicator === 'Quality Differentiated Teaching Practice' ? 'QDTP' : adjustment.nccdLevelIndicator}
            </Badge>
            <Badge 
              variant={adjustment.status === 'active' ? 'default' : 'secondary'} 
              className="text-xs"
            >
              {adjustment.status}
            </Badge>
          </div>
        </div>

        {!compact && (
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium text-foreground">Implementation:</span>
                <p className="text-xs mt-1 line-clamp-2">{adjustment.implementation}</p>
              </div>
              <div>
                <span className="font-medium text-foreground">Success Criteria:</span>
                <p className="text-xs mt-1 line-clamp-2">{adjustment.successCriteria}</p>
              </div>
            </div>
            
            <div>
              <span className="font-medium text-foreground">Responsible Staff:</span>
              <p className="text-xs mt-1">{adjustment.responsibleStaff}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t mt-3">
          <div className="flex items-center gap-3">
            {adjustment.subject && (
              <Badge variant="secondary" className="text-xs">
                {adjustment.subject}
              </Badge>
            )}
            <span className={`text-xs font-medium ${getConfidenceColor(adjustment.confidence)}`}>
              {adjustment.confidence}% confidence
            </span>
            {linkedEvidenceCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {linkedEvidenceCount} evidence link{linkedEvidenceCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <div className="text-xs text-muted-foreground">
              ID: {adjustment.adjustmentId.slice(0, 8)}
            </div>
            {showActions && (
              <div className="flex gap-1 ml-2">
                {onView && (
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onView(adjustment)}>
                    <Eye className="h-3 w-3" />
                  </Button>
                )}
                {onEdit && (
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onEdit(adjustment)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
                {onArchive && (
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onArchive(adjustment)}>
                    <Archive className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// components/ui/evidence-card.tsx
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Edit, Download } from 'lucide-react'
import { Evidence } from '@/lib/types'

interface EvidenceCardProps {
  evidence: Evidence
  linkedAdjustmentCount?: number
  onView?: (evidence: Evidence) => void
  onEdit?: (evidence: Evidence) => void
  onDownload?: (evidence: Evidence) => void
  showActions?: boolean
  compact?: boolean
}

export function EvidenceCard({
  evidence,
  linkedAdjustmentCount = 0,
  onView,
  onEdit,
  onDownload,
  showActions = true,
  compact = false
}: EvidenceCardProps) {
  const getNCCDLevelColor = (level: string) => {
    switch (level) {
      case "Quality Differentiated Teaching Practice": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "Supplementary": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "Substantial": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "Extensive": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600 dark:text-green-400"
    if (confidence >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Assessment': return '📝'
      case 'Observation': return '👁️'
      case 'Work Sample': return '📄'
      case 'Photo': return '📸'
      case 'Video': return '🎥'
      case 'Report': return '📊'
      default: return '📎'
    }
  }

  return (
    <Card className={`hover:bg-muted/50 transition-colors ${compact ? 'p-3' : ''}`}>
      <CardContent className={compact ? 'p-4' : 'p-4'}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <span className="text-lg">{getCategoryIcon(evidence.category)}</span>
              <div className="flex-1">
                <h4 className={`font-medium leading-5 ${compact ? 'text-sm' : ''}`}>
                  {evidence.description}
                </h4>
                {evidence.studentName && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Student: {evidence.studentName}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1 ml-3">
            <Badge 
              className={`text-xs ${getNCCDLevelColor(evidence.nccdLevelIndicator)} border-0`}
            >
              {evidence.nccdLevelIndicator === 'Quality Differentiated Teaching Practice' ? 'QDTP' : evidence.nccdLevelIndicator}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {evidence.category}
            </Badge>
          </div>
        </div>

        {!compact && (
          <div className="space-y-2 text-sm text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">Outcome:</span>
              <p className="text-xs mt-1 line-clamp-2">{evidence.outcome}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium text-foreground">Timeline:</span>
                <p className="text-xs mt-1">{evidence.timeline}</p>
              </div>
              <div>
                <span className="font-medium text-foreground">Collected By:</span>
                <p className="text-xs mt-1">{evidence.collectedBy}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t mt-3">
          <div className="flex items-center gap-3">
            {evidence.subject && (
              <Badge variant="secondary" className="text-xs">
                {evidence.subject}
              </Badge>
            )}
            <span className={`text-xs font-medium ${getConfidenceColor(evidence.confidence)}`}>
              {evidence.confidence}% confidence
            </span>
            {linkedAdjustmentCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {linkedAdjustmentCount} link{linkedAdjustmentCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <div className="text-xs text-muted-foreground">
              ID: {evidence.evidenceId.slice(0, 8)}
            </div>
            {showActions && (
              <div className="flex gap-1 ml-2">
                {onView && (
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onView(evidence)}>
                    <Eye className="h-3 w-3" />
                  </Button>
                )}
                {onEdit && (
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onEdit(evidence)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
                {onDownload && evidence.filePath && (
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onDownload(evidence)}>
                    <Download className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// components/ui/progress-indicator.tsx
import React from 'react'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface ProgressIndicatorProps {
  current: number
  total: number
  label?: string
  showDetails?: boolean
  completed?: number
  pending?: number
  failed?: number
  className?: string
}

export function ProgressIndicator({
  current,
  total,
  label,
  showDetails = false,
  completed = 0,
  pending = 0,
  failed = 0,
  className = ''
}: ProgressIndicatorProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label || 'Progress'}</span>
        <span className="text-sm text-muted-foreground">
          {current} of {total} ({Math.round(percentage)}%)
        </span>
      </div>
      
      <Progress value={percentage} className="h-2" />
      
      {showDetails && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {completed > 0 && (
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>{completed} completed</span>
            </div>
          )}
          {pending > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-yellow-600" />
              <span>{pending} pending</span>
            </div>
          )}
          {failed > 0 && (
            <div className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3 text-red-600" />
              <span>{failed} failed</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// components/ui/empty-state.tsx
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = ''
}: EmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent className="text-center py-12">
        <div className="mx-auto mb-4 opacity-30">
          {icon}
        </div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-4 max-w-md mx-auto">
          {description}
        </p>
        <div className="flex gap-2 justify-center">
          {action && (
            <Button onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// components/ui/notification-toast.tsx
import React, { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

interface NotificationToastProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  onClose: (id: string) => void
}

export function NotificationToast({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose
}: NotificationToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [id, duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error': return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'info': return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getBorderColor = () => {
    switch (type) {
      case 'success': return 'border-l-green-600'
      case 'error': return 'border-l-red-600'
      case 'warning': return 'border-l-yellow-600'
      case 'info': return 'border-l-blue-600'
    }
  }

  return (
    <Card className={`w-80 border-l-4 ${getBorderColor()} shadow-lg`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium">{title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onClose(id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
