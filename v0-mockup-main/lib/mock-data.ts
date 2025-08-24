import type { Adjustment, Evidence, Student } from "./types"

// Mock API response generators for extraction simulation
export const generateMockLearningPlanExtraction = (text: string): Adjustment[] => {
  return [
    {
      adjustmentId: `adj-${Date.now()}`,
      description: "Extracted adjustment from learning plan",
      category: "Curriculum",
      successCriteria: "Student will demonstrate improved understanding",
      implementation: "Implement differentiated instruction strategies",
      responsibleStaff: "Classroom Teacher",
      nccdLevelIndicator: "Supplementary",
      evidenceQuotes: ["Key quote from document"],
      rationale: "Based on student needs assessment",
      confidence: 80,
    },
  ]
}

export const generateMockEvidenceExtraction = (text: string): Evidence[] => {
  return [
    {
      evidenceId: `ev-${Date.now()}`,
      description: "Extracted evidence from document",
      category: "Assessment",
      implementation: "Applied adjustment in classroom setting",
      outcome: "Positive student response observed",
      responsibleStaff: "Teacher",
      timeline: new Date().toISOString().split("T")[0],
      qualityIndicators: ["Measurable improvement", "Consistent application"],
      nccdLevelIndicator: "Supplementary",
      evidenceQuotes: ["Supporting quote from evidence"],
      rationale: "Evidence supports adjustment effectiveness",
      confidence: 85,
    },
  ]
}

export const mockStudents: Student[] = [
  {
    studentId: "std-001",
    firstName: "Emma",
    lastName: "Johnson",
    yearLevel: "Year 3",
    class: "3A",
    hasNCCDFunding: true,
    disabilities: ["Autism Spectrum Disorder"],
    lastUpdated: "2024-01-15",
  },
  {
    studentId: "std-002",
    firstName: "Liam",
    lastName: "Chen",
    yearLevel: "Year 5",
    class: "5B",
    hasNCCDFunding: true,
    disabilities: ["ADHD", "Learning Disability"],
    lastUpdated: "2024-01-20",
  },
  {
    studentId: "std-003",
    firstName: "Sophia",
    lastName: "Williams",
    yearLevel: "Year 2",
    class: "2C",
    hasNCCDFunding: false,
    disabilities: ["Speech Delay"],
    lastUpdated: "2024-01-18",
  },
  {
    studentId: "std-004",
    firstName: "Noah",
    lastName: "Brown",
    yearLevel: "Year 4",
    class: "4A",
    hasNCCDFunding: true,
    disabilities: ["Intellectual Disability"],
    lastUpdated: "2024-01-22",
  },
  {
    studentId: "std-005",
    firstName: "Ava",
    lastName: "Davis",
    yearLevel: "Year 6",
    class: "6B",
    hasNCCDFunding: true,
    disabilities: ["Physical Disability", "Vision Impairment"],
    lastUpdated: "2024-01-25",
  },
]
