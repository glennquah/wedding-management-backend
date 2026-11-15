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

## Dependency review

`npm ci --ignore-scripts` completed successfully. `npm audit` reported **69 advisories**: 2 critical, 30 high, 20 moderate, and 17 low. These counts include transitive and development dependencies and can change as the registry updates. Packages marked critical: `handlebars`, `proxy-addr`.

Dependency upgrades were not applied as part of the documentation/credential changes. Review `npm audit` and validate compatible fixes before operating a public deployment; some fixes require major-version changes.

## Critical dependency details

These are package advisory matches, not confirmed exploits in the application. Development-only packages can affect build tooling. Runtime exploitability depends on the vulnerable feature and inputs being reachable.

| Package | Locked versions | Dependency context | Critical advisories |
| --- | --- | --- | --- |
| `handlebars` | 4.7.8 | Includes runtime dependency | [Handlebars.js has JavaScript Injection via AST Type Confusion](https://github.com/advisories/GHSA-2w6w-674q-4c4q); [Handlebars: JavaScript Injection via AST Type Confusion in compile (bypass of CVE-2026-33937)](https://github.com/advisories/GHSA-8r5x-fm3f-whwj); [Handlebars: JavaScript Injection via Own Property Check Bypass](https://github.com/advisories/GHSA-p8wg-vrv2-v86f) |
| `proxy-addr` | 2.0.7 | Includes runtime dependency | [proxy-addr vulnerable to IP spoofing via IPv4-mapped IPv6 trust subnet](https://github.com/advisories/GHSA-jqcg-44mw-7w3h) |

The count is affected package entries, not a count of proven independent attacks. Update and test dependency fixes separately from this preparation.

## Validation

- Prisma client generation and `npm run build` passed.
- Diff whitespace checks passed; environment variants are ignored and the example template is visible to Git.
- Database migrations, seed execution, payment/email integrations, and e2e tests were not run against external services.

## Remaining release decisions

- Select a project license and confirm permission from all relevant contributors. No license was invented by this review.
- Confirm rights to bundled images, fonts, screenshots, and linked third-party media. In particular, frontend slideshow and Wedding Wrapped audio references require review.
- Review sample names/emails and third-party infrastructure identifiers before publishing. Screenshots selected for the frontend README avoid email/account-management tables; the report itself is not copied into either repository.
- Configure a private vulnerability-reporting channel and your own infrastructure before deployment.

This preparation does not change repository visibility, rotate deployed secrets, deploy applications, or rewrite Git history. Dependency fixes remain follow-up work.
