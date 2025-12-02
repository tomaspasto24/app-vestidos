import { Page, Locator } from "@playwright/test";

interface SearchFilters {
  query?: string;
  startDate?: string;
  endDate?: string;
  size?: string;
}

class HomePage {
  private page: Page;
  
  private searchForm: string;
  private searchInput: string;
  private startDateInput: string;
  private endDateInput: string;
  private sizeSelect: string;
  private searchButton: string;
  
  private pageTitle: string;
  private featuredSection: string;

  constructor(page: Page) {
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

  async navigate(): Promise<void> {
    await this.page.goto('/');
  }

  async fillSearchQuery(query: string): Promise<void> {
    await this.page.fill(this.searchInput, query);
  }

  async selectStartDate(date: string): Promise<void> {
    await this.page.fill(this.startDateInput, date);
  }

  async selectEndDate(date: string): Promise<void> {
    await this.page.fill(this.endDateInput, date);
  }

  async selectSize(size: string): Promise<void> {
    await this.page.selectOption(this.sizeSelect, size);
  }

  async submitSearch(): Promise<void> {
    await this.page.click(this.searchButton);
  }

  async searchWithFilters({ query = '', startDate = '', endDate = '', size = '' }: SearchFilters): Promise<void> {
    if (query) await this.fillSearchQuery(query);
    if (startDate) await this.selectStartDate(startDate);
    if (endDate) await this.selectEndDate(endDate);
    if (size) await this.selectSize(size);
    await this.submitSearch();
  }

  async getSearchInputValue(): Promise<string> {
    return await this.page.inputValue(this.searchInput);
  }

  async getStartDateValue(): Promise<string> {
    return await this.page.inputValue(this.startDateInput);
  }

  async getEndDateValue(): Promise<string> {
    return await this.page.inputValue(this.endDateInput);
  }

  async getSelectedSize(): Promise<string> {
    return await this.page.inputValue(this.sizeSelect);
  }

  async isSearchFormVisible(): Promise<boolean> {
    return await this.page.isVisible(this.searchForm);
  }

  async waitForSearchResults(): Promise<void> {
    await this.page.waitForURL('**/search**');
  }
}

export { HomePage };

