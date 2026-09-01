import { test, expect } from '@playwright/test';
import { AiAssistantPage } from '../../pages';
import { attachUiComparison } from '../../index';
import {
  uiLayoutData,
  uiQuerySubmissionCases,
  uiRefusalCases,
  uiRoleQueryCases,
  uiApiParityCase,
} from '../../index';

test.describe('AI Assistant UI - Query & Citations Test Suite', () => {
  let assistantPage: AiAssistantPage;

  test.beforeEach(async ({ page }) => {
    assistantPage = new AiAssistantPage(page);
    await assistantPage.open();
  });

  test('should render initial UI elements and default layout correctly', async () => {
    await expect(assistantPage.headerTitle).toHaveText(uiLayoutData.headerTitle);
    await expect(assistantPage.regionSelect).toBeVisible();
    await expect(assistantPage.roleSelect).toBeVisible();
    await expect(assistantPage.questionInput).toBeVisible();
    await expect(assistantPage.questionInput).toHaveAttribute(
      'placeholder',
      uiLayoutData.questionPlaceholder
    );
    await expect(assistantPage.askButton).toBeVisible();
    await expect(assistantPage.docsPanelHeading).toHaveText(uiLayoutData.docsPanelHeading);
    await expect(assistantPage.docsContainer).toBeVisible();
  });

  test.describe('Query Submission & Execution Modes', () => {
    for (const tc of uiQuerySubmissionCases) {
      test(`[${tc.id}] ${tc.title}`, async () => {
        if (tc.region && tc.role) {
          await assistantPage.setUserContext(tc.region, tc.role);
        }
        await assistantPage.enterQuestion(tc.question);

        if (tc.submitMethod === 'enter') {
          await assistantPage.submitWithEnter();
        } else {
          await assistantPage.clickAsk();
        }

        if (tc.expected.isThinking !== undefined) {
          const isThinking = await assistantPage.isThinking();
          await attachUiComparison(tc.title, {
            question: tc.question,
            expected: { isThinking: tc.expected.isThinking },
            actual: { isThinking },
          });
          expect(isThinking).toBe(tc.expected.isThinking);
          return;
        }

        const answer = await assistantPage.waitForAnswer();
        const citations = await assistantPage.getCitations();

        await attachUiComparison(tc.title, {
          userContext: tc.region && tc.role ? { region: tc.region, role: tc.role } : undefined,
          question: tc.question,
          expected: tc.expected,
          actual: {
            answer,
            citations,
          },
        });

        expect(answer.length).toBeGreaterThan(0);
        expect(answer).not.toBe('Thinking...');

        if (tc.expected.keywords) {
          for (const keyword of tc.expected.keywords) {
            expect(answer.toLowerCase()).toContain(keyword.toLowerCase());
          }
        }

        if (tc.expected.citations) {
          for (const citation of tc.expected.citations) {
            expect(citations).toContain(citation);
          }
        }

        if (tc.expected.minCitationsCount !== undefined) {
          expect(citations.length).toBeGreaterThanOrEqual(tc.expected.minCitationsCount);
        }
      });
    }
  });

  test.describe('Graceful Refusal & RBAC Restrictions in UI', () => {
    for (const tc of uiRefusalCases) {
      test(`[${tc.id}] ${tc.title}`, async () => {
        await assistantPage.setUserContext(tc.region, tc.role);
        await assistantPage.askQuestion(tc.question);

        const answer = await assistantPage.waitForAnswer();
        const citations = await assistantPage.getCitations();

        await attachUiComparison(tc.title, {
          userContext: { region: tc.region, role: tc.role },
          question: tc.question,
          expected: tc.expected,
          actual: {
            answer,
            citations,
          },
        });

        expect(answer.toLowerCase()).toContain(tc.expected.refusalMessageSubstring.toLowerCase());
        if (tc.expected.forbiddenCitations) {
          for (const forbidden of tc.expected.forbiddenCitations) {
            expect(citations).not.toContain(forbidden);
          }
        }
        expect(citations).toHaveLength(tc.expected.citationsCount);
      });
    }
  });

  test.describe('Authorized Role-Based Policy Queries in UI', () => {
    for (const tc of uiRoleQueryCases) {
      test(`[${tc.id}] ${tc.title}`, async () => {
        await assistantPage.setUserContext(tc.region, tc.role);
        await assistantPage.askQuestion(tc.question);

        const answer = await assistantPage.waitForAnswer();
        const citations = await assistantPage.getCitations();

        await attachUiComparison(tc.title, {
          userContext: { region: tc.region, role: tc.role },
          question: tc.question,
          expected: tc.expected,
          actual: {
            answer,
            citations,
          },
        });

        for (const kw of tc.expected.keywords) {
          expect(answer.toLowerCase()).toContain(kw.toLowerCase());
        }
        for (const citation of tc.expected.citations) {
          expect(citations).toContain(citation);
        }
      });
    }
  });

  test.describe('UI vs API Parity & Data Leakage Prevention', () => {
    test(`[${uiApiParityCase.id}] ${uiApiParityCase.title}`, async () => {
      await assistantPage.setUserContext(uiApiParityCase.region, uiApiParityCase.role);
      const result = await assistantPage.askQuestionAndCaptureApiResponse(
        uiApiParityCase.question
      );

      await attachUiComparison('UI vs API Response Parity Verification', {
        userContext: { region: uiApiParityCase.region, role: uiApiParityCase.role },
        question: uiApiParityCase.question,
        expected: {
          status: uiApiParityCase.expected.status,
          keys: uiApiParityCase.expected.keys,
        },
        actual: {
          ui: result.ui,
          api: result.api,
        },
      });

      // 1. Verify API status
      expect(result.api.status).toBe(uiApiParityCase.expected.status);

      // 2. Verify UI faithfully matches API response
      expect(result.ui.answer).toBe(result.api.body.answer.trim());
      expect(result.ui.citations).toEqual(result.api.body.citations);

      // 3. Verify API payload schema contains standard contract properties
      for (const key of uiApiParityCase.expected.keys) {
        expect(result.api.body).toHaveProperty(key);
      }
      expect(Array.isArray(result.api.body.citations)).toBeTruthy();

      // 4. Verify payload does not contain leaked internal error or unmasked secrets
      const bodyJson = JSON.stringify(result.api.body);
      for (const forbidden of uiApiParityCase.expected.forbiddenBodyStrings) {
        expect(bodyJson).not.toContain(forbidden);
      }
    });
  });
});
