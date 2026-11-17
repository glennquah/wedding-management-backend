# Open-source preparation review

Reviewed on 2026-11-16, starting at `94618fb`. This review covers the checked-out files and all Git refs fetched by a normal clone. It does not inspect GitHub Actions logs/artifacts, Git LFS payloads, release attachments, deleted/unreachable objects, or refs not fetched by the clone. It is a credential and documentation review, not a complete application security audit.

## Credential scans

Gitleaks 8.30.1 was run with redacted output:

```bash
gitleaks git . --log-opts=--all --redact
gitleaks dir . --redact
```

No provider API-key matches were identified. The working-tree scan after the source fixes reported zero findings. A clean scan is not proof that every secret has been found; manual review also identified issues below.

The history scan reported one finding: the Nest starter README's dummy CircleCI badge token (`abc123def456`) in commit `25312ce519df04c53b013681677358cf6f2b797a`. It is an upstream documentation example, not an identified operational credential. The starter README has been replaced.

No tracked real `.env` files were found in current files or fetched history. Ignore rules now cover all `.env.*` variants while allowing `.env.example`.

Development seeds and the CI PostgreSQL service contain predictable example passwords. These are development fixtures, not identified production credentials. Never run the seed accounts in a public deployment. If any deployed accounts use these passwords, reset or remove them before publication.

## Dependency remediation

The initial audit reported 69 affected package entries, including 2 critical and 30 high. The updated dependency tree has **zero critical and zero high findings**. It retains **2 moderate and 12 low package entries**, caused by two underlying advisories:

| Underlying package | Remaining issue | Status |
| --- | --- | --- |
| CDK's bundled `minimatch` | [Glob pattern amplification](https://github.com/advisories/GHSA-g3hv-75wg-m249) (moderate) | Latest AWS CDK 2.277.0 still bundles the affected version. npm overrides do not replace bundled dependencies. This is infrastructure tooling; avoid untrusted glob patterns. Await a patched CDK bundle. |
| `deepmerge` | [Prototype poisoning of returned objects](https://github.com/advisories/GHSA-gcqx-w48m-w2h4) (low) | No patched release is published. It is pulled in by SendGrid and test/build tooling. Avoid passing untrusted objects to merge helpers and track the upstream fix. |

These remaining entries are not suppressed or treated as resolved. Downgrading CDK as npm audit suggests reintroduces higher-severity issues, so the latest release is retained. No unreviewed fork or incompatible merge-library substitution was added to hide the low-severity findings.

Changes include:

- Upgraded Handlebars and other compatible dependencies to patched releases; moved NestJS to 11.2.10 with Express 5 and Swagger 11.4.8.
- Updated Google APIs, Prisma within v6, webpack, copy-webpack-plugin, and the Nest CLI/schematics. Replaced the unnecessary `aws-lambda` runtime dependency with `@types/aws-lambda` and a type-only import.
- Added scoped security overrides for deepmerge-ts, minimatch, glob, qs, picomatch, Ajv, and tmp. Overrides are tracked in `package.json` and must be re-evaluated when parent dependencies catch up.
- Updated Swagger array/object declarations for the new schema types. Both HTTP entry points explicitly preserve Express 4's nested query parsing behavior under Express 5.
- Raised the development/CI Node baseline to 22.22.3 and the Lambda runtime to Node.js 22.
- CI audits dependencies at the high severity threshold, uses local-only JWT test values, and Dependabot checks updates weekly.

## Validation

- Nest compilation and ESLint checks passed after the upgrade. The first GitHub run hit the linter’s default 2 GB heap because the old config loaded the entire TypeScript project. Lint now uses the same enabled syntax rules without that unnecessary project load, and passed with a 2 GB heap locally; build/test CI receives a 4 GB heap.
- All 6 e2e suites and 59 tests passed against a disposable local PostgreSQL 16 database with placeholder integration credentials and the existing mocked email service.
- The Lambda webpack bundle compiled successfully.
- Source scans, diff whitespace checks, local documentation links, and clean install/lockfile consistency were checked.
- Real Stripe, email, Google OAuth, AI services, AWS deployments, and production data were not used.

### Existing database migration gap

Applying only the checked-in migrations to an empty database leaves the current Prisma schema incomplete. The first e2e run exposed the missing `Admin.isDatingPartnerRegistered` field; reviews, commissions, and Wedding Wrapped schema changes are also absent from migration history. Tests use `prisma db push` only against the disposable local database, as the existing CI already does. The README now explains this local setup and the need to reconcile migration history before production deployment. This dependency PR does not invent or apply production migrations.

## Remaining release decisions

- Select a project license and confirm permission from all relevant contributors. No license was invented by this review.
- Confirm rights to bundled images, fonts, screenshots, and linked third-party media. In particular, frontend slideshow and Wedding Wrapped audio references require review.
- Review sample names/emails and third-party infrastructure identifiers before publishing. Screenshots selected for the frontend README avoid email/account-management tables; the report itself is not copied into either repository.
- Configure a private vulnerability-reporting channel and your own infrastructure before deployment.

This preparation does not change repository visibility, rotate deployed secrets, deploy applications, or rewrite Git history. Deployment credential rotation and license selection remain follow-up work.
