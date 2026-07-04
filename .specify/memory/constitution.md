<!--
Sync Impact Report
==================
Version change: 1.0.0 → 1.1.0
Modified principles: none
Added sections:
  - Additional Constraints: file-based storage requirement (no database)
Removed sections: none
Templates requiring updates:
  - .specify/templates/plan-template.md ⚠ pending (ensure Constitution Check flags any DB usage as a violation)
  - .specify/templates/spec-template.md ✅ no change needed (storage is a technical constraint, not spec-level)
  - .specify/templates/tasks-template.md ⚠ pending (ensure data-persistence tasks assume file storage, not schema/migration tasks)
  - .specify/templates/commands/*.md ✅ no change needed
Follow-up TODOs:
  - TODO(RATIFICATION_DATE): Original adoption date unknown; using 2026-07-04 as placeholder ratification date since this is the first constitution for the project.
-->

# SpicyApp Constitution

## Core Principles

### I. Test-First (NON-NEGOTIABLE)
Tests MUST be written before implementation for every new feature or bug fix.
Tests MUST be reviewed and approved, then MUST fail before any implementation
code is written. Development MUST follow the Red-Green-Refactor cycle: write a
failing test, make it pass with the minimum code necessary, then refactor.
Pull requests that add behavior without accompanying tests MUST be rejected.

**Rationale**: SpicyApp is a web/mobile application where regressions directly
affect end users. Test-first discipline catches defects before they reach
production and keeps the codebase safe to change.

### II. Simplicity & YAGNI
Implementations MUST start with the simplest design that satisfies the current,
concrete requirement. Speculative abstractions, unused configuration options,
and "future-proofing" code paths MUST NOT be added until a real requirement
exists. When a simpler alternative exists that meets the same requirement, it
MUST be preferred over a more complex one.

**Rationale**: Premature abstraction slows onboarding and increases the surface
area for bugs. A small, well-tested app is easier to evolve than a large,
speculative one.

### III. User Experience Consistency
User-facing behavior (UI copy, navigation patterns, error messaging, loading
states) MUST be consistent across screens and platforms (web/mobile). Any new
screen or flow MUST reuse existing shared components and interaction patterns
before introducing new ones. Deviations MUST be justified in the PR description.

**Rationale**: Consistency reduces user confusion and support burden, and keeps
the app feeling like a single coherent product rather than a set of disjointed
features.

### IV. Code Review & Quality Gates
All changes MUST go through code review before merging. A change MUST NOT be
merged if: tests are failing, test coverage for the change is missing, or
linting/type-checking reports errors. Reviewers MUST verify compliance with
this constitution as part of every review.

**Rationale**: Automated and human gates catch issues that individual
developers miss under time pressure, and keep the codebase auditable.

### V. Versioning & Breaking Changes
The project MUST use semantic versioning (MAJOR.MINOR.BUILD) for releases.
Breaking changes to APIs, data schemas, or shared contracts MUST be called out
explicitly in the PR and release notes, and MUST include a migration path.

**Rationale**: Clear versioning lets consumers of the app (including internal
teams and future contributors) reason about compatibility and safely upgrade.

## Additional Constraints

**No database.** All application data (sessions, players, turns, prompt
content, etc.) MUST be persisted as files on the server — no relational,
document, or other database engine may be introduced. Any feature that needs
durable state MUST design its file layout (format, location, naming) as part
of its plan, and MUST account for concurrent read/write access from multiple
active sessions without corrupting data.

**Rationale**: This is an explicit, non-negotiable project constraint chosen
to keep the deployment footprint and operational complexity minimal for this
app's scale.

Beyond this, technology stack, security, and compliance requirements are not
yet formally defined. As concrete requirements emerge (e.g., specific
frameworks, data-privacy rules, deployment targets), they MUST be added here
rather than left as undocumented tribal knowledge.

## Development Workflow

Every feature MUST follow: spec → plan → tasks → test-first implementation →
code review → merge. Code review MUST check adherence to the Core Principles
above, in particular Test-First and Simplicity. CI checks (tests, lint, type
checks) MUST pass before merge; failures MUST be fixed, not bypassed.

## Governance

This constitution supersedes all other informal practices for this project.
Amendments require: (1) a documented rationale for the change, (2) an update
to this file including a version bump per the policy below, and (3) review of
dependent templates (plan/spec/tasks templates) for consistency.

Versioning policy: MAJOR versions cover backward-incompatible governance or
principle removals/redefinitions; MINOR versions cover new principles or
materially expanded guidance; PATCH versions cover clarifications and wording
fixes with no semantic change.

All pull requests and reviews MUST verify compliance with this constitution.
Any complexity that appears to violate Principle II (Simplicity & YAGNI) MUST
be explicitly justified in the PR description. Runtime development guidance
for AI agents working on this repo should live in an agent-specific guidance
file (e.g., CLAUDE.md) and MUST remain consistent with this constitution.

**Version**: 1.1.0 | **Ratified**: 2026-07-04 | **Last Amended**: 2026-07-04
