"use client";

import { DateTimePicker12h } from "./datetimepicker12h";
import { isMonthFirstLocale } from "@/lib/i18n";
import { DateTimePicker24h } from "./datetimepicker24h";

export function DateTimePicker({
  onChange,
}: {
  onChange: (e: Date) => void;
}) {
  if (isMonthFirstLocale()) {
    return <DateTimePicker12h onChange={onChange} />;
  }
  return <DateTimePicker24h onChange={onChange} />;
}
