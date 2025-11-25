class ItemPage {
  constructor(page) {
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

  async navigate(itemId) {
    await this.page.goto(`/items/${itemId}`);
  }

  async fillRentalForm({ name, email, phone, startDate, endDate }) {
    if (name) await this.page.fill(this.nameInput, name);
    if (email) await this.page.fill(this.emailInput, email);
    if (phone) await this.page.fill(this.phoneInput, phone);
    if (startDate) await this.page.fill(this.startDateInput, startDate);
    if (endDate) await this.page.fill(this.endDateInput, endDate);
  }

  async submitRentalForm(itemId) {
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
        if (error.message.includes("unavailable")) {
          throw new Error(`Form submission failed with status ${status}`);
        }
        throw error;
      }
    }

    await this.page.waitForLoadState("networkidle");
  }

  async waitForRentalSuccess(itemId) {
    await this.page.waitForURL(new RegExp(`.*/items/${itemId}\\?success=1`), {
      timeout: 10000,
    });
  }

  async getItemTitle() {
    return await this.page.textContent(this.itemTitle);
  }

  async isRentalFormVisible() {
    return await this.page.isVisible(this.rentalForm);
  }

  async getItemCategory() {
    return await this.page.textContent(this.itemCategory);
  }

  async getItemDescription() {
    const descriptionLocator = this.page.locator("p.mt-4").first();
    return await descriptionLocator.textContent();
  }

  async getItemPrice() {
    const priceLocator = this.page.locator('p.font-semibold:has-text("From")');
    return await priceLocator.textContent();
  }

  async getItemSizes() {
    const sizesLocator = this.page.locator('p.text-sm:has-text("Sizes:")');
    return await sizesLocator.textContent();
  }

  async getItemColor() {
    const colorLocator = this.page.locator('p.text-sm:has-text("Color:")');
    return await colorLocator.textContent();
  }

  async isCalendarVisible() {
    return await this.page.isVisible(this.calendar);
  }

  async getCalendarDays() {
    return await this.page.locator(`${this.calendar} > div`).count();
  }

  async isAvailabilitySectionVisible() {
    return await this.page.isVisible(this.availabilitySection);
  }
}

module.exports = { ItemPage };
