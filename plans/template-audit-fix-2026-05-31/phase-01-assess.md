---
phase: 1
title: "Assess current template and docs"
status: pending
priority: P2
effort: "1h"
dependencies: []
---

# Phase 01: Assess current template and docs

## Overview
Confirm the exact YAML indentation failures and any remaining deploy doc path mismatches before applying fixes.

## Requirements
- Functional: Identify all invalid `Events` indentation blocks and all incorrect template path references.
- Non-functional: No code changes yet; assessment only.

## Architecture
No architecture changes. This phase is a static inspection of template and docs.

## Related Code Files
- Modify: infra/iac/template.yaml
- Modify: infra/README-deploy.md

## Implementation Steps
1. Run `sam validate --template-file infra/iac/template.yaml` and capture the failure lines.
2. Scan infra/README-deploy.md for `template.yaml` references and confirm correct path usage.

## Success Criteria
- [ ] Exact indentation issue locations are identified.
- [ ] All doc path mismatches are enumerated.

## Risk Assessment
Risk: Missing a subtle path reference. Mitigation: use search across infra/README-deploy.md before edits.
