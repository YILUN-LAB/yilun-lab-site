import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDownIcon } from "./icons";
import { easeOut } from "@lib/motion-presets";
import { PROJECT_TYPE_OPTIONS } from "@lib/contact-schema";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 font-body text-base text-white placeholder:text-white/40 backdrop-blur-sm focus:border-[#F5B942] focus:outline-none focus:ring-2 focus:ring-[#F5B942]/40";

const labelClass =
  "mb-2 block font-body text-xs uppercase tracking-[0.18em] text-white/70";

export function ContactForm() {
  const [expanded, setExpanded] = useState(false);

  return (
    <form className="space-y-5" noValidate>
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
          className={inputClass}
        />
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
          className={inputClass}
        />
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
          className={inputClass}
        />
      </div>

      <div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="font-body text-sm text-white/70 transition-colors hover:text-white"
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
        <label htmlFor="contact-company">Company (leave blank)</label>
        <input
          id="contact-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <button
        type="submit"
        className="liquid-glass-strong liquid-glass-tint inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
      >
        Send
      </button>
    </form>
  );
}
