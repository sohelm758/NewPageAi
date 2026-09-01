import { Region, Role, QueryTestCase } from '../types';

export const API_ENDPOINTS = {
  QUERY: '/query',
  DOCUMENTS: '/documents',
  OPENAPI: '/openapi.json',
  DOCS: '/docs',
} as const;

export const API_HEADERS = {
  REGION: 'X-User-Region',
  ROLE: 'X-User-Role',
} as const;

export const CONTENT_TYPE_JSON = {
  'Content-Type': 'application/json',
} as const;

/**
 * Builds HTTP headers for API requests using standard header names.
 */
export function buildHeaders(
  region?: Region | string,
  role?: Role | string,
  extraHeaders?: Record<string, string>
): Record<string, string> {
  const headers: Record<string, string> = {
    ...CONTENT_TYPE_JSON,
  };

  if (region !== undefined) {
    headers[API_HEADERS.REGION] = region;
  }
  if (role !== undefined) {
    headers[API_HEADERS.ROLE] = role;
  }

  if (extraHeaders) {
    Object.assign(headers, extraHeaders);
  }

  return headers;
}

/**
 * Builds the request body for /query endpoint.
 */
export function buildRequestBody(question: string): { question: string } {
  return { question };
}


/**
 * Helper to resolve request payload and headers for any test case (both functional and contract test cases).
 */
export function getTestCaseRequest(tc: QueryTestCase): {
  headers: Record<string, string>;
  data?: Record<string, unknown>;
} {
  if (tc.request) {
    return {
      headers: {
        ...CONTENT_TYPE_JSON,
        ...(tc.request.headers as Record<string, string>),
      },
      data: tc.request.body as Record<string, unknown>,
    };
  }

  return {
    headers: buildHeaders(tc.region, tc.role),
    data: buildRequestBody(tc.question || ''),
  };
}
