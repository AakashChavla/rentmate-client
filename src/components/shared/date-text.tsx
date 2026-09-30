export const DEFAULT_ORG_TIME_ZONE = "Asia/Kolkata";

type DateTextProps = {
  value: string | Date;
  timeZone?: string;
  mode?: "date" | "datetime";
};

export function DateText({
  value,
  timeZone = DEFAULT_ORG_TIME_ZONE,
  mode = "date",
}: DateTextProps) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return <span>—</span>;
  }

  const formatted = new Intl.DateTimeFormat("en-IN", {
    timeZone,
    dateStyle: "medium",
    ...(mode === "datetime" ? { timeStyle: "short" as const } : {}),
  }).format(date);

  return <time dateTime={date.toISOString()}>{formatted}</time>;
}
