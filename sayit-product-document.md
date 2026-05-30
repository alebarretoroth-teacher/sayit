# SAYIT — Documento de Produto Completo
> *Versão 1.0 | Maio 2026*

---

## 1. VISÃO GERAL DO PRODUTO

### O Problema Real
Alunos brasileiros adultos não falham em inglês por falta de vocabulário ou gramática. Eles falham porque **não automatizaram as estruturas**. O cérebro ainda pensa em português, traduz, reorganiza — e nesse intervalo, a conversa passou.

O Sayit resolve isso: **transformar sentence patterns em respostas automáticas**, via microprodução repetida, contextualizada e inteligente.

### Proposta de Valor
> "Pare de traduzir. Comece a pensar em inglês."

Sayit é um app de fluência — não de gramática. O foco é **output guiado**: o aluno produz frases desde o primeiro dia, com feedback imediato e progressão baseada em evidências de aquisição de linguagem.

### Diferenciais vs. Concorrentes

| Feature | Duolingo | Speak | ELSA | **Sayit** |
|---|---|---|---|---|
| Sentence patterns | ❌ | Parcial | ❌ | ✅ Core |
| Build the sentence | ❌ | ❌ | ❌ | ✅ |
| Chunks em contexto | ❌ | ❌ | ❌ | ✅ |
| SRS inteligente | Parcial | ❌ | ❌ | ✅ |
| Dashboard professor | ❌ | ❌ | ❌ | ✅ |
| Homework automático | ❌ | ❌ | ❌ | ✅ |
| Foco adulto BR | ❌ | Parcial | ❌ | ✅ |

---

## 2. LÓGICA PEDAGÓGICA

### Framework de Aquisição
O Sayit é construído sobre 4 pilares de SLA (Second Language Acquisition):

**1. Comprehensible Input (Krashen)**
Antes de produzir, o aluno ouve e lê no nível i+1 — um degrau acima do que já sabe.

**2. Output Guiado (Swain)**
Produzir linguagem força o processamento ativo. O aluno não só reconhece — ele constrói.

**3. Automatização via Repetição Espaçada**
Estruturas retornam no momento exato antes de serem esquecidas (algoritmo SRS adaptativo).

**4. Noticing (Schmidt)**
O app destaca explicitamente o padrão que o aluno está aprendendo — não deixa implícito.

### Progressão CEFR

```
A1 → A2 → B1 → B2 → C1
```

Cada nível tem:
- Banco de sentence patterns específicos
- Vocabulário de alta frequência (GSL + AWL)
- Chunks funcionais por contexto (trabalho, social, viagem, estudo)
- Exercícios calibrados por complexidade sintática

### Tipos de Exercícios (do mais guiado ao mais livre)

```
GUIADO ←————————————————————→ LIVRE

Shadowing → Rearrange → Build → Speaking Drill → Free Response
```

1. **Shadowing** — ouve e repete com timing
2. **Rearrange the Sentence** — palavras embaralhadas, arrastar para ordenar
3. **Fill the Pattern** — estrutura dada, completar com chunk certo
4. **Build the Sentence** — prompt em português, construir do zero em inglês
5. **Speaking Drill** — falar a frase completa, IA avalia
6. **Free Response** — contexto dado, resposta livre, IA corrige

---

## 3. ARQUITETURA DO SISTEMA

### Stack Tecnológico

```
Frontend       → Next.js 14 (App Router) + TypeScript
Styling        → Tailwind CSS + shadcn/ui
Backend        → Supabase (PostgreSQL + Auth + Realtime + Storage)
IA / Speech    → OpenAI Whisper (transcrição) + GPT-4o (correção)
TTS            → ElevenLabs ou OpenAI TTS (áudio nativo)
Deploy         → Vercel
SRS Engine     → Custom (baseado em SM-2 modificado)
```

### Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────┐
│                    NEXT.JS APP                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │  Aluno UI    │  │  Professor   │  │  Admin    │ │
│  │  (PWA)       │  │  Dashboard   │  │  Panel    │ │
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘ │
└─────────┼────────────────┼────────────────┼────────┘
          │                │                │
┌─────────▼────────────────▼────────────────▼────────┐
│                   SUPABASE                          │
│  PostgreSQL │ Auth │ Storage │ Edge Functions       │
│  Realtime   │ RLS  │ Vectors (pgvector)            │
└─────────────────────────┬───────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────┐
│                   AI LAYER                          │
│  OpenAI (GPT-4o + Whisper) │ ElevenLabs TTS        │
│  SRS Engine Custom         │ Error Pattern Detector │
└─────────────────────────────────────────────────────┘
```

### Banco de Dados — Schema Principal

```sql
-- Usuários e perfis
users (id, email, name, role: 'student'|'teacher'|'admin', cefr_level, created_at)
profiles (user_id, avatar_url, streak_count, total_xp, timezone, preferences jsonb)

