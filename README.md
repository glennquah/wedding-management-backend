# Knotly · Wedding Management API

The NestJS API behind Knotly, an NUS IS4108 AI Solutioning Capstone wedding planning platform. It connects couples, collaborators, guests, vendors, and platform administrators through a shared PostgreSQL data model.

Use it with the [frontend monorepo](https://github.com/glennquah/wedding-management-frontend-admin).

## Features

- JWT authentication, refresh tokens, and role-based access for platform users.
- Wedding and collaborator management, guest groups, RSVPs, attendance, and seating arrangements.
- Customizable microsites, photo albums, guestbooks, gift wishlists, and gratitude cards.
- Vendor onboarding, listings, carts, orders, ratings, Stripe payments, cash gifts, and payouts.
- Email templates, invitations, notification history, planning checklists, and analytics.
- AI-assisted content generation and integrations for seating optimization, recommendations, date scheduling, and photo processing.
- Google Calendar integration and an optional partner-platform API.

## Stack and structure

NestJS 10, TypeScript, Prisma 6, PostgreSQL 16, Swagger/OpenAPI, Jest, Stripe, SendGrid, Google APIs, and OpenAI. AWS CDK infrastructure and a Lambda entry point are included.

```text
src/                Feature modules, controllers, services, DTOs, and auth guards
prisma/schema.prisma Database schema
prisma/migrations/  Versioned database migrations
prisma/seeds/       Development seed data
public/             Static assets
infra/              AWS CDK infrastructure
test/              Integration/e2e tests and service mocks
```

The [entity relationship diagram](wedding_management_erd.svg) documents the data model. Deployment diagrams are available in `deployment_architecture.drawio`.

## Local setup

Prerequisites: Node.js 22, npm, and Docker with Compose. Use your own development accounts for Stripe, OpenAI, SendGrid, and Google integrations.

```bash
npm ci
cp .env.example .env
```

Edit `.env` before continuing. Generate independent JWT signing keys using `openssl rand -base64 32`. The example database credentials are local development values only. Stripe and OpenAI clients initialize during startup, and the email service requires a nonempty SendGrid key, so configure all three before starting even when you are not exercising those features. Email delivery also requires a verified sender; inspect the sender configuration in `src/email-notification` for your deployment.

```bash
docker compose up -d
npm run generate:prisma:types
npx prisma migrate deploy
npm run dev
```

- API: http://localhost:8080
- Swagger UI: http://localhost:8080/api
- OpenAPI JSON: http://localhost:8080/api-json

On Windows, use `docker compose -f docker-compose.windows.yml up -d`. To stop the database while retaining data, run `docker compose down`. The existing npm `docker:dev:down` script includes `-v` and deletes the local database volume.

### Optional development data

```bash
npm run prisma:seed:dev
```

Run seeds only against an isolated local database. They include predictable demo passwords and project-specific sample data; never seed a public deployment with those accounts. Review the seed files before running them. Use Prisma Studio (`npm run prisma:gui`) to inspect local data.

### External integrations

| Configuration | Purpose |
| --- | --- |
| `DATABASE_URL`, `POSTGRES_*` | Prisma connection and local Compose database |
| `JWT_SECRET_KEY`, `JWT_REFRESH_KEY` | Independent access and refresh signing keys |
| `FRONTEND_URL`, `ADMIN_FRONTEND_URL` | Customer and platform-admin links |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Payments and webhook signature verification |
| `OPENAI_API_KEY` | AI content generation |
| `SENDGRID_API_KEY` | Transactional email |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | Calendar OAuth |
| `FASTAPI_URL` | Separate AI service, not included in this repository |
| `DATING_PARTNER_API_KEY`, `PARTNER_*` | Optional partner integration and commissions |

Confirm the Google callback URL against the calendar controller and your OAuth registration. Without the AI service, its optimization, recommendation, and photo endpoints will fail. Ordinary API/database development does not provide those models.

To forward Stripe test webhooks locally, authenticate the Stripe CLI and run `npm run stripe:start`. Copy the listener's signing secret into your local `STRIPE_WEBHOOK_SECRET`, then restart the API.

## Development and checks

| Command | Purpose |
| --- | --- |
| `npm run dev` | Generate Prisma client and start watch mode |
| `npm run build` | Compile the NestJS application |
| `npm run lint:check` | Check lint without modifying files |
| `npm test -- --runInBand` | Run unit tests |
| `npm run test:e2e` | Run the e2e suite |
| `npm run test:cov` | Collect coverage |
| `npm run prisma:gui` | Open Prisma Studio |

Review `test/jest-e2e.json` and test setup before running integration tests; use a disposable database and test-service configuration. Prisma migration generation and schema push modify your database; use the checked-in migrations for initial setup.

## Deployment

Review `infra/`, `src/lambda.ts`, and `.github/workflows` before deploying. The existing infrastructure and CORS origins are specific to the original project. Configure your own AWS account, region, networking, database, allowed frontend origins, sender addresses, and secrets. Never reuse local seed credentials in production.

## Contributing and security

Include the behavior change and validation steps in pull requests. Update API DTOs and Swagger annotations alongside endpoint changes, and regenerate the frontend client when needed. Never post secrets or real user data in public issues. See [SECURITY.md](SECURITY.md).

## License and assets

No project license has been selected; `package.json` currently declares `UNLICENSED`. Maintainers must choose an open-source license and confirm contributor and asset rights before release. Dependency licenses do not license this project's own code.

## Release review

See [the open-source preparation review](docs/OPEN_SOURCE_REVIEW.md) for credential-scan findings, dependency advisories, validation, and remaining release decisions.
