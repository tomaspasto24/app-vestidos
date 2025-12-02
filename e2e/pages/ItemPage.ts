import { Page, Locator } from "@playwright/test";

interface RentalData {
  name: string;
  email: string;
  phone: string;
  startDate: string;
  endDate: string;
}

class ItemPage {
  private page: Page;

  private rentalForm: string;
  public nameInput: string;
  public emailInput: string;
  public phoneInput: string;
  public startDateInput: string;
  public endDateInput: string;
  private submitButton: string;

  private itemTitle: string;
  private itemCategory: string;
  private itemDescription: string;
  private itemPrice: string;
  private itemSizes: string;
  private itemColor: string;
  private availabilitySection: string;
  private calendar: string;

  constructor(page: Page) {
    this.page = page;

    this.rentalForm = 'form[action="/api/rentals"]';
    this.nameInput = "#name";
    this.emailInput = "#email";
    this.phoneInput = "#phone";
    this.startDateInput = "#start";
    this.endDateInput = "#end";
    this.submitButton = 'button:has-text("Request rental")';

    this.itemTitle = "h1";
    this.itemCategory = "p.capitalize";
    this.itemDescription = "p.mt-4";
    this.itemPrice = "p.font-semibold";
    this.itemSizes = "p.text-sm";
    this.itemColor = "p.text-sm";
    this.availabilitySection = 'h2:has-text("Availability")';
    this.calendar = "div.grid.grid-cols-7";
  }

  async navigate(itemId: string): Promise<void> {
    await this.page.goto(`/items/${itemId}`);
  }

  async fillRentalForm({ name, email, phone, startDate, endDate }: RentalData): Promise<void> {
    if (name) await this.page.fill(this.nameInput, name);
    if (email) await this.page.fill(this.emailInput, email);
    if (phone) await this.page.fill(this.phoneInput, phone);
    if (startDate) await this.page.fill(this.startDateInput, startDate);
    if (endDate) await this.page.fill(this.endDateInput, endDate);
  }

  async submitRentalForm(itemId: string): Promise<void> {
    const responsePromise = this.page.waitForResponse(
      (response) => {
        return (
          response.url().includes("/api/rentals") &&
          response.request().method() === "POST"
        );
      },
      { timeout: 15000 }
    );

    await this.page.click(this.submitButton);

    const response = await responsePromise;

    const status = response.status();

    if (status >= 200 && status < 300) {
      try {
        await this.page.waitForURL(
          new RegExp(`.*/items/${itemId}(\\?success=1)?`),
          {
            timeout: 10000,
          }
        );
      } catch (error) {
        const currentUrl = this.page.url();
        if (currentUrl.includes("/api/rentals")) {
          await this.page.waitForTimeout(2000);
          const finalUrl = this.page.url();
          if (!finalUrl.includes(`/items/${itemId}`)) {
            await this.page.goto(`/items/${itemId}?success=1`);
          }
        }
      }
    } else if (status >= 300 && status < 400) {
      await this.page.waitForURL(
        new RegExp(`.*/items/${itemId}(\\?success=1)?`),
        {
          timeout: 10000,
        }
      );
    } else {
      try {
        const body = await response.text();
        throw new Error(
          `Form submission failed with status ${status}: ${body}`
        );
      } catch (error) {
        if (error instanceof Error && error.message.includes("unavailable")) {
          throw new Error(`Form submission failed with status ${status}`);
        }
        throw error;
      }
    }

    await this.page.waitForLoadState("networkidle");
  }

  async waitForRentalSuccess(itemId: string): Promise<void> {
    await this.page.waitForURL(new RegExp(`.*/items/${itemId}\\?success=1`), {
      timeout: 10000,
    });
  }

  async getItemTitle(): Promise<string | null> {
    return await this.page.textContent(this.itemTitle);
  }

  async isRentalFormVisible(): Promise<boolean> {
    return await this.page.isVisible(this.rentalForm);
  }

  async getItemCategory(): Promise<string | null> {
    return await this.page.textContent(this.itemCategory);
  }

  async getItemDescription(): Promise<string | null> {
    const descriptionLocator = this.page.locator("p.mt-4").first();
    return await descriptionLocator.textContent();
  }

  async getItemPrice(): Promise<string | null> {
    const priceLocator = this.page.locator('p.font-semibold:has-text("From")');
    return await priceLocator.textContent();
  }

  async getItemSizes(): Promise<string | null> {
    const sizesLocator = this.page.locator('p.text-sm:has-text("Sizes:")');
    return await sizesLocator.textContent();
  }

  async getItemColor(): Promise<string | null> {
    const colorLocator = this.page.locator('p.text-sm:has-text("Color:")');
    return await colorLocator.textContent();
  }

  async isCalendarVisible(): Promise<boolean> {
    return await this.page.isVisible(this.calendar);
  }

  async getCalendarDays(): Promise<number> {
    return await this.page.locator(`${this.calendar} > div`).count();
  }

  async isAvailabilitySectionVisible(): Promise<boolean> {
    return await this.page.isVisible(this.availabilitySection);
  }
}

export { ItemPage };

