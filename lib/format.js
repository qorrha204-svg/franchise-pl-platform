export const won = (n) => `₩${Math.round(n || 0).toLocaleString("ko-KR")}`;
export const pct = (n) => `${((n || 0) * 100).toFixed(1)}%`;
export const fmtNum = (v) => {
  const n = Number(v);
  return !v || isNaN(n) ? "" : n.toLocaleString("ko-KR");
};
