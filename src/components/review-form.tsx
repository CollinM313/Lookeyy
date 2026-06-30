"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { submitReview } from "@/app/actions/reviews";
import { cn } from "@/lib/utils";

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (rating === 0) {
      toast.error("Pick a star rating.");
      return;
    }
    setLoading(true);
    const r = await submitReview({ bookingId, rating, comment });
    setLoading(false);
    if (r.error) {
      toast.error(r.error);
      return;
    }
    setSubmitted(true);
    toast.success("Thanks for your review!");
  }

  if (submitted) return <p className="text-sm text-muted-foreground">Review submitted — thank you!</p>;

  return (
    <div className="space-y-2 rounded-lg border border-border p-3">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <button key={i} type="button" onClick={() => setRating(i + 1)}>
            <Star className={cn("h-5 w-5", i < rating ? "fill-primary text-primary" : "text-muted-foreground")} />
          </button>
        ))}
      </div>
      <Textarea
        placeholder="How was your tour?"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
      />
      <Button size="sm" onClick={handleSubmit} disabled={loading}>
        Submit review
      </Button>
    </div>
  );
}
