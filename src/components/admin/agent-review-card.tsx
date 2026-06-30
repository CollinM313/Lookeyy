"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { approveAgentApplication, rejectAgentApplication } from "@/app/actions/agents";

export function AgentReviewCard({
  agent,
}: {
  agent: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    licenseNumber: string;
    brokerage: string;
    coverageArea: string;
    bio: string;
    areasOfExpertise: string[];
  };
}) {
  const [loading, setLoading] = useState(false);

  async function approve() {
    setLoading(true);
    const r = await approveAgentApplication(agent.id);
    setLoading(false);
    if (r.error) toast.error(r.error);
    else toast.success(`${agent.name} approved as a tour partner.`);
  }

  async function reject() {
    setLoading(true);
    const r = await rejectAgentApplication(agent.id, "Did not meet partner criteria");
    setLoading(false);
    if (r.error) toast.error(r.error);
    else toast.success("Application rejected.");
  }

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{agent.name}</p>
          <p className="text-sm text-muted-foreground">
            {agent.email} {agent.phone ? `· ${agent.phone}` : ""}
          </p>
        </div>
        <Badge variant="outline">{agent.coverageArea}</Badge>
      </div>

      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <p><span className="text-muted-foreground">License:</span> {agent.licenseNumber}</p>
        <p><span className="text-muted-foreground">Brokerage:</span> {agent.brokerage}</p>
      </div>

      {agent.areasOfExpertise.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {agent.areasOfExpertise.map((a) => (
            <Badge key={a} variant="secondary">{a}</Badge>
          ))}
        </div>
      )}

      <p className="mt-3 text-sm text-muted-foreground">{agent.bio}</p>

      <div className="mt-4 flex gap-3">
        <Button onClick={approve} disabled={loading}>Approve</Button>
        <Button onClick={reject} variant="outline" disabled={loading}>Reject</Button>
      </div>
    </Card>
  );
}
