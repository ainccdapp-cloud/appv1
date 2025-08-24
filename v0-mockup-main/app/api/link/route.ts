import { type NextRequest, NextResponse } from "next/server"
import { appStore } from "@/lib/store"
import type { EvidenceLink } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const { adjustments, evidence } = await request.json()

    if (!adjustments || !evidence) {
      return NextResponse.json({ error: "Adjustments and evidence are required" }, { status: 400 })
    }

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate mock evidence links
    const links: EvidenceLink[] = []

    adjustments.forEach((adjustment: any) => {
      evidence.forEach((evidenceItem: any) => {
        // Simple mock logic to determine if items should be linked
        const shouldLink = Math.random() > 0.3 // 70% chance of linking

        if (shouldLink) {
          const confidence = Math.floor(Math.random() * 40) + 60 // 60-100% confidence
          const evidenceQuality = confidence >= 85 ? "Strong" : confidence >= 70 ? "Moderate" : "Weak"

          const link: EvidenceLink = {
            adjustmentId: adjustment.adjustmentId,
            evidenceId: evidenceItem.evidenceId,
            isMatch: true,
            confidence,
            connections: [
              `Both relate to ${adjustment.category.toLowerCase()} adjustments`,
              `Evidence demonstrates ${evidenceItem.category.toLowerCase()} effectiveness`,
              `Consistent NCCD level indicators`,
              `Similar implementation approaches`,
            ].slice(0, Math.floor(Math.random() * 3) + 2),
            evidenceQuality,
            missingElements:
              confidence < 80 ? ["Additional quantitative data needed", "Longer observation period required"] : [],
            nccdRelevance: `Supports ${adjustment.nccdLevelIndicator} level funding justification`,
            status: "pending",
          }

          links.push(link)
        }
      })
    })

    // Add links to store
    appStore.addEvidenceLinks(links)

    return NextResponse.json({
      success: true,
      links,
      message: `Generated ${links.length} evidence links`,
    })
  } catch (error) {
    console.error("Linking error:", error)
    return NextResponse.json({ error: "Failed to generate links" }, { status: 500 })
  }
}
