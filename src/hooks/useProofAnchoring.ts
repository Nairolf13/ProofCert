import { useCallback, useState } from 'react';
import { sha256File, sha256String } from '../utils/hash';
import { useBlockchain } from './useBlockchain';

interface UseProofAnchoringResult {
  anchorProof: (params: {
    fileOrContent: File | string;
    metadata?: string;
  }) => Promise<{ hash: string; transactionHash: string } | null>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook pour ancrer une preuve sur la blockchain MultiversX : hash, transaction, tx hash.
 */
export function useProofAnchoring(): UseProofAnchoringResult {
  const { certifyProof } = useBlockchain();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const anchorProof = useCallback(
    async ({ fileOrContent, metadata }: { fileOrContent: File | string; metadata?: string }) => {
      setLoading(true);
      setError(null);
      try {
        let hash: string;
        if (fileOrContent instanceof File) {
          hash = await sha256File(fileOrContent);
        } else {
          hash = await sha256String(fileOrContent);
        }
        // Envoi de la transaction MultiversX (hash + metadata optionnel)
        const { txHash } = await certifyProof(hash, metadata || '');
        setLoading(false);
        return { hash, transactionHash: txHash };
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur lors de l’ancrage blockchain');
        setLoading(false);
        return null;
      }
    },
    [certifyProof]
  );

  return { anchorProof, loading, error };
}