-- Conteúdo pedagógico
patterns (id, structure, example_en, example_pt, cefr_level, tags[], audio_url)
chunks (id, phrase_en, translation_pt, context, category, cefr_level)
exercises (id, type, pattern_id, prompt, correct_answer, distractors[], audio_url, difficulty)
lessons (id, title, cefr_level, focus: 'pattern'|'chunk'|'speaking', exercise_ids[])

-- Progresso do aluno
student_progress (user_id, exercise_id, attempts, correct_count, last_seen, next_review, ease_factor, interval_days)
sessions (id, user_id, started_at, ended_at, xp_earned, exercises_completed)
errors_log (id, user_id, exercise_id, student_answer, correct_answer, error_type, created_at)
recurring_errors (user_id, pattern_id, error_count, last_seen) -- materializado

-- Professor / turmas
classes (id, teacher_id, name, code, cefr_level, created_at)
class_members (class_id, student_id, joined_at)
homework (id, class_id, lesson_ids[], due_date, created_by)
homework_submissions (homework_id, student_id, completed_at, score)

-- Gamificação
achievements (id, name, description, icon, condition_type, condition_value)
student_achievements (user_id, achievement_id, earned_at)
streaks (user_id, current_streak, longest_streak, last_practice_date)
```

---

## 4. MAPA DE TELAS

### Fluxo Principal (Aluno)

```
ONBOARDING
├── Splash / Branding
├── Nível de inglês (teste rápido 5 perguntas ou autodeclarado)
├── Objetivo (viagem / trabalho / estudo / conversação)
├── Meta diária (5 / 10 / 15 / 20 min)
└── Cadastro / Login

HOME
├── Streak + XP do dia
├── Lição recomendada (SRS-driven)
├── Quick Practice (3 min)
├── Continue onde parou
└── Notificação de homework pendente

TRILHA DE APRENDIZAGEM
├── Mapa de unidades por CEFR
├── Cada unidade → 5-8 lições
└── Lição bloqueada / disponível / concluída

SESSÃO DE PRÁTICA
├── Warm-up (shadowing 30s)
├── Exercícios sequenciais (5-10 por sessão)
│   ├── Rearrange the Sentence
│   ├── Build the Sentence
│   ├── Fill the Pattern
│   ├── Speaking Drill
│   └── Free Response
├── Feedback em tempo real
├── Tela de resultado (XP + erros + próxima revisão)
└── Compartilhar resultado (opcional)

FLASHCARDS (SRS)
├── Fila de revisão do dia
├── Card frente (PT) → verso (EN + áudio)
├── Auto-avaliação: fácil / ok / difícil
└── Progresso da fila

SPEAKING HUB
├── Speaking Drills por tópico
├── Shadowing com waveform visual
└── Histórico de gravações

MEUS ERROS
├── Padrões com mais erros
├── Re-praticar erros específicos
└── Mapa de erros por tipo (ordem, vocabulário, estrutura)

PERFIL / PROGRESSO
├── Stats: streak, XP total, horas praticadas
├── CEFR atual + progresso para próximo nível
├── Conquistas
└── Configurações / metas

NOTIFICAÇÕES
└── Lembrete de prática, streak em risco, homework novo
```

### Fluxo Professor

```
DASHBOARD PROFESSOR
├── Visão geral das turmas
├── Progresso de cada aluno
├── Erros mais frequentes da turma
├── Criar / atribuir homework
└── Relatório exportável (PDF/CSV)
```

---

## 5. FUNCIONALIDADES MVP (v1.0)

O MVP deve validar o core loop: **praticar → melhorar → voltar amanhã**.

### Incluir no MVP

- [ ] Onboarding com teste de nível (5 questões adaptativas)
- [ ] 3 unidades completas (A1 → A2 → B1) com 5 lições cada
- [ ] 4 tipos de exercício: Rearrange, Build, Fill the Pattern, Speaking Drill
- [ ] SRS básico (revisão de flashcards por intervalo)
- [ ] Feedback de IA nas respostas de speaking (Whisper + GPT-4o)
- [ ] Streak diário + XP
- [ ] 3 conquistas (primeiro dia, 7 dias seguidos, primeira lição concluída)
- [ ] Histórico de erros recorrentes (top 5)
- [ ] Dashboard do aluno (stats básicos)
- [ ] Auth (email + Google OAuth)
- [ ] PWA mobile-first

### Deixar para v1.1+

- Dashboard do professor
- Homework automático
- Turmas e relatórios
- Shadowing com análise de pronúncia
- Free Response com correção aberta
- Notificações push
- Modo offline

---

## 6. SISTEMA DE REPETIÇÃO ESPAÇADA (SRS)

### Algoritmo Base: SM-2 Modificado

Cada exercício tem:
- **ease_factor** (inicia em 2.5) — quão "fácil" é para esse aluno
- **interval** (dias até próxima revisão)
- **repetitions** — quantas vezes acertou consecutivamente

```
Após acerto:
  - repetitions = 0 → interval = 1
  - repetitions = 1 → interval = 6
  - repetitions > 1 → interval = interval * ease_factor

