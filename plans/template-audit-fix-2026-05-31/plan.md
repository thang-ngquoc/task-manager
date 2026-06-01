---
title: "Fix template YAML and deploy docs alignment"
status: pending
date: 2026-05-31
source: docs/brainstorm/brainstorm-template-audit-2026-05-31.md
---

# Plan: Fix template YAML and deploy docs alignment

## Summary
Apply minimal fixes to make the SAM template validate/deploy and align deploy docs with the actual template location. No changes to runtime behavior.

## Scope
- Fix YAML indentation for UpdateTaskFunction/DeleteTaskFunction Events in infra/iac/template.yaml.
- Update template path references in infra/README-deploy.md.

## Out of Scope
- CloudWatch dashboard/alarms/SNS and AWS Budget (console-based).
- CloudFront/S3/OAC provisioning.
- Backend/Frontend logic changes.

## Dependencies and overlaps
- Overlaps with plans/lambda-handlers-2026-05-31/plan.md (same template file). Coordinate if both are active.

## Phase 1: Validate current state
- Run sam validate against infra/iac/template.yaml to confirm current failure.
- Identify exact YAML indentation breakpoints for Events blocks.
Related: phase-01-assess.md

## Phase 2: Apply minimal fixes
- Fix Events indentation for UpdateTaskFunction and DeleteTaskFunction.
- Update infra/README-deploy.md references to the correct template path (infra/iac/template.yaml).
Related: phase-02-implement.md

## Phase 3: Verify
- Re-run sam validate to confirm success.
- Re-read README-deploy to ensure all template path mentions are consistent.
Related: phase-03-validate.md

## Success Criteria
- sam validate passes for infra/iac/template.yaml.
- README-deploy points to infra/iac/template.yaml everywhere.
- No behavioral changes to existing infrastructure beyond YAML correctness.
