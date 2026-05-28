# ContractHub

**ContractHub** is a full-stack contract management platform for tracking agreements, stakeholders, and activity across their lifecycle. It pairs a modern React client with a secure Node.js API and PostgreSQL, and is designed and deployed as a **production-style** system suitable for real portfolio review.

For **endpoint-level detail** (routes, query parameters, status transition rules, error codes, and response envelopes), see the **[Contract Management API reference](backend/docs/API.md)** in the backend package.

---

## Live demo and deployment

The application is intended to run as a split deployment: a static or serverless frontend and a long-running API with a managed database.

| Surface | Hosting | Notes |
|--------|---------|--------|
| **Frontend** | [contract-management-dashboard-nine.vercel.app](https://contract-management-dashboard-nine.vercel.app) | Vercel |
| **Backend API** | AWS App Runner/ECS | REST API; routes are served from this origin. |
| **Database** | AWS RDS (PostgreSQL) | Managed instance; schema managed with Prisma migrations. |

Ensure the hosted database has been migrated and (for demo accounts) seeded so login and sample data behave as documented below.

---

## Demo credentials

All seeded demo accounts use the same password: **Password123!**

| Role | Email | Access |
|------|--------|--------|
| **Admin** | [admin@contracthub.com](mailto:admin@contracthub.com) | Full visibility and management of contracts, parties, users, and reporting views. |
| **User** | [alice@contracthub.com](mailto:alice@contracthub.com) | Standard user; sees and manages contracts according to ownership and role rules enforced by the API. |
| **User** | [bob@contracthub.com](mailto:bob@contracthub.com) | Same password; standard user role. |
| **User** | [carol@contracthub.com](mailto:carol@contracthub.com) | Same password; standard user role. |
| **User** | [david@contracthub.com](mailto:david@contracthub.com) | Same password; standard user role. |

If sign-in fails in production, the database may not yet include seeded users; run the project seed against that environment’s database URL (or register a new account via the API) following your deployment docs.

---

## Features

### Authentication and security

- **User registration (signup)** and **login**, backed by **JWT-based access** tokens for API authorization, with **HttpOnly, rotating refresh tokens** stored server-side and delivered via secure cookies for session continuity (session-like UX with token-based security).
- **Role-based access control** (admin vs user) enforced on protected routes and API handlers.
- Password hashing, input validation, and sensible API hardening (for example, security-oriented HTTP headers and rate limiting on sensitive endpoints).

### Contract management

- **Create** contracts with title, description, start and end dates, **status**, and **parties** (at least one party required in the product rules).
- **Read** and **update** contracts; editable fields follow the same model as create. **Status changes are validated** on the server against allowed transitions for standard users; invalid transitions return a clear API error. **Admin** users may change status without those transition checks where the API permits it.
- **Soft delete** only: contracts are marked deleted and hidden from normal lists while history and audit remain explainable.
- **Contract detail** surfaces the full record (metadata, parties, dates, status) in one place.

### Contract listing (search, filters, sort, pagination)

- **Search** matches **contract title** and **party name** (server-backed, so results stay consistent with permissions).
- **Filters** include **status** and a **start-date range** (contracts whose start date falls within the selected window; API query parameters mirror the UI).
- **Sorting** by **created date** and **updated date**, each ascending or descending.
- **Pagination** on the contracts list keeps payloads small and matches list API query parameters.

### Version history

- Each meaningful **update** can produce a **version snapshot** (structured record of the contract and its parties at that point in time).
- Users can **inspect prior versions** from the contract detail experience and run a **basic comparison** between two versions to see what changed (field-level oriented diff, suitable for review—not a full legal redline engine).

### Parties management

- Attach **parties** (stakeholders) to contracts with names, optional contact details, and flexible role labels (for example buyer, seller, witness).
- Dedicated flows to browse and inspect party detail in line with contract data.

### User management (admin)

- Admins can **list and inspect users**, adjust roles and activation where supported, and operate within the same RBAC model as the rest of the app.

### Dashboard and reports

- **Dashboard** summarises key metrics and contract health.
- **Reports** combine filtering, pagination-friendly contract lists, **status distribution** visualisations, and export-oriented actions for analysis.

### Audit and activity

- **Audit logging** records significant actions (auth events, contract lifecycle changes, user-related events) with actor, entity, optional diffs, and timestamps.
- **Per-contract activity timelines** expose audit entries where permissions allow, complementing stored **contract versions** (optional depth in a minimal brief, first-class in this implementation).

---

## Tech stack

### Frontend

- **JavaScript** — React application source is **JavaScript** (no TypeScript), per project constraints and for straightforward onboarding.
- **React** (Vite)
- **Tailwind CSS**
- **shadcn/ui-style** components (Radix UI primitives, class utilities)
- **TanStack Query** (React Query) for server state
- **Redux Toolkit** for client state (auth, UI, notifications), as required for predictable global UI state
- **React Router** for routing
- **Framer Motion** for motion and transitions
- **Responsive** layout and **usability-first** UI (clear hierarchy, loading and empty states, no decorative-heavy chrome)

### Backend

- **Node.js** with **Express**
- **JWT** access tokens and **cookie-based** refresh token rotation
- **Zod** for **input validation** on incoming requests
- **Central error-handling middleware** so failures map to **consistent HTTP status codes** and JSON error bodies (validation, auth, not found, conflict, and server errors are distinguished)
- **Prisma** with **PostgreSQL** (via the `pg` driver adapter)

### Database

- **PostgreSQL** (hosted on AWS RDS in the reference deployment)
- **Relational schema** (users, contracts, parties, version snapshots, refresh tokens, audit logs) with **foreign keys and indexes** rather than embedding sub-documents in a single document store.
- **Why relational instead of embedding:** contracts share cross-cutting concerns—list filtering by party name and status, reporting aggregates, referential integrity for parties and versions, and append-only audit rows—all map naturally to **normalized tables**, **joins**, and **constraints**. Embedding contract+parties+versions in one document would complicate partial updates, enforce inconsistent invariants, and make indexed search across parties and dates harder at scale. PostgreSQL matches the assignment options and fits OLTP-style workloads for this domain.

---

## Tools and libraries

- **Prisma** — schema, migrations, type-safe data access  
- **Axios** — HTTP client from the frontend to the REST API  
- **React Hook Form** with **Zod** resolvers — forms and shared validation patterns  
- **Recharts** — charts on dashboard and reports  
- **react-hot-toast** — lightweight user feedback  
- **TanStack Table** — table-heavy list views  
- **date-fns** — date handling in the UI  
- **Vitest** and Testing Library on the frontend; **Jest** and **Supertest** on the backend for automated tests  

---

## Architecture overview

The **frontend** and **backend** are separate deployables that communicate over **HTTPS** using a **REST API**. The UI does not talk to the database directly; all persistence goes through the API, which enforces **authentication**, **authorization**, and **validation**.

**API design:** Resources are **REST-oriented** (nouns, standard verbs, predictable paths). Responses use a **consistent JSON envelope** for success and error cases. **HTTP status codes** carry semantics (for example, 200/201 for success, 400 for validation, 401/403 for authz, 404 for missing resources, 409 for conflicts, 500 for unexpected server failure). **List endpoints** support **pagination** and **filtering** parameters that mirror the contract listing experience (search, status, dates, sort).

**Authentication** uses a short-lived **access token** (JWT) for API requests and a **refresh token** kept out of JavaScript land via **HttpOnly cookies**, rotated on use to reduce replay risk. **Authorization** checks the caller’s **role** and **resource ownership** (for example contract creator vs admin) before returning or mutating data.

**Role-based access** flows from the user record through middleware and services, so list endpoints, detail views, and mutations stay consistent with the same rules.

---

## Deployment

- **Frontend** — built with Vite and deployed on **Vercel** (or any static host), with environment variables pointing the client at the API base URL.  
- **Backend** — deployed as a Docker container on **AWS**; production startup applies **database migrations** before accepting traffic.  
- **PostgreSQL** — provisioned on **AWS RDS**; connection strings and secrets live in **environment-based configuration** only (never committed).  
- **CORS and cookies** — production requires aligned API origins, cookie security flags, and frontend API URL configuration so sessions work across domains.

---

## Key highlights

- **Production-oriented layout**: clear separation of features, shared UI primitives, and service layers rather than a single monolithic script.  
- **Security-conscious auth**: JWT plus rotating refresh tokens, hashed refresh token storage, and constant-time password checks where it matters.  
- **Rich domain model**: contracts, parties, soft delete, validated lifecycle, versioning with comparison, and audit trails support realistic workflows and reviewer questions.  
- **Documented API**: machine- and human-readable contract for integrators and assessors ([API.md](backend/docs/API.md)).  
- **Polished UX**: responsive shell, loading states, accessible-style components, and motion used with restraint.  
- **End-to-end story**: from login through admin and user journeys, search and reports, the app demonstrates breadth suitable for hiring conversations.

---

## Future improvements

- **Notifications** — in-app or email digests for renewals, status changes, and assignments  
- **Deeper analytics** — trend views, cohorts, and custom date ranges  
- **File uploads** — attach PDFs or executed copies to contract records  
- **Real-time updates** — websockets or server-sent events for collaborative edits  
- **Fine-grained permissions** — teams, delegated access, or contract-level sharing rules  

---

## Local development

Clone the repository, install dependencies in `frontend` and `backend`, configure environment files from the provided examples, run PostgreSQL locally or point `DATABASE_URL` at a dev instance, apply migrations, optionally seed demo data, then start the API and Vite dev server. See the `frontend` and `backend` package manifests for scripts (development, test, lint, database, and seed). Use **[backend/docs/API.md](backend/docs/API.md)** when exercising or extending REST behavior.

---

*ContractHub / Contract Management Dashboard — full-stack portfolio system.*
