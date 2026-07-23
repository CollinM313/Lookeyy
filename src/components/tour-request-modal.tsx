"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Video, CalendarCheck, CheckCircle } from "lucide-react";

type TourType = "live" | "recorded";

type Props = {
  open: boolean;
  onClose: () => void;
  propertyAddress?: string;
};

export function TourRequestModal({ open, onClose, propertyAddress }: Props) {
  const [tourType, setTourType] = useState<TourType>("live");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  }

  function handleClose() {
    onClose();
    setTimeout(() => setSubmitted(false), 300);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request a Tour</DialogTitle>
          {propertyAddress && (
            <DialogDescription>{propertyAddress}</DialogDescription>
          )}
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <p className="text-lg font-semibold">You&apos;re on the list!</p>
            <p className="text-sm text-muted-foreground">
              An agent will reach out within 24 hours to confirm your{" "}
              {tourType === "live" ? "live video" : "recorded"} tour.
            </p>
            <p className="text-xs text-muted-foreground">
              Start your free 7-day trial — no credit card required until after your first week.
            </p>
            <Button className="mt-2 w-full" onClick={handleClose}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Tour type picker */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTourType("live")}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors ${
                  tourType === "live"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                <Video className="h-6 w-6" />
                Live Tour
                <span className="text-xs font-normal">Real-time walkthrough</span>
              </button>
              <button
                type="button"
                onClick={() => setTourType("recorded")}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors ${
                  tourType === "recorded"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                <CalendarCheck className="h-6 w-6" />
                Recorded Tour
                <span className="text-xs font-normal">Watch on your schedule</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Your name</Label>
                <Input id="name" name="name" placeholder="Jane Smith" required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@email.com"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(555) 000-0000"
                  className="mt-1"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Sending..."
                : `Request ${tourType === "live" ? "Live" : "Recorded"} Tour`}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Free for 7 days · Then $12.99/month · Cancel anytime
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
