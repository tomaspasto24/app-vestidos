class AdminPage {
  constructor(page) {
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

  async navigate() {
    await this.page.goto("/admin");
  }

  async navigateToLogin() {
    await this.page.goto("/admin/login");
  }

  async login(username = "admin", password = "admin123") {
    await this.navigateToLogin();
    await this.page.fill(this.usernameInput, username);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.loginButton);
    await this.page.waitForURL("**/admin");
  }

  async isDashboardVisible() {
    return await this.page.isVisible(this.dashboardTitle);
  }

  async isRentalsSectionVisible() {
    return await this.page.isVisible(this.rentalsSection);
  }

  async isRentalsTableVisible() {
    return await this.page.isVisible(this.rentalsTable);
  }

  async getRentalRowsCount() {
    return await this.page.locator(this.rentalRows).count();
  }

  async getRentalRow(index) {
    const rows = await this.page.locator(this.rentalRows).all();
    if (index >= 0 && index < rows.length) {
      return rows[index];
    }
    return null;
  }

  async getRentalId(row) {
    const cells = await row.locator("td").all();
    return cells.length > 0 ? await cells[0].textContent() : null;
  }

  async getRentalItemId(row) {
    const cells = await row.locator("td").all();
    return cells.length > 1 ? await cells[1].textContent() : null;
  }

  async getRentalDates(row) {
    const cells = await row.locator("td").all();
    return cells.length > 2 ? await cells[2].textContent() : null;
  }

  async getRentalCustomer(row) {
    const cells = await row.locator("td").all();
    if (cells.length > 3) {
      const customerCell = cells[3];
      const cellText = await customerCell.textContent();
      
      // Extract name (first line, before email)
      const lines = cellText.split("\n").map((line) => line.trim()).filter((line) => line);
      const name = lines[0] || "";
      
      // Extract email (contains @)
      const emailMatch = cellText.match(/[\w.-]+@[\w.-]+\.\w+/);
      const email = emailMatch ? emailMatch[0] : "";
      
      // Extract phone (contains + or digits)
      const phoneMatch = cellText.match(/\+?[\d\s-]+/);
      const phone = phoneMatch ? phoneMatch[0].trim() : "";
      
      return { name, email, phone };
    }
    return null;
  }

  async getRentalStatus(row) {
    const cells = await row.locator("td").all();
    return cells.length > 4 ? await cells[4].textContent() : null;
  }

  async hasNoRentalsMessage() {
    return await this.page.isVisible(this.noRentalsMessage);
  }

  async logout() {
    await this.page.click(this.logoutButton);
    await this.page.waitForURL("**/admin/login");
  }
}

module.exports = { AdminPage };

