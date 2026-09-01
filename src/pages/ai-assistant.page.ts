import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { Region, Role, QueryApiResponse } from '../index';

export interface VisibleDocItem {
  docId: string;
  title: string;
  state: string;
}

export interface AskQuestionWithApiResponseResult {
  ui: {
    answer: string;
    citations: string[];
  };
  api: {
    status: number;
    body: QueryApiResponse & { [key: string]: unknown };
  };
}

export class AiAssistantPage extends BasePage {
  readonly headerTitle: Locator;
  readonly regionSelect: Locator;
  readonly roleSelect: Locator;
  readonly questionInput: Locator;
  readonly askButton: Locator;
  readonly answerContainer: Locator;
  readonly citationChips: Locator;
  readonly docsPanelHeading: Locator;
  readonly docsContainer: Locator;
  readonly docItems: Locator;

  constructor(page: Page) {
    super(page);
    this.headerTitle = page.locator('header h1');
    this.regionSelect = page.locator('[data-testid="region"]');
    this.roleSelect = page.locator('[data-testid="role"]');
    this.questionInput = page.locator('[data-testid="question"]');
    this.askButton = page.locator('[data-testid="ask"]');
    this.answerContainer = page.locator('[data-testid="answer"]');
    this.citationChips = page.locator('[data-testid="citation"]');
    this.docsPanelHeading = page.locator('aside.card.panel h2');
    this.docsContainer = page.locator('[data-testid="docs"]');
    this.docItems = page.locator('[data-testid="doc"]');
  }

  async open(): Promise<void> {
    await this.goto('/');
    await this.waitForNetworkIdle();
    await this.regionSelect.waitFor({ state: 'visible' });
    await this.roleSelect.waitFor({ state: 'visible' });
    // Wait for at least one doc or the empty text container to render
    await this.docItems.first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => null);
  }

  /**
   * Selects the region from the region dropdown and waits for the documents panel to refresh.
   */
  async selectRegion(region: Region | string): Promise<void> {
    await this.waitForNetworkIdle();
    await this.regionSelect.selectOption(region);
    await this.page.waitForTimeout(300);
  }

  /**
   * Selects the role from the role dropdown and waits for the documents panel to refresh.
   */
  async selectRole(role: Role | string): Promise<void> {
    await this.waitForNetworkIdle();
    await this.roleSelect.selectOption(role);
    await this.page.waitForTimeout(300);
  }

  /**
   * Sets both region and role context for the user session.
   */
  async setUserContext(region: Region | string, role: Role | string): Promise<void> {
    const currentRegion = await this.getSelectedRegion();
    const currentRole = await this.getSelectedRole();

    if (currentRegion !== region) {
      await this.selectRegion(region);
    }
    if (currentRole !== role) {
      await this.selectRole(role);
    }
  }

  /**
   * Returns current selected value in the region dropdown.
   */
  async getSelectedRegion(): Promise<string> {
    return await this.regionSelect.inputValue();
  }

  /**
   * Returns current selected value in the role dropdown.
   */
  async getSelectedRole(): Promise<string> {
    return await this.roleSelect.inputValue();
  }

  /**
   * Enters question text into the question input field.
   */
  async enterQuestion(question: string): Promise<void> {
    await this.questionInput.fill(question);
  }

  /**
   * Clicks the Ask button to submit the query.
   */
  async clickAsk(): Promise<void> {
    await this.askButton.click();
  }

  /**
   * Submits the query by pressing Enter inside the question input.
   */
  async submitWithEnter(): Promise<void> {
    await this.questionInput.press('Enter');
  }

  /**
   * Complete workflow to ask a question via clicking Ask.
   */
  async askQuestion(question: string): Promise<string> {
    await this.enterQuestion(question);
    await this.clickAsk();
    await this.waitForNetworkIdle();
    return await this.waitForAnswer();
  }

  /**
   * Submits a question and intercepts the background POST /query response,
   * returning both the rendered UI state and the parsed API payload together.
   */
  async askQuestionAndCaptureApiResponse(
    question: string
  ): Promise<AskQuestionWithApiResponseResult> {
    await this.enterQuestion(question);

    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes('/query') && resp.request().method() === 'POST',
      { timeout: 10000 }
    );

    await this.clickAsk();
    const response = await responsePromise;
    const apiBody = (await response.json()) as QueryApiResponse & { [key: string]: unknown };

    const answer = await this.waitForAnswer();
    const citations = await this.getCitations();

    return {
      ui: { answer, citations },
      api: { status: response.status(), body: apiBody },
    };
  }

  /**
   * Checks whether the answer element is currently showing the Thinking... placeholder.
   */
  async isThinking(): Promise<boolean> {
    const text = await this.answerContainer.textContent();
    return text?.trim() === 'Thinking...';
  }

  /**
   * Waits for the query answer to complete (transition out of placeholder state).
   */
  async waitForAnswer(timeout = 10000): Promise<string> {
    await this.page.waitForFunction(
      () => {
        const el = document.querySelector('[data-testid="answer"]');
        if (!el) return false;
        const text = el.textContent?.trim() || '';
        return text.length > 0 && text !== 'Thinking...' && !el.classList.contains('placeholder');
      },
      { timeout }
    );
    return (await this.answerContainer.textContent())?.trim() || '';
  }

  /**
   * Retrieves all citation chip texts currently displayed under the answer.
   */
  async getCitations(): Promise<string[]> {
    const count = await this.citationChips.count();
    const citations: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await this.citationChips.nth(i).textContent();
      if (text) citations.push(text.trim());
    }
    return citations;
  }

  /**
   * Retrieves the structured list of all visible documents displayed in the side panel.
   */
  async getVisibleDocs(): Promise<VisibleDocItem[]> {
    const count = await this.docItems.count();
    const docs: VisibleDocItem[] = [];

    for (let i = 0; i < count; i++) {
      const item = this.docItems.nth(i);
      const docIdAttr = await item.getAttribute('data-doc-id');
      const text = (await item.textContent()) || '';

      if (docIdAttr) {
        const titleDiv = item.locator('div').first();
        const title = (await titleDiv.textContent())?.trim() || '';
        const stateSpan = item.locator('span.state');
        const state = (await stateSpan.textContent())?.trim() || '';

        docs.push({
          docId: docIdAttr,
          title,
          state,
        });
      } else if (text.includes('No documents.')) {
        return [];
      }
    }

    return docs;
  }

  /**
   * Retrieves all document IDs currently visible in the documents panel.
   */
  async getVisibleDocIds(): Promise<string[]> {
    const docs = await this.getVisibleDocs();
    return docs.map((d) => d.docId);
  }
}
