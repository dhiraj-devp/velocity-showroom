"use client";

import { useId, useState, type FormEvent, type HTMLAttributes } from "react";
import { trackProductEvent } from "@/features/analytics/lib/track";
import { submitBooking } from "@/features/leads/actions";
import { ConversionDialog } from "@/features/leads/components/ConversionDialog";
import {
  todayDateInputValue,
  validateBookingFields,
  VIEWING_TIMES,
} from "@/features/leads/lib/validateLead";
import { buildEnquiryContext } from "@/features/vehicles/lib/enquiryContext";
import type { VehicleRecord } from "@/features/vehicles/types";

type BookingDialogProps = {
  open: boolean;
  record: VehicleRecord;
  onClose: () => void;
};

export function BookingDialog({ open, record, onClose }: BookingDialogProps) {
  const nameId = useId();
  const phoneId = useId();
  const emailId = useId();
  const dateId = useId();
  const timeId = useId();
  const messageId = useId();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<ReturnType<typeof validateBookingFields>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [persisted, setPersisted] = useState<"mysql" | "local">("local");
  const [formError, setFormError] = useState<string | null>(null);
  const context = buildEnquiryContext(record);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateBookingFields({
      name,
      phone,
      email,
      preferredDate,
      preferredTime,
    });
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const result = await submitBooking({
        vehicleId: context.vehicleId,
        vehicleName: context.vehicleName,
        vehicleSlug: context.vehicleSlug,
        name,
        phone,
        email,
        preferredDate,
        preferredTime,
        message,
        type: "viewing",
      });
      if (!result.ok) {
        if (result.fieldErrors) setErrors(result.fieldErrors);
        setFormError(result.error);
        return;
      }
      setPersisted(result.persisted);
      setSuccess(true);
      trackProductEvent("viewing_requested", {
        vehicleId: record.vehicle.id,
        slug: record.vehicle.slug,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ConversionDialog
      open={open}
      eyebrow="Book a viewing"
      title={context.vehicleName}
      onClose={onClose}
    >
      {success ? (
        <p className="text-sm leading-relaxed text-muted">
          {persisted === "mysql"
            ? "Your viewing request has been received. The desk will confirm a time."
            : "This viewing request has been recorded locally for this demonstration. Connect MySQL to persist bookings."}
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
          <label className="collection-field" htmlFor={dateId}>
            <span className="collection-label">Preferred date</span>
            <input
              id={dateId}
              type="date"
              className="collection-input"
              min={todayDateInputValue()}
              value={preferredDate}
              aria-invalid={errors.preferredDate ? true : undefined}
              onChange={(event) => setPreferredDate(event.target.value)}
            />
            {errors.preferredDate ? (
              <span className="text-sm text-accent">{errors.preferredDate}</span>
            ) : null}
          </label>
          <label className="collection-field" htmlFor={timeId}>
            <span className="collection-label">Preferred time</span>
            <select
              id={timeId}
              className="collection-select"
              value={preferredTime}
              aria-invalid={errors.preferredTime ? true : undefined}
              onChange={(event) => setPreferredTime(event.target.value)}
            >
              <option value="">Select a time</option>
              {VIEWING_TIMES.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
            {errors.preferredTime ? (
              <span className="text-sm text-accent">{errors.preferredTime}</span>
            ) : null}
          </label>
          <label className="collection-field" htmlFor={messageId}>
            <span className="collection-label">Message (optional)</span>
            <textarea
              id={messageId}
              className="collection-input min-h-24 py-3"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </label>
          {formError ? (
            <p className="text-sm text-accent" role="alert">
              {formError}
            </p>
          ) : null}
          <button type="submit" className="collection-apply" disabled={submitting}>
            {submitting ? "Recording…" : "Request viewing"}
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
