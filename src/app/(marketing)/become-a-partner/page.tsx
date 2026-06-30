import { AgentApplicationForm } from "@/components/agent-application-form";
import { Video, Users, TrendingUp } from "lucide-react";

export default function BecomePartnerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Become a Lookeyy tour partner</h1>
        <p className="mt-3 text-muted-foreground">
          Join our network of local agents conducting live and recorded video tours for motivated
          buyers and renters.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Users, title: "Qualified leads", body: "Tours come from buyers ready to engage." },
          { icon: Video, title: "Flexible format", body: "Live calls or recorded walkthroughs, your call." },
          { icon: TrendingUp, title: "Grow your book", body: "Build relationships before the open house." },
        ].map((f) => (
          <div key={f.title} className="rounded-xl border border-border bg-card p-4 text-center">
            <f.icon className="mx-auto h-6 w-6 text-primary" />
            <p className="mt-2 text-sm font-medium">{f.title}</p>
            <p className="text-xs text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <AgentApplicationForm />
      </div>
    </div>
  );
}
