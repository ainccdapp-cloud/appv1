"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Loader2, 
  LinkIcon, 
  FileText, 
  ClipboardList, 
  ArrowRight, 
  Users, 
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw
} from "lucide-react"
import Link from "next/link"

// Types (would be imported from @/lib/types in production)
interface Adjustment {
  adjustmentId: string
  studentId?: string
  description: string
  category: 'Quality Differentiated Teaching Practice' | 'Supplementary' | 'Substantial' | 'Extensive'
  implementation: string
  responsibleStaff: string
  nccdLevelIndicator: 'Quality Differentiated Teaching Practice' | 'Supplementary' | 'Substantial' | 'Extensive'
  confidence: number
  subject?: string
  status: 'active' | 'completed' | 'discontinued'
}

interface Evidence {
  evidenceId: string
  studentId?: string
  description: string
  category: 'Assessment' | 'Observation' | 'Work Sample' | 'Photo' | 'Video' | 'Report' | 'Other'
  outcome: string
  timeline: string
  nccdLevelIndicator: 'Quality Differentiated Teaching Practice' | 'Supplementary' | 'Substantial' | 'Extensive'
  confidence: number
  subject?: string
}

interface EvidenceLink {
  linkId: string
  adjustmentId: string
  evidenceId: string
  confidence: number
  evidenceQuality: 'Strong' | 'Moderate' | 'Weak'
  status: 'pending' | 'approved' | 'rejected'
  connections: string[]
  aiReasoning?: string
  createdAt: string
}

interface DashboardStats {
  totalStudents: number
  totalAdjustments: number
  totalEvidence: number
  totalLinks: number
  pendingReviews: number
  approvedLinks: number
  completionRate: number
}

