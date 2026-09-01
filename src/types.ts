export type Region = 'Americas' | 'EMEA' | 'APAC';
export type Role = 'Employee' | 'Engineering' | 'Finance' | 'Manager';
export type Audience = 'All Staff' | 'Engineering' | 'Finance' | 'Managers';
export type LifecycleState = 'Draft' | 'In Review' | 'Approved' | 'Retired';
export type Priority = 'P0' | 'P1' | 'P2' | 'P3';

export interface DocumentMeta {
  doc_id: string;
  title: string;
  region: Region | 'Global';
  audience: Audience;
  lifecycle_state: LifecycleState;
  supersedes?: string;
  last_updated: string;
  summary: string;
  body: string;
  key_facts: string[];
}

export interface ExpectedBehavior {
  shouldRefuse: boolean;
  expectedCitations: string[];
  expectedKeywords?: string[];
  forbiddenKeywords?: string[];
  forbiddenCitations?: string[];
  refusalMessageSubstring?: string;
  expectedStatus?: number;
}

export interface QueryTestCase {
  id: string;
  category: 'lifecycle' | 'rbac' | 'region' | 'grounding' | 'refusal' | 'adversarial' | 'contract';
  title: string;
  description: string;
  priority: Priority;
  region?: Region | string;
  role?: Role | string;
  question?: string;
  request?: {
    headers: {
      'X-User-Region'?: string;
      'X-User-Role'?: string;
      [key: string]: string | undefined;
    };
    body: {
      question?: string;
      [key: string]: unknown;
    };
  };
  expected: ExpectedBehavior;
  relatedDefectId?: string;
}

export interface UiScopingMatrixEntry {
  region: Region;
  role: Role;
  audience: Audience;
  expectedCount: number;
  expectedDocIds: string[];
  expectedDocs: Array<{
    doc_id: string;
    title: string;
    state: LifecycleState;
  }>;
}

export interface DocumentsMasterData {
  documents: DocumentMeta[];
  roleToAudienceMapping: Record<Role, Audience>;
  lifecycleRules: {
    allowedState: LifecycleState;
    prohibitedStates: LifecycleState[];
  };
  regionRules: {
    universalRegion: string;
    scopedRegions: Region[];
  };
}

export interface QueryApiResponse {
  answer: string;
  citations: string[];
}

export interface DocumentApiResponse {
  doc_id: string;
  title: string;
  region: string;
  audience: string;
  state: string;
}

export interface UiLifecycleExclusionData {
  forbiddenDocIds: string[];
  contexts: Array<{ region: Region; role: Role }>;
}

export interface UiRegionalBoundaryCase {
  id: string;
  region: Region;
  role: Role;
  title: string;
  expectedContains: string[];
  expectedNotContains: string[];
}

export interface UiRbacBoundaryCase {
  id: string;
  region: Region;
  initialRole: Role;
  targetRole: Role;
  targetDocId: string;
  title: string;
}

export interface UiLayoutData {
  headerTitle: string;
  questionPlaceholder: string;
  docsPanelHeading: string;
}

export interface UiQuerySubmissionCase {
  id: string;
  title: string;
  region?: Region;
  role?: Role;
  question: string;
  submitMethod: 'button' | 'enter';
  expected: {
    keywords?: string[];
    citations?: string[];
    minCitationsCount?: number;
    isThinking?: boolean;
  };
}

export interface UiRefusalCase {
  id: string;
  title: string;
  region: Region;
  role: Role;
  question: string;
  expected: {
    refusalMessageSubstring: string;
    forbiddenCitations?: string[];
    citationsCount: number;
  };
}

export interface UiRoleQueryCase {
  id: string;
  title: string;
  region: Region;
  role: Role;
  question: string;
  expected: {
    keywords: string[];
    citations: string[];
  };
}

export interface UiApiParityCase {
  id: string;
  title: string;
  region: Region;
  role: Role;
  question: string;
  expected: {
    status: number;
    keys: string[];
    forbiddenBodyStrings: string[];
  };
}

