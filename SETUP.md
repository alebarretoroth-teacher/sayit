# Sayit — Setup Guide

## 1. Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)
- Conta na [OpenAI](https://platform.openai.com)
- Conta no [Vercel](https://vercel.com) (deploy)

## 2. Instalação local

```bash
cd Sayit
npm install
cp .env.local.example .env.local
# Preencha as variáveis no .env.local
```

## 3. Supabase

1. Crie um novo projeto no Supabase
2. Copie a URL e a anon key para `.env.local`
3. No Supabase Dashboard → SQL Editor, rode em ordem:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_functions.sql`
   - `supabase/migrations/003_seed_content.sql`
4. Em Authentication → Providers, ative Google OAuth

## 4. Rodar localmente

```bash
npm run dev
# Acesse http://localhost:3000
```

## 5. Deploy (Vercel)

```bash
npx vercel
# Adicione as variáveis de ambiente no painel da Vercel
```

## Estrutura de arquivos

```
src/
  app/
    api/
      evaluate/      → Avaliação de respostas com GPT-4o
      speaking/      → Transcrição Whisper + avaliação
      progress/      → Salvar progresso + SRS
    dashboard/       → Home do aluno
    onboarding/      → Fluxo de onboarding (5 telas)
    practice/[id]/   → Sessão de prática
    flashcards/      → Revisão SRS
    profile/         → Perfil e estatísticas
  components/
    exercises/       → RearrangeExercise, BuildExercise, SpeakingDrill
    gamification/    → StreakBar, QuickStats
    layout/          → BottomNav, LessonCard
  lib/
    supabase/        → client.ts + server.ts
    srs.ts           → Algoritmo SM-2
    ai.ts            → OpenAI Whisper + GPT-4o
  types/
    index.ts         → Todos os tipos TypeScript
supabase/
  migrations/        → Schema SQL + seed content
```
