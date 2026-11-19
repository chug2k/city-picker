import { expect, test, type Page } from "@playwright/test";

function city(page: Page, name: string) {
  return page.getByRole("row").filter({ has: page.getByRole("cell", { name, exact: true }) });
}

async function putTechFirst(page: Page) {
  const cards = page.locator("[draggable=true]");
  await cards.first().evaluate(card => card.scrollIntoView({ block: "start" }));
  await cards.filter({ hasText: "Savings" }).dragTo(cards.filter({ hasText: "Dog Import Ease" }));
  await expect(cards.first()).toContainText("Tech VC");
}

test("salary changes the savings grade and rank, priorities change its weight", async ({ page }) => {
  await page.goto("./");
  const salary = page.getByLabel("Annual salary (USD)");
  const rows = page.locator("tbody tr");
  await expect(rows).toHaveCount(17);
  const austin = city(page, "Austin");
  await salary.fill("25000");
  await expect(rows.first()).toContainText("Kuala Lumpur");
  await expect(austin.getByRole("cell").first()).toHaveText("#12");
  await expect(austin.getByRole("cell").nth(2)).toHaveText("62.5");
  await expect(austin.getByText("-$38,064/yr shortfall")).toBeVisible();
  await expect(austin.getByRole("cell").nth(3).getByRole("button")).toHaveText("6/10");

  await salary.fill("200000");
  await expect(rows.first()).toContainText("Austin");
  await expect(austin.getByRole("cell").nth(2)).toHaveText("82.5");
  await expect(austin.getByText("$213,936/yr savings")).toBeVisible();
  const grade = austin.getByRole("cell").nth(3).getByRole("button");
  await expect(grade).toHaveText("10/10");
  await grade.click();
  await expect(austin.getByText(/Original \$100,000 scenario, recorded November 2025/)).toBeVisible();
  await expect(austin.getByRole("link", { name: "www.numbeo.com" })).toHaveAttribute("href", /Austin/);
  await grade.click();

  await putTechFirst(page);
  const singapore = city(page, "Singapore");
  await expect(rows.first()).toContainText("Singapore");
  await expect(singapore.getByRole("cell").nth(2)).toHaveText("95.7");
  await expect(singapore.getByText("$139,260/yr savings")).toBeVisible();
  await expect(austin.getByText("$213,936/yr savings")).toBeVisible();
  await salary.fill("25000");
  await expect(rows.first()).toContainText("Singapore");
  await expect(singapore.getByText("-$70,740/yr shortfall")).toBeVisible();
  await expect(singapore.getByRole("cell").nth(3).getByRole("button")).toHaveText("2.9/10");
});

test("zero income compares shortfalls, and salary, priorities and hidden cities survive reload", async ({ page }) => {
  await page.goto("./");
  const salary = page.getByLabel("Annual salary (USD)");
  await salary.fill("83950");
  await expect(city(page, "Singapore").getByText("$0/yr savings")).toBeVisible();
  await salary.fill("0");
  await expect(page.getByText(/\/yr shortfall$/)).toHaveCount(17);
  const cheapest = city(page, "Da Nang");
  await expect(cheapest.getByText("-$22,980/yr shortfall")).toBeVisible();
  await expect(cheapest.getByRole("cell").nth(3).getByRole("button")).toHaveText("10/10");
  await expect(city(page, "Brooklyn (NYC)").getByText("-$131,808/yr shortfall")).toBeVisible();
  await putTechFirst(page);
  await cheapest.getByRole("button", { name: "Hide", exact: true }).click();
  await page.reload();
  await expect(salary).toHaveValue("0");
  await expect(page.locator("[draggable=true]").first()).toContainText("Tech VC");
  await expect(page.locator("tbody tr").first()).toContainText("Singapore");
  await expect(page.locator("tbody tr").last()).toContainText("Da Nang");
  await expect(cheapest.getByRole("button", { name: "Unhide" })).toBeVisible();
  await expect(city(page, "Austin").getByRole("cell").nth(3).getByRole("button")).toHaveText("5.8/10");
  await page.getByRole("button", { name: "Reset to Defaults" }).click();
  await expect(page.locator("tbody tr").first()).toContainText("Kuala Lumpur");
  await expect(salary).toHaveValue("0");
  await salary.fill("-1000");
  await expect(salary).toHaveValue("0");
  await salary.fill("");
  await page.reload();
  await expect(salary).toHaveValue("0");
});

test("malformed saved preferences fall back to the original scenario", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("cityPickerSalary", "NaN");
    localStorage.setItem("cityPickerCriteriaOrder", '["savings","savings"]');
    localStorage.setItem("cityPickerHiddenCities", "{");
  });
  await page.goto("./");
  await expect(page.getByLabel("Annual salary (USD)")).toHaveValue("100000");
  await expect(page.locator("[draggable=true]")).toHaveCount(8);
  await expect(page.locator("tbody tr").first()).toContainText("Shanghai");
  await expect(city(page, "Da Nang").getByText("$79,020/yr savings")).toBeVisible();
});
