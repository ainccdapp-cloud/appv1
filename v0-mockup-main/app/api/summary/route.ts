import { type NextRequest, NextResponse } from "next/server"
import { appStore } from "@/lib/store"
import type { TeacherSummary } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const data = appStore.getLinkedData()
    const { adjustments, evidence, links } = data

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Calculate overall confidence
    const acceptedLinks = links.filter((l) => l.status === "accepted")
    const overallConfidence =
      acceptedLinks.length > 0
        ? Math.round(acceptedLinks.reduce((sum, link) => sum + link.confidence, 0) / acceptedLinks.length)
        : 0

    // Determine NCCD level based on adjustments
    const nccdLevels = adjustments.map((a) => a.nccdLevelIndicator)
    const hasExtensive = nccdLevels.includes("Extensive")
    const hasSubstantial = nccdLevels.includes("Substantial")
    const hasSupplementary = nccdLevels.includes("Supplementary")

    let nccdLevel = "Quality Differentiated Teaching Practice"
    if (hasExtensive) nccdLevel = "Extensive"
    else if (hasSubstantial) nccdLevel = "Substantial"
    else if (hasSupplementary) nccdLevel = "Supplementary"

    // Generate missing evidence suggestions
    const missingEvidence = []
    if (acceptedLinks.length < adjustments.length) {
      missingEvidence.push("Some adjustments lack supporting evidence documentation")
    }
    if (acceptedLinks.filter((l) => l.evidenceQuality === "Strong").length < 2) {
      missingEvidence.push("Additional high-quality evidence needed for stronger compliance")
    }
    if (!evidence.some((e) => e.category === "Assessment")) {
      missingEvidence.push("Assessment-based evidence would strengthen the case")
    }

    // Generate next steps
    const suggestedNextSteps = [
      "Continue documenting student progress with regular observations and assessments",
      "Collect additional evidence for adjustments with lower confidence scores",
      "Review and update adjustment strategies based on student response data",
      "Ensure all staff involved are documenting their implementation consistently",
    ]

    // Add specific recommendations based on data
    if (overallConfidence < 70) {
      suggestedNextSteps.unshift("Focus on gathering stronger evidence to improve overall confidence")
    }
    if (missingEvidence.length > 2) {
      suggestedNextSteps.push("Address missing evidence areas identified in this report")
    }

    const summary: TeacherSummary = {
      studentId: "STUDENT-001",
      adjustments,
      linkedEvidence: links,
      overallConfidence,
      missingEvidence,
      suggestedNextSteps: suggestedNextSteps.slice(0, 5), // Limit to 5 steps
      nccdCompliance: {
        level: nccdLevel,
        justification: `Based on current evidence and adjustments, this student qualifies for ${nccdLevel} level support. The evidence demonstrates consistent need for specialized interventions with ${overallConfidence}% confidence in documentation quality.`,
        recommendations: [
          "Maintain detailed records of all adjustment implementations",
          "Continue regular progress monitoring and documentation",
          "Ensure evidence collection covers all adjustment categories",
          "Review and update adjustments based on student progress data",
          "Collaborate with specialists to strengthen intervention strategies",
        ],
      },
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error("Summary generation error:", error)
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 })
  }
}
