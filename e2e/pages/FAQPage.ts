import { Page } from "@playwright/test";

class FAQPage {
  private page: Page;

  private pageTitle: string;
  private faqContainer: string;

  constructor(page: Page) {
    this.page = page;

    this.pageTitle = 'h1:has-text("Preguntas Frecuentes")';
    this.faqContainer = 'div.max-w-3xl';
  }

  async navigate(): Promise<void> {
    await this.page.goto("/faq");
  }

  async isTitleVisible(): Promise<boolean> {
    return await this.page.isVisible(this.pageTitle);
  }

  async getTitleText(): Promise<string | null> {
    return await this.page.textContent(this.pageTitle);
  }

  async isFAQContainerVisible(): Promise<boolean> {
    return await this.page.isVisible(this.faqContainer);
  }

  async getFAQQuestion(questionText: string): Promise<boolean> {
    const questionLocator = this.page.locator(`h2:has-text("${questionText}")`);
    return await questionLocator.isVisible();
  }

  async getFAQAnswer(questionText: string): Promise<string | null> {
    const questionLocator = this.page.locator(`h2:has-text("${questionText}")`);
    const parentDiv = questionLocator.locator("..");
    const answerLocator = parentDiv.locator("p.mt-2").first();
    return await answerLocator.textContent();
  }

  async getAllFAQQuestions(): Promise<string[]> {
    const questions = await this.page.locator("h2.font-semibold").allTextContents();
    return questions;
  }

  async getAllFAQAnswers(): Promise<string[]> {
    const answers = await this.page.locator("p.mt-2").allTextContents();
    return answers;
  }
}

export { FAQPage };

