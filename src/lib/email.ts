import { Resend } from "resend";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM || "Lookeyy <tours@lookeyy.com>";

export async function sendNotification(opts: {
  userId: string;
  to: string;
  type: NotificationType;
  subject: string;
  html: string;
  payload?: Record<string, unknown>;
}) {
  const { userId, to, type, subject, html, payload } = opts;

  if (resend) {
    try {
      await resend.emails.send({ from: FROM, to, subject, html });
    } catch (err) {
      console.error(`[email] failed to send ${type} to ${to}:`, err);
    }
  } else {
    console.log(`[email:stub] ${type} -> ${to} | ${subject}`);
  }

  await prisma.notification.create({
    data: { userId, type, payload: (payload ?? {}) as Prisma.InputJsonValue, channel: "email" },
  });
}

export const emailTemplates = {
  bookingRequested: (clientName: string, listingTitle: string) => `
    <h2>Tour request received</h2>
    <p>Hi ${clientName}, we've received your request to tour <strong>${listingTitle}</strong>. We're matching you with the best available local agent and will confirm shortly.</p>`,

  bookingPendingApproval: (listingTitle: string, agentName: string) => `
    <h2>New booking awaiting approval</h2>
    <p>A tour request for <strong>${listingTitle}</strong> has a suggested agent match: ${agentName}. Review it in the admin queue.</p>`,

  bookingConfirmed: (clientName: string, listingTitle: string, agentName: string, when: string) => `
    <h2>Your tour is confirmed!</h2>
    <p>Hi ${clientName}, your tour of <strong>${listingTitle}</strong> with ${agentName} is confirmed for ${when}.</p>`,

  agentAssigned: (agentName: string, listingTitle: string, when: string) => `
    <h2>New tour assigned</h2>
    <p>Hi ${agentName}, you've been assigned a tour of <strong>${listingTitle}</strong> on ${when}. Check your dashboard for details.</p>`,

  tourReminder: (name: string, listingTitle: string, when: string) => `
    <h2>Reminder: your tour starts in 1 hour</h2>
    <p>Hi ${name}, just a reminder that your tour of <strong>${listingTitle}</strong> is at ${when}.</p>`,

  tourCompletedReviewRequest: (clientName: string, listingTitle: string) => `
    <h2>How was your tour?</h2>
    <p>Hi ${clientName}, thanks for touring <strong>${listingTitle}</strong> with Lookeyy! Leave a quick review for your agent in your dashboard.</p>`,

  agentApplicationApproved: (name: string) => `
    <h2>Welcome to Lookeyy, ${name}!</h2>
    <p>Your tour partner application has been approved. Sign in to set your availability and start receiving tours.</p>`,

  agentApplicationRejected: (name: string, reason?: string) => `
    <h2>Update on your Lookeyy application</h2>
    <p>Hi ${name}, unfortunately we're not able to approve your tour partner application at this time.${reason ? ` Reason: ${reason}` : ""}</p>`,

  bookingCancelled: (name: string, listingTitle: string) => `
    <h2>Tour cancelled</h2>
    <p>Hi ${name}, the tour for <strong>${listingTitle}</strong> has been cancelled.</p>`,
};
