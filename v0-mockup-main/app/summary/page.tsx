"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { FileText, RefreshCw, CheckCircle, AlertTriangle, TrendingUp, Users, Calendar, Printer } from "lucide-react"
import Link from "next/link"
import type { TeacherSummary } from "@/lib/types"

export default function SummaryPage() {
  const [summary, setSummary] = useState<TeacherSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    generateSummary()
  }, [])

  const generateSummary = async () => {
    setGenerating(true)

    try {
      const response = await fetch("/api/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const summaryData = await response.json()
        setSummary(summaryData)
      }
    } catch (error) {
      console.error("Failed to generate summary:", error)
    } finally {
      setLoading(false)
      setGenerating(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600"
    if (confidence >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getComplianceColor = (level: string) => {
    switch (level) {
      case "Extensive":
        return "text-purple-600"
      case "Substantial":
        return "text-blue-600"
      case "Supplementary":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Generating teacher summary...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 print:mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Teacher Summary Report</h1>
              <p className="text-muted-foreground">
                Comprehensive overview of learning adjustments and evidence compliance
              </p>
            </div>
            <div className="flex gap-2 print:hidden">
              <Button onClick={generateSummary} disabled={generating} variant="outline">
                <RefreshCw className={`mr-2 h-4 w-4 ${generating ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button onClick={handlePrint} variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button asChild variant="outline">
                <Link href="/review">← Back to Review</Link>
              </Button>
            </div>
          </div>

          {summary ? (
            <div className="space-y-8">
              {/* Executive Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Executive Summary
                  </CardTitle>
                  <CardDescription>
                    Generated on {new Date().toLocaleDateString()} • Student ID: {summary.studentId}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">{summary.adjustments.length}</div>
                      <p className="text-sm text-muted-foreground">Active Adjustments</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {summary.linkedEvidence.filter((l) => l.status === "accepted").length}
                      </div>
                      <p className="text-sm text-muted-foreground">Verified Evidence Links</p>
                    </div>
                    <div className="text-center">
                      <div className={`text-3xl font-bold mb-2 ${getConfidenceColor(summary.overallConfidence)}`}>
                        {summary.overallConfidence}%
                      </div>
                      <p className="text-sm text-muted-foreground">Overall Confidence</p>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">NCCD Compliance Status</h4>
                      <div className="flex items-center gap-3">
                        <Badge className={`${getComplianceColor(summary.nccdCompliance.level)} bg-transparent border`}>
                          {summary.nccdCompliance.level}
                        </Badge>
                        <Progress value={summary.overallConfidence} className="flex-1 h-2" />
                        <span className="text-sm text-muted-foreground">
                          {summary.overallConfidence}% Evidence Strength
                        </span>
                      </div>
                    </div>

                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>{summary.nccdCompliance.justification}</AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Adjustments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Learning Adjustments Overview
                  </CardTitle>
                  <CardDescription>Current adjustments and their implementation status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {summary.adjustments.map((adjustment, index) => {
                      const linkedEvidence = summary.linkedEvidence.filter(
                        (l) => l.adjustmentId === adjustment.adjustmentId && l.status === "accepted",
                      )

                      return (
                        <div key={adjustment.adjustmentId} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium mb-1">{adjustment.description}</h4>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {adjustment.category}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {adjustment.nccdLevelIndicator}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-medium ${getConfidenceColor(adjustment.confidence)}`}>
                                {adjustment.confidence}% confidence
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {linkedEvidence.length} evidence link{linkedEvidence.length !== 1 ? "s" : ""}
                              </div>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium mb-1">Implementation:</p>
                              <p className="text-muted-foreground">{adjustment.implementation}</p>
                            </div>
                            <div>
                              <p className="font-medium mb-1">Success Criteria:</p>
                              <p className="text-muted-foreground">{adjustment.successCriteria}</p>
                            </div>
                          </div>

                          <div className="mt-3 text-sm">
                            <p className="font-medium mb-1">Responsible Staff:</p>
                            <p className="text-muted-foreground">{adjustment.responsibleStaff}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Evidence Quality Assessment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Evidence Quality Assessment
                  </CardTitle>
                  <CardDescription>Analysis of evidence strength and coverage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Evidence Quality Breakdown */}
                    <div>
                      <h4 className="font-medium mb-3">Evidence Quality Distribution</h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        {["Strong", "Moderate", "Weak"].map((quality) => {
                          const count = summary.linkedEvidence.filter(
                            (l) => l.evidenceQuality === quality && l.status === "accepted",
                          ).length
                          const percentage =
                            summary.linkedEvidence.length > 0 ? (count / summary.linkedEvidence.length) * 100 : 0

                          return (
                            <div key={quality} className="text-center p-4 border rounded-lg">
                              <div
                                className={`text-2xl font-bold mb-1 ${getConfidenceColor(quality === "Strong" ? 90 : quality === "Moderate" ? 70 : 50)}`}
                              >
                                {count}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{quality} Evidence</p>
                              <Progress value={percentage} className="h-2" />
                              <p className="text-xs text-muted-foreground mt-1">{Math.round(percentage)}%</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Missing Evidence */}
                    {summary.missingEvidence.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          Missing Evidence Areas
                        </h4>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <ul className="space-y-2">
                            {summary.missingEvidence.map((missing, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <span className="text-yellow-600 mt-1">•</span>
                                <span>{missing}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Recommended Next Steps
                  </CardTitle>
                  <CardDescription>Actionable recommendations to strengthen NCCD compliance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {summary.suggestedNextSteps.map((step, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-sm">{step}</p>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-6" />

                  <div>
                    <h4 className="font-medium mb-3">NCCD Compliance Recommendations</h4>
                    <div className="space-y-2">
                      {summary.nccdCompliance.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Footer */}
              <Card className="print:hidden">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                      This report was generated automatically based on uploaded learning plans and evidence. Review all
                      recommendations with your educational team before implementation.
                    </p>
                    <div className="flex justify-center gap-2">
                      <Button asChild>
                        <Link href="/upload">Upload More Documents</Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href="/review">Review Evidence Links</Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href="/dashboard">View Dashboard</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Data Available</h3>
                <p className="text-muted-foreground mb-4">
                  Upload learning plans and evidence to generate a comprehensive summary report.
                </p>
                <Button asChild>
                  <Link href="/upload">Upload Documents</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
