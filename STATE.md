# STATE

## Resumen rápido de arquitectura actual

Proyecto Next.js pequeño con App Router y una sola pantalla principal de juego.

### Estructura actual
- `app/page.tsx` — pantalla principal y núcleo de la app.
- `app/layout.tsx` — layout global y providers.
- `components/ui/*` — primitives UI reutilizables (shadcn-style).
- `lib/words.ts` — catálogo de palabras.
- `lib/utils.ts` — utilidades genéricas mínimas.
- `domain/game/*` — **nuevo** primer corte de dominio extraído en esta refactorización.
- `scripts/agent-status-log.sh` — **nuevo** helper append-only para estado/log del agente.

## Inventario de hotspots / acoplamiento

### Ficheros grandes
- `app/page.tsx` (~505 líneas): concentra UI, estado local, reglas del juego, aleatoriedad, temporizadores, flujo de ronda y parte de la presentación.
- `lib/words.ts` (~200 líneas): dataset estático razonable, pero hoy actúa como dependencia directa desde la pantalla.

### Zonas de acoplamiento detectadas
1. **Dominio mezclado con UI en `app/page.tsx`**
   - generación de rondas
   - asignación de roles
   - selección del primer jugador
   - validación mínima del setup
2. **Estado efímero mezclado con lógica de temporizadores**
   - `players`, `timers`, `intervalRefs`, `stage`, `firstPlayer` viven todos en la página.
3. **Dependencias de dominio sin capa intermedia**
   - la página consumía directamente `lib/words.ts` y literales como `"Impostor"`, `3`, `5`, `0.2`.
4. **Poca separación para crecimiento**
   - no existe aún una capa clara para `services`, `state` o `shared utils` del juego.

## Decisiones tomadas en este primer corte

### 1. Extraer dominio puro inicial
Se creó `domain/game/` con:
- `types.ts`
- `constants.ts`
- `engine.ts`

Esto mueve fuera de la pantalla:
- tipos del juego (`Player`, `GameMode`, `GameStage`, `TimerState`)
- constantes de negocio (`IMPOSTOR_ROLE`, `MIN_PLAYERS`, `REVEAL_DURATION_SECONDS`, `CRAZY_MODE_PROBABILITY`)
- helpers puros de dominio (`pickFirstPlayer`, `resolveGameMode`, `buildRoles`, `createGameRound`)

### 2. Mantener la UI intacta
`app/page.tsx` sigue controlando la experiencia, pero ya delega la creación de rondas y las constantes de negocio al dominio.

### 3. Añadir observabilidad mínima de agente
Se añadió:
- `scripts/agent-status-log.sh`
- log append-only en `/tmp/openclaw-agent-status/impostor.log`

Eventos esperados:
- `planning`
- `editing`
- `running`
- `blocked`
- `done`

## Plan de refactor por fases

### Fase 1 — Dominio y constantes compartidas
- [x] extraer tipos y constantes de negocio
- [x] extraer creación de ronda y helpers puros
- [ ] mover textos/modos/labels de juego a un módulo específico si empiezan a crecer

### Fase 2 — Capa de estado del juego
Objetivo: sacar el flujo principal de `app/page.tsx`.

Propuesta:
- crear `state/game/useImpostorGame.ts`
- centralizar:
  - `stage`
  - `playerNames`
  - `players`
  - `firstPlayer`
  - `crazyMode`
  - acciones `addPlayer`, `removePlayer`, `startGame`, `newRound`, `resetGame`

Resultado esperado:
- la página pasa a ser composición/presentación
- mejor testabilidad del flujo

### Fase 3 — Temporizadores/reveal state
Objetivo: separar el comportamiento temporal del dominio principal.

Propuesta:
- crear `state/game/useRevealTimers.ts`
- encapsular `timers`, `intervalRefs`, limpieza y `toggleCard`

Resultado esperado:
- menos efectos laterales en la pantalla
- menor riesgo al tocar UX de reveal

### Fase 4 — Componentización UI
Extraer desde `app/page.tsx`:
- `components/game/setup-screen.tsx`
- `components/game/playing-screen.tsx`
- `components/game/player-card.tsx`
- `components/game/theme-toggle.tsx`
- `components/game/first-player-panel.tsx`

Criterio:
- componentes presentacionales primero
- evitar meter lógica de negocio dentro de componentes nuevos

### Fase 5 — Services y datos
Si el juego crece:
- `services/game/logger.ts` o wrapper TS del logger de agente
- `services/game/random.ts` si necesitamos semilla/debug reproducible
- `domain/game/word-repository.ts` o `data/words.ts` para desacoplar dataset del motor

### Fase 6 — Calidad y pruebas
- tests unitarios para `domain/game/engine.ts`
- tests de hooks para estado si se crea `useImpostorGame`
- smoke test UI mínimo

## Riesgos actuales
- No se ha validado build localmente porque faltan dependencias instaladas (`next` no está disponible en este checkout).
- `app/page.tsx` sigue siendo el mayor hotspot; este cambio reduce riesgo pero no elimina el acoplamiento de estado/temporizadores.
- La aleatoriedad usa `Math.random()` y `sort(() => Math.random() - 0.5)`, suficiente para este juego casual pero no ideal si luego queremos test reproducible.
- `currentMode` se mantiene en estado pero aún no está reflejado en UI; es correcto funcionalmente, pero puede convertirse en deuda si se olvida.

## Siguientes pasos recomendados
1. Crear `useImpostorGame` para sacar las acciones principales de la página.
2. Extraer `toggleCard` + temporizadores a `useRevealTimers`.
3. Dividir la pantalla en `SetupScreen` y `PlayingScreen`.
4. Instalar dependencias y validar con `npm install`/`pnpm install` + `build` antes de refactors mayores.
