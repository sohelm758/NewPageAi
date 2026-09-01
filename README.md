# AI Knowledge Assistant — Test Automation Suite

A robust, data-driven automated testing framework built with **Playwright** and **TypeScript** to validate both API and UI layers of the **AI Knowledge Assistant** (internal Retrieval-Augmented Generation / RAG system).

---

## 1. Folder Structure (`src/`)

The core automation codebase resides entirely inside the `src/` directory, following Page Object Model (POM), data-driven testing, and modular separation of concerns:

```text
src/
├── index.ts                                # Central export aggregator for models, helpers, and datasets
├── types.ts                                # TypeScript domain models, test case interfaces, and API types
├── pages/                                  # Page Object Model (POM) layer for UI automation
│   ├── ai-assistant.page.ts                # Locators, interaction methods, and assertions for Knowledge Assistant UI
│   ├── base.page.ts                        # Base page wrapper for browser navigation and common web actions
│   └── index.ts                            # Aggregated exports for page objects
├── support/                                # Shared framework utilities and test data loaders
│   ├── api-helpers.ts                      # Request builders, HTTP headers generator, and API payload formatters
│   ├── attachment-helpers.ts               # Playwright test reporter attachment helpers for JSON artifacts
│   └── data.ts                             # Typed dataset exports and test data helper mappings
├── test-data/                              # Golden dataset repository (single source of truth)
│   ├── documents-master.json               # Master inventory of all 9 internal documents and access rules
│   ├── ui-scoping-matrix.json              # UI visibility scoping matrix and boundary test expectations
│   └── testCases/                          # Categorized JSON test case definitions
│       ├── adversarial-guardrails.json     # Adversarial prompts, jailbreaks, and injection test suites
│       ├── api-contract.json               # API schema, header validation, and error contract cases
│       ├── citations-grounding.json        # Claim-to-citation attribution and grounding tests
│       ├── lifecycle-governance.json       # Document lifecycle enforcement (Draft, In Review, Retired, Approved)
│       ├── rbac-access-control.json        # Role-based access control (RBAC) boundaries (Employee, Eng, Finance, Manager)
│       ├── refusal-out-of-scope.json       # Out-of-scope queries and graceful refusal validations
│       ├── regional-scoping.json           # Regional boundary enforcement (Americas, EMEA, APAC, Global)
│       └── ui-query.json                   # UI-specific interactions, refusals, role checks, and UI-API parity
└── tests/                                  # Playwright test specifications
    ├── api/                                # API automation test suites
    │   └── api.spec.ts                     # Automated API spec verifying /query and /documents against business rules
    └── ui/                                 # UI automation test suites
        ├── documents-visible.spec.ts       # UI aside panel document visibility and scoping specs
        └── query.spec.ts                   # UI query input, submission, thinking state, and answer/citation specs
```

---

## 2. Dataset Overview

The test suite employs a **Golden Dataset** architecture (`src/test-data/`), decoupling test execution logic from test data definitions to enable full maintainability and high test coverage.

| Dataset / File | Dimension | Count | Key Assertions & Invariants |
| :--- | :--- | :---: | :--- |
| `src/test-data/documents-master.json` | Master Document Inventory | 9 docs | Canonical document library, metadata (ID, title, region, audience, lifecycle state), and access mapping. |
| `src/test-data/ui-scoping-matrix.json` | UI Scoping Matrix & Boundaries | 12 pairs + 10 boundary tests | Authoritative list/count of visible docs per Region/Role pair, lifecycle exclusions, and UI panel scoping boundaries. |
| `src/test-data/testCases/lifecycle-governance.json` | Document Lifecycle Enforcement | 7 cases | Never surface `Draft` (D-009), `In Review` (D-003), or `Retired` (D-005). Prioritize active `D-004` over superseded `D-005`. |
| `src/test-data/testCases/rbac-access-control.json` | Role-Based Access Control (RBAC) | 11 cases | Restrict `D-006` (Engineering), `D-007` (Manager), `D-008` (Finance); refuse unauthorized cross-role queries. |
| `src/test-data/testCases/regional-scoping.json` | Geographic Scoping | 8 cases | Scope regional policies (e.g., travel allowance `D-001`, `D-002`) to user region; prevent cross-region policy leakage. |
| `src/test-data/testCases/citations-grounding.json` | Attribution & Grounding | 6 cases | Ensure 1:1 attribution between factual answer claims and citations; prevent citation drift and ungrounded facts. |
| `src/test-data/testCases/refusal-out-of-scope.json` | Graceful Refusal | 6 cases | Clean refusal messages and empty citations (`citations: []`) on non-existent company policies or out-of-scope topics. |
| `src/test-data/testCases/adversarial-guardrails.json` | Security & Injection Resistance | 7 cases | System prompt overrides, direct document ID dumping, translation evasions, and injection payloads. |
| `src/test-data/testCases/api-contract.json` | API Contract & Robustness | 4 cases | Required header validations (`X-User-Region`, `X-User-Role`), invalid enums, empty request payloads, and status codes. |
| `src/test-data/testCases/ui-query.json` | UI Query Interactions & Parity | 8 cases + layout config | Data-driven UI interaction workflows, button/enter submissions, refusals, role queries, and UI-API parity. |

---

## 3. Local Setup

Follow these steps to set up and run the test automation suite on your local machine:

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### Installation Steps

1. **Clone the repository and navigate to project root:**
   ```bash
   git clone <repository-url>
   cd NewPage-Ai
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Install Playwright browser binaries and system dependencies:**
   ```bash
   npx playwright install --with-deps chromium
   ```

4. **Configure Environment Variables:**
   Create a `.env` file in the root directory (see [Environment Variables](#4-environment-variables-mandatory) below).

---

## 4. Environment Variables (Mandatory)

The test suite utilizes `dotenv` to load environment variables from a `.env` file in the project root.

### Mandatory `.env` Configuration

Create a `.env` file in the project root:

```env
# Mandatory: Target application base URL for both UI and API testing
BASE_URL=https://main-knowledge-assistant.newpage.workers.dev/

# Optional: Set to 'true' to run UI tests with a visible browser window, or 'false' for headless
HEADED=false

# Optional: Set to 'true' in CI environments
CI=false
```

### Environment Variables Reference

| Variable | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `BASE_URL` | `string` | **Yes** | — | Base URL of the Knowledge Assistant application (used for API requests and UI browser navigation). |
| `HEADED` | `boolean` | No | `false` | When set to `true`, launches Chromium in headed mode for visual execution. |
| `CI` | `boolean` | No | `false` | When set to `true`, forces headless mode and CI test optimizations. |

---

## 5. Execution Commands

Use the following npm scripts and Playwright CLI commands to execute the test suite:

### Test Execution Commands

| Command | Description |
| :--- | :--- |
| `npm test` | Runs the entire test suite (all UI and API tests). |
| `npm run test:ui` | Runs only UI test specifications (`src/tests/ui`). |
| `npm run test:api` | Runs only API test specifications (`src/tests/api`). |
| `npm run test:headed` | Runs UI tests in headed mode with a visible browser window. |
| `npm run build` | Compiles TypeScript source files into `dist/`. |

### Debugging & Test Reports

| Command | Description |
| :--- | :--- |
| `npx playwright test --debug` | Runs tests in Playwright interactive debug mode. |
| `npx playwright test --trace on` | Runs tests and records execution traces for failure analysis. |
| `npx playwright show-report` | Opens the interactive HTML test execution report in your default browser. |
