"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, LinkIcon, FileText, ClipboardList, ArrowRight } from "lucide-react"
import Link from "next/link"
import type { Adjustment, Evidence, EvidenceLink } from "@/lib/types"

export default function DashboardPage() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([])
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [evidenceLinks, setEvidenceLinks] = useState<EvidenceLink[]>([])
  const [isLinking, setIsLinking] = useState(false)
  const [hasLinked, setHasLinked] = useState(false)

  useEffect(() => {
    // Load initial data from the store
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch("/api/data")
      if (response.ok) {
        const data = await response.json()
        setAdjustments(data.adjustments || [])
        setEvidence(data.evidence || [])
        setEvidenceLinks(data.links || [])
        setHasLinked(data.links?.length > 0)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    }
  }

  const handleLinking = async () => {
    setIsLinking(true)

    try {
      const response = await fetch("/api/link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adjustments,
          evidence,
        }),
      })

      if (response.ok) {
        const linkedData = await response.json()
        setEvidenceLinks(linkedData.links)
        setHasLinked(true)
      }
    } catch (error) {
      console.error("Linking failed:", error)
    } finally {
      setIsLinking(false)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600"
    if (confidence >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getQualityVariant = (quality: string) => {
    switch (quality) {
      case "Strong":
        return "default"
      case "Moderate":
        return "secondary"
      case "Weak":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
              <p className="text-muted-foreground">
                View all extracted adjustments and evidence with AI-powered linking
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline">
                <Link href="/">← Back to Home</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/upload">Upload More</Link>
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{adjustments.length}</p>
                    <p className="text-sm text-muted-foreground">Adjustments</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{evidence.length}</p>
                    <p className="text-sm text-muted-foreground">Evidence Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{evidenceLinks.length}</p>
                    <p className="text-sm text-muted-foreground">Evidence Links</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">{evidenceLinks.filter((l) => l.status === "pending").length}</p>
                    <p className="text-sm text-muted-foreground">Pending Review</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Linking Action */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Evidence Linking
              </CardTitle>
              <CardDescription>
                Use AI to automatically link evidence to adjustments based on content analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleLinking}
                  disabled={isLinking || adjustments.length === 0 || evidence.length === 0}
                  size="lg"
                >
                  {isLinking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Links...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="mr-2 h-4 w-4" />
                      {hasLinked ? "Re-analyze Links" : "Generate Links"}
                    </>
                  )}
                </Button>

                {hasLinked && (
                  <Button asChild variant="outline">
                    <Link href="/review">
                      Review Links
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>

              {(adjustments.length === 0 || evidence.length === 0) && (
                <p className="text-sm text-muted-foreground mt-2">
                  Upload both learning plans and evidence documents to enable linking
                </p>
              )}
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Adjustments */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Plan Adjustments</CardTitle>
                <CardDescription>Extracted adjustments from uploaded learning plans</CardDescription>
              </CardHeader>
              <CardContent>
                {adjustments.length > 0 ? (
                  <div className="space-y-4">
                    {adjustments.map((adjustment) => (
                      <div key={adjustment.adjustmentId} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">{adjustment.description}</h4>
                          <Badge variant="outline" className="text-xs">
                            {adjustment.category}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p>
                            <strong>Implementation:</strong> {adjustment.implementation}
                          </p>
                          <p>
                            <strong>Staff:</strong> {adjustment.responsibleStaff}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {adjustment.nccdLevelIndicator}
                            </Badge>
                            <span className={`text-xs font-medium ${getConfidenceColor(adjustment.confidence)}`}>
                              {adjustment.confidence}% confidence
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No adjustments found</p>
                    <Button asChild variant="outline" size="sm" className="mt-2 bg-transparent">
                      <Link href="/upload">Upload Learning Plan</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Evidence */}
            <Card>
              <CardHeader>
                <CardTitle>Evidence Items</CardTitle>
                <CardDescription>Extracted evidence from uploaded documents</CardDescription>
              </CardHeader>
              <CardContent>
                {evidence.length > 0 ? (
                  <div className="space-y-4">
                    {evidence.map((item) => (
                      <div key={item.evidenceId} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">{item.description}</h4>
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p>
                            <strong>Outcome:</strong> {item.outcome}
                          </p>
                          <p>
                            <strong>Timeline:</strong> {item.timeline}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {item.nccdLevelIndicator}
                            </Badge>
                            <span className={`text-xs font-medium ${getConfidenceColor(item.confidence)}`}>
                              {item.confidence}% confidence
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No evidence found</p>
                    <Button asChild variant="outline" size="sm" className="mt-2 bg-transparent">
                      <Link href="/upload">Upload Evidence</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Evidence Links */}
          {evidenceLinks.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Evidence Links</CardTitle>
                <CardDescription>AI-generated connections between adjustments and evidence</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {evidenceLinks.map((link, index) => {
                    const adjustment = adjustments.find((a) => a.adjustmentId === link.adjustmentId)
                    const evidenceItem = evidence.find((e) => e.evidenceId === link.evidenceId)

                    return (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant={getQualityVariant(link.evidenceQuality)}>
                              {link.evidenceQuality} Match
                            </Badge>
                            <span className={`text-sm font-medium ${getConfidenceColor(link.confidence)}`}>
                              {link.confidence}% confidence
                            </span>
                          </div>
                          <Badge variant={link.status === "pending" ? "secondary" : "default"}>{link.status}</Badge>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium mb-1">Adjustment:</p>
                            <p className="text-muted-foreground">{adjustment?.description}</p>
                          </div>
                          <div>
                            <p className="font-medium mb-1">Evidence:</p>
                            <p className="text-muted-foreground">{evidenceItem?.description}</p>
                          </div>
                        </div>

                        <Separator className="my-3" />

                        <div className="text-sm">
                          <p className="font-medium mb-1">Connections:</p>
                          <ul className="text-muted-foreground space-y-1">
                            {link.connections.map((connection, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                {connection}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
