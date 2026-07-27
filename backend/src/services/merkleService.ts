import crypto from 'crypto';

export class MerkleService {
  /**
   * Generates a SHA-256 hash for any string or object buffer
   */
  public static hashData(data: string | Buffer | object): string {
    const input = typeof data === 'object' && !Buffer.isBuffer(data) ? JSON.stringify(data) : data;
    return crypto.createHash('sha256').update(input).digest('hex');
  }

  /**
   * Builds a Merkle Tree from an array of data leaves and returns the Merkle Root Hash
   */
  public static computeMerkleRoot(leaves: string[]): string {
    if (leaves.length === 0) {
      return this.hashData('EMPTY_NODE');
    }

    let currentLevel = leaves.map((leaf) => (leaf.length === 64 ? leaf : this.hashData(leaf)));

    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left; // Duplicate last if odd count
        const combinedHash = this.hashData(left + right);
        nextLevel.push(combinedHash);
      }
      currentLevel = nextLevel;
    }

    return currentLevel[0];
  }

  /**
   * Generates complete Merkle proof for a Nyaya-Lipi FIR document
   */
  public static generateFIRMerkleLock(params: {
    audioHash: string;
    aiTranscriptText: string;
    officerTypedText?: string;
    timestamp: string;
  }): {
    audioHash: string;
    aiTranscriptHash: string;
    officerDraftHash?: string;
    merkleRootHash: string;
  } {
    const audioHash = params.audioHash.length === 64 ? params.audioHash : this.hashData(params.audioHash);
    const aiTranscriptHash = this.hashData(params.aiTranscriptText);
    const officerDraftHash = params.officerTypedText ? this.hashData(params.officerTypedText) : undefined;
    const timestampHash = this.hashData(params.timestamp);

    const leaves = [audioHash, aiTranscriptHash, timestampHash];
    if (officerDraftHash) {
      leaves.push(officerDraftHash);
    }

    const merkleRootHash = this.computeMerkleRoot(leaves);

    return {
      audioHash,
      aiTranscriptHash,
      officerDraftHash,
      merkleRootHash,
    };
  }

  /**
   * Verifies whether an existing FIR document has been altered post-lock
   */
  public static verifyIntegrity(params: {
    audioHash: string;
    aiTranscriptText: string;
    officerTypedText?: string;
    timestamp: string;
    expectedMerkleRoot: string;
  }): boolean {
    const computed = this.generateFIRMerkleLock({
      audioHash: params.audioHash,
      aiTranscriptText: params.aiTranscriptText,
      officerTypedText: params.officerTypedText,
      timestamp: params.timestamp,
    });

    return computed.merkleRootHash === params.expectedMerkleRoot;
  }
}
