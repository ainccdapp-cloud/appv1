import { type NextRequest, NextResponse } from "next/server"
import { appStore } from "@/lib/store"

export async function POST(request: NextRequest) {
  try {
    const { adjustmentId, evidenceId, status } = await request.json()

    if (!adjustmentId || !evidenceId || !status) {
      return NextResponse.json({ error: "adjustmentId, evidenceId, and status are required" }, { status: 400 })
    }

    if (!["accepted", "rejected"].includes(status)) {
      return NextResponse.json({ error: 'Status must be either "accepted" or "rejected"' }, { status: 400 })
    }

    // Update the evidence link status in the store
    appStore.updateEvidenceLinkStatus(adjustmentId, evidenceId, status)

    return NextResponse.json({
      success: true,
      message: `Evidence link ${status} successfully`,
    })
  } catch (error) {
    console.error("Review update error:", error)
    return NextResponse.json({ error: "Failed to update review status" }, { status: 500 })
  }
}
