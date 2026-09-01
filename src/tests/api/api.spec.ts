import { test, expect } from '@playwright/test';
import {
  API_ENDPOINTS,
  buildHeaders,
  getTestCaseRequest,
  attachApiComparison,
  documentsMaster,
  lifecycleGovernanceCases,
  rbacAccessControlCases,
  regionalScopingCases,
  citationsGroundingCases,
  refusalOutOfScopeCases,
  adversarialGuardrailsCases,
  apiContractCases,
  QueryTestCase,
  QueryApiResponse,
  DocumentApiResponse,
} from '../../index';

test.describe('Knowledge Assistant API Test Suite', () => {
  test.describe('GET /documents - Master Document Inventory', () => {
    test('should return all master documents with required schema and state', async ({ request }) => {
      const headers = buildHeaders('Americas', 'Employee');
      const response = await request.get(API_ENDPOINTS.DOCUMENTS, {
        headers,
      });

      expect(response.status()).toBe(200);
      const docs: DocumentApiResponse[] = await response.json();

      await attachApiComparison('GET /documents Master Inventory Comparison', {
        request: { endpoint: API_ENDPOINTS.DOCUMENTS, headers },
        expected: {
          status: 200,
          totalCount: documentsMaster.documents.length,
          documents: documentsMaster.documents.map((d) => ({
            doc_id: d.doc_id,
            title: d.title,
            region: d.region,
            audience: d.audience,
            state: d.lifecycle_state,
          })),
        },
        actual: {
          status: response.status(),
          totalCount: docs.length,
          documents: docs,
        },
      });

      expect(Array.isArray(docs)).toBeTruthy();
      expect(docs.length).toBe(documentsMaster.documents.length);

      for (const expectedDoc of documentsMaster.documents) {
        const matchingDoc = docs.find((d) => d.doc_id === expectedDoc.doc_id);
        expect(matchingDoc, `Document ${expectedDoc.doc_id} should be present`).toBeDefined();
        if (matchingDoc) {
          expect(matchingDoc.title).toBe(expectedDoc.title);
          expect(matchingDoc.region).toBe(expectedDoc.region);
          expect(matchingDoc.audience).toBe(expectedDoc.audience);
          expect(matchingDoc.state).toBe(expectedDoc.lifecycle_state);
        }
      }
    });
  });

  test.describe('POST /query - Lifecycle Governance (Rule 2: Approved Only)', () => {
    for (const tc of lifecycleGovernanceCases) {
      test(`[${tc.id}] ${tc.title}`, async ({ request }) => {
        if (tc.relatedDefectId) {
          test.info().annotations.push({
            type: 'Defect Tracking',
            description: `Tracks Defect ID: ${tc.relatedDefectId} - ${tc.description}`,
          });
        }

        const { headers, data } = getTestCaseRequest(tc);
        const response = await request.post(API_ENDPOINTS.QUERY, {
          headers,
          data,
        });

        expect(response.status()).toBe(200);
        const body: QueryApiResponse = await response.json();

        await validateQueryResponse(body, tc, response.status(), { headers, data });
      });
    }
  });

  test.describe('POST /query - Role-Based Access Control (Rule 1: Role Scoping)', () => {
    for (const tc of rbacAccessControlCases) {
      test(`[${tc.id}] ${tc.title}`, async ({ request }) => {
        if (tc.relatedDefectId) {
          test.info().annotations.push({
            type: 'Defect Tracking',
            description: `Tracks Defect ID: ${tc.relatedDefectId} - ${tc.description}`,
          });
        }

        const { headers, data } = getTestCaseRequest(tc);
        const response = await request.post(API_ENDPOINTS.QUERY, {
          headers,
          data,
        });

        expect(response.status()).toBe(200);
        const body: QueryApiResponse = await response.json();

        await validateQueryResponse(body, tc, response.status(), { headers, data });
      });
    }
  });

  test.describe('POST /query - Regional Scoping (Rule 1: Region Scoping)', () => {
    for (const tc of regionalScopingCases) {
      test(`[${tc.id}] ${tc.title}`, async ({ request }) => {
        if (tc.relatedDefectId) {
          test.info().annotations.push({
            type: 'Defect Tracking',
            description: `Tracks Defect ID: ${tc.relatedDefectId} - ${tc.description}`,
          });
        }

        const { headers, data } = getTestCaseRequest(tc);
        const response = await request.post(API_ENDPOINTS.QUERY, {
          headers,
          data,
        });

        expect(response.status()).toBe(200);
        const body: QueryApiResponse = await response.json();

        await validateQueryResponse(body, tc, response.status(), { headers, data });
      });
    }
  });

  test.describe('POST /query - Citations & Grounding (Rule 3: Attribution)', () => {
    for (const tc of citationsGroundingCases) {
      test(`[${tc.id}] ${tc.title}`, async ({ request }) => {
        if (tc.relatedDefectId) {
          test.info().annotations.push({
            type: 'Defect Tracking',
            description: `Tracks Defect ID: ${tc.relatedDefectId} - ${tc.description}`,
          });
        }

        const { headers, data } = getTestCaseRequest(tc);
        const response = await request.post(API_ENDPOINTS.QUERY, {
          headers,
          data,
        });

        expect(response.status()).toBe(200);
        const body: QueryApiResponse = await response.json();

        await validateQueryResponse(body, tc, response.status(), { headers, data });
      });
    }
  });

  test.describe('POST /query - Graceful Refusal & Out-of-Scope (Rule 4)', () => {
    for (const tc of refusalOutOfScopeCases) {
      test(`[${tc.id}] ${tc.title}`, async ({ request }) => {
        if (tc.relatedDefectId) {
          test.info().annotations.push({
            type: 'Defect Tracking',
            description: `Tracks Defect ID: ${tc.relatedDefectId} - ${tc.description}`,
          });
        }

        const { headers, data } = getTestCaseRequest(tc);
        const response = await request.post(API_ENDPOINTS.QUERY, {
          headers,
          data,
        });

        expect(response.status()).toBe(200);
        const body: QueryApiResponse = await response.json();

        await validateQueryResponse(body, tc, response.status(), { headers, data });
      });
    }
  });

  test.describe('POST /query - Adversarial Guardrails & Security', () => {
    for (const tc of adversarialGuardrailsCases) {
      test(`[${tc.id}] ${tc.title}`, async ({ request }) => {
        if (tc.relatedDefectId) {
          test.info().annotations.push({
            type: 'Defect Tracking',
            description: `Tracks Defect ID: ${tc.relatedDefectId} - ${tc.description}`,
          });
        }

        const { headers, data } = getTestCaseRequest(tc);
        const response = await request.post(API_ENDPOINTS.QUERY, {
          headers,
          data,
        });

        expect(response.status()).toBe(200);
        const body: QueryApiResponse = await response.json();

        await validateQueryResponse(body, tc, response.status(), { headers, data });
      });
    }
  });

  test.describe('POST /query - API Contract & Error Handling', () => {
    for (const tc of apiContractCases) {
      test(`[${tc.id}] ${tc.title}`, async ({ request }) => {
        if (tc.relatedDefectId) {
          test.info().annotations.push({
            type: 'Defect Tracking',
            description: `Tracks Defect ID: ${tc.relatedDefectId} - ${tc.description}`,
          });
        }

        const { headers, data } = getTestCaseRequest(tc);
        const response = await request.post(API_ENDPOINTS.QUERY, {
          headers,
          data,
        });

        if (tc.expected.expectedStatus) {
          await attachApiComparison(`[${tc.id}] API Status Contract Details`, {
            request: { headers, data },
            expected: { status: tc.expected.expectedStatus },
            actual: { status: response.status() },
          });
          expect.soft(response.status()).toBe(tc.expected.expectedStatus);
        } else if (response.status() === 200) {
          const body: QueryApiResponse = await response.json();
          await validateQueryResponse(body, tc, response.status(), { headers, data });
        }
      });
    }
  });
});

