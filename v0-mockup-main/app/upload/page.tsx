"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Loader2, Upload, FileText, X, File, CheckCircle, AlertCircle, Eye } from "lucide-react"
import Link from "next/link"

type DocumentType = "Learning Plan" | "Evidence"
type ProcessingStatus = "idle" | "uploading" | "processing" | "complete" | "error"

interface FileWithPreview extends File {
  id: string
  status: ProcessingStatus
  error?: string
}

export default function EnhancedUploadPage() {
  const [text, setText] = useState("")
  const [documentType, setDocumentType] = useState<DocumentType>("Learning Plan")
  const [isLoading, setIsLoading] = useState(false)
  const [extractedData, setExtractedData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([])
  const [uploadMode, setUploadMode] = useState<"text" | "files">("text")
  const [progress, setProgress] = useState(0)

  const generateFileId = () => Math.random().toString(36).substr(2, 9)

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const filesWithMeta: FileWithPreview[] = files.map(file => ({
      ...file,
      id: generateFileId(),
      status: "idle" as ProcessingStatus
    }))
    
    setUploadedFiles(prev => [...prev, ...filesWithMeta])
    setError(null)
    
    // Reset input
    event.target.value = ''
  }, [])

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id))
  }

  const handleExtract = async () => {
    if (uploadMode === "text" && !text.trim()) {
      setError("Please enter document text")
      return
    }

    if (uploadMode === "files" && uploadedFiles.length === 0) {
      setError("Please upload at least one file")
      return
    }

    setIsLoading(true)
    setError(null)
    setProgress(0)

    try {
      // Update progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const requestBody: any = { documentType }

      if (uploadMode === "text") {
        requestBody.text = text
      } else {
        // Mark files as processing
        setUploadedFiles(prev => prev.map(file => ({...file, status: "processing" as ProcessingStatus})))
        
        requestBody.files = uploadedFiles.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
          id: file.id
        }))
      }

      const response = await fetch("/api/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        throw new Error(`Failed to extract data: ${response.status}`)
      }

      const data = await response.json()
      setExtractedData(data)
      
      // Mark files as complete
      if (uploadMode === "files") {
        setUploadedFiles(prev => prev.map(file => ({...file, status: "complete" as ProcessingStatus})))
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during extraction"
      setError(errorMessage)
      
      // Mark files as error
      if (uploadMode === "files") {
        setUploadedFiles(prev => prev.map(file => ({...file, status: "error" as ProcessingStatus, error: errorMessage})))
      }
    } finally {
      setIsLoading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase()
    switch (ext) {
      case 'pdf': return <File className="h-4 w-4 text-red-500" />
      case 'doc':
      case 'docx': return <File className="h-4 w-4 text-blue-500" />
      case 'jpg':
      case 'jpeg':
      case 'png': return <File className="h-4 w-4 text-green-500" />
      default: return <File className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: ProcessingStatus) => {
    switch (status) {
      case "processing": return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case "complete": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error": return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">NCCD Document Processing</h1>
              <p className="text-muted-foreground">
                Upload learning plans or evidence documents for AI-powered extraction and NCCD compliance analysis
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/">← Back to Home</Link>
            </Button>
          </div>

          {isLoading && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing documents...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Document Input
                </CardTitle>
                <CardDescription>
                  Upload files or paste text for AI extraction and NCCD compliance analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Document Type</label>
                  <Select value={documentType} onValueChange={(value: DocumentType) => setDocumentType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Learning Plan">
                        Learning Plan / IEP
                        <div className="text-xs text-muted-foreground">Individual Education Plans, Learning Support Plans</div>
                      </SelectItem>
                      <SelectItem value="Evidence">
                        Evidence Document
                        <div className="text-xs text-muted-foreground">Assessment records, photos, work samples</div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium mb-3 block">Input Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={uploadMode === "text" ? "default" : "outline"}
                      onClick={() => setUploadMode("text")}
                      className="justify-start"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Text Input
                    </Button>
                    <Button
                      variant={uploadMode === "files" ? "default" : "outline"}
                      onClick={() => setUploadMode("files")}
                      className="justify-start"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      File Upload
                    </Button>
                  </div>
                </div>

                {uploadMode === "text" ? (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Document Content</label>
                    <Textarea
                      placeholder="Paste your document content here... Include student name, adjustments, evidence details, etc."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="min-h-[250px]"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      AI will extract: Student details, adjustments, NCCD categories, evidence requirements
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Upload Files</label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/40 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept=".doc,.docx,.pdf,.jpg,.jpeg,.png,.csv,.xlsx,.xls,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground mb-2">
                          Supports: DOC, DOCX, PDF, JPG, PNG, CSV, XLSX, TXT
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Maximum file size: 10MB per file
                        </p>
                      </label>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="space-y-3 mt-4">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">
                            Uploaded Files ({uploadedFiles.length})
                          </label>
                          <Badge variant="outline">
                            {(uploadedFiles.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024).toFixed(1)}MB total
                          </Badge>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                          {uploadedFiles.map((file) => (
                            <div key={file.id} className="flex items-center justify-between bg-muted/50 p-3 rounded">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {getFileIcon(file.name)}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{file.name}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {(file.size / 1024).toFixed(1)}KB
                                    </Badge>
                                    <Badge 
                                      variant={file.status === "complete" ? "default" : 
                                              file.status === "error" ? "destructive" : "secondary"}
                                      className="text-xs"
                                    >
                                      {file.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-2">
                                {getStatusIcon(file.status)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(file.id)}
                                  className="h-6 w-6 p-0"
                                  disabled={isLoading}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleExtract}
                  disabled={isLoading || (uploadMode === "text" ? !text.trim() : uploadedFiles.length === 0)}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing with AI...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Extract & Analyze
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Extraction Results</span>
                  {extractedData && (
                    <Badge variant="secondary">
                      {extractedData.adjustments?.length || extractedData.evidence?.length} items found
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  AI-extracted data structured for NCCD compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {extractedData ? (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{extractedData.documentType}</Badge>
                      {extractedData.filesProcessed && (
                        <Badge variant="outline">{extractedData.filesProcessed} files processed</Badge>
                      )}
                      <Badge variant="outline">
                        Confidence: {Math.round((extractedData.metadata?.confidence || 0) * 100)}%
                      </Badge>
                    </div>

                    {/* Quick Preview */}
                    {extractedData.adjustments && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-foreground">Found Adjustments:</h4>
                        {extractedData.adjustments.slice(0, 3).map((adj: any, idx: number) => (
                          <div key={idx} className="text-xs p-2 bg-muted/50 rounded">
                            <div className="font-medium">{adj.type}</div>
                            <div className="text-muted-foreground">{adj.description}</div>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {adj.level}
                            </Badge>
                          </div>
                        ))}
                        {extractedData.adjustments.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            ...and {extractedData.adjustments.length - 3} more
                          </p>
                        )}
                      </div>
                    )}

                    {extractedData.evidence && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-foreground">Found Evidence:</h4>
                        {extractedData.evidence.slice(0, 3).map((ev: any, idx: number) => (
                          <div key={idx} className="text-xs p-2 bg-muted/50 rounded">
                            <div className="font-medium">{ev.type}</div>
                            <div className="text-muted-foreground">{ev.description}</div>
                            <div className="flex gap-1 mt-1">
                              {ev.adjustment_links?.slice(0, 2).map((link: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {link}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <Separator />

                    {/* Raw Data (Collapsible) */}
                    <details className="group">
                      <summary className="cursor-pointer text-sm font-medium flex items-center gap-2 hover:text-foreground">
                        <Eye className="h-4 w-4" />
                        View Raw Extracted Data
                        <Badge variant="outline" className="text-xs">JSON</Badge>
                      </summary>
                      <div className="mt-3 bg-muted p-4 rounded-lg">
                        <pre className="text-xs overflow-auto max-h-[300px] whitespace-pre-wrap">
                          {JSON.stringify(extractedData, null, 2)}
                        </pre>
                      </div>
                    </details>

                    <Separator />

                    {/* Next Steps */}
                    <div className="grid grid-cols-1 gap-3">
                      <Button asChild>
                        <Link href="/dashboard">
                          <FileText className="mr-2 h-4 w-4" />
                          View in Dashboard
                        </Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href="/review">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Review & Approve Links
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <h3 className="text-lg font-medium mb-2">Ready to Process</h3>
                    <p className="text-sm">Upload documents or enter text to see AI extraction results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
