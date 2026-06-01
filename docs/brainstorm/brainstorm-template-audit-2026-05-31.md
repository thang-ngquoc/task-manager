# Brainstorm Report: Template Audit (PROJECT2)

Date: 2026-05-31
Scope: infra/iac/template.yaml + infra/README-deploy.md + backend/frontend auth touchpoints
Decision: Option 1 (minimal fix + strict alignment)

## Findings (ordered by severity)
- High: Invalid YAML indentation under UpdateTaskFunction/DeleteTaskFunction Events in infra/iac/template.yaml; sam validate/deploy fails.
- Medium: README-deploy references infra/template.yaml but actual path is infra/iac/template.yaml; deploy steps misleading.
- Low: Tracing enabled in VPC private subnets without X-Ray VPC endpoint; may produce trace errors/noise (not required by PROJECT2).

## Pass/Fail vs PROJECT2 requirements
- Pass: REST API + stage prod + Cognito authorizer.
- Pass: 4 Lambda functions, 4 distinct IAM roles, least-privilege DynamoDB ARNs.
- Pass: VPC private subnets + DynamoDB Gateway Endpoint + no NAT Gateway.
- Pass: CORS non-wildcard via AllowedOrigin.
- Pass: DynamoDB table + GSI userId-index.
- Pass: Frontend sends Bearer token; backend uses Cognito claims.
- Fail: Template does not validate due to indentation.
- Fail: README-deploy template path mismatch.
- Console-only (OK per README): Budget, CloudWatch dashboard/alarms/SNS, CloudFront/S3/OAC.

## Minimal Fix Recommendation
1) Fix Events indentation for UpdateTaskFunction/DeleteTaskFunction in infra/iac/template.yaml.
2) Update infra/README-deploy.md to point at infra/iac/template.yaml.
3) Optional: set Tracing to PassThrough or add X-Ray VPC endpoint if clean tracing is required.

## Risks
- Deployment blocked until YAML fixed.
- Incorrect README path causes wrong template usage and failed deploy.

## Validation
- sam validate --template-file infra/iac/template.yaml succeeds.
- sam deploy runs with correct template path.
