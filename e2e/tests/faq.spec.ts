import { test, expect } from "@playwright/test";
import { FAQPage } from "../pages/FAQPage";

test.describe("FAQ Page Tests", () => {
  let faqPage: FAQPage;

  test.beforeEach(async ({ page }) => {
    faqPage = new FAQPage(page);
  });

  test("should display FAQ page correctly", async ({ page }) => {
    await faqPage.navigate();

    await expect(page).toHaveURL(/.*\/faq/);

    await expect(faqPage.isTitleVisible()).resolves.toBe(true);

    const titleText = await faqPage.getTitleText();
    expect(titleText).toBe("Preguntas Frecuentes");

    await expect(faqPage.isFAQContainerVisible()).resolves.toBe(true);
  });

  test("should display all FAQ questions and answers", async ({ page }) => {
    await faqPage.navigate();

    const expectedQuestions = [
      "¿Cómo funciona el alquiler?",
      "¿Incluye limpieza?",
      "¿Cuánto tiempo puedo alquilar?",
      "¿Necesito crear una cuenta?",
    ];

    const expectedAnswers = [
      "Elige tu prenda, selecciona las fechas y envía la solicitud. Te confirmaremos por correo la disponibilidad y los siguientes pasos.",
      "Sí, la limpieza está incluida en todos los alquileres.",
      "Entre 2 y 7 días. Si necesitas más tiempo, contáctanos.",
      "No. Solo completa el formulario con tus datos y fechas.",
    ];

    for (const question of expectedQuestions) {
      const isVisible = await faqPage.getFAQQuestion(question);
      expect(isVisible).toBe(true);
    }

    const allQuestions = await faqPage.getAllFAQQuestions();
    expect(allQuestions.length).toBe(expectedQuestions.length);

    for (let i = 0; i < expectedQuestions.length; i++) {
      const question = expectedQuestions[i];
      const answer = await faqPage.getFAQAnswer(question);
      expect(answer).toBeTruthy();
      expect(answer?.trim().length).toBeGreaterThan(0);
      expect(answer?.trim()).toBe(expectedAnswers[i]);
    }
  });

  test("should have correct FAQ content structure", async ({ page }) => {
    await faqPage.navigate();

    const allQuestions = await faqPage.getAllFAQQuestions();
    expect(allQuestions.length).toBe(4);

    const allAnswers = await faqPage.getAllFAQAnswers();
    expect(allAnswers.length).toBeGreaterThanOrEqual(4);

    for (const question of allQuestions) {
      expect(question.trim().length).toBeGreaterThan(0);
    }

    for (const answer of allAnswers) {
      expect(answer.trim().length).toBeGreaterThan(0);
    }
  });
});

