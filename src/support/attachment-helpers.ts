import { test, TestInfo } from '@playwright/test';

export interface ComparisonDetails {
  expected: unknown;
  actual: unknown;
  [key: string]: unknown;
}

export interface ComparisonAttachmentOptions {
  contentType?: string;
  testInfo?: TestInfo;
}

/**
 * Attaches expected and actual details, along with optional metadata/inputs, to the Playwright test report.
 */
export async function attachComparison(
  title: string,
  details: ComparisonDetails | string,
  options?: ComparisonAttachmentOptions
): Promise<void> {
  const currentTestInfo = options?.testInfo ?? test.info();
  if (!currentTestInfo) {
    return;
  }

  const contentType = options?.contentType ?? 'application/json';
  const body =
    typeof details === 'string' ? details : JSON.stringify(details, null, 2);

  await currentTestInfo.attach(title, {
    body,
    contentType,
  });
}

/**
 * Attaches structured API test execution details (request, expected, actual) to the test report.
 */
export async function attachApiComparison(
  title: string,
  details: {
    request?: unknown;
    expected: unknown;
    actual: unknown;
    [key: string]: unknown;
  },
  testInfo?: TestInfo
): Promise<void> {
  await attachComparison(title, details, { testInfo, contentType: 'application/json' });
}

/**
 * Attaches structured UI test execution details (user context, expected, actual) to the test report.
 */
export async function attachUiComparison(
  title: string,
  details: {
    userContext?: unknown;
    expected: unknown;
    actual: unknown;
    [key: string]: unknown;
  },
  testInfo?: TestInfo
): Promise<void> {
  await attachComparison(title, details, { testInfo, contentType: 'application/json' });
}
