"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendNotification, emailTemplates } from "@/lib/email";

const applicationSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(7),
  licenseNumber: z.string().min(2),
  brokerage: z.string().min(2),
  coverageArea: z.string().min(2),
  bio: z.string().min(20),
  areasOfExpertise: z.array(z.string()).default([]),
});

export async function applyAsAgent(input: z.infer<typeof applicationSchema>) {
  const parsed = applicationSchema.safeParse(input);
  if (!parsed.success) return { error: "Please fill out all required fields." };

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: "An account with that email already exists." };

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      passwordHash,
      role: "CLIENT", // promoted to AGENT only on admin approval
      agentProfile: {
        create: {
          licenseNumber: parsed.data.licenseNumber,
          brokerage: parsed.data.brokerage,
          coverageArea: parsed.data.coverageArea,
          bio: parsed.data.bio,
          areasOfExpertise: parsed.data.areasOfExpertise,
          status: "PENDING",
        },
      },
    },
  });

  const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
  for (const admin of admins) {
    await sendNotification({
      userId: admin.id,
      to: admin.email,
      type: "AGENT_APPLICATION_APPROVED",
      subject: "New tour partner application",
      html: `<p>${user.name} (${user.email}) applied to become a tour partner.</p>`,
    });
  }

  return { success: true };
}

export async function approveAgentApplication(agentProfileId: string) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") return { error: "Not authorized." };

  const agent = await prisma.agentProfile.update({
    where: { id: agentProfileId },
    data: { status: "APPROVED" },
    include: { user: true },
  });
  await prisma.user.update({ where: { id: agent.userId }, data: { role: "AGENT" } });

  await sendNotification({
    userId: agent.userId,
    to: agent.user.email,
    type: "AGENT_APPLICATION_APPROVED",
    subject: "Welcome to Lookeyy!",
    html: emailTemplates.agentApplicationApproved(agent.user.name ?? "there"),
  });

  revalidatePath("/dashboard/admin/agents");
  return { success: true };
}

export async function rejectAgentApplication(agentProfileId: string, reason?: string) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") return { error: "Not authorized." };

  const agent = await prisma.agentProfile.update({
    where: { id: agentProfileId },
    data: { status: "REJECTED", rejectionReason: reason },
    include: { user: true },
  });

  await sendNotification({
    userId: agent.userId,
    to: agent.user.email,
    type: "AGENT_APPLICATION_REJECTED",
    subject: "Update on your Lookeyy application",
    html: emailTemplates.agentApplicationRejected(agent.user.name ?? "there", reason),
  });

  revalidatePath("/dashboard/admin/agents");
  return { success: true };
}

export async function updateAvailability(
  agentProfileId: string,
  slots: { date: string; startTime: string; endTime: string }[]
) {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized." };

  await prisma.availability.createMany({
    data: slots.map((s) => ({
      agentId: agentProfileId,
      date: new Date(s.date),
      startTime: s.startTime,
      endTime: s.endTime,
    })),
  });

  revalidatePath("/dashboard/agent/availability");
  return { success: true };
}

export async function deleteAvailability(slotId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized." };

  await prisma.availability.delete({ where: { id: slotId } });
  revalidatePath("/dashboard/agent/availability");
  return { success: true };
}
