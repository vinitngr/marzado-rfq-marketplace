"use client";

import * as React from "react";
import { CalendarDays } from "lucide-react";
import { addYears, format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export function RfqDatePicker() {
  const [date, setDate] = React.useState<Date>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  today.setDate(today.getDate() + 1);
  return (
    <div className="mt-5 space-y-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className="h-11 w-full justify-between rounded-none border-slate-300 bg-white px-3 text-left font-normal text-slate-700 shadow-none hover:bg-slate-50 focus-visible:border-slate-400 focus-visible:ring-0"
            variant="outline"
          >
            <span className={date ? "text-slate-950" : "text-slate-400"}>
              {date ? format(date, "EEEE, d MMMM yyyy") : "Choose a deadline"}
            </span>
            <CalendarDays className="size-4 text-slate-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={{ before: today }}
            startMonth={today}
            endMonth={addYears(today, 5)}
            captionLayout="dropdown"
          />
        </PopoverContent>
      </Popover>
      <input
        name="deadline"
        type="hidden"
        value={date ? format(date, "yyyy-MM-dd") : ""}
        required
      />
      <p className="text-xs text-slate-500">
        Pick a date from tomorrow through the next five years.
      </p>
    </div>
  );
}
