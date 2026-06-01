---
phase: 2
title: "Apply minimal fixes"
status: pending
priority: P2
effort: "1h"
dependencies: [1]
---

# Phase 02: Apply minimal fixes

## Overview
Fix SAM Events indentation for update/delete and align README-deploy template path references.

## Requirements
- Functional: Template is syntactically valid; docs point to infra/iac/template.yaml.
- Non-functional: No runtime behavior changes.

## Architecture
No changes to infrastructure architecture; formatting only.

## Related Code Files
- Modify: infra/iac/template.yaml
- Modify: infra/README-deploy.md

## Implementation Steps
1. Indent `Path` and `Method` under `Events.*.Properties` for UpdateTaskFunction and DeleteTaskFunction.
2. Replace doc references of `template.yaml` with `iac/template.yaml` in infra/README-deploy.md.

## Success Criteria
- [ ] Events indentation is corrected for both functions.
- [ ] All template path references in README-deploy are accurate.

## Risk Assessment
Risk: Over-editing docs and changing unrelated instructions. Mitigation: limit to path references only.
