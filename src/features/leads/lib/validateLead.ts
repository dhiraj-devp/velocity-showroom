export type FieldErrors = {
  name?: string;
  phone?: string;
  email?: string;
  preferredDate?: string;
  preferredTime?: string;
};

export type ContactFields = {
  name: string;
  phone: string;
  email: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactFields(fields: ContactFields): FieldErrors {
  const errors: FieldErrors = {};
  const name = fields.name.trim();
  const phoneDigits = fields.phone.replace(/\D/g, "");
  const email = fields.email.trim();

  if (name.length < 2) {
    errors.name = "Please enter your full name.";
  }

  if (phoneDigits.length < 8) {
    errors.phone = "Please enter a valid phone number.";
  }

  if (email && !EMAIL_PATTERN.test(email)) {
    errors.email = "Please enter a valid email, or leave this blank.";
  }

  return errors;
}

export function todayDateInputValue() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function validateBookingFields(
  fields: ContactFields & { preferredDate: string; preferredTime: string },
): FieldErrors {
  const errors = validateContactFields(fields);

  if (!fields.preferredDate) {
    errors.preferredDate = "Please choose a preferred date.";
  } else if (fields.preferredDate < todayDateInputValue()) {
    errors.preferredDate = "Please choose today or a future date.";
  }

  if (!fields.preferredTime) {
    errors.preferredTime = "Please choose a preferred time.";
  }

  return errors;
}

export const VIEWING_TIMES = [
  { value: "10:00", label: "10:00" },
  { value: "13:00", label: "13:00" },
  { value: "16:00", label: "16:00" },
  { value: "18:00", label: "18:00" },
] as const;
