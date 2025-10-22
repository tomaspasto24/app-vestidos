class HomePage {
  constructor(page) {
    this.page = page;
    
    this.searchForm = 'form[action="/search"]';
    this.searchInput = '#query';
    this.startDateInput = '#start';
    this.endDateInput = '#end';
    this.sizeSelect = '#size';
    this.searchButton = 'button[type="submit"]';
    
    this.pageTitle = 'h1';
    this.featuredSection = '#featured';
  }

  async navigate() {
    await this.page.goto('/');
  }

  async fillSearchQuery(query) {
    await this.page.fill(this.searchInput, query);
  }

  async selectStartDate(date) {
    await this.page.fill(this.startDateInput, date);
  }

  async selectEndDate(date) {
    await this.page.fill(this.endDateInput, date);
  }

  async selectSize(size) {
    await this.page.selectOption(this.sizeSelect, size);
  }

  async submitSearch() {
    await this.page.click(this.searchButton);
  }

  async searchWithFilters({ query = '', startDate = '', endDate = '', size = '' }) {
    if (query) await this.fillSearchQuery(query);
    if (startDate) await this.selectStartDate(startDate);
    if (endDate) await this.selectEndDate(endDate);
    if (size) await this.selectSize(size);
    await this.submitSearch();
  }

  async getSearchInputValue() {
    return await this.page.inputValue(this.searchInput);
  }

  async getStartDateValue() {
    return await this.page.inputValue(this.startDateInput);
  }

  async getEndDateValue() {
    return await this.page.inputValue(this.endDateInput);
  }

  async getSelectedSize() {
    return await this.page.inputValue(this.sizeSelect);
  }

  async isSearchFormVisible() {
    return await this.page.isVisible(this.searchForm);
  }

  async waitForSearchResults() {
    await this.page.waitForURL('**/search**');
  }
}

module.exports = { HomePage };