/**
 * Validates API response against expected test case assertions and attaches comparison info.
 */
async function validateQueryResponse(
  body: QueryApiResponse,
  tc: QueryTestCase,
  status: number = 200,
  requestDetails?: { headers: Record<string, string>; data: unknown }
): Promise<void> {
  const { expected } = tc;

  await attachApiComparison(`[${tc.id}] Query Assertion Details`, {
    testCaseId: tc.id,
    testCaseTitle: tc.title,
    request: requestDetails,
    expected: {
      status: tc.expected.expectedStatus || 200,
      expectedCitations: expected.expectedCitations,
      forbiddenCitations: expected.forbiddenCitations,
      expectedKeywords: expected.expectedKeywords,
      forbiddenKeywords: expected.forbiddenKeywords,
      refusalMessageSubstring: expected.refusalMessageSubstring,
      shouldRefuse: expected.shouldRefuse,
    },
    actual: {
      status,
      citations: body.citations,
      answer: body.answer,
    },
  });

  // Validate citations
  if (expected.shouldRefuse) {
    if (expected.expectedCitations.length === 0) {
      expect.soft(body.citations).toEqual(expected.expectedCitations);
    }
  } else {
    for (const expectedCit of expected.expectedCitations) {
      expect.soft(body.citations).toContain(expectedCit);
    }
  }

  // Validate forbidden citations
  if (expected.forbiddenCitations) {
    for (const forbiddenCit of expected.forbiddenCitations) {
      expect.soft(body.citations).not.toContain(forbiddenCit);
    }
  }

  // Validate expected keywords
  if (expected.expectedKeywords) {
    for (const keyword of expected.expectedKeywords) {
      expect.soft(body.answer.toLowerCase()).toContain(keyword.toLowerCase());
    }
  }

  // Validate forbidden keywords
  if (expected.forbiddenKeywords) {
    for (const forbiddenKw of expected.forbiddenKeywords) {
      expect.soft(body.answer.toLowerCase()).not.toContain(forbiddenKw.toLowerCase());
    }
  }

  // Validate refusal substring
  if (expected.refusalMessageSubstring) {
    expect.soft(body.answer.toLowerCase()).toContain(expected.refusalMessageSubstring.toLowerCase());
  }
}
