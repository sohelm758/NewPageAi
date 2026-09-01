import { test, expect } from '@playwright/test';
import { AiAssistantPage } from '../../pages';
import { attachUiComparison } from '../../index';
import {
  uiScopingMatrix,
  uiLifecycleExclusions,
  uiRegionalBoundaries,
  uiRbacBoundaries,
} from '../../index';

test.describe('AI Assistant UI - Documents Visible To You Panel Scoping', () => {
  let assistantPage: AiAssistantPage;

  test.beforeEach(async ({ page }) => {
    assistantPage = new AiAssistantPage(page);
    await assistantPage.open();
  });

  test.describe('Scoping Matrix (All 12 Region x Role Combinations)', () => {
    for (const matrixEntry of uiScopingMatrix) {
      test(`Region: ${matrixEntry.region} | Role: ${matrixEntry.role} -> should display ${matrixEntry.expectedCount} approved documents [${matrixEntry.expectedDocIds.join(', ')}]`, async () => {
        await assistantPage.setUserContext(matrixEntry.region, matrixEntry.role);

        // Retrieve visible document IDs and items from DOM
        const visibleDocIds = await assistantPage.getVisibleDocIds();
        const visibleDocs = await assistantPage.getVisibleDocs();

        await attachUiComparison('Documents Scoping Matrix Actual vs Expected', {
          userContext: { region: matrixEntry.region, role: matrixEntry.role },
          expected: {
            count: matrixEntry.expectedCount,
            docIds: matrixEntry.expectedDocIds,
            docs: matrixEntry.expectedDocs,
          },
          actual: {
            count: visibleDocIds.length,
            docIds: visibleDocIds,
            docs: visibleDocs,
          },
        });

        expect(visibleDocIds.length).toBe(matrixEntry.expectedCount);
        expect(visibleDocIds).toEqual(matrixEntry.expectedDocIds);

        // Verify document item contents
        for (let i = 0; i < matrixEntry.expectedDocs.length; i++) {
          const expectedDoc = matrixEntry.expectedDocs[i];
          const actualDoc = visibleDocs[i];

          expect(actualDoc.docId).toBe(expectedDoc.doc_id);
          expect(actualDoc.title).toBe(expectedDoc.title);
          expect(actualDoc.state).toBe(expectedDoc.state);
        }
      });
    }
  });

  test.describe('Lifecycle Enforcement in UI Scoping', () => {
    for (const { region, role } of uiLifecycleExclusions.contexts) {
      test(`[${region} - ${role}] must NEVER display Draft (D-009), In Review (D-003), or Retired (D-005) documents`, async () => {
        await assistantPage.setUserContext(region, role);
        const visibleDocIds = await assistantPage.getVisibleDocIds();

        await attachUiComparison('Lifecycle Exclusion Actual vs Expected', {
          userContext: { region, role },
          expected: {
            forbiddenDocIds: uiLifecycleExclusions.forbiddenDocIds,
          },
          actual: {
            visibleDocIds,
          },
        });

        for (const forbiddenDocId of uiLifecycleExclusions.forbiddenDocIds) {
          expect(visibleDocIds).not.toContain(forbiddenDocId);
        }
      });
    }
  });

  test.describe('Regional Scoping Boundaries in UI', () => {
    for (const tc of uiRegionalBoundaries) {
      test(`[${tc.id}] ${tc.title}`, async () => {
        await assistantPage.setUserContext(tc.region, tc.role);
        const docIds = await assistantPage.getVisibleDocIds();

        await attachUiComparison(`Regional Scoping Boundaries (${tc.region})`, {
          userContext: { region: tc.region, role: tc.role },
          expected: { contains: tc.expectedContains, notContains: tc.expectedNotContains },
          actual: { visibleDocIds: docIds },
        });

        for (const docId of tc.expectedContains) {
          expect(docIds).toContain(docId);
        }
        for (const docId of tc.expectedNotContains) {
          expect(docIds).not.toContain(docId);
        }
      });
    }
  });

  test.describe('Role-Based Access Control Scoping in UI', () => {
    for (const tc of uiRbacBoundaries) {
      test(`[${tc.id}] ${tc.title}`, async () => {
        await assistantPage.setUserContext(tc.region, tc.initialRole);
        let docIds = await assistantPage.getVisibleDocIds();
        expect(docIds).not.toContain(tc.targetDocId);

        await assistantPage.selectRole(tc.targetRole);
        docIds = await assistantPage.getVisibleDocIds();

        await attachUiComparison(`RBAC Scoping Boundaries (${tc.targetRole})`, {
          userContext: { region: tc.region, role: tc.targetRole },
          expected: { contains: [tc.targetDocId] },
          actual: { visibleDocIds: docIds },
        });

        expect(docIds).toContain(tc.targetDocId);
      });
    }
  });
});
