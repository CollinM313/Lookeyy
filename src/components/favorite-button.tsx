"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { toggleFavorite } from "@/app/actions/profile";
import { cn } from "@/lib/utils";

export function FavoriteButton({ listingId, initialFavorited }: { listingId: string; initialFavorited: boolean }) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const r = await toggleFavorite(listingId);
    setLoading(false);
    if (r.error) {
      toast.error("Sign in to save homes.");
      return;
    }
    setFavorited(!!r.favorited);
  }

  return (
    <Button variant="outline" className="w-full" disabled={loading} onClick={handleClick}>
      <Heart className={cn("mr-2 h-4 w-4", favorited && "fill-primary text-primary")} />
      {favorited ? "Saved" : "Save home"}
    </Button>
  );
}
