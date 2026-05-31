---
title: "Lambda handlers from backend source"
status: pending
date: 2026-05-31
source: docs/brainstorm/brainstorm-lambda-handlers-2026-05-31.md
---

# Plan: Lambda handlers from backend source

## Summary
Refactor backend handlers to support Lambda entrypoints while keeping Express dev server behavior intact, and update the SAM template to use Node.js 20 with CodeUri/Handler mappings. Align API Gateway path parameter name to `id` to match assignment spec and Express routes.

## Scope
- Replace inline Lambda code in [infra/iac/template.yaml](infra/iac/template.yaml) with backend handler code.
- Add `lambdaHandler` exports to existing handler files without breaking Express usage.
- Keep response shapes and status codes exactly as current Express handlers.

## Out of Scope
- DynamoDB schema or index changes.
- Frontend changes.
- Express-to-Lambda adapters or new dependencies.

## Constraints
- Node.js 20 runtime.
- Express dev server must keep working.
- API paths remain `/tasks` and `/tasks/{id}` (API Gateway) aligned with `/tasks/:id` (Express).

## Touchpoints
- [infra/iac/template.yaml](infra/iac/template.yaml)
- [backend/src/handlers/getTasks.js](backend/src/handlers/getTasks.js#L1)
- [backend/src/handlers/createTask.js](backend/src/handlers/createTask.js#L1)
- [backend/src/handlers/updateTask.js](backend/src/handlers/updateTask.js#L1)
- [backend/src/handlers/deleteTask.js](backend/src/handlers/deleteTask.js#L1)
- [backend/src/routes/tasks.js](backend/src/routes/tasks.js#L1)
- [backend/src/middleware/authMiddleware.js](backend/src/middleware/authMiddleware.js#L1)
- [backend/src/shared/dynamodb.js](backend/src/shared/dynamodb.js#L1)

## Phase 1: IaC switch to backend handlers
- Update Globals in [infra/iac/template.yaml](infra/iac/template.yaml#L47) to Node.js 20 and remove Python handler default.
- Replace InlineCode for all 4 functions with `CodeUri: backend/` and `Handler: src/handlers/<name>.lambdaHandler`.
- Set API Gateway paths to `/tasks` and `/tasks/{id}` so Lambda reads `event.pathParameters.id` while Express keeps `/tasks/:id` ([backend/src/routes/tasks.js](backend/src/routes/tasks.js#L12)).

## Phase 2: Dual exports for Lambda + Express
- Add `exports.lambdaHandler` to each handler file so Express keeps using `exports.handler`.
- Map Cognito user id from `requestContext.authorizer.claims.sub` and pass into shared logic.
- Ensure status codes and response shapes remain consistent with existing logic in:
  - [backend/src/handlers/getTasks.js](backend/src/handlers/getTasks.js#L6)
  - [backend/src/handlers/createTask.js](backend/src/handlers/createTask.js#L7)
  - [backend/src/handlers/updateTask.js](backend/src/handlers/updateTask.js#L6)
  - [backend/src/handlers/deleteTask.js](backend/src/handlers/deleteTask.js#L6)

## Phase 3: Packaging and validation
- Ensure `backend/package.json` dependencies are bundled into Lambda artifact (AWS SDK v3 is required).
- Validate with SAM local invoke or deployed API:
  - GET `/tasks` returns `{ message, data }` and matches current status codes.
  - POST `/tasks` returns 201 with `{ message, data }` and matches error handling.
  - PUT `/tasks/{id}` and DELETE `/tasks/{id}` reflect 400/403/500 paths.

## Risks and Mitigations
- Risk: userId missing in Lambda events without Cognito authorizer. Mitigation: ensure authorizer configured and fail with 401.
- Risk: path parameter mismatch (`taskId` vs `id`). Mitigation: use `{id}` in API Gateway and `pathParameters.id` in Lambda.
- Risk: missing `node_modules` in Lambda bundle. Mitigation: SAM build from backend folder and include dependencies.

## Validation Criteria
- All 4 Lambda endpoints return same status codes and JSON shape as Express handlers.
- Express dev server behavior unchanged for `/tasks` routes.
- API Gateway paths align with assignment spec: PUT/DELETE `/tasks/:id`.
