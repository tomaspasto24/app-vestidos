const { test, expect } = require("@playwright/test");
const { HomePage } = require("../pages/HomePage");
const { ItemPage } = require("../pages/ItemPage");

test.describe("Search and Rental Tests", () => {
  let homePage;
  let itemPage;

  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    itemPage = new ItemPage(page);
    await homePage.navigate();
  });

  test("should search for a dress and schedule a rental", async ({ page }) => {
    const searchQuery = "evening gown";

    await homePage.searchWithFilters({ query: searchQuery });
    await homePage.waitForSearchResults();

    await expect(page).toHaveURL(/.*\/search/);
    await expect(page).toHaveURL(/.*q=evening\+gown/);

    const itemLinks = page.locator('a:has-text("View details")');
    const itemCount = await itemLinks.count();
    const itemLink =
      itemCount > 1 ? itemLinks.nth(itemCount - 1) : itemLinks.first();
    await expect(itemLink).toBeVisible();

    const href = await itemLink.getAttribute("href");
    const itemIdMatch = href.match(/\/items\/(\d+)/);
    const itemId = itemIdMatch ? itemIdMatch[1] : null;

    await itemLink.click();

    await expect(page).toHaveURL(new RegExp(`.*/items/${itemId}`));
    await expect(itemPage.isRentalFormVisible()).resolves.toBe(true);

    const uniqueOffset = Math.floor(Date.now() / 1000) % 200;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 60 + uniqueOffset);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 3);

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const rentalData = {
      name: "Test User",
      email: "test@example.com",
      phone: "+1234567890",
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    };

    await itemPage.fillRentalForm(rentalData);

    await expect(page.locator(itemPage.nameInput)).toHaveValue(rentalData.name);
    await expect(page.locator(itemPage.emailInput)).toHaveValue(
      rentalData.email
    );
    await expect(page.locator(itemPage.phoneInput)).toHaveValue(
      rentalData.phone
    );
    await expect(page.locator(itemPage.startDateInput)).toHaveValue(
      rentalData.startDate
    );
    await expect(page.locator(itemPage.endDateInput)).toHaveValue(
      rentalData.endDate
    );

    await itemPage.submitRentalForm(itemId);

    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(new RegExp(`.*/items/${itemId}\\?success=1`), {
      timeout: 10000,
    });
  });

  test("should search and navigate to item details from search results", async ({
    page,
  }) => {
    await homePage.searchWithFilters({ query: "cocktail" });
    await homePage.waitForSearchResults();

    const catalogItems = page.locator('[class*="grid"] > div');
    await expect(catalogItems.first()).toBeVisible();

    const firstItemLink = page.locator('a:has-text("View details")').first();
    await firstItemLink.click();

    await expect(page).toHaveURL(/.*\/items\/\d+/);

    await expect(itemPage.isRentalFormVisible()).resolves.toBe(true);

    const itemTitle = await itemPage.getItemTitle();
    expect(itemTitle).toBeTruthy();
    expect(itemTitle.length).toBeGreaterThan(0);
  });

  test("should display dress details on item detail page", async ({ page }) => {
    await homePage.searchWithFilters({ query: "evening" });
    await homePage.waitForSearchResults();

    const firstItemLink = page.locator('a:has-text("View details")').first();
    await expect(firstItemLink).toBeVisible();

    const href = await firstItemLink.getAttribute("href");
    const itemIdMatch = href.match(/\/items\/(\d+)/);
    const itemId = itemIdMatch ? itemIdMatch[1] : null;

    await firstItemLink.click();

    await expect(page).toHaveURL(new RegExp(`.*/items/${itemId}`));

    const itemTitle = await itemPage.getItemTitle();
    expect(itemTitle).toBeTruthy();
    expect(itemTitle.length).toBeGreaterThan(0);

    const itemCategory = await itemPage.getItemCategory();
    expect(itemCategory).toBeTruthy();
    expect(itemCategory.trim().length).toBeGreaterThan(0);

    const itemDescription = await itemPage.getItemDescription();
    expect(itemDescription).toBeTruthy();
    expect(itemDescription.trim().length).toBeGreaterThan(0);

    const itemPrice = await itemPage.getItemPrice();
    expect(itemPrice).toBeTruthy();
    expect(itemPrice).toContain("$");
    expect(itemPrice).toContain("/day");

    const itemSizes = await itemPage.getItemSizes();
    expect(itemSizes).toBeTruthy();
    expect(itemSizes).toContain("Sizes:");

    const itemColor = await itemPage.getItemColor();
    expect(itemColor).toBeTruthy();
    expect(itemColor).toContain("Color:");
  });

  test("should display calendar on item detail page", async ({ page }) => {
    await homePage.searchWithFilters({ query: "cocktail" });
    await homePage.waitForSearchResults();

    const firstItemLink = page.locator('a:has-text("View details")').first();
    await expect(firstItemLink).toBeVisible();

    await firstItemLink.click();

    await expect(page).toHaveURL(/.*\/items\/\d+/);

    await expect(itemPage.isAvailabilitySectionVisible()).resolves.toBe(true);

    await expect(itemPage.isCalendarVisible()).resolves.toBe(true);

    const calendarDaysCount = await itemPage.getCalendarDays();
    expect(calendarDaysCount).toBeGreaterThan(0);
    expect(calendarDaysCount).toBe(30);
  });
});
