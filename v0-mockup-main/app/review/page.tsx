"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Eye,
  FileText,
  ClipboardList,
} from "lucide-react"
import Link from "next/link"
import type { Adjustment, Evidence, EvidenceLink } from "@/lib/types"

export default function ReviewPage() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([])
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [evidenceLinks, setEvidenceLinks] = useState<EvidenceLink[]>([])
  const [loading, setLoading] = useState(true)
  const [processingLink, setProcessingLink] = useState<string | null>(null)

  useEffect(() => {
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
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLinkAction = async (adjustmentId: string, evidenceId: string, action: "accepted" | "rejected") => {
    const linkKey = `${adjustmentId}-${evidenceId}`
    setProcessingLink(linkKey)

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adjustmentId,
          evidenceId,
          status: action,
        }),
      })

      if (response.ok) {
        // Update local state
        setEvidenceLinks((prev) =>
          prev.map((link) =>
            link.adjustmentId === adjustmentId && link.evidenceId === evidenceId ? { ...link, status: action } : link,
          ),
        )
      }
    } catch (error) {
      console.error("Failed to update link status:", error)
    } finally {
      setProcessingLink(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Accepted</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending Review</Badge>
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600"
    if (confidence >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "Strong":
        return "text-green-600"
      case "Moderate":
        return "text-yellow-600"
      case "Weak":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const pendingLinks = evidenceLinks.filter((link) => link.status === "pending")
  const acceptedLinks = evidenceLinks.filter((link) => link.status === "accepted")
  const rejectedLinks = evidenceLinks.filter((link) => link.status === "rejected")

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading review data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Evidence Link Review</h1>
              <p className="text-muted-foreground">
                Review and approve AI-generated connections between adjustments and evidence
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/dashboard">← Back to Dashboard</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/summary">View Summary</Link>
              </Button>
            </div>
          </div>

          {/* Review Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold">{pendingLinks.length}</p>
                    <p className="text-sm text-muted-foreground">Pending Review</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{acceptedLinks.length}</p>
                    <p className="text-sm text-muted-foreground">Accepted</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold">{rejectedLinks.length}</p>
                    <p className="text-sm text-muted-foreground">Rejected</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{evidenceLinks.length}</p>
                    <p className="text-sm text-muted-foreground">Total Links</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Overview */}
          {evidenceLinks.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Review Progress</CardTitle>
                <CardDescription>Track your progress reviewing evidence links</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Progress</span>
                      <span>
                        {Math.round(((acceptedLinks.length + rejectedLinks.length) / evidenceLinks.length) * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={((acceptedLinks.length + rejectedLinks.length) / evidenceLinks.length) * 100}
                      className="h-2"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Accepted: {acceptedLinks.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Rejected: {rejectedLinks.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Pending: {pendingLinks.length}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Evidence Links */}
          {evidenceLinks.length > 0 ? (
            <div className="space-y-6">
              {evidenceLinks.map((link, index) => {
                const adjustment = adjustments.find((a) => a.adjustmentId === link.adjustmentId)
                const evidenceItem = evidence.find((e) => e.evidenceId === link.evidenceId)
                const linkKey = `${link.adjustmentId}-${link.evidenceId}`
                const isProcessing = processingLink === linkKey

                return (
                  <Card
                    key={index}
                    className={`transition-all ${
                      link.status === "accepted"
                        ? "border-green-200 bg-green-50/50"
                        : link.status === "rejected"
                          ? "border-red-200 bg-red-50/50"
                          : "border-yellow-200 bg-yellow-50/50"
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(link.status)}
                          <div>
                            <CardTitle className="text-lg">Evidence Link #{index + 1}</CardTitle>
                            <CardDescription>
                              AI Confidence:{" "}
                              <span className={`font-medium ${getConfidenceColor(link.confidence)}`}>
                                {link.confidence}%
                              </span>
                              {" • "}
                              Quality:{" "}
                              <span className={`font-medium ${getQualityColor(link.evidenceQuality)}`}>
                                {link.evidenceQuality}
                              </span>
                            </CardDescription>
                          </div>
                        </div>
                        {getStatusBadge(link.status)}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      {/* Adjustment and Evidence Details */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <ClipboardList className="h-4 w-4" />
                            Adjustment
                          </div>
                          <div className="bg-background border rounded-lg p-4">
                            <h4 className="font-medium mb-2">{adjustment?.description}</h4>
                            <div className="space-y-2 text-sm text-muted-foreground">
                              <p>
                                <strong>Category:</strong> {adjustment?.category}
                              </p>
                              <p>
                                <strong>Implementation:</strong> {adjustment?.implementation}
                              </p>
                              <p>
                                <strong>Staff:</strong> {adjustment?.responsibleStaff}
                              </p>
                              <Badge variant="secondary" className="text-xs">
                                {adjustment?.nccdLevelIndicator}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <FileText className="h-4 w-4" />
                            Evidence
                          </div>
                          <div className="bg-background border rounded-lg p-4">
                            <h4 className="font-medium mb-2">{evidenceItem?.description}</h4>
                            <div className="space-y-2 text-sm text-muted-foreground">
                              <p>
                                <strong>Category:</strong> {evidenceItem?.category}
                              </p>
                              <p>
                                <strong>Outcome:</strong> {evidenceItem?.outcome}
                              </p>
                              <p>
                                <strong>Timeline:</strong> {evidenceItem?.timeline}
                              </p>
                              <Badge variant="secondary" className="text-xs">
                                {evidenceItem?.nccdLevelIndicator}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* AI Analysis */}
                      <div className="space-y-4">
                        <h4 className="font-medium">AI Analysis</h4>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-sm font-medium mb-2">Identified Connections</h5>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                              {link.connections.map((connection, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-primary mt-1">•</span>
                                  {connection}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h5 className="text-sm font-medium mb-2">NCCD Relevance</h5>
                            <p className="text-sm text-muted-foreground">{link.nccdRelevance}</p>

                            {link.missingElements.length > 0 && (
                              <div className="mt-3">
                                <h5 className="text-sm font-medium mb-2 text-yellow-600">Missing Elements</h5>
                                <ul className="space-y-1 text-sm text-muted-foreground">
                                  {link.missingElements.map((element, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <AlertTriangle className="h-3 w-3 text-yellow-600 mt-1 flex-shrink-0" />
                                      {element}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {link.status === "pending" && (
                        <div className="flex gap-3 pt-4 border-t">
                          <Button
                            onClick={() => handleLinkAction(link.adjustmentId, link.evidenceId, "accepted")}
                            disabled={isProcessing}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <ThumbsUp className="mr-2 h-4 w-4" />
                            Accept Link
                          </Button>
                          <Button
                            onClick={() => handleLinkAction(link.adjustmentId, link.evidenceId, "rejected")}
                            disabled={isProcessing}
                            variant="destructive"
                          >
                            <ThumbsDown className="mr-2 h-4 w-4" />
                            Reject Link
                          </Button>
                        </div>
                      )}

                      {link.status !== "pending" && (
                        <Alert className={link.status === "accepted" ? "border-green-200" : "border-red-200"}>
                          <AlertDescription>
                            This link has been {link.status}.
                            {link.status === "accepted"
                              ? " It will be included in compliance reports."
                              : " It will not be used for NCCD justification."}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Evidence Links to Review</h3>
                <p className="text-muted-foreground mb-4">
                  Generate evidence links from the dashboard to start reviewing connections.
                </p>
                <Button asChild>
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
