# STATE

## Resumen rápido de arquitectura actual

Proyecto Next.js pequeño con App Router y una sola pantalla principal de juego.

### Estructura actual
- `app/page.tsx` — composición mínima de la pantalla principal.
- `app/layout.tsx` — layout global y providers.
- `components/game/*` — **nuevo** corte presentacional de la UI del juego.
- `components/ui/*` — primitives UI reutilizables (shadcn-style).
- `lib/words.ts` — catálogo de palabras.
- `lib/utils.ts` — utilidades genéricas mínimas.
- `domain/game/*` — dominio del juego ya desacoplado de la pantalla.
- `scripts/agent-status-log.sh` — helper append-only para estado/log del agente.

## Inventario de hotspots / acoplamiento

### Ficheros grandes
- `components/game/setup-screen.tsx` y `components/game/playing-screen.tsx`: concentran la mayor parte de la presentación, ya separada de la lógica.
- `lib/words.ts` (~200 líneas): dataset estático razonable, pero hoy actúa como dependencia directa desde el motor de ronda.

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

Estado:
- [x] creado `hooks/use-impostor-game.ts`
- [x] centralizados `stage`, `inputName`, `playerNames`, `players`, `firstPlayer`, `crazyMode`, `currentMode`
- [x] movidas las acciones `addPlayer`, `removePlayer`, `startGame`, `newRound`, `resetGame`, `shuffleFirstPlayer`
- [x] mantenido `alert` como detalle de UI vía callback `onInvalidSetup`

Resultado actual:
- la página ya actúa más como composición/presentación
- el flujo de ronda queda encapsulado y es más fácil de testear/iterar

### Fase 3 — Temporizadores/reveal state
Objetivo: separar el comportamiento temporal del dominio principal.

Estado:
- [x] creado `hooks/use-reveal-timers.ts`
- [x] encapsulados `timers`, `intervalRefs`, limpieza y `toggleCard`
- [x] limpieza automática de intervals al desmontar o resetear/nueva ronda

Resultado actual:
- menos efectos laterales en la página
- corte pequeño y seguro: no cambia la UX visible, solo mueve la mecánica temporal

### Fase 4 — Componentización UI
Estado:
- [x] extraído `components/game/setup-screen.tsx`
- [x] extraído `components/game/playing-screen.tsx`
- [x] extraído `components/game/player-card.tsx`
- [x] extraído `components/game/theme-toggle.tsx`
- [x] extraído `components/game/first-player-panel.tsx`
- [x] extraído `components/game/how-to-play-card.tsx`
- [x] extraído `components/game/crazy-mode-toggle.tsx`
- [x] extraído `components/game/player-input.tsx`
- [x] extraído `components/game/players-list.tsx`

Criterio aplicado:
- componentes presentacionales primero
- lógica de negocio mantenida en hooks/domain
- sin cambios visuales intencionados; se han movido bloques JSX casi literales
- se priorizó `playing-screen.tsx` y solo después un corte muy pequeño y de bajo riesgo en `setup-screen.tsx`

### Fase 5 — Services y datos
Si el juego crece:
- `services/game/logger.ts` o wrapper TS del logger de agente
- `services/game/random.ts` si necesitamos semilla/debug reproducible
- `domain/game/word-repository.ts` o `data/words.ts` para desacoplar dataset del motor

### Fase 6 — Calidad y pruebas

#### Stack elegido
- `Vitest` como runner principal por ser la opción más ligera y estándar para TypeScript/Next en tests unitarios puros.
- entorno `node` para no meter `jsdom` ni Testing Library antes de necesitarlos de verdad.
- `vitest.config.ts` mínimo con alias `@` y foco inicial en `domain/**/*.test.ts`.

#### Alcance cubierto en esta ronda
- `domain/game/engine.ts` cubierto con 11 tests unitarios.
- casos cubiertos:
  - selección aleatoria controlada (`pickRandomItem`)
  - shuffle sin mutación del array original (`shuffleArray`)
  - elección de primer jugador evitando repetir cuando aplica (`pickFirstPlayer`)
  - resolución de modos normales/crazy (`resolveGameMode`)
  - asignación de roles en `normal`, `one-innocent`, `no-impostor` y `all-impostors` (`buildRoles`)
  - integración base de creación de ronda (`createGameRound`)
- para hacer los tests deterministas se reemplazó el `sort(() => Math.random() - 0.5)` por un Fisher-Yates simple e inyectable con `random` opcional. Mantiene el comportamiento del juego y mejora la testabilidad.

#### Huecos pendientes
- `hooks/use-impostor-game.ts`: aún sin tests; puede cubrirse más adelante con `@testing-library/react` cuando compense añadir `jsdom`.
- `hooks/use-reveal-timers.ts`: requiere tests temporales con fake timers; buen siguiente paso si queremos blindar reveals.
- sin smoke tests de UI todavía; deliberado para evitar sobreinfraestructura en esta primera ronda.

## Riesgos actuales
- `setup-screen.tsx` ya quedó en una composición razonable (hero + shell + CTA); seguir troceándolo ahora tendría retorno bajo y más riesgo de ruido que beneficio.
- `playing-screen.tsx` ya soltó sus bloques presentacionales más claros; no conviene seguir fragmentándolo por deporte.
- La aleatoriedad sigue basada en `Math.random()`, pero ahora el motor acepta una función `random` opcional para tests deterministas; si algún día queremos seed/debug reproducible, conviene encapsularla en un servicio.
- `currentMode` se mantiene en estado pero aún no está reflejado en UI; hoy no rompe nada, pero sigue siendo deuda si la app quiere exponer modos especiales.
- `useRevealTimers` depende del índice del jugador para los timers; es consistente con la UI actual, pero si en el futuro hay reordenaciones dinámicas convendría migrar a una clave estable.

## Validación ejecutada
- `pnpm test` ✅
- `pnpm exec tsc --noEmit` ✅
- `pnpm build` ✅

## Cierre de etapa: refactor estructural
La ronda de refactor estructural puede darse por cerrada aquí.

Motivo:
- `app/page.tsx` ya quedó como composición fina.
- dominio y temporizadores están aislados en `domain/` y `hooks/`.
- `setup-screen.tsx` y `playing-screen.tsx` ya tienen un tamaño y responsabilidad razonables para una app pequeña.
- el último corte en setup separa justo la entrada y la lista de jugadores, que era el punto más natural que quedaba.

## Próximos pasos recomendados (fuera del refactor estructural)
1. Añadir tests a `hooks/use-reveal-timers.ts` con fake timers; es el siguiente punto con mejor ROI tras el motor.
2. Valorar tests ligeros de `use-impostor-game.ts` para reglas de setup/reset/new round cuando compense introducir `jsdom`.
3. Decidir si `currentMode` debe mostrarse en UI o eliminarse del estado hasta que haga falta explícitamente.
4. Si se quiere más seguridad para reveal/timers, migrar de índice a identificador estable por jugador.
5. Si el juego evoluciona, atacar mejoras de producto o reglas, no más cortes de componentes salvo necesidad real.
