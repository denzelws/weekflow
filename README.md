# WeekFlow

> Foco em metas diárias. Uma tarefa por vez.

App minimalista e gamificado de gestão de tarefas semanais. Inspirado na mecânica de engajamento do Duolingo, com foco absoluto e sem sobrecarga cognitiva.

---

## Stack

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS v3** com design system customizado
- **uuid** para geração de IDs
- **clsx** para composição de classes
- Persistência via **localStorage** (MVP)

---

## Setup

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build de produção
npm run build
```

---

## Arquitetura

```
src/
├── styles/
│   └── globals.css          # Design tokens, tipografia, classes reutilizáveis
│
├── types/
│   └── index.ts             # Todos os tipos de domínio (Task, Week, DaySession…)
│
├── utils/
│   ├── index.ts             # Date helpers, XP calc, factories, cn()
│   └── storage.ts           # Camada de persistência localStorage
│
├── store/
│   └── useAppStore.ts       # Estado central + todas as regras de negócio (RN-01~18)
│
├── components/
│   ├── ui/                  # Componentes atômicos reutilizáveis
│   │   ├── Button.tsx       # Variantes: primary | secondary | ghost | danger
│   │   ├── Badge.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Checkbox.tsx
│   │   ├── XPPop.tsx        # Animação +XP
│   │   ├── StreakBars.tsx
│   │   ├── TaskCard.tsx     # Estados: pending | today | completed | focus-active
│   │   ├── WeekCalendar.tsx # Strip semanal com indicadores por dia
│   │   └── index.ts
│   │
│   ├── layout/              # Estrutura de página
│   │   ├── AppShell.tsx     # Container mobile com header + nav slots
│   │   ├── Header.tsx       # Logo + XP + avatar
│   │   ├── BottomNav.tsx    # Navegação inferior
│   │   └── index.ts
│   │
│   └── screens/             # Telas completas (uma por fluxo do BRD)
│       ├── BrainDump.tsx    # Tela 1 — Input semanal
│       ├── WeekKickoff.tsx  # Tela 2 — Reveal + Start the Week
│       ├── BacklogView.tsx  # Tela 3 — Backlog + seleção diária
│       ├── FocusMode.tsx    # Tela 4 — Uma tarefa por vez
│       ├── DaySummary.tsx   # Tela 5 — XP, streak, resumo
│       └── index.ts
│
├── App.tsx                  # Router principal (screen switch)
└── main.tsx                 # Entry point
```

---

## Design System

### Cores
| Token | Valor | Uso |
|-------|-------|-----|
| `surface` | `#060d24` | Background base |
| `surface-high` | `#151e3c` | Cards interativos |
| `primary` | `#3afea0` | Electric Mint — accent |
| `secondary` | `#ff6b6b` | Warm Coral — alertas |
| `gold` | `#f5c842` | Conquistas |

### Classes Utilitárias Principais
- `.btn-primary` `.btn-secondary` `.btn-ghost` — sistema de botões
- `.card` `.card-low` `.card-highest` — hierarquia de superfícies
- `.glass` — frosted glass overlay
- `.input` `.textarea` — campos de entrada
- `.badge-primary` `.badge-muted` — etiquetas
- `.task-card` `.task-card.selected` `.task-card.completed` — estados de tarefa
- `.text-display` `.text-h1` `.text-label` — escala tipográfica
- `.text-gradient` — gradiente mint no texto
- `.screen` `.screen-centered` — containers de tela
- `.animate-slide-up` `.animate-fade-in` `.animate-xp-pop` — animações

### Regras do Design System
- ❌ Sem borders `1px solid` para separar seções
- ❌ Sem sombras em cinza puro
- ✅ Separação por contraste de luminância (`surface-low` → `surface-high`)
- ✅ Botões primários com gradiente 135°
- ✅ Foco via `box-shadow` glow, não `outline`

---

## Regras de Negócio Implementadas

Todas as RN-01 a RN-18 do Business Rules Document v1.0 estão implementadas em `src/store/useAppStore.ts`:

| RN | Implementação |
|----|---------------|
| RN-01 | Input único na `BrainDump` screen |
| RN-02 | `parseTasksFromText()` em `utils/index.ts` |
| RN-03 | Limite de 21 tarefas com alerta visual |
| RN-04 | `BrainDump` bloqueada quando semana ativa |
| RN-05 | Stagger animation na `WeekKickoff` |
| RN-06 | Dia atual destacado com mint |
| RN-07 | Botão "Start the Week" obrigatório |
| RN-08 | `toggleTodayTask()` bloqueia em 3 |
| RN-09 | Todas as tarefas visíveis no backlog |
| RN-10 | Tarefas concluídas desabilitadas |
| RN-11 | `selectionLocked` após início do foco |
| RN-12 | Outras tarefas ocultas no `FocusMode` |
| RN-13 | `completeTask()` avança automaticamente |
| RN-14 | Sem botão de skip |
| RN-15 | Timer Pomodoro opcional (25 min) |
| RN-16 | `calcDayXP()` com bônus e multiplicador |
| RN-17 | `carryOver()` — máximo 1 por dia |
| RN-18 | `closeDay()` persiste XP, streak e data |
