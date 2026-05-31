---
phase: 3
title: "Validate changes"
status: pending
priority: P2
effort: "0.5h"
dependencies: [2]
---

# Phase 03: Validate changes

## Overview
Verify the template validates and deploy docs are consistent.

## Requirements
- Functional: `sam validate` passes; doc references are correct.
- Non-functional: No new warnings introduced.

## Architecture
No architecture changes.

## Related Code Files
- Modify: infra/iac/template.yaml
- Modify: infra/README-deploy.md

## Implementation Steps
1. Run `sam validate --template-file infra/iac/template.yaml` and confirm success.
2. Re-scan infra/README-deploy.md to ensure all template path references are correct.

## Success Criteria
- [ ] `sam validate` succeeds.
- [ ] README-deploy path references are consistent.

## Risk Assessment
Risk: Validation done with wrong template path. Mitigation: use absolute/explicit path in command.
