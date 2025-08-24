import { type NextRequest, NextResponse } from "next/server"
import { generateMockLearningPlanExtraction, generateMockEvidenceExtraction } from "@/lib/mock-data"
import { appStore } from "@/lib/store"

export async function POST(request: NextRequest) {
  try {
    const { text, documentType, files } = await request.json()

    if (!documentType) {
      return NextResponse.json({ error: "documentType is required" }, { status: 400 })
    }

    if (!text && (!files || files.length === 0)) {
      return NextResponse.json({ error: "Either text or files are required" }, { status: 400 })
    }

    // Simulate AI processing delay (longer for multiple files)
    const processingTime = files ? Math.min(1500 + files.length * 500, 4000) : 1500
    await new Promise((resolve) => setTimeout(resolve, processingTime))

    let extractedData

    if (documentType === "Learning Plan") {
      const inputContent =
        text || `Processing ${files?.length || 0} uploaded files: ${files?.map((f: any) => f.name).join(", ") || ""}`
      const adjustments = generateMockLearningPlanExtraction(inputContent)
      appStore.addAdjustments(adjustments)
      extractedData = {
        documentType,
        adjustments,
        extractedAt: new Date().toISOString(),
        ...(files && { filesProcessed: files.length, fileNames: files.map((f: any) => f.name) }),
      }
    } else if (documentType === "Evidence") {
      const inputContent =
        text || `Processing ${files?.length || 0} uploaded files: ${files?.map((f: any) => f.name).join(", ") || ""}`
      const evidence = generateMockEvidenceExtraction(inputContent)
      appStore.addEvidence(evidence)
      extractedData = {
        documentType,
        evidence,
        extractedAt: new Date().toISOString(),
        ...(files && { filesProcessed: files.length, fileNames: files.map((f: any) => f.name) }),
      }
    } else {
      return NextResponse.json({ error: "Invalid document type" }, { status: 400 })
    }

    return NextResponse.json(extractedData)
  } catch (error) {
    console.error("Extraction error:", error)
    return NextResponse.json({ error: "Failed to extract data" }, { status: 500 })
  }
}
