"use client";

import { COLORS } from "@/lib/tokens";
import { formatMonthShort } from "@/lib/date";
import { selectStyle } from "@/components/ui";

export default function PeriodRangeSelect({ months, start, end, onChangeStart, onChangeEnd }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <select value={start} onChange={(e) => onChangeStart(e.target.value)} style={selectStyle}>
        {months.map((m) => (
          <option key={m} value={m}>
            {formatMonthShort(m)}
          </option>
        ))}
      </select>
      <span style={{ color: COLORS.inkSoft, fontSize: 13 }}>~</span>
      <select value={end} onChange={(e) => onChangeEnd(e.target.value)} style={selectStyle}>
        {months.map((m) => (
          <option key={m} value={m}>
            {formatMonthShort(m)}
          </option>
        ))}
      </select>
    </div>
  );
}
