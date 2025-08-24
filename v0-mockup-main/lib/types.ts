// Core data types for Learning Plans and NCCD compliance management

export interface Adjustment {
  adjustmentId: string
  description: string
  category: "Curriculum" | "Assessment" | "Environment" | "Instruction" | "Social"
  successCriteria: string
  implementation: string
  responsibleStaff: string
  nccdLevelIndicator: "Quality Differentiated Teaching Practice" | "Supplementary" | "Substantial" | "Extensive"
  evidenceQuotes: string[]
  rationale: string
  confidence: number // 0-100
}

export interface Evidence {
  evidenceId: string
  description: string
  category: "Assessment" | "Observation" | "Work Sample" | "Report" | "Meeting Notes"
  implementation: string
  outcome: string
  responsibleStaff: string
  timeline: string
  qualityIndicators: string[]
  nccdLevelIndicator: "Quality Differentiated Teaching Practice" | "Supplementary" | "Substantial" | "Extensive"
  evidenceQuotes: string[]
  rationale: string
  confidence: number // 0-100
}

export interface EvidenceLink {
  adjustmentId: string
  evidenceId: string
  isMatch: boolean
  confidence: number // 0-100
  connections: string[]
  evidenceQuality: "Strong" | "Moderate" | "Weak"
  missingElements: string[]
  nccdRelevance: string
  status: "pending" | "accepted" | "rejected"
}

export interface DocumentExtraction {
  adjustments?: Adjustment[]
  evidence?: Evidence[]
  documentType: "Learning Plan" | "Evidence"
  extractedAt: string
}

export interface Student {
  studentId: string
  firstName: string
  lastName: string
  yearLevel: string
  class: string
  hasNCCDFunding: boolean
  disabilities?: string[]
  lastUpdated: string
}

export interface TeacherSummary {
  studentId: string
  student?: Student // Added optional student reference
  adjustments: Adjustment[]
  linkedEvidence: EvidenceLink[]
  overallConfidence: number
  missingEvidence: string[]
  suggestedNextSteps: string[]
  nccdCompliance: {
    level: string
    justification: string
    recommendations: string[]
  }
}

export interface SessionData {
  selectedStudent?: Student
  currentDocuments: DocumentExtraction[]
  evidenceLinks: EvidenceLink[]
}
