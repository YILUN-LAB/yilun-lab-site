# Staging and Keystatic retirement

Retired on 2026-09-16. Website content is now maintained directly in MDX and assets,
with agent-assisted changes reviewed through ordinary Vercel Preview deployments.
`main` remains the production branch. The editor, OAuth endpoints, publish API,
automatic main-to-staging synchronization, and unused save/recovery groundwork
are deprecated and removed from the active source tree.

## Source archives

Annotated tags preserve the original files, dependencies, tests, and full history:

| Tag                                | Commit                                     | Contents                                                             |
| ---------------------------------- | ------------------------------------------ | -------------------------------------------------------------------- |
| `archive/staging-2026-09-16`       | `61d24fc561cdefc6a1ef5c0e7c1eae822604d01d` | Latest remote staging, including all artwork and the deployed editor |
| `archive/keystatic-cms-2026-09-16` | `3802e81b1b24a3ba7bb42a723ef9c9ddab8713da` | Local feature branch, including its nine previously unpushed commits |

At retirement, staging and main (`10c60c32a145066f56223b1ead0c07b9ccf9d459`) had
identical Git trees. Staging's five additional commits were synchronization merges.
All nine feature-branch patches were already present in main under other hashes.
No unpublished project content needed merging.

A separately stored local backup contains `website-before-retirement.bundle`
(complete Git history, verified with `git bundle verify`), `staging-source.tar.gz`,
`refs.json`, and snapshots of the pre-existing local documentation changes. It is
stored outside the working repository in `../Yilun-Lab-Archives/2026-09-16-staging-retirement/`.
Secrets and environment files are not included in the source archive.

## Inspect or recover

```sh
git fetch origin --tags
git worktree add --detach ../yilun-staging-archive archive/staging-2026-09-16
```

Inspect this detached worktree without pushing or deploying it. For independent
recovery from the offline backup:

```sh
git clone /path/to/website-before-retirement.bundle recovered-yilun-site
git -C recovered-yilun-site switch --detach archive/staging-2026-09-16
```

Do not restore the archived synchronization workflow or credentials to production.
Any decision to reactivate the editor requires an explicit new deployment plan.
The current `vercel.json` disables automatic deployment of the retired branch names;
ordinary feature-branch previews remain enabled.

## Vercel configuration at retirement

- Team: `yiilunzhan-4453s-projects`.
- Project: `yilun-lab-site` (`prj_rQm12RkrGop2ldTeDZvIipL7wxlE`).
- Git repository: `YILUN-LAB/yilun-lab-site`; production branch: `main`.
- Production domain: `www.yilunlab.com`; apex `yilunlab.com` redirects to it.
- Former editor domain: `edit.yilunlab.com`, attached to Preview branch `staging`.
- Latest observed staging deployment: `BPcfUu7JWZuu8GMieG2tV82cG3Dg`.
- Production deployment before retirement: `4yWffjq4ER66Gq3GQdHwLWfsmJoa`.
- No Deploy Hooks were configured. Preview branch tracking covered all unassigned branches.

The following eight variables were scoped to Preview only. Their names are
recorded for historical context; secret values are intentionally not archived:

- `PUBLIC_KEYSTATIC_STORAGE`
- `PUBLIC_KEYSTATIC_BRANCH`
- `PUBLIC_KEYSTATIC_REPO_OWNER`
- `PUBLIC_KEYSTATIC_REPO_NAME`
- `KEYSTATIC_GITHUB_CLIENT_ID`
- `KEYSTATIC_GITHUB_CLIENT_SECRET`
- `KEYSTATIC_SECRET`
- `PREVIEW_PASSWORD`

`RESEND_API_KEY` belongs to the active contact form and must remain configured.
Preview indexing now depends on `VERCEL_ENV=preview`, independently of passwords.
Existing Vercel deployments are immutable historical artifacts: changing code or
environment variables only affects new deployments. Deployment history is not a
credential backup or a guarantee that the old editor is inaccessible.

## Service retirement outcome

- `edit.yilunlab.com` now returns a 307 redirect to `https://www.yilunlab.com/`.
  Its staging branch binding has been removed; the domain remains as a reversible
  redirect for old bookmarks.
- Historical deployments are retained in Vercel. Standard Vercel Authentication
  now requires team login for non-production-custom-domain access. An anonymous
  request to the old staging branch URL was verified to redirect to Vercel SSO.
  This is protected historical hosting, not deletion of the old executable builds.
- The eight deprecated Preview variables remain unchanged at the owner's request.
  Current code does not read them. They are not needed for new previews.
- Both old local branches and their remote branches are retired after the source
  archive tags were pushed. `main` is the active long-lived branch.
- The contact form key, production domains, and ordinary feature-branch preview
  capability remain in place.

## Validation

`npm run check`, `npm run lint`, and `npm test` passed (8 tests). Preview and
production builds passed. All 15 preview HTML pages contained noindex; only
`/connect` retained noindex in production. Public routes returned 200 and retired
editor/API routes returned 404 in local HTTP checks, including POST `/api/publish`.
Browser checks covered the homepage, functioning Works filters, hero video,
mobile/tablet/desktop layout widths, and the retired editor's 404 page. A stale
local dependency cache caused initial hydration errors when build and dev ran
together; a fresh dev server resolved them, with no errors in the fresh session.
Project MDX and public assets are unchanged. No real contact email was sent.

Dependency removal pruned 233 packages without changing remaining package versions.
The package manager still reported 29 audit findings; broad dependency upgrades
were outside this retirement change.

The implementation was pushed in commit `e2e853f` and deployed successfully to
Production as [deployment 99qiuZnBB](https://vercel.com/yiilunzhan-4453s-projects/yilun-lab-site/99qiuZnBBWZUE82ibu9b8neH1Bbo).
Vercel confirmed Ready / Current on `www.yilunlab.com`. GitHub now has only `main`
as an active branch; both annotated archive tags remain available.
