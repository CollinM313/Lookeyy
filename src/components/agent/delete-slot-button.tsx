"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteAvailability } from "@/app/actions/agents";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export function DeleteSlotButton({ slotId }: { slotId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await deleteAvailability(slotId);
    setLoading(false);
    router.refresh();
  }

  return (
    <Button size="icon-sm" variant="ghost" disabled={loading} onClick={handleDelete}>
      <X className="h-3.5 w-3.5" />
    </Button>
  );
}
