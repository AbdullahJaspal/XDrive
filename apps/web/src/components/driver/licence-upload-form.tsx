'use client';

import { FileUp, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiFormRequest } from '@/lib/api/client';
import { getAccessToken } from '@/lib/auth/session-client';

interface UploadResult {
  file: { id: string; originalName: string };
  licence: { licenceNumber: string };
}

interface LicenceUploadFormProps {
  onUploaded: () => void;
}

const ACCEPT = 'image/jpeg,image/png,application/pdf';

export function LicenceUploadForm({ onUploaded }: LicenceUploadFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    const token = getAccessToken();
    if (!file || !token) {
      setError('Choose a file to upload');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', file);
    if (notes.trim()) formData.append('notes', notes.trim());

    try {
      const result = await apiFormRequest<UploadResult>('/drivers/me/licence-upload', formData, {
        token,
      });
      setSuccess(`Uploaded ${result.file.originalName} — linked to ${result.licence.licenceNumber}`);
      setNotes('');
      if (inputRef.current) inputRef.current.value = '';
      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="licence-file">PHV licence document</Label>
        <p className="text-xs text-muted-foreground">
          JPEG, PNG, or PDF · max 10MB. Your operator will verify before dispatch.
        </p>
        <input
          ref={inputRef}
          id="licence-file"
          type="file"
          accept={ACCEPT}
          required
          className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="upload-notes">Note for compliance (optional)</Label>
        <Textarea
          id="upload-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Renewal submitted to council on 12 May"
          rows={2}
        />
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm text-emerald-800" role="status">
          {success}
        </p>
      ) : null}
      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading…
          </>
        ) : (
          <>
            <FileUp className="h-4 w-4" />
            Upload document
          </>
        )}
      </Button>
    </form>
  );
}
