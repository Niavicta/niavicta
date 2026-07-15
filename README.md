# Niavicta

Marketing site for **Niavicta** and **nianav OS**, the operating system for regulated startups.

Static and dependency-free: plain HTML, CSS, and JavaScript. No build step, no framework, and no third-party scripts. Every font, image, and script is self-hosted. Served via GitHub Pages at https://niavicta.com.

## Image bank

Reusable photos and diagrams live in `dirs/img/`, catalogued in `dirs/img/image-bank.json` so pages and blog posts can be illustrated by searching descriptions and tags rather than filenames. Before adding an image to any page or post, read `dirs/img/README.md` — it explains how to pick an image, the markup to use, and how to add new ones (drop the file in `dirs/img/`, run `python build-image-bank.py`, fill in the description and tags).
