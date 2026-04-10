# Contract Management API

Complete reference for all API endpoints. Use this document to build Postman collections, understand request/response shapes, and learn the business rules enforced by each endpoint.

---

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Response Envelope](#response-envelope)
- [Error Codes](#error-codes)
- [Rate Limiting](#rate-limiting)
- [Auth Routes](#auth-routes)
  - [POST /api/auth/register](#post-apiauthregister)
  - [POST /api/auth/login](#post-apiauthlogin)
  - [POST /api/auth/refresh](#post-apiauthrefresh)
  - [POST /api/auth/logout](#post-apiauthlogout)
  - [GET /api/auth/me](#get-apiauthme)
- [Contract Routes](#contract-routes)
  - [GET /api/contracts](#get-apicontracts)
  - [POST /api/contracts](#post-apicontracts)
  - [GET /api/contracts/:id](#get-apicontractsid)
  - [PUT /api/contracts/:id](#put-apicontractsid)
  - [DELETE /api/contracts/:id](#delete-apicontractsid)
- [Version History Routes](#version-history-routes)
  - [GET /api/contracts/:id/versions](#get-apicontractsidversions)
  - [GET /api/contracts/:id/versions/:versionId](#get-apicontractsidversionsversionid)
- [Audit Log Routes](#audit-log-routes)
  - [GET /api/contracts/:id/audit](#get-apicontractsidaudit)
- [Status Transition Rules](#status-transition-rules)
- [Soft Delete Rules](#soft-delete-rules)

---

## Base URL

| Environment | URL |
|---|---|
| Local development | `http://localhost:5001` |
| Production (Render) | `https://your-render-service.onrender.com` |

All routes are prefixed with `/api`.

---

## Authentication

This API uses a **dual-token** strategy:

| Token | Storage | Lifetime | Usage |
|---|---|---|---|
| Access Token (JWT) | Frontend memory / `Authorization` header | 15 minutes | Sent on every protected request |
| Refresh Token (opaque) | HttpOnly cookie (`refreshToken`) | 7 days | Sent automatically to `/api/auth/refresh` |

**Using the access token:**

Include it in the `Authorization` header on every protected request:

```
Authorization: Bearer <accessToken>
```

**Refresh token rotation:**

Every call to `POST /api/auth/refresh` issues a brand-new refresh token and immediately revokes the old one. If a revoked token is ever reused, the entire token family is invalidated (all sessions for that user are logged out).

---

## Response Envelope

All responses — success and error — follow the same JSON envelope shape.

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "meta": { ... }
}
```
> `meta` is only present on paginated responses.

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description",
    "details": [ ... ]
  }
}
```
> `details` is only present on validation errors — it contains field-level messages.

---

## Error Codes

| HTTP Status | Code | When it occurs |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Request body or query params failed Zod validation |
| 401 | `UNAUTHENTICATED` | Missing or malformed `Authorization` header |
| 401 | `INVALID_TOKEN` | JWT signature invalid or token not found |
| 401 | `TOKEN_EXPIRED` | Access token or refresh token has expired |
| 401 | `INVALID_CREDENTIALS` | Wrong email or password on login |
| 401 | `TOKEN_REUSE_DETECTED` | Revoked refresh token was reused — all sessions invalidated |
| 403 | `FORBIDDEN` | Authenticated but not authorized for this resource |
| 403 | `ACCOUNT_DEACTIVATED` | User account has been deactivated by admin |
| 404 | `NOT_FOUND` | Resource does not exist (or was soft-deleted) |
| 409 | `CONFLICT` | Unique constraint violation (e.g. duplicate email) |
| 422 | `INVALID_STATUS_TRANSITION` | Attempted a disallowed contract status change |
| 429 | `RATE_LIMITED` | Too many requests within the rate-limit window |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected server error |

---

## Rate Limiting

Rate limiting is applied to `POST /api/auth/register` and `POST /api/auth/login` only.

| Setting | Default value | Env var |
|---|---|---|
| Window | 15 minutes | `RATE_LIMIT_WINDOW_MS=900000` |
| Max requests per window per IP | 20 | `RATE_LIMIT_MAX=20` |

When exceeded, the response is `429 RATE_LIMITED`. The response headers include:
- `RateLimit-Limit` — max requests allowed
- `RateLimit-Remaining` — requests left in the current window
- `RateLimit-Reset` — epoch time when the window resets

---

## Auth Routes

---

### POST /api/auth/register

Creates a new user account. The role defaults to `USER`. On success, issues an access token in the response body and sets a `refreshToken` HttpOnly cookie.

**Auth required:** No (Public)

**Rate limited:** Yes

#### Request Body

```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "Secret123"
}
```

| Field | Type | Required | Validation |
|---|---|---|---|
| `name` | string | Yes | 2–100 characters |
| `email` | string | Yes | Valid email format, lowercased |
| `password` | string | Yes | 8–72 chars, at least 1 uppercase letter, at least 1 number |

#### Success Response — `201 Created`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "a1b2c3d4-...",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "USER",
      "createdAt": "2026-04-10T12:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Cookie set:** `refreshToken=<raw-token>; HttpOnly; SameSite=Strict; Path=/api/auth`

#### Error Responses

| Status | Code | Cause |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Missing/invalid fields |
| 409 | `CONFLICT` | Email already registered |
| 429 | `RATE_LIMITED` | Too many registration attempts |

---

### POST /api/auth/login

Validates credentials and returns a new token pair.

**Auth required:** No (Public)

**Rate limited:** Yes

#### Request Body

```json
{
  "email": "jane@example.com",
  "password": "Secret123"
}
```

| Field | Type | Required | Validation |
|---|---|---|---|
| `email` | string | Yes | Valid email format |
| `password` | string | Yes | Non-empty |

#### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "a1b2c3d4-...",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "USER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Cookie set:** `refreshToken=<raw-token>; HttpOnly; SameSite=Strict; Path=/api/auth`

#### Error Responses

| Status | Code | Cause |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Missing/invalid fields |
| 401 | `INVALID_CREDENTIALS` | Wrong email or password |
| 403 | `ACCOUNT_DEACTIVATED` | Account has been disabled |
| 429 | `RATE_LIMITED` | Too many login attempts |

---

### POST /api/auth/refresh

Issues a new access token using the refresh token stored in the HttpOnly cookie. **Rotates** the refresh token — a new cookie is set and the old token is immediately revoked.

**Auth required:** HttpOnly cookie (`refreshToken`)

**Rate limited:** No

#### Request Body

None. The refresh token is read from the `refreshToken` cookie automatically by the browser.

> **Postman note:** In Postman, you must manually copy the `refreshToken` cookie value from a login response and send it as a cookie header, or use Postman's cookie manager.

#### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Cookie updated:** New `refreshToken` cookie replaces the old one.

#### Error Responses

| Status | Code | Cause |
|---|---|---|
| 401 | `UNAUTHENTICATED` | Refresh token cookie missing |
| 401 | `INVALID_TOKEN` | Token not found in database |
| 401 | `TOKEN_EXPIRED` | Refresh token past expiry date |
| 401 | `TOKEN_REUSE_DETECTED` | Already-revoked token was presented — all sessions killed |

---

### POST /api/auth/logout

Revokes the current refresh token, ending the session. The `refreshToken` cookie is cleared.

**Auth required:** Bearer token

#### Request Body

None.

#### Success Response — `200 OK`

```json
{
  "success": true,
  "data": null
}
```

**Cookie cleared:** `refreshToken` is removed.

#### Error Responses

| Status | Code | Cause |
|---|---|---|
| 401 | `UNAUTHENTICATED` | Missing or invalid access token |

---

### GET /api/auth/me

Returns the profile of the currently authenticated user.

**Auth required:** Bearer token

#### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "a1b2c3d4-...",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "USER",
      "isActive": true,
      "createdAt": "2026-04-10T12:00:00.000Z"
    }
  }
}
```

#### Error Responses

| Status | Code | Cause |
|---|---|---|
| 401 | `UNAUTHENTICATED` | Missing or invalid access token |
| 404 | `NOT_FOUND` | User deleted after token was issued |

---

## Contract Routes

All contract routes require a valid Bearer token. Regular `USER` role can only access contracts they created. `ADMIN` role can access all contracts.

---

### GET /api/contracts

Returns a paginated, filterable list of contracts.

- **USER:** returns only contracts created by the caller
- **ADMIN:** returns all contracts across all users

**Auth required:** Bearer token

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `search` | string | No | — | Case-insensitive search on contract `title` and party `name` |
| `status` | string or string[] | No | — | Filter by status. One of: `DRAFT`, `ACTIVE`, `EXECUTED`, `EXPIRED`. Pass multiple: `?status=DRAFT&status=ACTIVE` |
| `startDateFrom` | ISO date string | No | — | Filter contracts whose `startDate` is on or after this date |
| `startDateTo` | ISO date string | No | — | Filter contracts whose `startDate` is on or before this date |
| `sortBy` | `createdAt` \| `updatedAt` | No | `createdAt` | Field to sort by |
| `sortOrder` | `asc` \| `desc` | No | `desc` | Sort direction |
| `page` | integer | No | `1` | Page number (1-based) |
| `limit` | integer | No | `20` | Results per page (max `100`) |

#### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "contracts": [
      {
        "id": "c1d2e3f4-...",
        "title": "Vendor Agreement",
        "description": "Annual vendor agreement with Acme Corp",
        "startDate": "2026-01-01T00:00:00.000Z",
        "endDate": "2026-12-31T00:00:00.000Z",
        "status": "ACTIVE",
        "createdById": "a1b2c3d4-...",
        "deletedAt": null,
        "createdAt": "2026-04-01T10:00:00.000Z",
        "updatedAt": "2026-04-05T14:00:00.000Z",
        "parties": [
          { "id": "p1...", "name": "Acme Corp", "email": "legal@acme.com", "role": "Vendor" }
        ],
        "createdBy": {
          "id": "a1b2c3d4-...",
          "name": "Jane Smith",
          "email": "jane@example.com"
        }
      }
    ]
  },
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "hasNextPage": true
  }
}
```

#### Error Responses

| Status | Code | Cause |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid query parameters |
| 401 | `UNAUTHENTICATED` | Missing or invalid access token |

---

### POST /api/contracts

Creates a new contract with an initial version snapshot (v1). The status defaults to `DRAFT`.

**Auth required:** Bearer token

#### Request Body

```json
{
  "title": "Vendor Agreement",
  "description": "Annual vendor agreement with Acme Corp",
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "parties": [
    { "name": "Acme Corp", "email": "legal@acme.com", "role": "Vendor" },
    { "name": "Jane Smith", "email": "jane@example.com", "role": "Client" }
  ]
}
```

| Field | Type | Required | Validation |
|---|---|---|---|
| `title` | string | Yes | 1–300 characters |
| `description` | string | No | Max 5000 characters |
| `startDate` | ISO date string | Yes | Any valid date |
| `endDate` | ISO date string | Yes | Must be after `startDate` |
| `parties` | array | Yes | 1–20 items |
| `parties[].name` | string | Yes | 1–200 characters |
| `parties[].email` | string | No | Valid email format |
| `parties[].role` | string | No | Max 100 characters (e.g. `"Buyer"`, `"Seller"`) |

#### Success Response — `201 Created`

```json
{
  "success": true,
  "data": {
    "contract": {
      "id": "c1d2e3f4-...",
      "title": "Vendor Agreement",
      "description": "Annual vendor agreement with Acme Corp",
      "startDate": "2026-01-01T00:00:00.000Z",
      "endDate": "2026-12-31T00:00:00.000Z",
      "status": "DRAFT",
      "createdById": "a1b2c3d4-...",
      "deletedAt": null,
      "createdAt": "2026-04-10T12:00:00.000Z",
      "updatedAt": "2026-04-10T12:00:00.000Z",
      "parties": [
        { "id": "p1...", "name": "Acme Corp", "email": "legal@acme.com", "role": "Vendor" },
        { "id": "p2...", "name": "Jane Smith", "email": "jane@example.com", "role": "Client" }
      ],
      "createdBy": { "id": "a1b2c3d4-...", "name": "Jane Smith", "email": "jane@example.com" }
    }
  }
}
```

#### Error Responses

| Status | Code | Cause |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Missing/invalid fields or `endDate` before `startDate` |
| 401 | `UNAUTHENTICATED` | Missing or invalid access token |

---

### GET /api/contracts/:id

Returns the full detail of a single contract, including its parties and creator.

**Auth required:** Bearer token

**RBAC:** User must be the contract owner or have `ADMIN` role.

#### Path Parameters

| Parameter | Type | Description |
|---|---|---|
| `id` | UUID string | The contract ID |

#### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "contract": {
      "id": "c1d2e3f4-...",
      "title": "Vendor Agreement",
      "description": "Annual vendor agreement with Acme Corp",
      "startDate": "2026-01-01T00:00:00.000Z",
      "endDate": "2026-12-31T00:00:00.000Z",
      "status": "ACTIVE",
      "createdById": "a1b2c3d4-...",
      "deletedAt": null,
      "createdAt": "2026-04-01T10:00:00.000Z",
      "updatedAt": "2026-04-05T14:00:00.000Z",
      "parties": [
        { "id": "p1...", "name": "Acme Corp", "email": "legal@acme.com", "role": "Vendor" }
      ],
      "createdBy": { "id": "a1b2c3d4-...", "name": "Jane Smith", "email": "jane@example.com" }
    }
  }
}
```

#### Error Responses

| Status | Code | Cause |
|---|---|---|
| 401 | `UNAUTHENTICATED` | Missing or invalid access token |
| 403 | `FORBIDDEN` | Caller does not own the contract and is not Admin |
| 404 | `NOT_FOUND` | Contract does not exist or is soft-deleted |

---

### PUT /api/contracts/:id

Updates a contract. All fields are optional — only send the fields you want to change. If `parties` is included, the entire parties list is **replaced** atomically. Every update creates a new version snapshot.

**Auth required:** Bearer token

**RBAC:** User must be the contract owner or have `ADMIN` role.

> See [Status Transition Rules](#status-transition-rules) for allowed `status` changes.

#### Path Parameters

| Parameter | Type | Description |
|---|---|---|
| `id` | UUID string | The contract ID |

#### Request Body

All fields optional. At least one field should be provided.

```json
{
  "title": "Vendor Agreement (Revised)",
  "status": "ACTIVE",
  "parties": [
    { "name": "Acme Corp", "email": "legal@acme.com", "role": "Vendor" },
    { "name": "Jane Smith", "email": "jane@example.com", "role": "Client" },
    { "name": "Bob Jones", "email": "bob@example.com", "role": "Witness" }
  ]
}
```

| Field | Type | Validation |
|---|---|---|
| `title` | string | 1–300 characters |
| `description` | string | Max 5000 characters |
| `startDate` | ISO date string | Any valid date |
| `endDate` | ISO date string | Must be after `startDate` if both provided |
| `status` | string | Must be a valid transition from current status |
| `parties` | array | 1–20 items. Replaces the full parties list if provided. |

#### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "contract": { "...updated contract object..." },
    "previousStatus": "DRAFT"
  }
}
```

#### Error Responses

| Status | Code | Cause |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid field values |
| 401 | `UNAUTHENTICATED` | Missing or invalid access token |
| 403 | `FORBIDDEN` | Caller does not own the contract and is not Admin |
| 404 | `NOT_FOUND` | Contract does not exist or is soft-deleted |
| 422 | `INVALID_STATUS_TRANSITION` | The requested status change is not allowed |

---

### DELETE /api/contracts/:id

Soft-deletes a contract by setting `deletedAt`. The contract is hidden from all list/detail responses but data is preserved in the database (including audit logs).

**Auth required:** Bearer token

**RBAC:** User must be the contract owner or have `ADMIN` role.

**Deletion rules:**
- `USER` role: can only delete contracts with status `DRAFT`
- `ADMIN` role: can delete `DRAFT` or `ACTIVE` contracts
- Neither role can delete `EXECUTED` contracts (they are permanent records)

#### Path Parameters

| Parameter | Type | Description |
|---|---|---|
| `id` | UUID string | The contract ID |

#### Success Response — `200 OK`

```json
{
  "success": true,
  "data": null
}
```

#### Error Responses

| Status | Code | Cause |
|---|---|---|
| 401 | `UNAUTHENTICATED` | Missing or invalid access token |
| 403 | `FORBIDDEN` | Caller does not own the contract and is not Admin |
| 404 | `NOT_FOUND` | Contract does not exist or already deleted |
| 422 | `INVALID_STATUS_TRANSITION` | Tried to delete an `EXECUTED` contract, or a User tried to delete a non-`DRAFT` contract |

---

## Version History Routes

Every time a contract is created or updated, a full JSON snapshot is saved. These routes expose that history.

---

### GET /api/contracts/:id/versions

Returns a list of all version snapshots for a contract, newest first. The full `snapshot` JSON is excluded from the list — use the detail endpoint to retrieve it.

**Auth required:** Bearer token

**RBAC:** User must be the contract owner or have `ADMIN` role.

#### Path Parameters

| Parameter | Type | Description |
|---|---|---|
| `id` | UUID string | The contract ID |

#### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "versions": [
      {
        "id": "v2...",
        "versionNumber": 2,
        "createdAt": "2026-04-05T14:00:00.000Z",
        "changedBy": { "id": "a1b2c3d4-...", "name": "Jane Smith", "email": "jane@example.com" }
      },
      {
        "id": "v1...",
        "versionNumber": 1,
        "createdAt": "2026-04-01T10:00:00.000Z",
        "changedBy": { "id": "a1b2c3d4-...", "name": "Jane Smith", "email": "jane@example.com" }
      }
    ]
  }
}
```

#### Error Responses

| Status | Code | Cause |
|---|---|---|
| 401 | `UNAUTHENTICATED` | Missing or invalid access token |
| 403 | `FORBIDDEN` | Caller does not own the contract and is not Admin |
| 404 | `NOT_FOUND` | Contract does not exist |

---

### GET /api/contracts/:id/versions/:versionId

Returns the full snapshot of a specific version, including the complete contract state and parties list at the time of that change.

**Auth required:** Bearer token

**RBAC:** User must be the contract owner or have `ADMIN` role.

#### Path Parameters

| Parameter | Type | Description |
|---|---|---|
| `id` | UUID string | The contract ID |
| `versionId` | UUID string | The version ID (from the versions list) |

#### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "version": {
      "id": "v2...",
      "versionNumber": 2,
      "createdAt": "2026-04-05T14:00:00.000Z",
      "snapshot": {
        "id": "c1d2e3f4-...",
        "title": "Vendor Agreement (Revised)",
        "description": "Annual vendor agreement with Acme Corp",
        "startDate": "2026-01-01T00:00:00.000Z",
        "endDate": "2026-12-31T00:00:00.000Z",
        "status": "ACTIVE",
        "createdById": "a1b2c3d4-...",
        "parties": [
          { "name": "Acme Corp", "email": "legal@acme.com", "role": "Vendor" }
        ],
        "capturedAt": "2026-04-05T14:00:00.000Z"
      },
      "changedBy": { "id": "a1b2c3d4-...", "name": "Jane Smith", "email": "jane@example.com" }
    }
  }
}
```

#### Error Responses

| Status | Code | Cause |
|---|---|---|
| 401 | `UNAUTHENTICATED` | Missing or invalid access token |
| 403 | `FORBIDDEN` | Caller does not own the contract and is not Admin |
| 404 | `NOT_FOUND` | Contract or version does not exist |

---

## Audit Log Routes

---

### GET /api/contracts/:id/audit

Returns a paginated activity timeline for a contract. Includes all create, update, status change, and delete events. Audit logs are preserved even after a contract is soft-deleted.

**Auth required:** Bearer token

**RBAC:** User must be the contract owner or have `ADMIN` role.

#### Path Parameters

| Parameter | Type | Description |
|---|---|---|
| `id` | UUID string | The contract ID |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `page` | integer | No | `1` | Page number |
| `limit` | integer | No | `50` | Results per page (max `100`) |

#### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log1...",
        "action": "CONTRACT_STATUS_CHANGED",
        "entityType": "contract",
        "entityId": "c1d2e3f4-...",
        "diff": {
          "before": { "status": "DRAFT" },
          "after": { "status": "ACTIVE" }
        },
        "ipAddress": "127.0.0.1",
        "createdAt": "2026-04-05T14:00:00.000Z",
        "actor": { "id": "a1b2c3d4-...", "name": "Jane Smith", "email": "jane@example.com" }
      },
      {
        "id": "log2...",
        "action": "CONTRACT_CREATED",
        "entityType": "contract",
        "entityId": "c1d2e3f4-...",
        "diff": null,
        "ipAddress": null,
        "createdAt": "2026-04-01T10:00:00.000Z",
        "actor": { "id": "a1b2c3d4-...", "name": "Jane Smith", "email": "jane@example.com" }
      }
    ]
  },
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 50,
    "totalPages": 1,
    "hasNextPage": false
  }
}
```

**Possible `action` values:**

| Action | Description |
|---|---|
| `CONTRACT_CREATED` | Contract was first created |
| `CONTRACT_UPDATED` | Non-status fields were changed |
| `CONTRACT_STATUS_CHANGED` | Contract status was transitioned |
| `CONTRACT_DELETED` | Contract was soft-deleted |

#### Error Responses

| Status | Code | Cause |
|---|---|---|
| 401 | `UNAUTHENTICATED` | Missing or invalid access token |
| 403 | `FORBIDDEN` | Caller does not own the contract and is not Admin |
| 404 | `NOT_FOUND` | Contract does not exist |

---

## Status Transition Rules

Contract status follows a strict lifecycle. The allowed transitions depend on the caller's role.

| From \ To | `DRAFT` | `ACTIVE` | `EXECUTED` | `EXPIRED` |
|---|---|---|---|---|
| `DRAFT` | — | User + Admin | Admin only | Admin only |
| `ACTIVE` | — | — | User + Admin | User + Admin |
| `EXECUTED` | — | — | — | — |
| `EXPIRED` | — | — | — | — |

**Rules:**
- `EXECUTED` and `EXPIRED` are terminal states — no further transitions are possible
- Attempting a disallowed transition returns `422 INVALID_STATUS_TRANSITION`
- Admins can force any valid transition

---

## Soft Delete Rules

Contracts are never permanently deleted from the database. A `DELETE` request sets `deletedAt` to the current timestamp.

| Caller Role | Can delete `DRAFT` | Can delete `ACTIVE` | Can delete `EXECUTED` | Can delete `EXPIRED` |
|---|---|---|---|---|
| `USER` (owner) | Yes | No | No | No |
| `ADMIN` | Yes | Yes | No | Yes |

- Soft-deleted contracts are invisible in all `GET` endpoints (list and detail)
- Audit logs for soft-deleted contracts remain accessible via `GET /api/contracts/:id/audit`
- There is no restore endpoint (by design — contact DB admin for recovery)
