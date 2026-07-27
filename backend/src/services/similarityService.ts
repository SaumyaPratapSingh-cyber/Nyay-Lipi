import { IDiscrepancyItem } from '../models/FIR';

export interface ISimilarityAnalysisResult {
  overallScore: number;                 // 0 to 100%
  semanticScore: number;                // 0 to 100%
  entityOverlapScore: number;           // 0 to 100%
  bnsSectionAlignment: 'EXACT_MATCH' | 'PARTIAL_MATCH' | 'MISMATCH';
  discrepancies: IDiscrepancyItem[];
  recommendation: 'AUTO_APPROVE' | 'WARNING_NEEDS_JUSTIFICATION' | 'FLAG_FOR_SP';
}

export class SimilarityService {
  /**
   * Tokenizes text into normalized lowercase word tokens
   */
  private static tokenize(text: string): Set<string> {
    const cleaned = text
      .toLowerCase()
      .replace(/[^\w\s\u0900-\u097F]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'in', 'ka', 'ki', 'ke', 'ne', 'se', 'par', 'hai', 'tha', 'thi']);
    const tokens = cleaned.split(' ').filter((w) => w.length > 2 && !stopWords.has(w));
    return new Set(tokens);
  }

  /**
   * Computes Jaccard Similarity Index between two token sets (0 to 100%)
   */
  public static computeJaccardSimilarity(textA: string, textB: string): number {
    const setA = this.tokenize(textA);
    const setB = this.tokenize(textB);

    if (setA.size === 0 && setB.size === 0) return 100;
    if (setA.size === 0 || setB.size === 0) return 0;

    let intersectionSize = 0;
    setA.forEach((token) => {
      if (setB.has(token)) intersectionSize++;
    });

    const unionSize = new Set([...Array.from(setA), ...Array.from(setB)]).size;
    return Math.round((intersectionSize / unionSize) * 100);
  }

  /**
   * Compares extracted entities from AI audio transcript against officer manual typed text
   */
  public static computeEntityOverlap(
    aiEntities: {
      weaponsUsed?: string[];
      accusedDetails?: string[];
      location?: string;
      incidentTime?: string;
    },
    typedText: string
  ): { score: number; missingEntities: IDiscrepancyItem[] } {
    const typedLower = typedText.toLowerCase();
    const missing: IDiscrepancyItem[] = [];
    let totalChecks = 0;
    let matches = 0;

    // Check weapons
    if (aiEntities.weaponsUsed && aiEntities.weaponsUsed.length > 0) {
      aiEntities.weaponsUsed.forEach((weapon) => {
        totalChecks++;
        if (typedLower.includes(weapon.toLowerCase())) {
          matches++;
        } else {
          missing.push({
            field: 'Weapon Mentioned in Audio',
            aiValue: weapon,
            officerValue: 'Omitted from typed FIR',
            severity: 'HIGH',
            description: `Audio transcript explicitly mentions weapon "${weapon}", but it was omitted from the officer's typed draft.`,
          });
        }
      });
    }

    // Check location
    if (aiEntities.location) {
      totalChecks++;
      if (typedLower.includes(aiEntities.location.toLowerCase())) {
        matches++;
      } else {
        missing.push({
          field: 'Incident Location',
          aiValue: aiEntities.location,
          officerValue: 'Differs or omitted',
          severity: 'MEDIUM',
          description: `Location "${aiEntities.location}" extracted from audio was not clearly matched in officer's typed draft.`,
        });
      }
    }

    // Check accused
    if (aiEntities.accusedDetails && aiEntities.accusedDetails.length > 0) {
      aiEntities.accusedDetails.forEach((accused) => {
        totalChecks++;
        if (typedLower.includes(accused.toLowerCase())) {
          matches++;
        } else {
          missing.push({
            field: 'Accused Identity / Description',
            aiValue: accused,
            officerValue: 'Omitted or altered',
            severity: 'CRITICAL',
            description: `Audio contains details of accused "${accused}", which is absent or altered in the officer's typed FIR.`,
          });
        }
      });
    }

    const score = totalChecks > 0 ? Math.round((matches / totalChecks) * 100) : 85;
    return { score, missingEntities: missing };
  }

  /**
   * Compares BNS penal sections suggested by AI vs sections selected by officer
   */
  public static compareBNSSections(
    aiSections: string[],
    officerSections: string[]
  ): {
    alignment: 'EXACT_MATCH' | 'PARTIAL_MATCH' | 'MISMATCH';
    discrepancies: IDiscrepancyItem[];
  } {
    const aiSet = new Set(aiSections.map((s) => s.trim().toUpperCase()));
    const officerSet = new Set(officerSections.map((s) => s.trim().toUpperCase()));
    const discrepancies: IDiscrepancyItem[] = [];

    if (aiSet.size === 0 && officerSet.size === 0) {
      return { alignment: 'EXACT_MATCH', discrepancies: [] };
    }

    let matchingCount = 0;
    aiSet.forEach((sec) => {
      if (officerSet.has(sec)) {
        matchingCount++;
      } else {
        discrepancies.push({
          field: 'BNS Penal Section',
          aiValue: sec,
          officerValue: 'Not applied by officer',
          severity: 'CRITICAL',
          description: `AI Legal Engine mapped offense to BNS Section "${sec}", but officer did not include it.`,
        });
      }
    });

    if (matchingCount === aiSet.size && matchingCount === officerSet.size) {
      return { alignment: 'EXACT_MATCH', discrepancies: [] };
    } else if (matchingCount > 0) {
      return { alignment: 'PARTIAL_MATCH', discrepancies };
    } else {
      return { alignment: 'MISMATCH', discrepancies };
    }
  }

  /**
   * Comprehensive Analysis Handler
   */
  public static analyzeDualDrafts(params: {
    aiTranscriptText: string;
    aiEntities: {
      weaponsUsed?: string[];
      accusedDetails?: string[];
      location?: string;
      incidentTime?: string;
    };
    aiSuggestedSections: string[];
    officerTypedText: string;
    officerSelectedSections: string[];
  }): ISimilarityAnalysisResult {
    const semanticScore = this.computeJaccardSimilarity(params.aiTranscriptText, params.officerTypedText);
    const entityResult = this.computeEntityOverlap(params.aiEntities, params.officerTypedText);
    const sectionResult = this.compareBNSSections(params.aiSuggestedSections, params.officerSelectedSections);

    const allDiscrepancies = [...entityResult.missingEntities, ...sectionResult.discrepancies];

    // Weighted Overall Score calculation
    const overallScore = Math.round(semanticScore * 0.4 + entityResult.score * 0.4 + (sectionResult.alignment === 'EXACT_MATCH' ? 100 : sectionResult.alignment === 'PARTIAL_MATCH' ? 50 : 0) * 0.2);

    let recommendation: 'AUTO_APPROVE' | 'WARNING_NEEDS_JUSTIFICATION' | 'FLAG_FOR_SP' = 'AUTO_APPROVE';

    const hasCriticalDiscrepancy = allDiscrepancies.some((d) => d.severity === 'CRITICAL');

    if (overallScore < 60 || hasCriticalDiscrepancy) {
      recommendation = 'FLAG_FOR_SP';
    } else if (overallScore < 85 || allDiscrepancies.length > 0) {
      recommendation = 'WARNING_NEEDS_JUSTIFICATION';
    }

    return {
      overallScore,
      semanticScore,
      entityOverlapScore: entityResult.score,
      bnsSectionAlignment: sectionResult.alignment,
      discrepancies: allDiscrepancies,
      recommendation,
    };
  }
}
