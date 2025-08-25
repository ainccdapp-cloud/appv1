// lib/types.ts - Centralized type definitions

export type NCCDLevel = 'Quality Differentiated Teaching Practice' | 'Supplementary' | 'Substantial' | 'Extensive'
export type AdjustmentStatus = 'active' | 'completed' | 'discontinued'
export type EvidenceCategory = 'Assessment' | 'Observation' | 'Work Sample' | 'Photo' | 'Video' | 'Report' | 'Other'
export type LinkStatus = 'pending' | 'approved' | 'rejected'
export type EvidenceQuality = 'Strong' | 'Moderate' | 'Weak'
export type ProcessingStatus = 'idle' | 'uploading' | 'processing' | 'complete' | 'error'

export interface Student {
  studentId: string
  name: string
  year: string
  classroom: string
  primaryDisability?: string
  secondaryDisabilities?: string[]
  enrollmentDate: string
  lastUpdated: string
}

export interface Adjustment {
  adjustmentId: string
  studentId: string
  studentName?: string
  description: string
  category: 'Quality Differentiated Teaching Practice' | 'Supplementary' | 'Substantial' | 'Extensive'
  implementation: string
  successCriteria: string
  responsibleStaff: string
  nccdLevelIndicator: NCCDLevel
  confidence: number
  subject?: string
  status: AdjustmentStatus
  createdAt: string
  lastModified: string
  reviewDate?: string
  isActive: boolean
}

export interface Evidence {
  evidenceId: string
  studentId: string
  studentName?: string
  description: string
  category: EvidenceCategory
  outcome: string
  timeline: string
  nccdLevelIndicator: NCCDLevel
  confidence: number
  subject?: string
  dateCollected: string
  collectedBy: string
  filePath?: string
  fileType?: string
  metadata?: Record<string, any>
}

export interface EvidenceLink {
  linkId: string
  adjustmentId: string
  evidenceId: string
  confidence: number
  evidenceQuality: EvidenceQuality
  status: LinkStatus
  connections: string[]
  nccdRelevance: string
  missingElements: string[]
  aiReasoning?: string
  createdAt: string
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string
}

export interface DashboardStats {
  totalStudents: number
  totalAdjustments: number
  totalEvidence: number
  totalLinks: number
  pendingReviews: number
  approvedLinks: number
  rejectedLinks: number
  completionRate: number
  averageConfidence: number
  lastUpdate: string
}

export interface TeacherSummary {
  studentId: string
  studentName: string
  generatedAt: string
  adjustments: Adjustment[]
  linkedEvidence: EvidenceLink[]
  overallConfidence: number
  nccdCompliance: {
    level: NCCDLevel
    justification: string
    recommendations: string[]
    missingElements: string[]
  }
  missingEvidence: string[]
  suggestedNextSteps: string[]
  complianceScore: number
}

export interface FileWithPreview extends File {
  id: string
  status: ProcessingStatus
  error?: string
  extractedData?: any
  uploadProgress?: number
}

export interface UploadResult {
  success: boolean
  documentType: string
  filesProcessed: number
  adjustments?: Adjustment[]
  evidence?: Evidence[]
  metadata: {
    confidence: number
    processingTime: number
    errors: string[]
    warnings: string[]
  }
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
}

export interface FilterOptions {
  studentId?: string
  nccdLevel?: NCCDLevel
  status?: AdjustmentStatus | LinkStatus
  confidence?: { min: number; max: number }
  dateRange?: { start: string; end: string }
  subject?: string
}

export interface SearchResult {
  type: 'adjustment' | 'evidence' | 'student'
  id: string
  title: string
  description: string
  relevance: number
}

// Utility types
export type SortDirection = 'asc' | 'desc'
export type SortField = 'date' | 'confidence' | 'name' | 'status'

export interface SortOptions {
  field: SortField
  direction: SortDirection
}

// Error types
export class NCCDError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'NCCDError'
  }
}

export class ValidationError extends NCCDError {
  constructor(message: string, public field: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class ProcessingError extends NCCDError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'PROCESSING_ERROR', details)
    this.name = 'ProcessingError'
  }
}
