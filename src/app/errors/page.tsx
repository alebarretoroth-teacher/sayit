import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/layout/BottomNav";
import { AlertCircle, RotateCcw, TrendingDown } from "lucide-react";

export default async function ErrorsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/onboarding");

  // Recurring errors (top 10, ordered by count desc)
  const { data: recurringErrors } = await supabase
    .from("recurring_errors")
    .select("*, patterns(id, structure, example_en, example_pt, cefr_level)")
    .eq("user_id", user.id)
    .order("error_count", { ascending: false })
    .limit(10);

  // Recent errors (last 20)
  const { data: recentErrors } = await supabase
    .from("errors_log")
    .select("*, exercises(prompt, correct_answer, type, pattern_id)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  // Error type breakdown
  const errorTypes: Record<string, number> = {};
  recentErrors?.forEach((e) => {
    errorTypes[e.error_type] = (errorTypes[e.error_type] ?? 0) + 1;
  });

  const ERROR_TYPE_LABELS: Record<string, string> = {
    word_order: "Ordem das palavras",
    vocabulary: "Vocabulário",
    structure: "Estrutura",
    pronunciation: "Pronúncia",
    other: "Outros",
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Análise</p>
        <h1 className="text-2xl font-bold">Meus Erros</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Use isso para focar onde mais precisa melhorar.
        </p>
      </div>

      {/* Error type breakdown */}
      {Object.keys(errorTypes).length > 0 && (
        <div className="px-5 mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Onde você mais erra
          </h2>
          <div className="card space-y-3">
            {Object.entries(errorTypes)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => {
                const max = Math.max(...Object.values(errorTypes));
                const pct = Math.round((count / max) * 100);
                return (
                  <div key={type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{ERROR_TYPE_LABELS[type] ?? type}</span>
                      <span className="text-muted-foreground">{count}x</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-error rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Recurring errors — patterns */}
      {(recurringErrors?.length ?? 0) > 0 && (
        <div className="px-5 mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Padrões com mais erros
          </h2>
          <div className="space-y-3">
            {recurringErrors?.map((re) => (
              <div key={`${re.user_id}-${re.pattern_id}`} className="card space-y-2 border-l-4 border-error/40">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="pattern-chip text-xs">{re.patterns?.structure}</span>
                    <p className="text-sm font-mono mt-2 text-foreground">
                      {re.patterns?.example_en}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {re.patterns?.example_pt}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-xs font-bold text-error">{re.error_count}x</span>
                    <span className="text-[10px] text-muted-foreground">{re.patterns?.cefr_level}</span>
                  </div>
                </div>
                <Link
                  href={`/practice/review?pattern=${re.pattern_id}`}
                  className="flex items-center gap-1.5 text-primary text-xs font-semibold"
                >
                  <RotateCcw size={12} />
                  Revisar este padrão
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent errors list */}
      {(recentErrors?.length ?? 0) > 0 && (
        <div className="px-5 mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Erros recentes
          </h2>
          <div className="space-y-2">
            {recentErrors?.map((err) => (
              <div key={err.id} className="card">
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle size={14} className="text-error flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">{err.exercises?.type}</p>
                </div>
                <p className="text-xs text-muted-foreground mb-1">Prompt:</p>
                <p className="text-sm font-medium mb-2">{err.exercises?.prompt}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-error/5 rounded-md p-2">
                    <p className="text-[10px] text-error font-semibold mb-0.5">Sua resposta</p>
                    <p className="text-xs font-mono">{err.student_answer}</p>
                  </div>
                  <div className="bg-success/5 rounded-md p-2">
                    <p className="text-[10px] text-success font-semibold mb-0.5">Correto</p>
                    <p className="text-xs font-mono">{err.correct_answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {(recentErrors?.length ?? 0) === 0 && (
        <div className="px-5 flex flex-col items-center text-center py-12">
          <TrendingDown size={40} className="text-success mb-4" />
          <h2 className="font-bold text-lg">Nenhum erro registrado</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Complete algumas lições para ver sua análise de erros aqui.
          </p>
        </div>
      )}

      <BottomNav active="errors" />
    </div>
  );
}
