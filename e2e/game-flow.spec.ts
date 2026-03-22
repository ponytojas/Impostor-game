import { expect, test } from "@playwright/test"

import { palabrasJuego } from "../lib/words"

const PLAYER_NAMES = ["Ana", "Luis", "Marta"]

test("covers the main happy path from setup to round reset", async ({ page }) => {
  await page.clock.install()
  await page.goto("/")

  const playerInput = page.getByPlaceholder("Nombre del jugador")

  for (const name of PLAYER_NAMES) {
    await playerInput.fill(name)
    await page.getByRole("button", { name: /agregar/i }).click()
  }

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
