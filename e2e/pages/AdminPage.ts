import { Page, Locator } from "@playwright/test";

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

class AdminPage {
  private page: Page;

  private loginForm: string;
  private usernameInput: string;
  private passwordInput: string;
  private loginButton: string;

  private dashboardTitle: string;
  private rentalsSection: string;
  private rentalsTable: string;
  private rentalsTableBody: string;
  private rentalRows: string;
  private noRentalsMessage: string;

  private logoutButton: string;

  constructor(page: Page) {
    this.page = page;

    this.loginForm = 'form[action="/api/admin/login"]';
    this.usernameInput = 'input[name="username"]';
    this.passwordInput = 'input[name="password"]';
    this.loginButton = 'button:has-text("Sign in")';

    this.dashboardTitle = 'h1:has-text("Admin dashboard")';
    this.rentalsSection = 'h2:has-text("Scheduled rentals")';
    this.rentalsTable = 'table.min-w-full';
    this.rentalsTableBody = 'table.min-w-full tbody';
    this.rentalRows = 'table.min-w-full tbody tr';
    this.noRentalsMessage = 'td:has-text("No rentals yet.")';

    this.logoutButton = 'button:has-text("Sign out")';
  }

  async navigate(): Promise<void> {
    await this.page.goto("/admin");
  }

  async navigateToLogin(): Promise<void> {
    await this.page.goto("/admin/login");
  }

