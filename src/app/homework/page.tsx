import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BottomNav from "@/components/layout/BottomNav";

export default async function HomeworkPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/onboarding");

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "#FAF6F1" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#072547" }} className="px-6 pt-12 pb-6">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#FF7058" }}>
          Tarefas
        </p>
        <h1 className="text-xl font-bold text-white">Homework</h1>
      </div>

      <div className="px-5 py-6 space-y-4">
        {/* Empty state */}
        <div className="rounded-2xl p-8 text-center space-y-4" style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #E5E0D8" }}>
          <div className="text-5xl">📋</div>
          <h3 className="text-lg font-bold" style={{ color: "#072547" }}>Nenhuma tarefa por enquanto</h3>
          <p className="text-sm leading-relaxed" style={{ color: "#072547", opacity: 0.5 }}>
            Quando seu professor atribuir tarefas, elas vão aparecer aqui com prazo e conteúdo definidos.
          </p>
        </div>

        {/* What to expect */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: "#072547" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#FF7058" }}>
            O que vai aparecer aqui
          </p>
          <div className="space-y-3">
            {[
              { icon: "📝", text: "Lições específicas atribuídas pelo professor" },
              { icon: "🎯", text: "Exercícios com prazo de entrega" },
              { icon: "🎤", text: "Gravações de speaking para revisar" },
              { icon: "✅", text: "Acompanhamento do que já foi entregue" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Practice suggestion */}
        <a href="/trail" className="flex items-center justify-between rounded-2xl px-5 py-4 active:scale-95 transition-all" style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #E5E0D8" }}>
          <div>
            <p className="font-semibold text-sm" style={{ color: "#072547" }}>Sem tarefa? Pratique por conta!</p>
            <p className="text-xs mt-0.5" style={{ color: "#072547", opacity: 0.45 }}>Continue sua trilha de aprendizagem</p>
          </div>
          <span className="font-bold text-lg" style={{ color: "#FF7058" }}>→</span>
        </a>
      </div>

      <BottomNav active="homework" />
    </div>
  );
}
