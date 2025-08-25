// hooks/useData.ts
import { useState, useEffect, useCallback } from 'react'
import { Adjustment, Evidence, EvidenceLink, DashboardStats, ApiResponse } from '@/lib/types'

export function useData() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([])
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [evidenceLinks, setEvidenceLinks] = useState<EvidenceLink[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalAdjustments: 0,
    totalEvidence: 0,
    totalLinks: 0,
    pendingReviews: 0,
    approvedLinks: 0,
    rejectedLinks: 0,
    completionRate: 0,
    averageConfidence: 0,
    lastUpdate: new Date().toISOString()
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/data')
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`)
      }
      
      const result: ApiResponse = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch data')
      }
      
      setAdjustments(result.data?.adjustments || [])
      setEvidence(result.data?.evidence || [])
      setEvidenceLinks(result.data?.links || [])
      setStats(result.data?.stats || stats)
      setLastRefresh(new Date())
      
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refresh = useCallback(() => {
    fetchData()
  }, [fetchData])

  return {
    adjustments,
    evidence,
    evidenceLinks,
    stats,
    isLoading,
    error,
    lastRefresh,
    refresh,
    setAdjustments,
    setEvidence,
    setEvidenceLinks,
    setStats
  }
}

// hooks/useEvidenceLinks.ts
import { useState, useCallback } from 'react'
import { Adjustment, Evidence, EvidenceLink, ApiResponse } from '@/lib/types'

export function useEvidenceLinks() {
  const [isLinking, setIsLinking] = useState(false)
  const [linkingProgress, setLinkingProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const generateLinks = useCallback(async (
    adjustments: Adjustment[], 
    evidence: Evidence[]
  ): Promise<EvidenceLink[]> => {
    if (adjustments.length === 0 || evidence.length === 0) {
      throw new Error('Both adjustments and evidence are required for linking')
    }

    setIsLinking(true)
    setError(null)
    setLinkingProgress(0)

    // Enhanced progress simulation with stages
    const stages = [
      { message: 'Analyzing document content...', progress: 20 },
      { message: 'Matching NCCD criteria...', progress: 50 },
      { message: 'Calculating confidence scores...', progress: 75 },
      { message: 'Finalizing connections...', progress: 90 }
    ]

    let currentStage = 0
    const progressInterval = setInterval(() => {
      if (currentStage < stages.length) {
        setLinkingProgress(stages[currentStage].progress)
        currentStage++
      }
    }, 800)

    try {
      const response = await fetch('/api/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adjustments,
          evidence,
        }),
      })

      clearInterval(progressInterval)
      setLinkingProgress(100)

      if (!response.ok) {
        throw new Error(`Linking failed: ${response.status} ${response.statusText}`)
      }

      const result: ApiResponse<{ links: EvidenceLink[] }> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate evidence links')
      }

      return result.data?.links || []

    } catch (error) {
      console.error('Linking failed:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate evidence links')
      throw error
    } finally {
      setIsLinking(false)
      clearInterval(progressInterval)
      setTimeout(() => setLinkingProgress(0), 1500)
    }
  }, [])

  const updateLinkStatus = useCallback(async (
    adjustmentId: string, 
    evidenceId: string, 
    status: 'approved' | 'rejected',
    notes?: string
  ) => {
    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adjustmentId,
          evidenceId,
          status,
          notes,
          reviewedAt: new Date().toISOString()
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update link status: ${response.status}`)
      }

      const result: ApiResponse = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update link status')
      }

      return result.data
    } catch (error) {
      console.error('Failed to update link status:', error)
      throw error
    }
  }, [])

  return {
    isLinking,
    linkingProgress,
    error,
    generateLinks,
    updateLinkStatus,
    setError
  }
}

// hooks/useFileUpload.ts
import { useState, useCallback } from 'react'
import { FileWithPreview, UploadResult, ApiResponse } from '@/lib/types'

