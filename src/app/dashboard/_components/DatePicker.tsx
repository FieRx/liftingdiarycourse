"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

export function DatePicker({ selected }: { selected: Date }) {
  const router = useRouter();
  const [date, setDate] = useState<Date>(selected);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleSelect(d: Date | undefined) {
    if (!d) return;
    setDate(d);
    router.push(`/dashboard?date=${format(d, "yyyy-MM-dd")}`);
  }

  if (!mounted) return <div className="rounded-lg border bg-card w-[var(--rdp-month-width,280px)] h-[300px]" />;

  return (
    <div className="rounded-lg border bg-card p-2 w-fit">
      <Calendar
        mode="single"
        selected={date}
        onSelect={handleSelect}
        captionLayout="dropdown"
        fromYear={2020}
        toYear={2030}
      />
    </div>
  );
}
