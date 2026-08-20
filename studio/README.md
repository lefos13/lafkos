# Lafkos content studio

The public site is ready to consume Sanity documents through the contracts in
`src/lib/content.ts`. This package contains the initial Studio config and the
Place, Trail, Story, Category, and Site Settings schemas. Set
`PUBLIC_SANITY_PROJECT_ID` and `PUBLIC_SANITY_DATASET`, then run `pnpm --filter
@lafkos/studio dev`. The first public build intentionally uses the local seed
dataset so the experience remains previewable without credentials.