Após erro:
  - interval = 1
  - repetitions = 0
  - ease_factor = max(1.3, ease_factor - 0.2)

Após resposta "difícil":
  - ease_factor = ease_factor - 0.15
  - interval mantém mas não cresce

Após resposta "fácil":
  - ease_factor = ease_factor + 0.1
```

### Fila de Revisão Diária
- Máx. 20 revisões/dia (configurable)
- Novas palavras: máx. 10/dia
- Prioridade: vencidas > hoje > novas
- Exercícios de speaking têm peso maior no SRS (maior esforço cognitivo = maior fixação)

---

## 7. GAMIFICAÇÃO (LEVE E ELEGANTE)

### Princípio: recompensar consistência, não velocidade

Nada de vidas ou penalidades. Gamificação positiva, adulta.

### XP System
- Exercício correto: 10 XP
- Speaking drill: 15 XP (maior esforço)
- Sessão completa: +20 XP bônus
- Streak diário: multiplicador (1.1x após 3 dias, 1.2x após 7, 1.3x após 30)

### Streak
- Perde se não praticar em 24h após o reset (meia-noite local)
- "Streak Shield" — 1 proteção por semana (evita perder streak em 1 falta)
- Visual: fogo que cresce com o streak

### Conquistas (exemplos)
| Nome | Condição |
|---|---|
| First Word | Completar primeira lição |
| On a Roll | 7 dias seguidos |
| Pattern Master | Completar todos exercícios de 1 pattern |
| Speaking Up | Completar 10 speaking drills |
| Unstoppable | 30 dias seguidos |
| Error Hunter | Re-praticar 20 erros do histórico |

### Metas Semanais
- Meta da semana gerada automaticamente (ex: "Pratique 5 dias essa semana")
- Recompensa: XP bônus + badge especial

---

## 8. IDENTIDADE VISUAL SUGERIDA

### Conceito
**Premium, calmo, confiante.** O app não grita — ele convida. Visual inspirado em apps como Linear, Notion e Calm: muito espaço, tipografia forte, poucas cores.

### Paleta de Cores
```
Primary:    #1A1A2E  (Azul-noite profundo) — confiança, seriedade
Accent:     #4F6EF7  (Azul elétrico) — ação, interação
Success:    #22C55E  (Verde) — acerto, progresso
Warning:    #F59E0B  (Âmbar) — atenção, streak
Error:      #EF4444  (Vermelho) — erro, feedback
Background: #F8F9FF  (Quase branco com toque frio)
Surface:    #FFFFFF  (Cards)
Text:       #111827  (Quase preto)
Muted:      #6B7280  (Cinza médio)
```

### Tipografia
```
Display:  Inter (700) — títulos, XP, números grandes
Body:     Inter (400/500) — textos corridos
Mono:     JetBrains Mono — padrões, estruturas (destaca o pattern)
```

### Componentes-chave
- Cards com border-radius 16px, sombra muito suave
- Botão primário: fundo `#4F6EF7`, texto branco, rounded-full
- Botão secundário: outline, sem fill
- Progress bar: gradiente azul → roxo suave
- Ícones: Lucide Icons (linha fina, moderno)
- Animações: Framer Motion, suaves e funcionais (nunca decorativas)

### Logo/Nome
**Sayit** — palavra simples, ação direta. Logotipo: wordmark "sayit" em Inter 700, com o "i" substituído por uma bolha de fala estilizada. Tom: convida a falar, não a estudar.

---

## 9. FLUXO PRINCIPAL DO ALUNO (User Journey)

### Sessão Típica (10 min)

