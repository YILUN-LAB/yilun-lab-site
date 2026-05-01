import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDownIcon } from "./icons";
import { easeOut, fadeBlurInImmediate } from "@lib/motion-presets";
import {
  ContactFormSchema,
  PROJECT_TYPE_OPTIONS,
  type ContactFormInput,
} from "@lib/contact-schema";

type FormStatus =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

type FormErrors = Partial<Record<keyof ContactFormInput, string>>;

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 font-body text-base text-white placeholder:text-white/40 backdrop-blur-sm focus:border-[#F5B942] focus:outline-none focus:ring-2 focus:ring-[#F5B942]/40 disabled:opacity-50";

const labelClass =
  "mb-2 block font-body text-xs uppercase tracking-[0.18em] text-white/70";

const errorClass = "mt-1 font-body text-xs text-[#FF8A8A]";

const ERROR_COPY: Record<string, string> = {
  invalid_input: "Some fields aren't filled in correctly. Please review and try again.",
  rate_limited: "Too many submissions in the last hour. Please email us directly instead.",
  send_failed: "Something went wrong on our end. Please try again or email us directly.",
  network: "Couldn't reach the server. Check your connection and try again.",
};

interface ContactFormProps {
  /** Optional callback. Fires on every input event with `true` when at
   *  least one of name/email/message has non-whitespace content,
   *  `false` otherwise. Used by /connect to gate the flip-back guard. */
  onContentChange?: (hasContent: boolean) => void;
}

export function ContactForm({ onContentChange }: ContactFormProps = {}) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });
  const [errors, setErrors] = useState<FormErrors>({});

  const submitting = status.kind === "submitting";

  function handleFormInput(e: FormEvent<HTMLFormElement>) {
    if (!onContentChange) return;
    const fd = new FormData(e.currentTarget);
    const hasContent = ["name", "email", "message"].some(
      (k) => String(fd.get(k) ?? "").trim().length > 0
    );
    onContentChange(hasContent);
  }

  if (status.kind === "success") {
    return (
      <motion.div
        {...fadeBlurInImmediate()}
        role="status"
        aria-live="polite"
        className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm"
      >
        <p className="font-heading text-2xl italic leading-tight text-white">
          Thanks for writing.
        </p>
        <p className="mt-2 font-body text-base font-light text-white/80">
          We'll get back to you within a few days.
        </p>
      </motion.div>
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const fd = new FormData(e.currentTarget);
    const raw = {
      name: (fd.get("name") as string) ?? "",
      email: (fd.get("email") as string) ?? "",
      message: (fd.get("message") as string) ?? "",
      projectType: (fd.get("projectType") as string) || undefined,
      venue: (fd.get("venue") as string) || undefined,
      timeline: (fd.get("timeline") as string) || undefined,
      budgetNotes: (fd.get("budgetNotes") as string) || undefined,
      _gotcha: (fd.get("_gotcha") as string) ?? "",
    };

    const parsed = ContactFormSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof ContactFormInput;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setStatus({ kind: "submitting" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const body = (await res.json()) as { ok: boolean; error?: string };
      if (body.ok) {
        setStatus({ kind: "success" });
      } else {
        setStatus({
          kind: "error",
          message: ERROR_COPY[body.error ?? "send_failed"] ?? ERROR_COPY.send_failed,
        });
      }
    } catch {
      setStatus({ kind: "error", message: ERROR_COPY.network });
    }
  }

  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={handleSubmit}
      onInput={handleFormInput}
    >
      <div>
        <label htmlFor="contact-name" className={labelClass}>
          Name <span aria-hidden="true">*</span>
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          maxLength={100}
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
          disabled={submitting}
          className={inputClass}
        />
        {errors.name && (
          <p id="contact-name-error" className={errorClass}>
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="contact-email" className={labelClass}>
          Email <span aria-hidden="true">*</span>
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          maxLength={254}
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          disabled={submitting}
          className={inputClass}
        />
        {errors.email && (
          <p id="contact-email-error" className={errorClass}>
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClass}>
          Message <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={5}
          aria-required="true"
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          disabled={submitting}
          className={inputClass}
        />
        {errors.message && (
          <p id="contact-message-error" className={errorClass}>
            {errors.message}
          </p>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          disabled={submitting}
          className="font-body text-sm text-white/70 transition-colors hover:text-white disabled:opacity-50"
        >
          {expanded ? "Hide project details" : "Add project details"}
          <ChevronDownIcon
            className={`ml-1 inline-block h-4 w-4 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="optional"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: easeOut }}
              className="overflow-hidden"
            >
              <div className="space-y-5 pt-5">
                <div>
                  <label htmlFor="contact-project-type" className={labelClass}>
                    Project type
                  </label>
                  <select
                    id="contact-project-type"
                    name="projectType"
                    defaultValue="Not sure yet"
                    disabled={submitting}
                    className={inputClass}
                  >
                    {PROJECT_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-venue" className={labelClass}>
                    Venue or location
                  </label>
                  <input
                    id="contact-venue"
                    name="venue"
                    type="text"
                    maxLength={200}
                    disabled={submitting}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="contact-timeline" className={labelClass}>
                    Timeline
                  </label>
                  <input
                    id="contact-timeline"
                    name="timeline"
                    type="text"
                    maxLength={100}
                    placeholder="Spring 2026 / ASAP / TBD"
                    disabled={submitting}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="contact-budget" className={labelClass}>
                    Budget range or notes
                  </label>
                  <input
                    id="contact-budget"
                    name="budgetNotes"
                    type="text"
                    maxLength={200}
                    disabled={submitting}
                    className={inputClass}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Honeypot — hidden from real users via offscreen positioning + aria. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-10000px",
          height: 0,
          width: 0,
          overflow: "hidden",
        }}
      >
        <label htmlFor="contact-gotcha">Leave this field empty</label>
        <input
          id="contact-gotcha"
          name="_gotcha"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="liquid-glass-strong liquid-glass-tint inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold disabled:cursor-wait disabled:opacity-70"
        >
          {submitting ? "Sending…" : "Send"}
        </button>

        <p role="status" aria-live="polite" className="min-h-[1rem] font-body text-sm">
          {status.kind === "error" && (
            <span className="text-[#FF8A8A]">{status.message}</span>
          )}
        </p>
      </div>
    </form>
  );
}
