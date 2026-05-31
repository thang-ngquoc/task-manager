# Brainstorm Report: Lambda Handlers from Backend Source

## Problem Statement and Requirements
Need to replace inline Python in [infra/iac/template.yaml](infra/iac/template.yaml) with Node.js Lambda handlers sourced from existing backend code, while keeping Express dev server working. Existing handlers are Express-style and must become Lambda-compatible without breaking response shapes. API path parameters must match assignment spec: PUT /tasks/:id and DELETE /tasks/:id.

Requirements:
- Use backend handler files as Lambda code, no inline code in template.
- Lambda runtime: Node.js 20.
- Lambda auth: Cognito claims `requestContext.authorizer.claims.sub`.
- Keep API paths and response shapes unchanged.
- Keep DynamoDB schema and GSI unchanged.
- Express server continues working without adapters.

## Evaluated Approaches (Pros/Cons)
A) Dual export per handler file (recommended)
- Pros: minimal refactor, no new deps, Express stays intact, direct mapping for SAM.
- Cons: two entrypoints per file, need to keep behavior aligned.

B) Extract shared service layer with new Lambda wrappers
- Pros: cleaner separation, easier unit tests.
- Cons: more files and refactor, not strictly “use handlers in place”.

C) Express-to-Lambda bridge (serverless-http)
- Pros: minimal code changes.
- Cons: new dependency, cold start overhead, heavier runtime.

## Final Recommended Solution (Approach A)
Use dual exports inside each handler file. Keep `exports.handler` for Express and add `exports.lambdaHandler` for Lambda. Convert API Gateway event into normalized input, read userId from Cognito claims, and return API Gateway response objects with matching `message/data` shapes.

Mapping table:
- getTasks: [backend/src/handlers/getTasks.js](backend/src/handlers/getTasks.js) -> `lambdaHandler` -> GET /tasks
- createTask: [backend/src/handlers/createTask.js](backend/src/handlers/createTask.js) -> `lambdaHandler` -> POST /tasks
- updateTask: [backend/src/handlers/updateTask.js](backend/src/handlers/updateTask.js) -> `lambdaHandler` -> PUT /tasks/{id}
- deleteTask: [backend/src/handlers/deleteTask.js](backend/src/handlers/deleteTask.js) -> `lambdaHandler` -> DELETE /tasks/{id}

Path parameter note:
- Express uses `:id` in routes. API Gateway uses `{id}`. In Lambda, use `event.pathParameters.id` to match the assignment spec.

## Implementation Considerations and Risks
- Node.js runtime in SAM: set `Runtime: nodejs20.x` in Globals or per function.
- Packaging: Lambda must include `node_modules` from [backend/package.json](backend/package.json) (AWS SDK v3 is not bundled in Node 20).
- CORS headers: keep consistent with existing AllowedOrigin config.
- Auth claims: ensure Cognito authorizer is enabled so `requestContext.authorizer.claims.sub` exists.
- Condition checks: preserve current behavior for 403 vs 404, and 400 vs 500.

## Success Metrics and Validation Criteria
Expected status codes and response shapes must match current Express behavior:
- GET /tasks: 200 with `{ message, data }`; 400 if missing userId; 500 on errors.
- POST /tasks: 201 with `{ message, data }`; 400 if missing title/userId; 500 on errors.
- PUT /tasks/{id}: 200 with `{ message, data }`; 400 if no fields; 403 if not owner; 500 on errors.
- DELETE /tasks/{id}: 200 with `{ message }`; 400 if missing id; 403 if not owner; 500 on errors.

## Next Steps and Dependencies
- Update [infra/iac/template.yaml](infra/iac/template.yaml) to use CodeUri + Handler pointing to backend handlers and Node.js 20.
- Refactor handler files to add `lambdaHandler` and Lambda-compatible request parsing.
- Add small shared helpers (response + auth parsing) in [backend/src/shared](backend/src/shared) if needed.
- Validate with SAM local invoke or deployed API Gateway tests.
