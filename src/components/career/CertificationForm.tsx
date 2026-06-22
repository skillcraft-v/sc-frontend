"use client";

import { useState, type FormEvent } from "react";
import { careerErrorMessage, fieldErrors } from "@/lib/career/error-messages";
import type { Certification, CertificationInput } from "@/lib/career/types";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface CertificationFormProps {
  initial?: Certification;
  submitLabel: string;
  onSubmit: (input: CertificationInput) => Promise<void>;
}

export function CertificationForm({ initial, submitLabel, onSubmit }: CertificationFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [issuer, setIssuer] = useState(initial?.issuer ?? "");
  const [issuedAt, setIssuedAt] = useState(initial?.issued_at ?? "");
  const [expiresAt, setExpiresAt] = useState(initial?.expires_at ?? "");
  const [credentialUrl, setCredentialUrl] = useState(initial?.credential_url ?? "");

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setFields({});
    const input: CertificationInput = {
      name,
      issuer,
      issued_at: issuedAt,
      expires_at: expiresAt || null,
      credential_url: credentialUrl || null,
    };
    try {
      await onSubmit(input);
    } catch (err) {
      setError(careerErrorMessage(err));
      setFields(fieldErrors(err));
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {error ? <Alert>{error}</Alert> : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="cert_name" label="Nome" required value={name} error={fields.name} onChange={(e) => setName(e.target.value)} />
        <Field id="cert_issuer" label="Emissor" required value={issuer} error={fields.issuer} onChange={(e) => setIssuer(e.target.value)} />
        <Field id="cert_issued" label="Emitida em" type="date" required value={issuedAt} error={fields.issued_at} onChange={(e) => setIssuedAt(e.target.value)} />
        <Field id="cert_expires" label="Expira em" type="date" value={expiresAt} error={fields.expires_at} onChange={(e) => setExpiresAt(e.target.value)} />
      </div>
      <Field id="cert_url" label="URL da credencial" type="url" value={credentialUrl} error={fields.credential_url} onChange={(e) => setCredentialUrl(e.target.value)} />
      <Button type="submit" pending={pending} pendingLabel="Salvando…">
        {submitLabel}
      </Button>
    </form>
  );
}
