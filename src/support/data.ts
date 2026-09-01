import {
  QueryTestCase,
  UiScopingMatrixEntry,
  DocumentsMasterData,
  UiLifecycleExclusionData,
  UiRegionalBoundaryCase,
  UiRbacBoundaryCase,
  UiLayoutData,
  UiQuerySubmissionCase,
  UiRefusalCase,
  UiRoleQueryCase,
  UiApiParityCase,
} from '../types';

import masterData from '../test-data/documents-master.json';
import lifecycleData from '../test-data/testCases/lifecycle-governance.json';
import rbacData from '../test-data/testCases/rbac-access-control.json';
import regionalData from '../test-data/testCases/regional-scoping.json';
import citationsData from '../test-data/testCases/citations-grounding.json';
import refusalData from '../test-data/testCases/refusal-out-of-scope.json';
import adversarialData from '../test-data/testCases/adversarial-guardrails.json';
import uiMatrixData from '../test-data/ui-scoping-matrix.json';
import apiContractData from '../test-data/testCases/api-contract.json';
import uiQueryJsonData from '../test-data/testCases/ui-query.json';

// Authoritative datasets
export const documentsMaster = masterData as DocumentsMasterData;
export const lifecycleGovernanceCases = lifecycleData.testCases as QueryTestCase[];
export const rbacAccessControlCases = rbacData.testCases as QueryTestCase[];
export const regionalScopingCases = regionalData.testCases as QueryTestCase[];
export const citationsGroundingCases = citationsData.testCases as QueryTestCase[];
export const refusalOutOfScopeCases = refusalData.testCases as QueryTestCase[];
export const adversarialGuardrailsCases = adversarialData.testCases as QueryTestCase[];
export const apiContractCases = apiContractData.testCases as QueryTestCase[];
export const uiScopingMatrix = uiMatrixData.scopingMatrix as UiScopingMatrixEntry[];
export const uiLifecycleExclusions = uiMatrixData.lifecycleExclusions as UiLifecycleExclusionData;
export const uiRegionalBoundaries = uiMatrixData.regionalBoundaries as UiRegionalBoundaryCase[];
export const uiRbacBoundaries = uiMatrixData.rbacBoundaries as UiRbacBoundaryCase[];

export const uiLayoutData = uiQueryJsonData.layout as UiLayoutData;
export const uiQuerySubmissionCases = uiQueryJsonData.submissionCases as UiQuerySubmissionCase[];
export const uiRefusalCases = uiQueryJsonData.refusalCases as UiRefusalCase[];
export const uiRoleQueryCases = uiQueryJsonData.roleQueryCases as UiRoleQueryCase[];
export const uiApiParityCase = uiQueryJsonData.apiParityCase as UiApiParityCase;
