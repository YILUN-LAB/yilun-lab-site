export const prerender = false;

import type { APIRoute } from "astro";
import { Resend } from "resend";
import { ContactFormSchema } from "@lib/contact-schema";

const resend = new Resend(import.meta.env.RESEND_API_KEY);

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
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

  // Honeypot tripped — return silent 200 so bots don't retry with new evasion.
  if (data._gotcha && data._gotcha.length > 0) {
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  if (isRateLimited(clientAddress)) {
    return new Response(JSON.stringify({ ok: false, error: "rate_limited" }), {
      status: 429,
    });
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
      console.error("contact form: resend returned error", { data, error });
      return new Response(JSON.stringify({ ok: false, error: "send_failed" }), {
        status: 502,
      });
    }
  } catch (err) {
    // Defensive: SDK-internal exceptions (network, DNS, abort, etc.)
    console.error("contact form: resend threw", { data, err });
    return new Response(JSON.stringify({ ok: false, error: "send_failed" }), {
      status: 502,
    });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
