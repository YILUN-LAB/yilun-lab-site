export const prerender = false;

import type { APIRoute } from "astro";
import { Resend } from "resend";
import { RESEND_API_KEY } from "astro:env/server";
import { ContactFormSchema } from "@lib/contact-schema";

const resend = new Resend(RESEND_API_KEY);

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_EVICT_AT = 5000;
const RATE_LIMIT_HARD_CAP = 10000;
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  if (rateLimits.size > RATE_LIMIT_EVICT_AT) {
    for (const [k, v] of rateLimits) {
      if (v.resetAt <= now) rateLimits.delete(k);
    }
  }
  if (rateLimits.size > RATE_LIMIT_HARD_CAP) return true;
  const entry = rateLimits.get(ip);
  if (!entry || entry.resetAt <= now) {
    rateLimits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "invalid_input" }), {
      status: 400,
    });
  }

  const parsed = ContactFormSchema.safeParse(payload);
  if (!parsed.success) {
    return new Response(JSON.stringify({ ok: false, error: "invalid_input" }), {
      status: 400,
    });
  }
  const data = parsed.data;

  // Vercel's edge prepends the real client IP to x-forwarded-for, but a
  // malicious client can append junk so the whole comma-list differs every
  // request — bypassing the rate limiter. Take only the leftmost segment,
  // which is the one the edge guarantees.
  const ip = clientAddress.split(",")[0]?.trim() || clientAddress;
  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ ok: false, error: "rate_limited" }), {
      status: 429,
    });
  }

  // Honeypot tripped — return silent 200 so bots don't retry with new evasion.
  // Checked AFTER rate-limit so honeypot-tripped bots still increment the
  // bucket; otherwise they could hammer the parse path forever for free.
  if (data._gotcha && data._gotcha.length > 0) {
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  const optionalRows: Array<[string, string | undefined]> = [
    ["Project type", data.projectType],
    ["Venue", data.venue],
    ["Timeline", data.timeline],
    ["Budget", data.budgetNotes],
  ];
  const filledRows = optionalRows.filter(
    ([, v]) => v && v.length > 0,
  ) as Array<[string, string]>;

  const textBody = [
    `From: ${data.name} <${data.email}>`,
    "",
    data.message,
    ...(filledRows.length > 0
      ? ["", "----------------", ...filledRows.map(([k, v]) => `${k}: ${v}`)]
      : []),
  ].join("\n");

  const htmlBody = [
    `<p><strong>From:</strong> ${escapeHtml(data.name)} &lt;${escapeHtml(data.email)}&gt;</p>`,
    `<p style="white-space:pre-wrap">${escapeHtml(data.message)}</p>`,
    ...(filledRows.length > 0
      ? [
          "<hr>",
          "<dl>",
          ...filledRows.flatMap(([k, v]) => [
            `<dt><strong>${escapeHtml(k)}</strong></dt>`,
            `<dd>${escapeHtml(v)}</dd>`,
          ]),
          "</dl>",
        ]
      : []),
  ].join("");

  try {
    const { error } = await resend.emails.send({
      from: "YILUN LAB Studio <studio@yilunlab.com>",
      to: ["yilun@yilunlab.com"],
      replyTo: data.email,
      subject: `[YILUN LAB inquiry] ${data.name}`,
      html: htmlBody,
      text: textBody,
    });
    if (error) {
      // Resend SDK 6.x resolves with { data: null, error } instead of throwing
      console.error("contact form: resend returned error", {
        error,
        nameLen: data.name.length,
        messageLen: data.message.length,
      });
      return new Response(JSON.stringify({ ok: false, error: "send_failed" }), {
        status: 502,
      });
    }
  } catch (err) {
    // Defensive: SDK-internal exceptions (network, DNS, abort, etc.)
    console.error("contact form: resend threw", {
      err,
      nameLen: data.name.length,
      messageLen: data.message.length,
    });
    return new Response(JSON.stringify({ ok: false, error: "send_failed" }), {
      status: 502,
    });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
