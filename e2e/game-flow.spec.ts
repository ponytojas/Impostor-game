import { expect, test } from "@playwright/test"

import { palabrasJuego } from "../lib/words"

const PLAYER_NAMES = ["Ana", "Luis", "Marta"]

async function addPlayers(page: import("@playwright/test").Page, playerNames = PLAYER_NAMES) {
  const playerInput = page.getByPlaceholder("Nombre del jugador")

  for (const name of playerNames) {
    await playerInput.fill(name)
    await page.getByRole("button", { name: /agregar/i }).click()
  }

  return { playerInput }
}

test("covers the main happy path from setup to round reset", async ({ page }) => {
  await page.clock.install()
  await page.goto("/")

  const { playerInput } = await addPlayers(page)

  await expect(page.getByRole("button", { name: /iniciar juego/i })).toBeVisible()
  await page.getByRole("button", { name: /iniciar juego/i }).click()

  await expect(page.getByText("Revela tu rol en secreto.")).toBeVisible()
  await expect(page.getByText("Primer jugador")).toBeVisible()

  const firstPlayer = page.getByTestId("first-player-name")
  await expect(firstPlayer).toHaveText(new RegExp(`^(${PLAYER_NAMES.join("|")})$`))

  const firstCard = page.getByTestId("player-card-0")
  await firstCard.click()

  await expect(firstCard.getByText("Tu rol")).toBeVisible()

  const revealedRole = (await firstCard.getByTestId("player-role").textContent())?.trim()
  expect(revealedRole).toBeTruthy()
  expect(revealedRole === "IMPOSTOR" || palabrasJuego.includes(revealedRole!)).toBeTruthy()

  await expect(firstCard.getByTestId("player-timer")).toHaveText("5s")

  await page.clock.fastForward(5_000)
  await expect(firstCard.getByText("Toca para revelar")).toBeVisible()
  await expect(firstCard.getByTestId("player-timer")).toHaveCount(0)

  const previousFirstPlayer = await firstPlayer.textContent()
  await page.getByRole("button", { name: /nueva ronda/i }).click()

  await expect(firstCard.getByText("Toca para revelar")).toBeVisible()
  await expect(firstPlayer).toHaveText(new RegExp(`^(${PLAYER_NAMES.join("|")})$`))

  const nextFirstPlayer = await firstPlayer.textContent()
  expect(nextFirstPlayer).toBeTruthy()
  expect(PLAYER_NAMES).toContain(nextFirstPlayer!)
  expect(nextFirstPlayer).not.toBe(previousFirstPlayer)

  await page.getByRole("button", { name: /cambiar jugadores/i }).click()

  await expect(page.getByText("Una carta, una palabra, un impostor.")).toBeVisible()
  await expect(playerInput).toHaveValue("")
  await expect(page.getByText("Agrega al menos 3 jugadores para comenzar.")).toHaveCount(0)
  await expect(page.getByRole("button", { name: /iniciar juego/i })).toHaveCount(0)
})

test("lets players reshuffle the first player without reusing the current one", async ({ page }) => {
  await page.goto("/")
  await addPlayers(page)
  await page.getByRole("button", { name: /iniciar juego/i }).click()

  const firstPlayer = page.getByTestId("first-player-name")
  const initialFirstPlayer = (await firstPlayer.textContent())?.trim()

  expect(initialFirstPlayer).toBeTruthy()
  expect(PLAYER_NAMES).toContain(initialFirstPlayer!)

  await page.getByRole("button", { name: /cambiar primer jugador/i }).click()

  const reshuffledFirstPlayer = (await firstPlayer.textContent())?.trim()
  expect(reshuffledFirstPlayer).toBeTruthy()
  expect(PLAYER_NAMES).toContain(reshuffledFirstPlayer!)
  expect(reshuffledFirstPlayer).not.toBe(initialFirstPlayer)
})

test("supports a deterministic crazy mode round with all impostors", async ({ page }) => {
  await page.clock.install()
  await page.goto("/")
  await addPlayers(page)

  await page.locator('button[role="checkbox"]').click({ force: true })
  await page.evaluate(() => {
    const values = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    let index = 0

    Math.random = () => {
      const nextValue = values[index] ?? 0
      index += 1
      return nextValue
    }
  })

  await page.getByRole("button", { name: /iniciar juego/i }).click()
  await expect(page.getByText("Revela tu rol en secreto.")).toBeVisible()

  for (let index = 0; index < PLAYER_NAMES.length; index += 1) {
    const card = page.getByTestId(`player-card-${index}`)
    await card.click()
    await expect(card.getByTestId("player-role")).toHaveText("IMPOSTOR")
    await expect(card.getByTestId("player-timer")).toHaveText("5s")
    await page.clock.fastForward(5_000)
    await expect(card.getByText("Toca para revelar")).toBeVisible()
  }
})
