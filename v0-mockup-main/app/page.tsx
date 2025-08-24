import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function HomePage() {
  // You'll want to fetch this data from your database
  const stats = {
    totalStudents: 0,
    pendingReviews: 0,
    completionRate: 0,
    recentUploads: 0
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with school context */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant="outline">School Dashboard</Badge>
              <Badge variant="secondary">2025 NCCD Cycle</Badge>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              NCCD Compliance Hub
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Streamline your NCCD reporting with AI-powered evidence matching, 
              automated compliance tracking, and comprehensive student support documentation
            </p>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
                <p className="text-sm text-muted-foreground">Students</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-orange-600">{stats.pendingReviews}</div>
                <p className="text-sm text-muted-foreground">Pending Reviews</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{stats.completionRate}%</div>
                <p className="text-sm text-muted-foreground">Complete</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.recentUploads}</div>
                <p className="text-sm text-muted-foreground">Recent Uploads</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Action Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-all hover:scale-105">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    📄 Upload & Extract
                  </span>
                  <Badge variant="outline">New</Badge>
                </CardTitle>
                <CardDescription>
                  Upload learning plans, IEPs, or evidence documents. 
                  AI will extract key adjustments and requirements automatically.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/upload">Start Upload</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all hover:scale-105">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    📊 Dashboard
                  </span>
                  {stats.pendingReviews > 0 && (
                    <Badge variant="destructive">{stats.pendingReviews}</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  View all student adjustments, evidence links, and compliance status 
                  with intelligent matching suggestions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/dashboard">View Dashboard</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all hover:scale-105">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ✅ Review & Approve
                </CardTitle>
                <CardDescription>
                  Review AI-suggested evidence links with confidence scores. 
                  Accept, reject, or modify automated matches.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/review">Review Links</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all hover:scale-105">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📋 NCCD Reports
                </CardTitle>
                <CardDescription>
                  Generate comprehensive reports for NCCD submission, 
                  individual student summaries, and compliance tracking.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/reports">Generate Reports</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Button variant="ghost" asChild>
              <Link href="/students">Manage Students</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/settings">School Settings</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/help">NCCD Guidelines</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
