// Simple in-memory store for the prototype
import type { Adjustment, Evidence, EvidenceLink } from "./types"

class AppStore {
  private adjustments: Adjustment[] = []
  private evidence: Evidence[] = []
  private evidenceLinks: EvidenceLink[] = []

  // Adjustments
  getAdjustments(): Adjustment[] {
    return this.adjustments
  }

  addAdjustments(newAdjustments: Adjustment[]): void {
    this.adjustments.push(...newAdjustments)
  }

  // Evidence
  getEvidence(): Evidence[] {
    return this.evidence
  }

  addEvidence(newEvidence: Evidence[]): void {
    this.evidence.push(...newEvidence)
  }

  // Evidence Links
  getEvidenceLinks(): EvidenceLink[] {
    return this.evidenceLinks
  }

  addEvidenceLinks(newLinks: EvidenceLink[]): void {
    this.evidenceLinks.push(...newLinks)
  }

  updateEvidenceLinkStatus(adjustmentId: string, evidenceId: string, status: "accepted" | "rejected"): void {
    const link = this.evidenceLinks.find((l) => l.adjustmentId === adjustmentId && l.evidenceId === evidenceId)
    if (link) {
      link.status = status
    }
  }

  // Get linked data
  getLinkedData() {
    return {
      adjustments: this.adjustments,
      evidence: this.evidence,
      links: this.evidenceLinks,
    }
  }

  // Reset store (for testing)
  reset(): void {
    this.adjustments = []
    this.evidence = []
    this.evidenceLinks = []
  }
}

export const appStore = new AppStore()
