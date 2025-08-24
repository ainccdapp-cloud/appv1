"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Upload, FileText, X, File } from "lucide-react"
import Link from "next/link"

type DocumentType = "Learning Plan" | "Evidence"

export default function UploadPage() {
  const [text, setText] = useState("")
  const [documentType, setDocumentType] = useState<DocumentType>("Learning Plan")
  const [isLoading, setIsLoading] = useState(false)
  const [extractedData, setExtractedData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadMode, setUploadMode] = useState<"text" | "files">("text")

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles((prev) => [...prev, ...files])
    setError(null)
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
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

    try {
      const requestBody: any = { documentType }

      if (uploadMode === "text") {
        requestBody.text = text
      } else {
        // For files, we'll send file names and simulate processing
        requestBody.files = uploadedFiles.map((file) => ({
          name: file.name,
          type: file.type,
          size: file.size,
        }))
      }

      const response = await fetch("/api/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error("Failed to extract data")
      }

      const data = await response.json()
      setExtractedData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase()
    return <File className="h-4 w-4" />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Document Upload & Extraction</h1>
              <p className="text-muted-foreground">Upload documents or paste text to extract structured data</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/">← Back to Home</Link>
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Document Input
                </CardTitle>
                <CardDescription>Upload files or paste text for AI extraction</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Document Type</label>
                  <Select value={documentType} onValueChange={(value: DocumentType) => setDocumentType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Learning Plan">Learning Plan</SelectItem>
                      <SelectItem value="Evidence">Evidence</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Input Method</label>
                  <div className="flex gap-2">
                    <Button
                      variant={uploadMode === "text" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUploadMode("text")}
                    >
                      Text Input
                    </Button>
                    <Button
                      variant={uploadMode === "files" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUploadMode("files")}
                    >
                      File Upload
                    </Button>
                  </div>
                </div>

                {uploadMode === "text" ? (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Document Content</label>
                    <Textarea
                      placeholder="Paste your document content here..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="min-h-[200px]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Upload Files</label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept=".doc,.docx,.pdf,.jpg,.jpeg,.png,.csv,.xlsx,.xls,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-1">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground">
                          Supports: DOC, DOCX, PDF, JPG, PNG, CSV, XLSX, TXT
                        </p>
                      </label>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <label className="text-sm font-medium">Uploaded Files ({uploadedFiles.length})</label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                              <div className="flex items-center gap-2">
                                {getFileIcon(file.name)}
                                <span className="text-sm truncate">{file.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {(file.size / 1024).toFixed(1)}KB
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                className="h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

                <Button
                  onClick={handleExtract}
                  disabled={isLoading || (uploadMode === "text" ? !text.trim() : uploadedFiles.length === 0)}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Extract Data
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle>Extraction Results</CardTitle>
                <CardDescription>Structured data extracted from your document</CardDescription>
              </CardHeader>
              <CardContent>
                {extractedData ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="secondary">{extractedData.documentType}</Badge>
                      <Badge variant="outline">
                        {extractedData.adjustments?.length || extractedData.evidence?.length} items extracted
                      </Badge>
                      {extractedData.filesProcessed && (
                        <Badge variant="outline">{extractedData.filesProcessed} files processed</Badge>
                      )}
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-sm overflow-auto max-h-[400px]">
                        {JSON.stringify(extractedData, null, 2)}
                      </pre>
                    </div>

                    <div className="flex gap-2">
                      <Button asChild size="sm">
                        <Link href="/dashboard">View in Dashboard</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/review">Review Links</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Upload documents or enter text to see extraction results</p>
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
