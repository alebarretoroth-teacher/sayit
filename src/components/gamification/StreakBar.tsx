"use client";

interface StreakBarProps {
  streak: number;
  xp: number;
  dailyGoalMinutes: number;
}

export default function StreakBar({ streak, xp, dailyGoalMinutes }: StreakBarProps) {
  return (
    <div className="rounded-2xl px-5 py-4 flex items-center justify-between" style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #E5E0D8" }}>
      <div className="text-center">
        <p className="text-2xl font-bold leading-none" style={{ color: "#FF7058" }}>{streak}</p>
        <p className="text-xs mt-1" style={{ color: "#072547", opacity: 0.45 }}>sequência</p>
      </div>

      <div className="w-px h-8" style={{ backgroundColor: "#E5E0D8" }} />

      <div className="text-center">
        <p className="text-2xl font-bold leading-none" style={{ color: "#072547" }}>{xp.toLocaleString("pt-BR")}</p>
        <p className="text-xs mt-1" style={{ color: "#072547", opacity: 0.45 }}>pontos</p>
      </div>

      <div className="w-px h-8" style={{ backgroundColor: "#E5E0D8" }} />

      <div className="text-center">
        <p className="text-2xl font-bold leading-none" style={{ color: "#7DC9E8" }}>{dailyGoalMinutes}</p>
        <p className="text-xs mt-1" style={{ color: "#072547", opacity: 0.45 }}>meta/dia</p>
      </div>
    </div>
  );
}
