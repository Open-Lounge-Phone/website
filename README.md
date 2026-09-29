# Open Lounge Phone website

The project site at [openloungephone.app](https://openloungephone.app), built with
[Astro Starlight](https://starlight.astro.build/) and served as static assets by Cloudflare
Workers.

Most pages are generated from the docs in the main repository,
[Open-Lounge-Phone/open-lounge-phone](https://github.com/Open-Lounge-Phone/open-lounge-phone),
which is a git submodule at `main/`: `scripts/sync-docs.ts` copies the README, `docs/`,
`hardware/` and `firmware/` pages into `src/content/docs/` (gitignored) and rewrites their links.
The funding figures come from `main/packages/core/src/funding.ts`, the same code the hub and the
companion app use. Edit the docs in the main repository, not here. Hand-written pages (home,
getting started, how-tos, about, funding) are in `src/content-src/`.

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

To pick up newer docs, move the submodule to the main repository's latest commit and commit
that:

```sh
git submodule update --remote main
git add main && git commit -m "Update docs from the main repository"
```

Build-time settings (environment variables): `SPONSOR_URL` (a GitHub Sponsors link, or `none`
to hide the button), and `FUNDING_BALANCE_USD`, `BASE_COST_USD_PER_MONTH`,
`COST_PER_ACTIVE_USER_USD_PER_MONTH` for the hub's funding figures.

## Deploy

```sh
npm run deploy    # build, then `wrangler deploy` (Worker `openloungephone-site`)
```

`wrangler.jsonc` serves `dist/` on the `openloungephone.app` custom domain; deploying needs
`wrangler login` to the Cloudflare account that owns that zone.

## Organization files

`org/` is the source of the [Open-Lounge-Phone/.github](https://github.com/Open-Lounge-Phone/.github)
repository (the organization profile and default `FUNDING.yml`), which is the published copy.
See [org/README.md](org/README.md).

## License

AGPL-3.0-or-later, like the main repository's software.
