import { expect, test } from "@playwright/test";

// Smoke test: la página principal responde y renderiza contenido.
test("la página principal carga", async ({ page }) => {
  const respuesta = await page.goto("/");
  expect(respuesta?.ok()).toBeTruthy();
  await expect(page.locator("body")).toBeVisible();
  await expect(page.locator("main")).toBeVisible();
});
