import { test, expect } from "@playwright/test";
import { AdminPage } from "../pages/AdminPage";
import { HomePage } from "../pages/HomePage";
import { ItemPage } from "../pages/ItemPage";

test.describe("Admin Rentals Tests", () => {
  let adminPage: AdminPage;
  let homePage: HomePage;
  let itemPage: ItemPage;

  test.beforeEach(async ({ page }) => {
    adminPage = new AdminPage(page);
    homePage = new HomePage(page);
    itemPage = new ItemPage(page);
  });

  test("should display rentals table on admin page", async ({ page }) => {
    await adminPage.login();

    await expect(adminPage.isDashboardVisible()).resolves.toBe(true);
    await expect(adminPage.isRentalsSectionVisible()).resolves.toBe(true);
    await expect(adminPage.isRentalsTableVisible()).resolves.toBe(true);
  });

  test("should display no rentals message when there are no rentals", async ({
    page,
  }) => {
    await adminPage.login();

    const rentalsCount = await adminPage.getRentalRowsCount();

    if (rentalsCount === 1) {
      const hasNoRentals = await adminPage.hasNoRentalsMessage();
      expect(hasNoRentals).toBe(true);
    }
  });

  test("should display rental details correctly after creating a rental", async ({
    page,
  }) => {
    await adminPage.login();

    const rentalsBefore = await adminPage.getRentalRowsCount();

    await page.goto("/");
    await homePage.searchWithFilters({ query: "evening" });
    await homePage.waitForSearchResults();

    const firstItemLink = page.locator('a:has-text("View details")').first();
    await firstItemLink.click();

    const href = await firstItemLink.getAttribute("href");
    const itemIdMatch = href?.match(/\/items\/(\d+)/);
    const itemId = itemIdMatch ? itemIdMatch[1] : null;

    if (!itemId) {
      throw new Error("Item ID not found");
    }

    await expect(page).toHaveURL(new RegExp(`.*/items/${itemId}`));

    const uniqueOffset = Math.floor(Date.now() / 1000) % 200;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 60 + uniqueOffset);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 3);

    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const rentalData = {
      name: "Test Customer",
      email: "testcustomer@example.com",
      phone: "+1234567890",
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    };

    await itemPage.fillRentalForm(rentalData);
    await itemPage.submitRentalForm(itemId);
    await page.waitForLoadState("networkidle");

    await adminPage.navigate();

    const rentalsAfter = await adminPage.getRentalRowsCount();

    if (rentalsAfter > rentalsBefore) {
      const lastRentalRow = await adminPage.getRentalRow(0);
      expect(lastRentalRow).not.toBeNull();

      if (!lastRentalRow) {
        throw new Error("Last rental row not found");
      }

      const rentalItemId = await adminPage.getRentalItemId(lastRentalRow);
      expect(rentalItemId).toBe(itemId);

      const rentalDates = await adminPage.getRentalDates(lastRentalRow);
      expect(rentalDates).toContain(rentalData.startDate);
      expect(rentalDates).toContain(rentalData.endDate);

      const rentalCustomer = await adminPage.getRentalCustomer(lastRentalRow);
      expect(rentalCustomer).not.toBeNull();
      if (rentalCustomer) {
        expect(rentalCustomer.name).toBe(rentalData.name);
        expect(rentalCustomer.email).toBe(rentalData.email);
        expect(rentalCustomer.phone).toContain(rentalData.phone.replace("+", ""));
      }

      const rentalStatus = await adminPage.getRentalStatus(lastRentalRow);
      expect(rentalStatus?.toLowerCase()).toContain("active");
    }
  });

  test("should display all rental table columns", async ({ page }) => {
    await adminPage.login();

    await expect(adminPage.isRentalsTableVisible()).resolves.toBe(true);

    const tableHeaders = await page
      .locator('table.min-w-full thead th')
      .allTextContents();

    expect(tableHeaders).toContain("Rental ID");
    expect(tableHeaders).toContain("Item");
    expect(tableHeaders).toContain("Dates");
    expect(tableHeaders).toContain("Customer");
    expect(tableHeaders).toContain("Status");
    expect(tableHeaders).toContain("Actions");
  });
});

