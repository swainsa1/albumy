<!--
Sync Impact Report
- Version change: N/A -> 1.0.0
- Modified principles:
	- PRINCIPLE_1_NAME -> I. Code Quality Is Non-Negotiable
	- PRINCIPLE_2_NAME -> II. Test Coverage Defines Done
	- PRINCIPLE_3_NAME -> III. User Experience Must Be Consistent
	- PRINCIPLE_4_NAME -> IV. Performance Budgets Are Required
- Added sections:
	- Engineering Quality Gates
	- Delivery Workflow Expectations
- Removed sections:
	- PRINCIPLE_5_NAME placeholder section
- Templates requiring updates:
	- ✅ updated: .specify/templates/plan-template.md
	- ✅ updated: .specify/templates/spec-template.md
	- ✅ updated: .specify/templates/tasks-template.md
	- ⚠ pending: .specify/templates/commands/*.md (directory not present in repository)
- Follow-up TODOs:
	- None
-->

# Albumy Constitution

## Core Principles

### I. Code Quality Is Non-Negotiable
All production code MUST pass formatting, linting, and static analysis checks in CI before merge.
Changes MUST preserve readability through clear naming, small focused units, and removal of dead code.
Public interfaces MUST include concise usage documentation. Rationale: maintainability and safe iteration
depend on enforceable quality gates, not reviewer preference.

### II. Test Coverage Defines Done
Every behavior change MUST include automated tests that fail before implementation and pass after it.
Bug fixes MUST include a regression test. Feature work MUST include unit tests plus integration or contract
tests where components interact. Merges with failing tests are prohibited. Rationale: reliable delivery
requires objective verification of behavior and prevention of regressions.

### III. User Experience Must Be Consistent
User-facing changes MUST reuse established design patterns for layout, interaction, feedback, and copy tone.
Every flow MUST provide consistent loading, empty, success, and error states. Accessibility checks for
keyboard navigation, contrast, and semantic labeling MUST be included in review. Rationale: consistency
reduces user error, support load, and re-learning cost.

### IV. Performance Budgets Are Required
Each feature MUST declare measurable performance budgets in its specification (for example response time,
render latency, memory usage, or bundle size as applicable). Implementations MUST include evidence that
budgets are met and MUST not regress critical-path performance without explicit approval and mitigation.
Rationale: performance is a user-facing quality attribute and must be managed as a first-class constraint.

## Engineering Quality Gates

- Pull requests MUST include: linked specification, updated tests, and evidence of quality checks.
- Pull requests touching user-facing behavior MUST include UX consistency review notes.
- Pull requests affecting critical paths MUST include before/after performance measurements.
- Any temporary exception MUST document owner, scope, expiration date, and rollback plan.

## Delivery Workflow Expectations

- Work MUST follow spec -> plan -> tasks before implementation begins.
- The plan MUST pass Constitution Check gates before Phase 0 research completion.
- Task breakdowns MUST keep user stories independently deliverable and testable.
- Release notes MUST summarize user-visible changes, test coverage updates, and performance impact.

## Governance

This constitution is authoritative for engineering practices in this repository. Amendments require a pull
request that includes: proposed text changes, impact assessment on templates and workflows, and approval
from at least one project maintainer.

Versioning policy for this constitution follows semantic versioning:
- MAJOR: incompatible governance or principle removals/redefinitions.
- MINOR: new principle/section or materially expanded guidance.
- PATCH: clarifications, wording improvements, and non-semantic edits.

Compliance review is required at planning and pull request time. Reviewers MUST block changes that violate
any MUST requirement unless a documented exception is approved per Engineering Quality Gates.

**Version**: 1.0.0 | **Ratified**: 2026-03-24 | **Last Amended**: 2026-03-24
