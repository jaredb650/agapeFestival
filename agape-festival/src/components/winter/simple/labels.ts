/** The data keeps the flyer's caps ("GETTING HERE"); the page sets sentence case ("Getting here"). Acronyms stay. */
export function sentence(label: string) {
  const t = label.trim();
  if (t.length <= 3 && t === t.toUpperCase()) return t;
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

/** "2027-02-19" → "Fri Feb 19" (the date line the page uses everywhere). */
export function dayStamp(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }).replace(",", "");
}
