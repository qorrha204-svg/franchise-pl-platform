export function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// "2026-07" -> "26.7"
export function formatMonthShort(month) {
  const [y, m] = month.split("-");
  return `${y.slice(2)}.${Number(m)}`;
}
