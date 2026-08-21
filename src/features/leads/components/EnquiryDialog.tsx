"use client";

import { useId, useState, type FormEvent, type HTMLAttributes } from "react";
import type { Dealership } from "@/features/dealership/types";
import { ConversionDialog } from "@/features/leads/components/ConversionDialog";
import { validateContactFields } from "@/features/leads/lib/validateLead";
import { localLeadRepository } from "@/features/leads/repository/localLeadRepository";
import type { LeadSource } from "@/features/leads/types";
import { buildEnquiryContext } from "@/features/vehicles/lib/enquiryContext";
import type { VehicleRecord } from "@/features/vehicles/types";

type EnquiryMode = "vehicle_enquiry" | "register_interest" | "similar_enquiry";

type EnquiryDialogProps = {
  open: boolean;
  mode: EnquiryMode;
  record: VehicleRecord;
  dealership: Dealership;
  onClose: () => void;
};

const COPY: Record<
  EnquiryMode,
  { eyebrow: string; submit: string; source: LeadSource }
> = {
  vehicle_enquiry: {
    eyebrow: "Enquire about",
    submit: "Send enquiry",
    source: "vehicle_enquiry",
  },
  register_interest: {
    eyebrow: "Register interest",
    submit: "Register interest",
    source: "register_interest",
  },
  similar_enquiry: {
    eyebrow: "Enquire about similar",
    submit: "Send enquiry",
    source: "vehicle_enquiry",
  },
};

export function EnquiryDialog({
  open,
  mode,
  record,
  dealership,
  onClose,
}: EnquiryDialogProps) {
  const copy = COPY[mode];
  const nameId = useId();
  const phoneId = useId();
  const emailId = useId();
  const messageId = useId();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<ReturnType<typeof validateContactFields>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateContactFields({ name, phone, email });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const context = buildEnquiryContext(record);
      await localLeadRepository.create({
        dealershipId: dealership.id,
        vehicleId: context.vehicleId,
        vehicleName: context.vehicleName,
        vehicleSlug: context.vehicleSlug,
        pagePath: context.pagePath,
        source: copy.source,
        name,
        phone,
        email,
        message,
      });
      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ConversionDialog
      open={open}
      eyebrow={copy.eyebrow}
      title={buildEnquiryContext(record).vehicleName}
      onClose={onClose}
    >
      {success ? (
        <p className="text-sm leading-relaxed text-muted">
          Your details have been recorded in this demonstration. A live desk and
          email connection are not active yet.
        </p>
      ) : (
        <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
          <Field
            id={nameId}
            label="Full name"
            value={name}
            autoComplete="name"
            error={errors.name}
            onChange={setName}
          />
          <Field
            id={phoneId}
            label="Phone"
            value={phone}
            autoComplete="tel"
            inputMode="tel"
            error={errors.phone}
            onChange={setPhone}
          />
          <Field
            id={emailId}
            label="Email (optional)"
            value={email}
            autoComplete="email"
            inputMode="email"
            error={errors.email}
            onChange={setEmail}
          />
          <label className="collection-field" htmlFor={messageId}>
            <span className="collection-label">Message (optional)</span>
            <textarea
              id={messageId}
              className="collection-input min-h-28 py-3"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </label>
          <button type="submit" className="collection-apply" disabled={submitting}>
            {submitting ? "Recording…" : copy.submit}
          </button>
        </form>
      )}
    </ConversionDialog>
  );
}

function Field({
  id,
  label,
  value,
  error,
  autoComplete,
  inputMode,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  autoComplete?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  onChange: (value: string) => void;
}) {
  const errorId = `${id}-error`;

  return (
    <label className="collection-field" htmlFor={id}>
      <span className="collection-label">{label}</span>
      <input
        id={id}
        className="collection-input"
        value={value}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <span id={errorId} className="text-sm text-accent">
          {error}
        </span>
      ) : null}
    </label>
  );
}
