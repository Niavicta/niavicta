# Image bank

This folder is the website's **image bank**: the reusable photos and diagrams
that pages and blog posts pull from. Everything here is catalogued in
[`image-bank.json`](image-bank.json) so a person or an AI can search it by
meaning instead of guessing from filenames.

## For anyone (or any AI) adding images to a page or blog post

1. **Read `image-bank.json`.** Each entry has a `description`, `tags`,
   `orientation`, `width`/`height`, a suggested `use`, and ready-to-paste `alt`
   text.
2. **Pick by `tags` + `description`**, matched to what the page or post is
   about. Respect `use`: `hero` images open a piece, `inline` sit inside the
   body, `thumbnail` are small. Match `orientation` to the slot (a `hero`
   usually wants `landscape`).
3. **Insert with the site's standard markup**, reusing the catalogued `alt`
   text verbatim (or a sharper variant for the specific context):

   ```html
   <!-- inline, inside a .prose block -->
   <img src="dirs/img/coding.jpg" alt="A developer writing code on a laptop">
   ```

   For a blog **hero** image, drop this figure at the top of the first content
   band (self-contained, no global CSS needed):

   ```html
   <figure style="margin:0 0 34px;border-radius:10px;overflow:hidden">
     <img src="dirs/img/process-flow.jpg"
          alt="Hands typing on a laptop with a process flow diagram floating above the keyboard"
          style="width:100%;height:auto;display:block">
   </figure>
   ```

4. **If nothing fits well, do not force a weak match.** Say the post needs a new
   image and describe what to shoot or license. A wrong image is worse than none.
5. Every `<img>` needs real `alt` text. It is required for accessibility and it
   is what makes the bank searchable in the first place.

## Adding new images to the bank

1. Drop the file into `dirs/img/` (keep filenames lowercase-kebab, e.g.
   `founder-desk.jpg`). Prefer web-sized images: long edge around 1600–2000px,
   compressed. The originals here run large (up to ~4460px); resizing before
   commit keeps the site fast.
2. Run the refresh script from the repo root:

   ```bash
   python build-image-bank.py
   ```

   It adds the new file to `image-bank.json` with its real dimensions and
   orientation, and flags it `todo`.
3. Fill in the new entry's `description`, `tags`, `use`, and `alt`. That is what
   makes it findable. Re-running the script never overwrites those fields.

## Tag vocabulary (extend as needed)

`audit` · `lab` · `science` · `medtech` · `biotech` · `coding` · `software` ·
`developer` · `engineering` · `hardware` · `electronics` · `ai` · `agentic` ·
`network` · `systems` · `regulatory` · `compliance` · `standards` · `iso` ·
`workflow` · `process` · `procedures` · `kanban` · `team` · `people` ·
`collaboration` · `founder` · `portrait` · `journey` · `growth` · `scale` ·
`ideas` · `innovation` · `abstract` · `europe`

Keep tags lowercase. Reuse existing tags before inventing new ones so search stays consistent.

## What is not in the bank

Founder portraits in `dirs/img/team/` are excluded on purpose. They are placed by
hand on specific pages (About, Other services) and should never be auto-suggested
as illustration. The refresh script skips that folder.
