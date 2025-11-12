const { test, expect } = require("@playwright/test");
const { HomePage } = require("../pages/HomePage");

test.describe("Search Query Filter Tests", () => {
  let homePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigate();
  });

  test("should search for dresses with query filter", async ({ page }) => {
    const searchQuery = "evening gown";

    await homePage.searchWithFilters({ query: searchQuery });

    await homePage.waitForSearchResults();

    await expect(page).toHaveURL(/.*\/search/);

    await expect(page).toHaveURL(/.*q=evening\+gown/);

    const searchInput = page.locator('input[name="q"]');
    await expect(searchInput).toHaveValue(searchQuery);
  });

  test("should search with empty query and show all results", async ({
    page,
  }) => {
    await homePage.submitSearch();

    await homePage.waitForSearchResults();

    await expect(page).toHaveURL(/.*\/search/);

    const searchInput = page.locator('input[name="q"]');
    await expect(searchInput).toHaveValue("");

    const catalogItems = page.locator('[class*="grid"] > div').first();
    await expect(catalogItems).toBeVisible();
  });

  test("should clear search query when navigating back to home", async ({
    page,
  }) => {
    await homePage.searchWithFilters({ query: "cocktail dress" });
    await homePage.waitForSearchResults();

    await page.goto("/");

    const searchInputValue = await homePage.getSearchInputValue();
    expect(searchInputValue).toBe("");
  });
});
