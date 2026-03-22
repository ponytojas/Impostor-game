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
- `Vitest` como runner principal.
- `@testing-library/react` solo para `renderHook`, sin montar UI compleja.
- `jsdom` únicamente en los tests de hooks mediante `// @vitest-environment jsdom`.
- fake timers de Vitest para cubrir comportamiento temporal sin fragilidad visual.
- `vitest.config.ts` sigue mínimo: alias `@` y scope ampliado a `domain/**/*.test.ts` + `hooks/**/*.test.ts`.

#### Alcance cubierto en esta ronda
- `domain/game/engine.ts` sigue cubierto con 11 tests unitarios.
- se añadieron 6 tests de integración pragmáticos sobre hooks:
  - `hooks/use-reveal-timers.test.ts`
    - reveal manual + countdown + auto-hide al expirar
    - cierre manual de una carta limpiando su timer
    - `clearAllTimers` reseteando el estado temporal para preparar nueva ronda
  - `hooks/use-impostor-game.test.ts`
    - bloqueo de setup inválido con callback `onInvalidSetup`
    - arranque de partida propagando estado de ronda (`stage`, `players`, `firstPlayer`, `currentMode`)
    - `shuffleFirstPlayer`, `newRound` y `resetGame` en un corte pequeño pero valioso
- enfoque deliberado: probar lógica compuesta y coordinación entre estado + temporizadores, no componentes visuales.
- para hacer los tests del motor deterministas se reemplazó el `sort(() => Math.random() - 0.5)` por un Fisher-Yates simple e inyectable con `random` opcional. Mantiene el comportamiento del juego y mejora la testabilidad.

#### Qué NO se cubrió aún
- no hay tests de componentes (`SetupScreen`, `PlayingScreen`, `PlayerCard`, etc.).
- no se cubrieron interacciones de DOM reales ni accesibilidad visual.
- `useImpostorGame` no está cubierto de forma exhaustiva: faltan duplicados, trims más finos, combinación completa con `crazyMode` real y asserts más profundos sobre integración con engine no mockeado.
- `clearAllTimers` no resetea cartas reveladas; hoy el test documenta el comportamiento actual en vez de imponer otro.

#### Qué quedaría para Playwright
- flujo completo happy path desde la home: añadir jugadores, empezar partida, revelar cartas y verificar auto-hide visible en UI.
- persistencia/flujo visible del primer jugador y botón de nueva ronda.
- smoke e2e del modo crazy desde la interfaz.
- regresiones visuales/UX ligeras: alternancia setup/playing, reset de partida y controles principales operativos.

## Riesgos actuales
- `setup-screen.tsx` ya quedó en una composición razonable (hero + shell + CTA); seguir troceándolo ahora tendría retorno bajo y más riesgo de ruido que beneficio.
- `playing-screen.tsx` ya soltó sus bloques presentacionales más claros; no conviene seguir fragmentándolo por deporte.
- La aleatoriedad sigue basada en `Math.random()`, pero ahora el motor acepta una función `random` opcional para tests deterministas; si algún día queremos seed/debug reproducible, conviene encapsularla en un servicio.
- `currentMode` se mantiene en estado pero aún no está reflejado en UI; hoy no rompe nada, pero sigue siendo deuda si la app quiere exponer modos especiales.
- `useRevealTimers` depende del índice del jugador para los timers; es consistente con la UI actual, pero si en el futuro hay reordenaciones dinámicas convendría migrar a una clave estable.

## Fase 7 — E2E con Playwright

### Stack elegido
- `Playwright` con `@playwright/test`.
- un único spec e2e en `e2e/game-flow.spec.ts`.
- `webServer` integrado en `playwright.config.ts` levantando `next dev` en `127.0.0.1:3000`.
- uso de `page.clock` para avanzar el temporizador de reveal sin esperas reales ni fragilidad temporal.
- selectores estables mínimos con `data-testid` solo donde aportan valor (`first-player-name`, `player-card-*`, `player-role`, `player-timer`).

### Alcance cubierto en esta ronda
El spec happy path actual cubre un flujo representativo de extremo a extremo:
- abrir home
- añadir 3 jugadores
- empezar partida
- comprobar que existe un primer jugador válido
- revelar una carta y validar que muestra un rol real (`IMPOSTOR` o una palabra del catálogo)
- verificar el countdown visible inicial de `5s`
- adelantar el reloj y comprobar auto-hide real de la carta
- lanzar `Nueva Ronda` y comprobar que el flujo sigue operativo
- usar `Cambiar Jugadores` y validar vuelta al setup limpio

### Limitaciones actuales
- solo hay un happy path; no cubre errores de setup, duplicados ni modo crazy.
- la validación e2e depende de que el host tenga instaladas las dependencias de navegador de Playwright.
- en este entorno actual faltan libs del sistema para Chromium, así que `pnpm test:e2e` queda bloqueado a nivel host aunque el spec/config ya están montados.
- no se añadieron snapshots ni pruebas visuales a propósito; para esta app pequeña hoy aportan poco frente al coste de mantenimiento.

### Siguientes ampliaciones recomendadas
1. añadir un spec corto para `crazyMode` validando que la ronda arranca y la UI sigue siendo jugable.
2. cubrir un caso de setup inválido visible en UI si en el futuro se reemplaza `alert` por feedback inline/toast.
3. comprobar explícitamente el reshuffle del primer jugador desde el botón `Cambiar`.
4. si aparecen más flujos, crear helpers/page objects muy pequeños; todavía no compensa abstraer más.

## Validación ejecutada
- `pnpm test` ✅
- `pnpm exec tsc --noEmit` ✅
- `pnpm build` ✅
- `pnpm test:e2e` ⚠️ bloqueado por dependencias de sistema de Playwright/Chromium ausentes en el host (`playwright install-deps` no disponible desde este runtime)

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