  async login(username: string = "admin", password: string = "admin123"): Promise<void> {
    await this.navigateToLogin();
    await this.page.fill(this.usernameInput, username);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.loginButton);
    await this.page.waitForURL("**/admin");
  }

  async isDashboardVisible(): Promise<boolean> {
    return await this.page.isVisible(this.dashboardTitle);
  }

  async isRentalsSectionVisible(): Promise<boolean> {
    return await this.page.isVisible(this.rentalsSection);
  }

  async isRentalsTableVisible(): Promise<boolean> {
    return await this.page.isVisible(this.rentalsTable);
  }

  async getRentalRowsCount(): Promise<number> {
    return await this.page.locator(this.rentalRows).count();
  }

  async getRentalRow(index: number): Promise<Locator | null> {
    const rows = await this.page.locator(this.rentalRows).all();
    if (index >= 0 && index < rows.length) {
      return rows[index];
    }
    return null;
  }

  async getRentalId(row: Locator): Promise<string | null> {
    const cells = await row.locator("td").all();
    return cells.length > 0 ? await cells[0].textContent() : null;
  }

  async getRentalItemId(row: Locator): Promise<string | null> {
    const cells = await row.locator("td").all();
    return cells.length > 1 ? await cells[1].textContent() : null;
  }

  async getRentalDates(row: Locator): Promise<string | null> {
    const cells = await row.locator("td").all();
    return cells.length > 2 ? await cells[2].textContent() : null;
  }

  async getRentalCustomer(row: Locator): Promise<CustomerInfo | null> {
    const cells = await row.locator("td").all();
    if (cells.length > 3) {
      const customerCell = cells[3];
      const cellText = await customerCell.textContent();
      
      const lines = cellText ? cellText.split("\n").map((line) => line.trim()).filter((line) => line) : [];
      const name = lines[0] || "";
      
      const emailMatch = cellText ? cellText.match(/[\w.-]+@[\w.-]+\.\w+/) : null;
      const email = emailMatch ? emailMatch[0] : "";
      
      const phoneMatch = cellText ? cellText.match(/\+?[\d\s-]+/) : null;
      const phone = phoneMatch ? phoneMatch[0].trim() : "";
      
      return { name, email, phone };
    }
    return null;
  }

  async getRentalStatus(row: Locator): Promise<string | null> {
    const cells = await row.locator("td").all();
    return cells.length > 4 ? await cells[4].textContent() : null;
  }

  async hasNoRentalsMessage(): Promise<boolean> {
    return await this.page.isVisible(this.noRentalsMessage);
  }

  async logout(): Promise<void> {
    await this.page.click(this.logoutButton);
    await this.page.waitForURL("**/admin/login");
  }

  async getEditRentalButton(rentalRow: Locator): Promise<Locator | null> {
    try {
      const editButton = rentalRow.locator('button:has-text("Edit"), a:has-text("Edit"), button[aria-label*="Edit"], button[aria-label*="edit"]');
      const isVisible = await editButton.isVisible({ timeout: 1000 }).catch(() => false);
      return isVisible ? editButton : null;
    } catch {
      return null;
    }
  }

  async isEditRentalButtonVisible(rentalRow: Locator): Promise<boolean> {
    const button = await this.getEditRentalButton(rentalRow);
    return button !== null;
  }

  async getCancelRentalButton(rentalRow: Locator): Promise<Locator | null> {
    try {
      const cancelButton = rentalRow.locator('button:has-text("Cancel"), form button');
      const isVisible = await cancelButton.isVisible({ timeout: 1000 }).catch(() => false);
      return isVisible ? cancelButton : null;
    } catch {
      return null;
    }
  }

  async isCancelRentalButtonVisible(rentalRow: Locator): Promise<boolean> {
    const button = await this.getCancelRentalButton(rentalRow);
    return button !== null;
  }

  async getAddItemButton(): Promise<Locator | null> {
    try {
      const addButton = this.page.locator('button:has-text("Add Item"), button:has-text("Add"), a:has-text("Add Item"), button[aria-label*="Add"], button[aria-label*="add"]');
      const isVisible = await addButton.isVisible({ timeout: 1000 }).catch(() => false);
      return isVisible ? addButton : null;
    } catch {
      return null;
    }
  }

  async isAddItemButtonVisible(): Promise<boolean> {
    const button = await this.getAddItemButton();
    return button !== null;
  }

  async getAddItemForm(): Promise<Locator | null> {
    try {
      const form = this.page.locator('form[action*="item"], form[action*="items"], form:has(input[name="name"]):has(input[name="category"])');
      const isVisible = await form.isVisible({ timeout: 1000 }).catch(() => false);
      return isVisible ? form : null;
    } catch {
      return null;
    }
  }

  async isAddItemFormVisible(): Promise<boolean> {
    const form = await this.getAddItemForm();
    return form !== null;
  }

  async getInventorySection(): Promise<Locator> {
    return this.page.locator('section:has(h2:has-text("Inventory"))');
  }

  async clickEditRentalButton(rentalRow: Locator): Promise<void> {
    const editButton = await this.getEditRentalButton(rentalRow);
    if (!editButton) {
      throw new Error("Edit rental button not found - functionality not implemented");
    }
    await editButton.click();
  }

  async getEditRentalForm(): Promise<Locator | null> {
    try {
      const form = this.page.locator('form[action*="rental"]:has(input[name="start"]), form[action*="rental"]:has(input[name="end"])');
      const isVisible = await form.isVisible({ timeout: 1000 }).catch(() => false);
      return isVisible ? form : null;
    } catch {
      return null;
    }
  }

  async fillEditRentalForm(data: { startDate?: string; endDate?: string; name?: string; email?: string; phone?: string }): Promise<void> {
    const form = await this.getEditRentalForm();
    if (!form) {
      throw new Error("Edit rental form not found");
    }
    if (data.startDate) await this.page.fill('input[name="start"], input[id="start"]', data.startDate);
    if (data.endDate) await this.page.fill('input[name="end"], input[id="end"]', data.endDate);
    if (data.name) await this.page.fill('input[name="name"], input[id="name"]', data.name);
    if (data.email) await this.page.fill('input[name="email"], input[id="email"]', data.email);
    if (data.phone) await this.page.fill('input[name="phone"], input[id="phone"]', data.phone);
  }

  async submitEditRentalForm(): Promise<void> {
    const submitButton = this.page.locator('form[action*="rental"] button[type="submit"], form[action*="rental"] button:has-text("Save"), form[action*="rental"] button:has-text("Update")');
    const isVisible = await submitButton.isVisible({ timeout: 1000 }).catch(() => false);
    if (!isVisible) {
      throw new Error("Edit rental submit button not found");
    }
    await submitButton.click();
  }

  async clickCancelRentalButton(rentalRow: Locator): Promise<void> {
    const cancelButton = await this.getCancelRentalButton(rentalRow);
    if (!cancelButton) {
      throw new Error("Cancel rental button not found");
    }
    await cancelButton.click();
  }

  async clickAddItemButton(): Promise<void> {
    const addButton = await this.getAddItemButton();
    if (!addButton) {
      throw new Error("Add item button not found");
    }
    await addButton.click();
  }

  async fillAddItemForm(data: { name: string; category: string; sizes?: string; pricePerDay?: string; color?: string; style?: string }): Promise<void> {
    const form = await this.getAddItemForm();
    if (!form) {
      throw new Error("Add item form not found");
    }
    await this.page.fill('input[name="name"], input[id="name"]', data.name);
    await this.page.fill('input[name="category"], input[id="category"], select[name="category"]', data.category);
    if (data.sizes) await this.page.fill('input[name="sizes"], input[id="sizes"]', data.sizes);
    if (data.pricePerDay) await this.page.fill('input[name="pricePerDay"], input[id="pricePerDay"], input[name="price"]', data.pricePerDay);
    if (data.color) await this.page.fill('input[name="color"], input[id="color"]', data.color);
    if (data.style) await this.page.fill('input[name="style"], input[id="style"]', data.style);
  }

  async submitAddItemForm(): Promise<void> {
    const submitButton = this.page.locator('form[action*="item"] button[type="submit"], form[action*="item"] button:has-text("Add"), form[action*="item"] button:has-text("Create")');
    const isVisible = await submitButton.isVisible({ timeout: 1000 }).catch(() => false);
    if (!isVisible) {
      throw new Error("Add item submit button not found - functionality not implemented");
    }
    await submitButton.click();
  }
}

export { AdminPage };

