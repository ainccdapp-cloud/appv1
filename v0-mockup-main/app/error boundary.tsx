// components/error-boundary.tsx
"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
    })

    // Log to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // logErrorToService(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props

      if (Fallback) {
        return <Fallback error={this.state.error} reset={this.handleReset} />
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Something went wrong
              </CardTitle>
              <CardDescription>
                An unexpected error occurred while loading this page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    <details className="whitespace-pre-wrap">
                      <summary className="font-medium cursor-pointer">Error Details</summary>
                      <div className="mt-2 text-xs">
                        <strong>Message:</strong> {this.state.error.message}
                        {this.state.error.stack && (
                          <>
                            <br />
                            <strong>Stack:</strong>
                            <pre className="mt-1 text-xs overflow-auto max-h-32">
                              {this.state.error.stack}
                            </pre>
                          </>
                        )}
                      </div>
                    </details>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button onClick={this.handleReset} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// lib/utils.ts - Additional utility functions
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { NCCDLevel, AdjustmentStatus, LinkStatus } from '@/lib/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting utilities
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date'
  }

  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options
  }).format(dateObj)
}

export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return formatDate(dateObj)
}

// NCCD utility functions
export function getNCCDLevelColor(level: NCCDLevel): string {
  switch (level) {
    case "Quality Differentiated Teaching Practice": 
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    case "Supplementary": 
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    case "Substantial": 
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
    case "Extensive": 
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    default: 
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }
}

export function getNCCDLevelAbbreviation(level: NCCDLevel): string {
  switch (level) {
    case "Quality Differentiated Teaching Practice": return "QDTP"
    case "Supplementary": return "Supp"
    case "Substantial": return "Sub"
    case "Extensive": return "Ext"
    default: return level
  }
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 80) return "text-green-600 dark:text-green-400"
  if (confidence >= 60) return "text-yellow-600 dark:text-yellow-400"
  return "text-red-600 dark:text-red-400"
}

export function getConfidenceBadgeVariant(confidence: number): "default" | "secondary" | "destructive" {
  if (confidence >= 80) return "default"
  if (confidence >= 60) return "secondary"
  return "destructive"
}

export function getStatusColor(status: AdjustmentStatus | LinkStatus): string {
  switch (status) {
    case "active":
    case "approved":
      return "text-green-600 dark:text-green-400"
    case "completed":
      return "text-blue-600 dark:text-blue-400"
    case "pending":
      return "text-yellow-600 dark:text-yellow-400"
    case "discontinued":
    case "rejected":
      return "text-red-600 dark:text-red-400"
    default:
      return "text-gray-600 dark:text-gray-400"
  }
}

// File utilities
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getFileIcon(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'pdf': return '📄'
    case 'doc':
    case 'docx': return '📝'
    case 'xls':
    case 'xlsx': return '📊'
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif': return '🖼️'
    case 'mp4':
    case 'mov':
    case 'avi': return '🎥'
    case 'mp3':
    case 'wav': return '🎵'
    default: return '📎'
  }
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  const fileType = file.type.toLowerCase()
  const fileName = file.name.toLowerCase()
  const fileExtension = fileName.split('.').pop() || ''
  
  return allowedTypes.some(type => {
    if (type.includes('/')) {
      // MIME type check
      return fileType === type || fileType.startsWith(type.replace('*', ''))
    } else {
      // Extension check
      return fileExtension === type.replace('.', '')
    }
  })
}

// Search and filtering utilities
export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm.trim()) return text
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\export function getConfidenceBadgeVariant(confidence: number): "default" | "secondary" | "destructive" {
  if (')})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

export function fuzzySearch(items: any[], searchTerm: string, fields: string[]): any[] {
  if (!searchTerm.trim()) return items
  
  const searchLower = searchTerm.toLowerCase()
  
  return items.filter(item => {
    return fields.some(field => {
      const value = getNestedProperty(item, field)
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchLower)
      }
      return false
    })
  })
}

function getNestedProperty(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

// Data processing utilities
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key])
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    if (aVal == null && bVal == null) return 0
    if (aVal == null) return direction === 'asc' ? -1 : 1
    if (bVal == null) return direction === 'asc' ? 1 : -1
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  })
}

export function calculateStats(numbers: number[]): {
  min: number
  max: number
  mean: number
  median: number
  count: number
} {
  if (numbers.length === 0) {
    return { min: 0, max: 0, mean: 0, median: 0, count: 0 }
  }
  
  const sorted = [...numbers].sort((a, b) => a - b)
  const sum = numbers.reduce((acc, num) => acc + num, 0)
  const count = numbers.length
  const mean = sum / count
  
  const median = count % 2 === 0
    ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
    : sorted[Math.floor(count / 2)]
  
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean: Math.round(mean * 100) / 100,
    median: Math.round(median * 100) / 100,
    count
  }
}

// Validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateRequired(value: any, fieldName: string): string | null {
  if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) {
    return `${fieldName} is required`
  }
  return null
}

export function validateLength(value: string, min: number, max: number, fieldName: string): string | null {
  if (value.length < min) {
    return `${fieldName} must be at least ${min} characters`
  }
  if (value.length > max) {
    return `${fieldName} must be no more than ${max} characters`
  }
  return null
}

export function validateRange(value: number, min: number, max: number, fieldName: string): string | null {
  if (value < min) {
    return `${fieldName} must be at least ${min}`
  }
  if (value > max) {
    return `${fieldName} must be no more than ${max}`
  }
  return null
}

// API utilities
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<{ data: T; error: null } | { data: null; error: string }> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.success === false) {
      throw new Error(data.error || 'API request failed')
    }

    return { data: data.data || data, error: null }
  } catch (error) {
    console.error('API request failed:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export function createFormData(data: Record<string, any>): FormData {
  const formData = new FormData()
  
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value)
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item instanceof File) {
          formData.append(`${key}[${index}]`, item)
        } else {
          formData.append(`${key}[${index}]`, JSON.stringify(item))
        }
      })
    } else if (typeof value === 'object' && value !== null) {
      formData.append(key, JSON.stringify(value))
    } else {
      formData.append(key, String(value))
    }
  })
  
  return formData
}

// Export utilities
export function exportToCSV(data: any[], filename: string = 'export.csv'): void {
  if (data.length === 0) return
  
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

export function exportToJSON(data: any[], filename: string = 'export.json'): void {
  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

// Local storage utilities (for non-artifact environments)
export function saveToStorage(key: string, data: any): boolean {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, JSON.stringify(data))
      return true
    }
  } catch (error) {
    console.warn('Failed to save to localStorage:', error)
  }
  return false
}

export function loadFromStorage<T = any>(key: string, defaultValue: T): T {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    }
  } catch (error) {
    console.warn('Failed to load from localStorage:', error)
  }
  return defaultValue
}

export function removeFromStorage(key: string): boolean {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key)
      return true
    }
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error)
  }
  return false
}

// Performance utilities
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Accessibility utilities
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

export function announceToScreenReader(message: string): void {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', 'polite')
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// Type guards
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value)
}

export function isObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// Environment utilities
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

export function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function isServer(): boolean {
  return typeof window === 'undefined'
}
