export function formatDateTime(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatRelativeMinutes(minutes) {
  if (minutes < 1) return "now";
  return `${minutes} min ago`;
}

export function matchesSearch(item, query, keys) {
  if (!query) return true;
  const term = query.toLowerCase();
  return keys.some((key) => String(item[key] ?? "").toLowerCase().includes(term));
}
