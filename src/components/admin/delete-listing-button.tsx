"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteListing } from "@/app/actions/listings";
import { useRouter } from "next/navigation";

export function DeleteListingButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    setLoading(true);
    try {
      await deleteListing(listingId);
      toast.success("Listing deleted.");
      router.refresh();
    } catch {
      toast.error("Failed to delete listing.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" variant="ghost" disabled={loading} onClick={handleDelete}>
      Delete
    </Button>
  );
}
