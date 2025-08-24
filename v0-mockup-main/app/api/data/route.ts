import { NextResponse } from "next/server"
import { appStore } from "@/lib/store"

export async function GET() {
  try {
    const data = appStore.getLinkedData()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Data fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}
