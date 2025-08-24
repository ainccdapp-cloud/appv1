// NCCD Type Definitions

export interface Student {
  id: string
  name: string
  year: string
  school: string
  dateOfBirth?: string
  studentId?: string
}

export interface Adjustment {
  adjustmentId: string
  studentId?: string
  description: string
  category: 'Quality Differentiated Teaching Practice' | 'Supplementary' | 'Substantial' | 'Extensive'
  implementation: string
  responsibleStaff: string
  nccdLevelIndicator: 'Quality Differentiated Teaching Practice' | 'Supplementary' | 'Substantial' | 'Extensive'
  confidence: number // 0-100
  subject?: string
  frequency?: string
  startDate?: string
  endDate?: string
  evidenceRequired?: string[]
  status: 'active' | 'completed' | 'discontinued'
  extractedFrom?: {
    documentId: string
    documentName: string
    extractedAt: string
  }
}

export interface Evidence {
  evidenceId: string
  studentId?: string
  description: string
  category: 'Assessment' | 'Observation' | 'Work Sample' | 'Photo' | 'Video' | 'Report' | 'Other'
  outcome: string
  timeline: string
  nccdLevelIndicator: 'Quality Differentiated Teaching Practice' | 'Supplementary' | 'Substantial' | 'Extensive'
  confidence: number // 0-100
  dateCollected?: string
  subject?: string
  staff?: string
  fileInfo?: {
    fileName: string
    fileType: string
    fileSize: number
    filePath?: string
  }
  extractedFrom?: {
    documentId: string
    documentName: string
    extractedAt: string
  }
}

export interface EvidenceLink {
  linkId: string
  adjustmentId: string
  evidenceId: string
  confidence: number // 0-100
  evidenceQuality: 'Strong' | 'Moderate' | 'Weak'
  status: 'pending' | 'approved' | 'rejected' | 'modified'
  connections: string[] // Array of connection explanations
  aiReasoning?: string
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string
  createdAt: string
  updatedAt?: string
}

export interface NCCDLevel {
  level: 'Quality Differentiated Teaching Practice' | 'Supplementary' | 'Substantial' | 'Extensive'
  description: string
  criteria: string[]
  evidenceRequirements: string[]
}

export interface School {
  id: string
  name: string
  state: string
  sector: 'Government' | 'Catholic' | 'Independent'
  postcode: string
}

export interface User {
  id: string
  name: string
  email: string
  role: 'teacher' | 'coordinator' | 'admin'
  schoolId: string
}

// API Response Types
export interface DashboardData {
  adjustments: Adjustment[]
  evidence: Evidence[]
  links: EvidenceLink[]
  students?: Student[]
  stats: {
    totalStudents: number
    totalAdjustments: number
    totalEvidence: number
    totalLinks: number
    pendingReviews: number
    approvedLinks: number
    completionRate: number
  }
}

export interface LinkingRequest {
  adjustments: Adjustment[]
  evidence: Evidence[]
  options?: {
    minimumConfidence: number
    includeWeakMatches: boolean
  }
}

export interface LinkingResponse {
  links: EvidenceLink[]
  processingTime: number
  totalCombinations: number
  linksGenerated: number
}