export default function EnhancedDashboardPage() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([])
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [evidenceLinks, setEvidenceLinks] = useState<EvidenceLink[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalAdjustments: 0,
    totalEvidence: 0,
    totalLinks: 0,
    pendingReviews: 0,
    approvedLinks: 0,
    completionRate: 0
  })
  
  const [isLinking, setIsLinking] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [linkingProgress, setLinkingProgress] = useState(0)
  const [hasLinked, setHasLinked] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch("/api/data")
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`)
      }
      
      const data = await response.json()
      setAdjustments(data.adjustments || [])
      setEvidence(data.evidence || [])
      setEvidenceLinks(data.links || [])
      setStats(data.stats || stats)
      setHasLinked(data.links?.length > 0)
      setLastRefresh(new Date())
      
    } catch (error) {
      console.error("Failed to fetch data:", error)
      setError(error instanceof Error ? error.message : "Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLinking = async () => {
    if (adjustments.length === 0 || evidence.length === 0) {
      setError("Both adjustments and evidence are required for linking")
      return
    }

    setIsLinking(true)
    setError(null)
    setLinkingProgress(0)

    // Progress simulation
    const progressInterval = setInterval(() => {
      setLinkingProgress(prev => Math.min(prev + 15, 90))
    }, 500)

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

      clearInterval(progressInterval)
      setLinkingProgress(100)

      if (!response.ok) {
        throw new Error(`Linking failed: ${response.status}`)
      }

      const linkedData = await response.json()
      setEvidenceLinks(linkedData.links)
      setHasLinked(true)
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalLinks: linkedData.links.length,
        pendingReviews: linkedData.links.filter((l: EvidenceLink) => l.status === 'pending').length
      }))

    } catch (error) {
      console.error("Linking failed:", error)
      setError(error instanceof Error ? error.message : "Failed to generate evidence links")
      clearInterval(progressInterval)
    } finally {
      setIsLinking(false)
      setTimeout(() => setLinkingProgress(0), 1000)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600 dark:text-green-400"
    if (confidence >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getQualityVariant = (quality: string) => {
    switch (quality) {
      case "Strong": return "default"
      case "Moderate": return "secondary"
      case "Weak": return "outline"
      default: return "outline"
    }
  }

  const getNCCDLevelColor = (level: string) => {
    switch (level) {
      case "Quality Differentiated Teaching Practice": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "Supplementary": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "Substantial": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "Extensive": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">NCCD Dashboard</h1>
              <p className="text-muted-foreground">
                Manage student adjustments and evidence with AI-powered linking analysis
              </p>
              {lastRefresh && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={fetchData} disabled={isLoading}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              <Button asChild variant="outline">
                <Link href="/">← Back to Home</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/upload">Upload More</Link>
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="mb-6" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalStudents}</p>
                    <p className="text-xs text-muted-foreground">Students</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalAdjustments}</p>
                    <p className="text-xs text-muted-foreground">Adjustments</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalEvidence}</p>
                    <p className="text-xs text-muted-foreground">Evidence</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-indigo-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalLinks}</p>
                    <p className="text-xs text-muted-foreground">Links</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.pendingReviews}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.approvedLinks}</p>
                    <p className="text-xs text-muted-foreground">Approved</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-gradient-to-r from-green-500 to-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.completionRate}%</p>
                    <p className="text-xs text-muted-foreground">Complete</p>
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
                AI Evidence Linking
              </CardTitle>
              <CardDescription>
                Automatically connect evidence to adjustments using AI-powered content analysis and NCCD guidelines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLinking && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Analyzing evidence connections...</span>
                      <span>{linkingProgress}%</span>
                    </div>
                    <Progress value={linkingProgress} className="w-full" />
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <Button
                    onClick={handleLinking}
                    disabled={isLinking || adjustments.length === 0 || evidence.length === 0}
                    size="lg"
                  >
                    {isLinking ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing Connections...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="mr-2 h-4 w-4" />
                        {hasLinked ? "Re-analyze Links" : "Generate Evidence Links"}
                      </>
                    )}
                  </Button>

                  {hasLinked && !isLinking && (
                    <Button asChild variant="outline">
                      <Link href="/review">
                        Review Links ({stats.pendingReviews} pending)
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>

                {(adjustments.length === 0 || evidence.length === 0) && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Upload both learning plans and evidence documents to enable AI linking analysis.
                      <div className="flex gap-2 mt-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href="/upload">Upload Learning Plans</Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link href="/upload">Upload Evidence</Link>
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Adjustments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Learning Plan Adjustments</span>
                  <Badge variant="outline">{adjustments.length}</Badge>
                </CardTitle>
                <CardDescription>
                  AI-extracted adjustments from uploaded learning plans and IEPs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {adjustments.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {adjustments.map((adjustment) => (
                      <div key={adjustment.adjustmentId} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-sm leading-5">{adjustment.description}</h4>
                          <div className="flex flex-col gap-1">
                            <Badge 
                              className={`text-xs ${getNCCDLevelColor(adjustment.nccdLevelIndicator)} border-0`}
                            >
                              {adjustment.nccdLevelIndicator === 'Quality Differentiated Teaching Practice' ? 'QDTP' : adjustment.nccdLevelIndicator}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {adjustment.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="font-medium text-foreground">Implementation:</span>
                              <p className="text-xs mt-1">{adjustment.implementation}</p>
                            </div>
                            <div>
                              <span className="font-medium text-foreground">Responsible Staff:</span>
                              <p className="text-xs mt-1">{adjustment.responsibleStaff}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-2">
                              {adjustment.subject && (
                                <Badge variant="secondary" className="text-xs">
                                  {adjustment.subject}
                                </Badge>
                              )}
                              <span className={`text-xs font-medium ${getConfidenceColor(adjustment.confidence)}`}>
                                {adjustment.confidence}% confidence
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ID: {adjustment.adjustmentId}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <ClipboardList className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <h3 className="text-lg font-medium mb-2">No Adjustments Found</h3>
                    <p className="text-sm mb-4">Upload learning plans or IEPs to extract student adjustments</p>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/upload">Upload Learning Plan</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Evidence */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Evidence Items</span>
                  <Badge variant="outline">{evidence.length}</Badge>
                </CardTitle>
                <CardDescription>
                  AI-extracted evidence from uploaded documents and photos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {evidence.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {evidence.map((item) => (
                      <div key={item.evidenceId} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-sm leading-5">{item.description}</h4>
                          <div className="flex flex-col gap-1">
                            <Badge 
                              className={`text-xs ${getNCCDLevelColor(item.nccdLevelIndicator)} border-0`}
                            >
                              {item.nccdLevelIndicator === 'Quality Differentiated Teaching Practice' ? 'QDTP' : item.nccdLevelIndicator}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {item.category}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium text-foreground">Outcome:</span>
                            <p className="text-xs mt-1">{item.outcome}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="font-medium text-foreground">Timeline:</span>
                              <p className="text-xs mt-1">{item.timeline}</p>
                            </div>
                            {item.subject && (
                              <div>
                                <span className="font-medium text-foreground">Subject:</span>
                                <p className="text-xs mt-1">{item.subject}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t">
                            <span className={`text-xs font-medium ${getConfidenceColor(item.confidence)}`}>
                              {item.confidence}% confidence
                            </span>
                            <div className="text-xs text-muted-foreground">
                              ID: {item.evidenceId}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <h3 className="text-lg font-medium mb-2">No Evidence Found</h3>
                    <p className="text-sm mb-4">Upload evidence documents, photos, or work samples</p>
                    <Button asChild variant="outline" size="sm">
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
                <CardTitle className="flex items-center justify-between">
                  <span>AI-Generated Evidence Links</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{evidenceLinks.length} total</Badge>
                    <Badge variant="secondary">{stats.pendingReviews} pending</Badge>
                  </div>
                </CardTitle>
                <CardDescription>
                  Automatically generated connections between adjustments and evidence based on NCCD guidelines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {evidenceLinks.map((link, index) => {
                    const adjustment = adjustments.find((a) => a.adjustmentId === link.adjustmentId)
                    const evidenceItem = evidence.find((e) => e.evidenceId === link.evidenceId)

                    return (
                      <div key={link.linkId} className="border rounded-lg p-4 hover:bg-muted/25 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge variant={getQualityVariant(link.evidenceQuality)} className="text-xs">
                              {link.evidenceQuality} Match
                            </Badge>
                            <span className={`text-sm font-medium ${getConfidenceColor(link.confidence)}`}>
                              {link.confidence}% confidence
                            </span>
                            <Badge 
                              variant={link.status === "pending" ? "secondary" : 
                                      link.status === "approved" ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {link.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(link.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 text-sm mb-3">
                          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                            <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">📋 Adjustment:</p>
                            <p className="text-blue-700 dark:text-blue-300 text-xs leading-relaxed">
                              {adjustment?.description || 'Adjustment not found'}
                            </p>
                            {adjustment && (
                              <Badge className={`mt-2 text-xs ${getNCCDLevelColor(adjustment.nccdLevelIndicator)} border-0`}>
                                {adjustment.nccdLevelIndicator === 'Quality Differentiated Teaching Practice' ? 'QDTP' : adjustment.nccdLevelIndicator}
                              </Badge>
                            )}
                          </div>
                          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-md">
                            <p className="font-medium text-green-900 dark:text-green-100 mb-1">📄 Evidence:</p>
                            <p className="text-green-700 dark:text-green-300 text-xs leading-relaxed">
                              {evidenceItem?.description || 'Evidence not found'}
                            </p>
                            {evidenceItem && (
                              <Badge className={`mt-2 text-xs ${getNCCDLevelColor(evidenceItem.nccdLevelIndicator)} border-0`}>
                                {evidenceItem.nccdLevelIndicator === 'Quality Differentiated Teaching Practice' ? 'QDTP' : evidenceItem.nccdLevelIndicator}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <Separator className="my-3" />

                        <div className="text-sm">
                          <p className="font-medium mb-2 text-foreground">🔗 Connection Analysis:</p>
                          <ul className="text-muted-foreground space-y-1 text-xs">
                            {link.connections.map((connection, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span className="leading-relaxed">{connection}</span>
                              </li>
                            ))}
                          </ul>
                          {link.aiReasoning && (
                            <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                              <span className="font-medium">AI Analysis:</span> {link.aiReasoning}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {evidenceLinks.length > 3 && (
                  <div className="text-center pt-4 border-t">
                    <Button asChild variant="outline">
                      <Link href="/review">
                        View All Links & Review
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          {(adjustments.length > 0 || evidence.length > 0 || evidenceLinks.length > 0) && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
                <CardDescription>Recommended actions based on your current data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {stats.pendingReviews > 0 && (
                    <Button asChild className="justify-start h-auto p-4">
                      <Link href="/review">
                        <div className="text-left">
                          <div className="font-medium">Review Pending Links</div>
                          <div className="text-sm opacity-90">{stats.pendingReviews} links awaiting review</div>
                        </div>
                      </Link>
                    </Button>
                  )}
                  
                  {adjustments.length > 0 && (
                    <Button asChild variant="outline" className="justify-start h-auto p-4">
                      <Link href="/reports">
                        <div className="text-left">
                          <div className="font-medium">Generate Reports</div>
                          <div className="text-sm opacity-70">Create NCCD compliance reports</div>
                        </div>
                      </Link>
                    </Button>
                  )}
                  
                  <Button asChild variant="outline" className="justify-start h-auto p-4">
                    <Link href="/upload">
                      <div className="text-left">
                        <div className="font-medium">Upload More Data</div>
                        <div className="text-sm opacity-70">Add more learning plans or evidence</div>
                      </div>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