export function useFileUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateFileId = () => Math.random().toString(36).substr(2, 9)

  const addFiles = useCallback((files: File[]) => {
    const filesWithMeta: FileWithPreview[] = files.map(file => ({
      ...file,
      id: generateFileId(),
      status: 'idle',
      uploadProgress: 0
    }))
    
    setUploadedFiles(prev => [...prev, ...filesWithMeta])
    setError(null)
  }, [])

  const removeFile = useCallback((id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id))
  }, [])

  const updateFileStatus = useCallback((id: string, status: ProcessingStatus, error?: string) => {
    setUploadedFiles(prev => prev.map(file => 
      file.id === id ? { ...file, status, error } : file
    ))
  }, [])

  const processFiles = useCallback(async (
    documentType: string,
    additionalData?: Record<string, any>
  ): Promise<UploadResult> => {
    if (uploadedFiles.length === 0) {
      throw new Error('No files to process')
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Update all files to processing
      setUploadedFiles(prev => prev.map(file => ({
        ...file, 
        status: 'processing'
      })))

      const formData = new FormData()
      formData.append('documentType', documentType)
      
      if (additionalData) {
        formData.append('metadata', JSON.stringify(additionalData))
      }

      uploadedFiles.forEach(file => {
        formData.append('files', file)
      })

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
      }

      const result: ApiResponse<UploadResult> = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Processing failed')
      }

      // Mark files as complete
      setUploadedFiles(prev => prev.map(file => ({
        ...file, 
        status: 'complete'
      })))

      return result.data!

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Processing failed'
      setError(errorMessage)
      
      // Mark files as error
      setUploadedFiles(prev => prev.map(file => ({
        ...file, 
        status: 'error',
        error: errorMessage
      })))
      
      throw error
    } finally {
      setIsProcessing(false)
    }
  }, [uploadedFiles])

  const processText = useCallback(async (
    text: string,
    documentType: string
  ): Promise<UploadResult> => {
    if (!text.trim()) {
      throw new Error('Text content is required')
    }

    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          documentType,
        }),
      })

      if (!response.ok) {
        throw new Error(`Extraction failed: ${response.status} ${response.statusText}`)
      }

      const result: ApiResponse<UploadResult> = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Text processing failed')
      }

      return result.data!

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Text processing failed'
      setError(errorMessage)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const clearFiles = useCallback(() => {
    setUploadedFiles([])
    setError(null)
  }, [])

  return {
    uploadedFiles,
    isProcessing,
    error,
    addFiles,
    removeFile,
    updateFileStatus,
    processFiles,
    processText,
    clearFiles,
    setError
  }
}

// hooks/useSearch.ts
import { useState, useMemo } from 'react'
import { Adjustment, Evidence, EvidenceLink, SearchResult, FilterOptions, SortOptions } from '@/lib/types'

export function useSearch<T extends Adjustment | Evidence | EvidenceLink>(items: T[]) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({})
  const [sortOptions, setSortOptions] = useState<SortOptions>({ field: 'date', direction: 'desc' })

  const filteredAndSortedItems = useMemo(() => {
    let filtered = items

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item => {
        const searchText = [
          'description' in item ? item.description : '',
          'studentName' in item ? item.studentName : '',
          'category' in item ? item.category : '',
          'nccdLevelIndicator' in item ? item.nccdLevelIndicator : '',
        ].join(' ').toLowerCase()
        
        return searchText.includes(query)
      })
    }

    // Apply filters
    if (filters.nccdLevel) {
      filtered = filtered.filter(item => 
        'nccdLevelIndicator' in item && item.nccdLevelIndicator === filters.nccdLevel
      )
    }

    if (filters.confidence) {
      filtered = filtered.filter(item => 
        'confidence' in item && 
        item.confidence >= filters.confidence!.min && 
        item.confidence <= filters.confidence!.max
      )
    }

    if (filters.status) {
      filtered = filtered.filter(item => 
        'status' in item && item.status === filters.status
      )
    }

    if (filters.subject) {
      filtered = filtered.filter(item => 
        'subject' in item && item.subject === filters.subject
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const { field, direction } = sortOptions
      const multiplier = direction === 'asc' ? 1 : -1

      switch (field) {
        case 'date':
          const aDate = 'createdAt' in a ? new Date(a.createdAt) : new Date()
          const bDate = 'createdAt' in b ? new Date(b.createdAt) : new Date()
          return (aDate.getTime() - bDate.getTime()) * multiplier

        case 'confidence':
          const aConf = 'confidence' in a ? a.confidence : 0
          const bConf = 'confidence' in b ? b.confidence : 0
          return (aConf - bConf) * multiplier

        case 'name':
          const aName = 'description' in a ? a.description : ''
          const bName = 'description' in b ? b.description : ''
          return aName.localeCompare(bName) * multiplier

        case 'status':
          const aStatus = 'status' in a ? a.status : ''
          const bStatus = 'status' in b ? b.status : ''
          return aStatus.localeCompare(bStatus) * multiplier

        default:
          return 0
      }
    })

    return filtered
  }, [items, searchQuery, filters, sortOptions])

  const updateFilter = useCallback((key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
    setSearchQuery('')
  }, [])

  const updateSort = useCallback((field: SortOptions['field'], direction?: SortOptions['direction']) => {
    setSortOptions(prev => ({
      field,
      direction: direction || (prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc')
    }))
  }, [])

  return {
    searchQuery,
    setSearchQuery,
    filters,
    updateFilter,
    clearFilters,
    sortOptions,
    updateSort,
    filteredAndSortedItems,
    totalItems: items.length,
    filteredCount: filteredAndSortedItems.length
  }
}

// hooks/useLocalStorage.ts (Note: This would be for non-artifact environments)
import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key)
        if (item) {
          setStoredValue(JSON.parse(item))
        }
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
    }
  }, [key])

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue] as const
}

// hooks/useDebounce.ts
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// hooks/useNotifications.ts
import { useState, useCallback } from 'react'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification = { ...notification, id }
    
    setNotifications(prev => [...prev, newNotification])

    // Auto-remove after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id))
      }, notification.duration || 5000)
    }

    return id
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications
  }
}
