"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  LinkIcon, 
  FileText, 
  ClipboardList, 
  ArrowRight, 
  Users, 
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  BarChart3
} from "lucide-react"
import Link from "next/link"

// Import our new hooks and components
import { useData } from "@/hooks/useData"
import { useEvidenceLinks } from "@/hooks/useEvidenceLinks"
import { useSearch } from "@/hooks/useSearch"
import { useNotifications } from "@/hooks/useNotifications"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"
import { SearchFilterBar } from "@/components/ui/search-filter-bar"
import { AdjustmentCard } from "@/components/ui/adjustment-card"
import { EvidenceCard } from "@/components/ui/evidence-card"
import { ProgressIndicator } from "@/components/ui/progress-indicator"
import { EmptyState } from "@/components/ui/empty-state"
import { NotificationToast } from "@/components/ui/notification-toast"

export default function ImprovedDashboardPage() {
  const [selectedView, setSelectedView] = useState<'overview' | 'adjustments' | 'evidence' | 'links'>('overview')
  
  // Use our custom hooks
  const {
    adjustments,
    evidence,
    evidenceLinks,
    stats,
    isLoading,
    error,
    lastRefresh,
    refresh,
    setEvidenceLinks,
    setStats
  } = useData()

  const {
    isLinking,
    linkingProgress,
    error: linkingError,
    generateLinks,
    setError: setLinkingError
  } = useEvidenceLinks()

  const {
    notifications,
    addNotification,
    removeNotification
  } = useNotifications()

  // Search functionality for adjustments and evidence
  const adjustmentSearch = useSearch(adjustments)
  const evidenceSearch = useSearch(evidence)

  const handleLinking = async () => {
    if (adjustments.length === 0 || evidence.length === 0) {
      addNotification({
        type: 'warning',
        title: 'Missing Data',
        message: 'Both adjustments and evidence are required for linking'
      })
      return
    }

    try {
      setLinkingError(null)
      const newLinks = await generateLinks(adjustments, evidence)
      
      setEvidenceLinks(newLinks)
      setStats(prev => ({
        ...prev,
        totalLinks: newLinks.length,
        pendingReviews: newLinks.filter(l => l.status === 'pending').length
      }))

      addNotification({
        type: 'success',
        title: 'Links Generated',
        message: `Successfully generated ${newLinks.length} evidence links for review`
      })

    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Linking Failed',
        message: error instanceof Error ? error.message : 'Failed to generate evidence links'
      })
    }
  }

  const handleViewAdjustment = (adjustment: any) => {
    addNotification({
      type: 'info',
      title: 'Adjustment Details',
      message: `Viewing details for: ${adjustment.description.slice(0, 50)}...`
    })
  }

  const handleViewEvidence = (evidence: any) => {
    addNotification({
      type: 'info',
      title: 'Evidence Details',
      message: `Viewing details for: ${evidence.description.slice(0, 50)}...`
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <LoadingSkeleton variant="text" className="h-8 w-64" />
            <LoadingSkeleton variant="text" className="h-4 w-96" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <LoadingSkeleton key={i} variant="card" className="h-20" />
              ))}
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <LoadingSkeleton variant="card" />
              <LoadingSkeleton variant="card" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            {...notification}
            onClose={removeNotification}
          />
        ))}
      </div>

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
              <Button variant="ghost" size="sm" onClick={refresh} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
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
          {(error || linkingError) && (
            <Alert className="mb-6" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || linkingError}</AlertDescription>
            </Alert>
          )}

          {/* Enhanced Stats Overview with Charts */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <Card className="hover:shadow-md transition-shadow">
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

            <Card className="hover:shadow-md transition-shadow">
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

            <Card className="hover:shadow-md transition-shadow">
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

            <Card className="hover:shadow-md transition-shadow">
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

            <Card className="hover:shadow-md transition-shadow">
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

            <Card className="hover:shadow-md transition-shadow">
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

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.completionRate}%</p>
                    <p className="text-xs text-muted-foreground">Complete</p>
                    <ProgressIndicator 
                      current={stats.completionRate} 
                      total={100} 
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
              {(['overview', 'adjustments', 'evidence', 'links'] as const).map((view) => (
                <Button
                  key={view}
                  variant={selectedView === view ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedView(view)}
                  className="text-xs"
                >
                  {view === 'overview' && <BarChart3 className="h-3 w-3 mr-1" />}
                  {view === 'adjustments' && <ClipboardList className="h-3 w-3 mr-1" />}
                  {view === 'evidence' && <FileText className="h-3 w-3 mr-1" />}
                  {view === 'links' && <LinkIcon className="h-3 w-3 mr-1" />}
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* AI Linking Action - Always Visible */}
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
                  <ProgressIndicator
                    current={linkingProgress}
                    total={100}
                    label="Analyzing evidence connections..."
                    className="mb-4"
                  />
                )}

                <div className="flex items-center gap-4">
                  <Button
                    onClick={handleLinking}
                    disabled={isLinking || adjustments.length === 0 || evidence.length === 0}
                    size="lg"
                  >
                    {isLinking ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing Connections...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="mr-2 h-4 w-4" />
                        {evidenceLinks.length > 0 ? "Re-analyze Links" : "Generate Evidence Links"}
                      </>
                    )}
                  </Button>

                  {evidenceLinks.length > 0 && !isLinking && (
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

          {/* Dynamic Content Based on Selected View */}
          {selectedView === 'overview' && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Adjustments Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Recent Adjustments</span>
                    <Badge variant="outline">{adjustments.length}</Badge>
                  </CardTitle>
                  <CardDescription>
                    Latest learning plan adjustments extracted from uploaded documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {adjustments.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {adjustments.slice(0, 3).map((adjustment) => {
                        const linkedCount = evidenceLinks.filter(l => 
                          l.adjustmentId === adjustment.adjustmentId && l.status === 'approved'
                        ).length
                        return (
                          <AdjustmentCard
                            key={adjustment.adjustmentId}
                            adjustment={adjustment}
                            linkedEvidenceCount={linkedCount}
                            onView={handleViewAdjustment}
                            compact
                          />
                        )
                      })}
                      {adjustments.length > 3 && (
                        <div className="text-center pt-2 border-t">
                          <Button asChild variant="outline" size="sm">
                            <Link href="#" onClick={() => setSelectedView('adjustments')}>
                              View All {adjustments.length} Adjustments
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <EmptyState
                      icon={<ClipboardList className="h-16 w-16" />}
                      title="No Adjustments Found"
                      description="Upload learning plans or IEPs to extract student adjustments"
                      action={{
                        label: "Upload Learning Plan",
                        onClick: () => window.location.href = '/upload'
                      }}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Evidence Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Recent Evidence</span>
                    <Badge variant="outline">{evidence.length}</Badge>
                  </CardTitle>
                  <CardDescription>
                    Latest evidence items extracted from uploaded documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {evidence.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {evidence.slice(0, 3).map((item) => {
                        const linkedCount = evidenceLinks.filter(l => 
                          l.evidenceId === item.evidenceId && l.status === 'approved'
                        ).length
                        return (
                          <EvidenceCard
                            key={item.evidenceId}
                            evidence={item}
                            linkedAdjustmentCount={linkedCount}
                            onView={handleViewEvidence}
                            compact
                          />
                        )
                      })}
                      {evidence.length > 3 && (
                        <div className="text-center pt-2 border-t">
                          <Button asChild variant="outline" size="sm">
                            <Link href="#" onClick={() => setSelectedView('evidence')}>
                              View All {evidence.length} Evidence Items
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <EmptyState
                      icon={<FileText className="h-16 w-16" />}
                      title="No Evidence Found"
                      description="Upload evidence documents, photos, or work samples"
                      action={{
                        label: "Upload Evidence",
                        onClick: () => window.location.href = '/upload'
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {selectedView === 'adjustments' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Learning Plan Adjustments</span>
                  <Badge variant="outline">{adjustmentSearch.filteredCount} of {adjustmentSearch.totalItems}</Badge>
                </CardTitle>
                <CardDescription>
                  AI-extracted adjustments from uploaded learning plans and IEPs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SearchFilterBar
                  searchQuery={adjustmentSearch.searchQuery}
                  onSearchChange={adjustmentSearch.setSearchQuery}
                  filters={adjustmentSearch.filters}
                  onFilterChange={adjustmentSearch.updateFilter}
                  sortOptions={adjustmentSearch.sortOptions}
                  onSortChange={adjustmentSearch.updateSort}
                  onClearFilters={adjustmentSearch.clearFilters}
                  className="mb-6"
                />

                {adjustmentSearch.filteredAndSortedItems.length > 0 ? (
                  <div className="space-y-4">
                    {adjustmentSearch.filteredAndSortedItems.map((adjustment) => {
                      const linkedCount = evidenceLinks.filter(l => 
                        l.adjustmentId === adjustment.adjustmentId && l.status === 'approved'
                      ).length
                      return (
                        <AdjustmentCard
                          key={adjustment.adjustmentId}
                          adjustment={adjustment}
                          linkedEvidenceCount={linkedCount}
                          onView={handleViewAdjustment}
                        />
                      )
                    })}
                  </div>
                ) : (
                  <EmptyState
                    icon={<ClipboardList className="h-16 w-16" />}
                    title="No Adjustments Found"
                    description={adjustmentSearch.searchQuery || Object.keys(adjustmentSearch.filters).length > 0 
                      ? "No adjustments match your search criteria" 
                      : "Upload learning plans or IEPs to extract student adjustments"}
                    action={{
                      label: adjustmentSearch.searchQuery || Object.keys(adjustmentSearch.filters).length > 0 
                        ? "Clear Filters" : "Upload Learning Plan",
                      onClick: adjustmentSearch.searchQuery || Object.keys(adjustmentSearch.filters).length > 0 
                        ? adjustmentSearch.clearFilters : () => window.location.href = '/upload'
                    }}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {selectedView === 'evidence' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Evidence Items</span>
                  <Badge variant="outline">{evidenceSearch.filteredCount} of {evidenceSearch.totalItems}</Badge>
                </CardTitle>
                <CardDescription>
                  AI-extracted evidence from uploaded documents and photos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SearchFilterBar
                  searchQuery={evidenceSearch.searchQuery}
                  onSearchChange={evidenceSearch.setSearchQuery}
                  filters={evidenceSearch.filters}
                  onFilterChange={evidenceSearch.updateFilter}
                  sortOptions={evidenceSearch.sortOptions}
                  onSortChange={evidenceSearch.updateSort}
                  onClearFilters={evidenceSearch.clearFilters}
                  className="mb-6"
                />

                {evidenceSearch.filteredAndSortedItems.length > 0 ? (
                  <div className="space-y-4">
                    {evidenceSearch.filteredAndSortedItems.map((item) => {
                      const linkedCount = evidenceLinks.filter(l => 
                        l.evidenceId === item.evidenceId && l.status === 'approved'
                      ).length
                      return (
                        <EvidenceCard
                          key={item.evidenceId}
                          evidence={item}
                          linkedAdjustmentCount={linkedCount}
                          onView={handleViewEvidence}
                        />
                      )
                    })}
                  </div>
                ) : (
                  <EmptyState
                    icon={<FileText className="h-16 w-16" />}
                    title="No Evidence Found"
                    description={evidenceSearch.searchQuery || Object.keys(evidenceSearch.filters).length > 0 
                      ? "No evidence matches your search criteria" 
                      : "Upload evidence documents, photos, or work samples"}
                    action={{
                      label: evidenceSearch.searchQuery || Object.keys(evidenceSearch.filters).length > 0 
                        ? "Clear Filters" : "Upload Evidence",
                      onClick: evidenceSearch.searchQuery || Object.keys(evidenceSearch.filters).length > 0 
                        ? evidenceSearch.clearFilters : () => window.location.href = '/upload'
                    }}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {selectedView === 'links' && evidenceLinks.length > 0 && (
            <Card>
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
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {evidenceLinks.slice(0, 5).map((link, index) => {
                    const adjustment = adjustments.find((a) => a.adjustmentId === link.adjustmentId)
                    const evidenceItem = evidence.find((e) => e.evidenceId === link.evidenceId)

                    const getQualityVariant = (quality: string) => {
                      switch (quality) {
                        case "Strong": return "default"
                        case "Moderate": return "secondary"
                        case "Weak": return "outline"
                        default: return "outline"
                      }
                    }

                    const getConfidenceColor = (confidence: number) => {
                      if (confidence >= 80) return "text-green-600 dark:text-green-400"
                      if (confidence >= 60) return "text-yellow-600 dark:text-yellow-400"
                      return "text-red-600 dark:text-red-400"
                    }

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
                            <p className="text-blue-700 dark:text-blue-300 text-xs leading-relaxed line-clamp-2">
                              {adjustment?.description || 'Adjustment not found'}
                            </p>
                          </div>
                          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-md">
                            <p className="font-medium text-green-900 dark:text-green-100 mb-1">📄 Evidence:</p>
                            <p className="text-green-700 dark:text-green-300 text-xs leading-relaxed line-clamp-2">
                              {evidenceItem?.description || 'Evidence not found'}
                            </p>
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          <strong>Connection:</strong> {link.connections[0]}
                          {link.connections.length > 1 && ` (+${link.connections.length - 1} more)`}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {evidenceLinks.length > 5 && (
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
                      <Link href="/summary">
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
