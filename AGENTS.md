# AGENTS.md

Guidance for any AI/coding agent editing this repository.

This is a static, dependency-free site (plain HTML/CSS/JS, no build step) served
via GitHub Pages at https://niavicta.com. `main` is the live branch: whatever
lands on `main` deploys. Work on a branch and open a PR unless told otherwise.

## Images — always use the image bank

When a page or blog post needs a photo or diagram:

1. Read `dirs/img/image-bank.json` and pick the image whose `description` and
   `tags` best match the content. Respect `use` (hero / inline / thumbnail) and
   `orientation`.
2. Insert it with the site's standard `<img src="dirs/img/…" alt="…">` markup,
   using the catalogued `alt` text. Full snippets and the hero-figure pattern
   are in `dirs/img/README.md`.
3. If nothing fits, say the piece needs a new image and describe it. Do not
   force a weak match.

To add a new image: drop it in `dirs/img/`, run `python build-image-bank.py`,
then fill in the new entry's `description`, `tags`, `use`, and `alt`.

## Content voice

Brand copy follows the Niavicta voice rules: no em dashes, affirmative framing,
short paragraphs, plain English, active voice. Blog posts carry the standard
site chrome (header, footer, SEO block, structured data). See
`follow-the-journey.html` and any post under it for the pattern.

## After changing pages

Keep `sitemap.xml` and `llms.txt` in sync when you add or remove a page.
