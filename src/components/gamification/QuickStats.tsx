"use client";

interface QuickStatsProps {
  dueReviews: number;
  todayMinutes?: number;
  correctRate?: number;
}

export default function QuickStats({ dueReviews, todayMinutes = 0, correctRate = 0 }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #E5E0D8" }}>
        <p className="text-2xl font-bold" style={{ color: "#FF7058" }}>{dueReviews}</p>
        <p className="text-xs mt-1" style={{ color: "#072547", opacity: 0.45 }}>revisões</p>
      </div>
      <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #E5E0D8" }}>
        <p className="text-2xl font-bold" style={{ color: "#22C55E" }}>{todayMinutes}</p>
        <p className="text-xs mt-1" style={{ color: "#072547", opacity: 0.45 }}>min hoje</p>
      </div>
      <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #E5E0D8" }}>
        <p className="text-2xl font-bold" style={{ color: "#072547" }}>{correctRate}%</p>
        <p className="text-xs mt-1" style={{ color: "#072547", opacity: 0.45 }}>aproveitamento</p>
      </div>
    </div>
  );
}
