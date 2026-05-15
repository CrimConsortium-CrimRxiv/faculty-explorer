# Criminology PhD Faculty Explorer

A searchable directory of criminology and criminal-justice faculty across U.S. PhD-granting programs and [CrimConsortium](https://crimconsortium.com) (formerly the CrimRxiv Consortium) worldwide. Search by name or research interest, filter to Consortium members, and jump to each scholar's official profile page.

**Live site:** https://crimconsortium.github.io/criminology-faculty-explorer/

## What's inside

- `index.html` — the page shell
- `style.css` — design system and layout
- `app.js` — search, filters, sort, rendering
- `data.json` / `data.js` — the faculty dataset (mirrors of each other; `data.js` is what the page loads)
- `build.json` — current build version + date
- `.nojekyll` — tells GitHub Pages to serve files as-is

## Sources

Data is compiled from:

- [U.S. News & World Report Best Criminology Schools rankings](https://www.usnews.com/best-graduate-schools/top-humanities-schools/criminology-rankings)
- [Academy of Doctoral Programs in Criminology & Criminal Justice (ADPCCJ)](https://adpccj.com/members) member roster
- Each department's official faculty directory
- [CrimConsortium](https://crimconsortium.com) member list (formerly the CrimRxiv Consortium)

Not affiliated with U.S. News, ADPCCJ, CrimRxiv, CrimConsortium, or any listed institution.

## Updating

Edit files locally and `git push`. GitHub Pages redeploys automatically within a minute.

The build version in the footer is bumped via the helper script in the parent workspace before each deploy.
