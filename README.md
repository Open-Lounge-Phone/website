# Open Lounge Phone website

The project site at [openloungephone.app](https://openloungephone.app), built with
[Astro Starlight](https://starlight.astro.build/) and served as static assets by Cloudflare
Workers.

The site follows the main repository,
[Open-Lounge-Phone/open-lounge-phone](https://github.com/Open-Lounge-Phone/open-lounge-phone),
at its latest `main` (a git submodule at `main/`; every build fetches it first).
`scripts/sync-docs.ts` copies into `src/content/docs/` (gitignored), rewriting links:

- the reference: the README, `docs/`, `hardware/` and `firmware/` pages;
- the user guides: getting started and the how-tos, from the main repository's `docs/site/`
  (edit them there, with the code they describe);
- the website's own pages from `src/content-src/` (home, uses, about, versions, funding).

Hand-written pages can use `{{facts}}` worked out at build time (`facts()` in the sync script):
the released and `main` server versions, the firmware versions, the docs commit and date, and the
public hub's live version. The funding figures come from `main/packages/core/src/funding.ts`, the
same code the hub and the companion app use.

## Build

Requires Node 22+.

```sh
git clone --recursive https://github.com/Open-Lounge-Phone/website
cd website
npm install
npm run build     # sync the docs, build to dist/, then fail on any broken internal link
npm run dev       # local preview
```

Already cloned without `--recursive`? Run `git submodule update --init`.

Builds use the main repository's latest `main`, so there's nothing to bump. To build from the
submodule's recorded commit instead (say, offline), set `OLP_DOCS_PINNED=1`.

Build-time settings (environment variables): `SPONSOR_URL` (a GitHub Sponsors link, or `none`
to hide the button), and `FUNDING_BALANCE_USD`, `BASE_COST_USD_PER_MONTH`,
`COST_PER_ACTIVE_USER_USD_PER_MONTH` for the hub's funding figures.

## Deploy

```sh
npm run deploy    # build, then `wrangler deploy` (Worker `openloungephone-site`)
```

`wrangler.jsonc` serves `dist/` on the `openloungephone.app` custom domain; deploying needs
`wrangler login` to the Cloudflare account that owns that zone.

GitHub Actions (`.github/workflows/deploy.yml`) does this by itself: on every push here, on
request, and every hour, deploying only when this repository, the main repository's `main` or the
hub's version changed. It needs the repository secrets `CLOUDFLARE_API_TOKEN` (allowed to edit
Workers scripts) and `CLOUDFLARE_ACCOUNT_ID`; without them it builds and checks links only.

## Organization files

`org/` is the source of the [Open-Lounge-Phone/.github](https://github.com/Open-Lounge-Phone/.github)
repository (the organization profile and default `FUNDING.yml`), which is the published copy.
See [org/README.md](org/README.md).

## License

AGPL-3.0-or-later, like the main repository's software.
