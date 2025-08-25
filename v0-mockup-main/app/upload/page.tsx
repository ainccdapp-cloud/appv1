"use client"

import React, { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  Download,
  RefreshCw,
  Zap,
  Image,
  FileVideo,
  FileSpreadsheet,
  Trash2,
  Plus
} from "lucide-react"
import Link from "next/link"

// Import our custom hooks and components
import { useFileUpload } from "@/hooks/useFileUpload"
import { useNotifications } from "@/hooks/useNotifications"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"
import { ProgressIndicator } from "@/components/ui/progress-indicator"
import { EmptyState } from "@/components/ui/empty-state"
import { NotificationToast } from "@/components/ui/notification-toast"
import { ErrorBoundary } from "@/components/error-boundary"

// Import utilities
import { 
  formatFileSize, 
  validateFileType, 
  getFileIcon,
  debounce,
  cn
} from "@/lib/utils"

type DocumentType = "Learning Plan" | "Evidence"
type UploadMode = "text" | "files" | "mixed"

const ALLOWED_FILE_TYPES = [
  '.doc', '.docx', '.pdf', '.txt', '.rtf',
  '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp',
  '.mp4', '.mov', '.avi', '.wmv', '.mp3', '.wav',
  '.xlsx', '.xls', '.csv'
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_TOTAL_SIZE = 50 * 1024 * 1024 // 50MB total
const MAX_FILES = 20

export default function EnhancedUploadPage() {
  const [text, setText] = useState("")
  const [documentType, setDocumentType] = useState<DocumentType>("Learning Plan")
  const [uploadMode, setUploadMode] = useState<UploadMode>("files")
  const [extractedData, setExtractedData] = useState<any>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [processingStage, setProcessingStage] = useState<string>("")
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Custom hooks
  const {
    uploadedFiles,
    isProcessing,
    error: uploadError,
    addFiles,
    removeFile,
    updateFileStatus,
    processFiles,
    processText,
    clearFiles,
    setError: setUploadError
  } = useFileUpload()

  const {
    notifications,
    addNotification,
    removeNotification
  } = useNotifications()

  // Debounced text change handler
  const debouncedTextChange = useCallback(
    debounce((value: string) => {
      if (value.trim().length > 50) {
        // Auto-detect document type based on content
        const lowercaseText = value.toLowerCase()
        if (lowercaseText.includes('assessment') || 
            lowercaseText.includes('evidence') || 
            lowercaseText.includes('observation')) {
          setDocumentType('Evidence')
        } else if (lowercaseText.includes('plan') || 
                   lowercaseText.includes('goal') || 
                   lowercaseText.includes('adjustment')) {
          setDocumentType('Learning Plan')
        }
      }
    }, 500),
    []
  )

  const handleTextChange = (value: string) => {
    setText(value)
    debouncedTextChange(value)
  }

  // Enhanced file validation
  const validateFiles = (files: File[]): { valid: File[]; invalid: { file: File; reason: string }[] } => {
    const valid: File[] = []
    const invalid: { file: File; reason: string }[] = []

    const currentTotalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0)
    let newTotalSize = currentTotalSize

    for (const file of files) {
      // Check file count
      if (uploadedFiles.length + valid.length >= MAX_FILES) {
        invalid.push({ file, reason: `Maximum ${MAX_FILES} files allowed` })
        continue
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        invalid.push({ file, reason: `File too large (max ${formatFileSize(MAX_FILE_SIZE)})` })
        continue
      }

      // Check total size
      if (newTotalSize + file.size > MAX_TOTAL_SIZE) {
        invalid.push({ file, reason: `Total size limit exceeded (max ${formatFileSize(MAX_TOTAL_SIZE)})` })
        continue
      }

      // Check file type
      if (!validateFileType(file, ALLOWED_FILE_TYPES)) {
        invalid.push({ file, reason: 'Unsupported file type' })
        continue
      }

      // Check for duplicates
      const isDuplicate = [...uploadedFiles, ...valid].some(existing => 
        existing.name === file.name && existing.size === file.size
      )
      if (isDuplicate) {
        invalid.push({ file, reason: 'Duplicate file' })
        continue
      }

      valid.push(file)
      newTotalSize += file.size
    }

    return { valid, invalid }
  }

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    handleFilesAdded(files)
    
    // Reset input
    if (event.target) {
      event.target.value = ''
    }
  }, [])

  const handleFilesAdded = (files: File[]) => {
    const { valid, invalid } = validateFiles(files)

    if (valid.length > 0) {
      addFiles(valid)
      addNotification({
        type: 'success',
        title: 'Files Added',
        message: `${valid.length} file${valid.length !== 1 ? 's' : ''} added successfully`
      })
    }

    invalid.forEach(({ file, reason }) => {
      addNotification({
        type: 'error',
        title: 'File Rejected',
        message: `${file.name}: ${reason}`
      })
    })
  }

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFilesAdded(files)
  }, [])

  // Processing handler
  const handleProcess = async () => {
    if (uploadMode === "text" || uploadMode === "mixed") {
      if (!text.trim()) {
        setUploadError("Please enter document text")
        return
      }
    }

    if (uploadMode === "files" || uploadMode === "mixed") {
      if (uploadedFiles.length === 0) {
        setUploadError("Please upload at least one file")
        return
      }
    }

    try {
      setUploadError(null)
      setExtractedData(null)

      let result
      
      if (uploadMode === "text") {
        setProcessingStage("Analyzing text content...")
        result = await processText(text, documentType)
      } else if (uploadMode === "files") {
        setProcessingStage("Processing uploaded files...")
        result = await processFiles(documentType, { 
          includeMetadata: true,
          confidenceThreshold: 0.7
        })
      } else {
        // Mixed mode - process both
        setProcessingStage("Processing text and files...")
        result = await processFiles(documentType, { 
          additionalText: text,
          includeMetadata: true,
          confidenceThreshold: 0.7
        })
      }

      setExtractedData(result)
      setProcessingStage("")

      addNotification({
        type: 'success',
        title: 'Processing Complete',
        message: `Successfully extracted ${result.adjustments?.length || result.evidence?.length || 0} items`
      })

    } catch (error) {
      setProcessingStage("")
      addNotification({
        type: 'error',
        title: 'Processing Failed',
        message: error instanceof Error ? error.message : 'Failed to process documents'
      })
    }
  }

  // File icon component
  const FileIcon = ({ fileName }: { fileName: string }) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || ''
    
    switch (ext) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />
      case 'doc':
      case 'docx':
        return <FileText className="h-4 w-4 text-blue-500" />
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <FileSpreadsheet className="h-4 w-4 text-green-500" />
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="h-4 w-4 text-purple-500" />
      case 'mp4':
      case 'mov':
      case 'avi':
        return <FileVideo className="h-4 w-4 text-orange-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing": return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
      case "complete": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error": return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return null
    }
  }

  const totalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0)
  const canProcess = (uploadMode === "text" && text.trim()) || 
                    (uploadMode === "files" && uploadedFiles.length > 0) ||
                    (uploadMode === "mixed" && (text.trim() || uploadedFiles.length > 0))

  return (
    <ErrorBoundary>
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
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">NCCD Document Processing</h1>
                <p className="text-muted-foreground">
                  Upload learning plans or evidence documents for AI-powered extraction and NCCD compliance analysis
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline">
                  <Link href="/">← Back to Home</Link>
                </Button>
                {extractedData && (
                  <Button asChild variant="outline">
                    <Link href="/dashboard">View Dashboard</Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Processing Status */}
            {isProcessing && (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <ProgressIndicator
                    current={extractedData ? 100 : 75}
                    total={100}
                    label={processingStage || "Processing documents..."}
                    className="mb-2"
                  />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    <span>AI is analyzing your content for NCCD compliance</span>
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
                <CardContent className="space-y-6">
                  {/* Document Type Selection */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Document Type</label>
                    <Select value={documentType} onValueChange={(value: DocumentType) => setDocumentType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Learning Plan">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <div>
                              <div className="font-medium">Learning Plan / IEP</div>
                              <div className="text-xs text-muted-foreground">Individual Education Plans, Learning Support Plans</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="Evidence">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            <div>
                              <div className="font-medium">Evidence Document</div>
                              <div className="text-xs text-muted-foreground">Assessment records, photos, work samples</div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Input Mode Selection */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Input Method</label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={uploadMode === "text" ? "default" : "outline"}
                        onClick={() => setUploadMode("text")}
                        className="justify-start text-xs"
                        size="sm"
                      >
                        <FileText className="mr-1 h-3 w-3" />
                        Text Only
                      </Button>
                      <Button
                        variant={uploadMode === "files" ? "default" : "outline"}
                        onClick={() => setUploadMode("files")}
                        className="justify-start text-xs"
                        size="sm"
                      >
                        <Upload className="mr-1 h-3 w-3" />
                        Files Only
                      </Button>
                      <Button
                        variant={uploadMode === "mixed" ? "default" : "outline"}
                        onClick={() => setUploadMode("mixed")}
                        className="justify-start text-xs"
                        size="sm"
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Both
                      </Button>
                    </div>
                  </div>

                  {/* Text Input */}
                  {(uploadMode === "text" || uploadMode === "mixed") && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Document Content</label>
                      <Textarea
                        placeholder="Paste your document content here... Include student name, adjustments, evidence details, etc."
                        value={text}
                        onChange={(e) => handleTextChange(e.target.value)}
                        className="min-h-[200px] resize-none"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">
                          AI will extract: Student details, adjustments, NCCD categories, evidence requirements
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {text.length} chars
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* File Upload */}
                  {(uploadMode === "files" || uploadMode === "mixed") && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Upload Files</label>
                      <div 
                        className={cn(
                          "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                          isDragOver 
                            ? "border-primary bg-primary/5" 
                            : "border-muted-foreground/25 hover:border-muted-foreground/40"
                        )}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept={ALLOWED_FILE_TYPES.join(',')}
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        
                        <div className="space-y-2">
                          <Upload className={cn(
                            "h-10 w-10 mx-auto",
                            isDragOver ? "text-primary" : "text-muted-foreground"
                          )} />
                          <div>
                            <p className="text-sm font-medium mb-1">
                              {isDragOver ? "Drop files here" : "Click to upload or drag and drop"}
                            </p>
                            <p className="text-xs text-muted-foreground mb-1">
                              Supports: Documents, Images, Videos, Spreadsheets
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Max {formatFileSize(MAX_FILE_SIZE)} per file • {MAX_FILES} files max
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* File List */}
                      {uploadedFiles.length > 0 && (
                        <div className="space-y-3 mt-4">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">
                              Uploaded Files ({uploadedFiles.length}/{MAX_FILES})
                            </label>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {formatFileSize(totalSize)} total
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFiles}
                                className="h-6 text-xs"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Clear All
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
                            {uploadedFiles.map((file) => (
                              <div key={file.id} className="flex items-center justify-between bg-muted/50 p-3 rounded-md">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <FileIcon fileName={file.name} />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate" title={file.name}>
                                      {file.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="outline" className="text-xs">
                                        {formatFileSize(file.size)}
                                      </Badge>
                                      <Badge 
                                        variant={
                                          file.status === "complete" ? "default" : 
                                          file.status === "error" ? "destructive" : "secondary"
                                        }
                                        className="text-xs"
                                      >
                                        {file.status}
                                      </Badge>
                                      {file.error && (
                                        <span className="text-xs text-destructive truncate max-w-32" title={file.error}>
                                          {file.error}
                                        </span>
                                      )}
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
                                    disabled={isProcessing}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Storage Usage */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Storage Usage</span>
                              <span>{Math.round((totalSize / MAX_TOTAL_SIZE) * 100)}% of limit</span>
                            </div>
                            <Progress value={(totalSize / MAX_TOTAL_SIZE) * 100} className="h-1" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Error Display */}
                  {uploadError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{uploadError}</AlertDescription>
                    </Alert>
                  )}

                  {/* Process Button */}
                  <Button
                    onClick={handleProcess}
                    disabled={isProcessing || !canProcess}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Processing with AI...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Extract & Analyze with AI
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Results Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Extraction Results</span>
                    {extractedData && (
                      <Badge variant="secondary">
                        {extractedData.adjustments?.length || extractedData.evidence?.length || 0} items found
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    AI-extracted data structured for NCCD compliance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isProcessing ? (
                    <div className="space-y-4">
                      <LoadingSkeleton variant="text" rows={3} />
                      <LoadingSkeleton variant="card" />
                      <LoadingSkeleton variant="text" rows={2} />
                    </div>
                  ) : extractedData ? (
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
                        {extractedData.metadata?.processingTime && (
                          <Badge variant="outline">
                            {extractedData.metadata.processingTime}ms
                          </Badge>
                        )}
                      </div>

                      {/* Warnings & Errors */}
                      {extractedData.metadata?.warnings?.length > 0 && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="text-sm font-medium mb-1">Processing Warnings:</div>
                            <ul className="text-xs space-y-1">
                              {extractedData.metadata.warnings.map((warning: string, i: number) => (
                                <li key={i}>• {warning}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Quick Preview */}
                      {extractedData.adjustments && extractedData.adjustments.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-foreground">
                            Found Adjustments ({extractedData.adjustments.length})
                          </h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {extractedData.adjustments.slice(0, 3).map((adj: any, idx: number) => (
                              <div key={idx} className="text-xs p-3 bg-muted/50 rounded border">
                                <div className="font-medium text-foreground mb-1">{adj.category || adj.type}</div>
                                <div className="text-muted-foreground mb-2 line-clamp-2">{adj.description}</div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {adj.nccdLevelIndicator || adj.level}
                                  </Badge>
                                  {adj.confidence && (
                                    <Badge variant="secondary" className="text-xs">
                                      {adj.confidence}% confidence
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                            {extractedData.adjustments.length > 3 && (
                              <p className="text-xs text-muted-foreground text-center py-2">
                                ...and {extractedData.adjustments.length - 3} more adjustments
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {extractedData.evidence && extractedData.evidence.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-foreground">
                            Found Evidence ({extractedData.evidence.length})
                          </h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {extractedData.evidence.slice(0, 3).map((ev: any, idx: number) => (
                              <div key={idx} className="text-xs p-3 bg-muted/50 rounded border">
                                <div className="font-medium text-foreground mb-1">{ev.category || ev.type}</div>
                                <div className="text-muted-foreground mb-2 line-clamp-2">{ev.description}</div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {ev.nccdLevelIndicator || ev.level}
                                  </Badge>
                                  {ev.confidence && (
                                    <Badge variant="secondary" className="text-xs">
                                      {ev.confidence}% confidence
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                            {extractedData.evidence.length > 3 && (
                              <p className="text-xs text-muted-foreground text-center py-2">
                                ...and {extractedData.evidence.length - 3} more evidence items
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      <Separator />

                      {/* Raw Data Toggle */}
                      <details className="group">
                        <summary className="cursor-pointer text-sm font-medium flex items-center gap-2 hover:text-foreground">
                          <Eye className="h-4 w-4" />
                          View Raw Extracted Data
                          <Badge variant="outline" className="text-xs">JSON</Badge>
                        </summary>
                        <div className="mt-3 bg-muted p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-muted-foreground">Raw extraction data</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(JSON.stringify(extractedData, null, 2))
                                addNotification({
                                  type: 'success',
                                  title: 'Copied',
                                  message: 'Data copied to clipboard'
                                })
                              }}
                              className="h-6 text-xs"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                          </div>
                          <pre className="text-xs overflow-auto max-h-[300px] whitespace-pre-wrap bg-background p-3 rounded border">
                            {JSON.stringify(extractedData, null, 2)}
                          </pre>
                        </div>
                      </details>

                      <Separator />

                      {/* Next Steps */}
                      <div className="grid grid-cols-1 gap-3">
                        <Button asChild size="lg">
                          <Link href="/dashboard">
                            <FileText className="mr-2 h-4 w-4" />
                            View in Dashboard
                          </Link>
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                          <Button asChild variant="outline">
                            <Link href="/review">
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Review Links
                            </Link>
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => {
                              setExtractedData(null)
                              setText("")
                              clearFiles()
                            }}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Process More
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <EmptyState
                      icon={<FileText className="h-16 w-16" />}
                      title="Ready to Process"
                      description="Upload documents or enter text to see AI extraction results. The system will automatically identify adjustments, evidence, and NCCD compliance levels."
                      action={canProcess ? {
                        label: "Extract & Analyze",
                        onClick: handleProcess
                      } : undefined}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Help Section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-lg">Tips for Better Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">📋 Learning Plans</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Include student names and IDs</li>
                      <li>• List specific adjustments and accommodations</li>
                      <li>• Mention responsible staff members</li>
                      <li>• Include implementation timelines</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">📄 Evidence Documents</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Include assessment dates and results</li>
                      <li>• Document specific outcomes achieved</li>
                      <li>• Reference which adjustments were supported</li>
                      <li>• Include photos or work samples when relevant</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