```
1. ABERTURA (30s)
   App abre → vê streak atual + XP do dia
   Notificação: "3 revisões te esperando"

2. WARM-UP (1 min)
   Shadowing rápido: ouve uma frase, repete
   Feedback visual: waveform + "Good rhythm!"

3. REVISÕES SRS (3 min)
   3-5 flashcards da fila de revisão
   Fácil/Ok/Difícil → algoritmo ajusta próxima revisão

4. LIÇÃO NOVA (4 min)
   Pattern do dia: "I've been + [verb-ing]"
   → Exemplo em contexto (diálogo real)
   → Rearrange the Sentence (2x)
   → Build the Sentence (2x)
   → Speaking Drill (1x)
   → Feedback IA: o que acertou / o que melhorar

5. ENCERRAMENTO (30s)
   Tela de resultado:
   - XP ganho (+45 XP)
   - Streak mantida 🔥
   - "Você acertou 4/5. Esse pattern volta em 3 dias."
   - CTA: "Ver meus erros" ou "Próxima lição"

6. PÓS-SESSÃO
   Notificação agendada para amanhã
   Streak Shield aplicado se necessário
```

### Onboarding (primeira vez)

```
Tela 1: Splash animado + "Stop translating. Start speaking."
Tela 2: "Qual seu nível de inglês?" → Teste 5 perguntas adaptativas
Tela 3: "Qual seu objetivo?" → 4 opções com ícone (viagem, trabalho, conversação, academia)
Tela 4: "Quanto tempo por dia?" → slider 5/10/15/20 min
Tela 5: Cadastro (Google OAuth ou email)
Tela 6: "Sua trilha foi criada." → entra direto na primeira lição
```

---

## 10. ROADMAP DE DESENVOLVIMENTO

### Fase 1 — Foundation (Semanas 1-4)
- Setup Next.js + Supabase + Auth
- Schema do banco de dados completo
- Design system base (Tailwind + shadcn/ui + tokens)
- Onboarding flow
- 3 unidades de conteúdo (A1-B1)

### Fase 2 — Core Loop (Semanas 5-8)
- Exercícios: Rearrange, Build, Fill the Pattern
- Player de áudio + TTS
- SRS engine (SM-2)
- Streak + XP
- Dashboard do aluno v1

### Fase 3 — AI Layer (Semanas 9-12)
- Integração Whisper (transcrição de speaking)
- Feedback GPT-4o nas respostas
- Speaking Drill com avaliação
- Histórico de erros recorrentes
- Flashcards inteligentes

### Fase 4 — Social & Teacher (Semanas 13-16)
- Dashboard do professor
- Criação de turmas + homework
- Relatórios de progresso
- Notificações push (PWA)
- Conquistas e metas semanais

### Fase 5 — Polish & Scale (Semanas 17-20)
- Shadowing com análise de pronúncia avançada
- Modo offline (service worker)
- Otimização de performance
- Analytics (Mixpanel ou Posthog)
- Testes A/B no onboarding
- App stores (Capacitor ou React Native wrapper)

---

## 11. PONTOS DE ATENÇÃO E RISCOS

### Riscos Técnicos
- **Latência da IA**: Feedback de speaking deve ser <3s ou o aluno perde engajamento. Solução: streaming de resposta + feedback parcial imediato.
- **Custo de API**: OpenAI Whisper + GPT-4o pode escalar rápido. Solução: cache de respostas similares, limite de sessões com IA por plano.

### Riscos Pedagógicos
- **Gamificação excessiva**: Streak e XP podem virar o objetivo — o aluno "faz para não perder o streak", não para aprender. Solução: nunca penalizar; gamificação sempre positiva.
- **Conteúdo genérico**: Frases descontextualizadas não criam automatização real. Solução: todo exercício tem contexto (situação, persona, objetivo comunicativo).

### Riscos de Produto
- **Scope creep**: Lista de features é longa. Discipline o MVP — professor dashboard pode esperar.
- **Retenção D7**: Apps de idioma têm retenção péssima após 7 dias. Solução: onboarding gera comprometimento real (meta, objetivo, rotina) antes da primeira lição.

---

## 12. MÉTRICAS DE SUCESSO

| Métrica | Meta MVP | Meta Fase 4 |
|---|---|---|
| D1 Retention | > 60% | > 70% |
| D7 Retention | > 30% | > 45% |
| Sessions/week/user | > 4 | > 5 |
| Speaking drills/session | > 1 | > 2 |
| NPS | > 40 | > 60 |
| Streak 7+ dias | > 20% dos usuários ativos | > 35% |

---

*Documento gerado para o projeto Sayit | Alessandra Barreto Roth | Maio 2026*
