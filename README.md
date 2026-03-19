# Roberts Lab Website

[![URLChecker](https://github.com/RobertsLab/lab-website/actions/workflows/urlchecker-md-files.yml/badge.svg)](https://github.com/RobertsLab/lab-website/actions/workflows/urlchecker-md-files.yml)

The official website for the Roberts Lab at the University of Washington School of Aquatic and Fishery Sciences.

🌐 **Live site:** [faculty.washington.edu/sr320](https://faculty.washington.edu/sr320)

---

## Overview

This website is built with [Quarto](https://quarto.org/), a scientific and technical publishing system. Content is written in `.qmd` (Quarto Markdown) files, rendered to HTML, and served from the `docs/` directory via GitHub Pages.

---

## Repository Structure

```
lab-website/
├── _quarto.yml            # Site-wide configuration (navbar, sidebar, theme)
├── index.qmd              # Home page (front page listings + lab description)
├── people.qmd             # Lab members page
├── projects.qmd           # Research projects listing page
├── publications.qmd       # Publications page (papers, preprints, theses)
├── posts.qmd              # News and updates listing page
├── courses.qmd            # Courses page
├── research.qmd           # Full research overview page
├── dei.qmd                # Outreach and DEI page
├── undergraduate_guide.qmd # Undergraduate guide page
├── calendar.qmd           # Lab calendar page
├── contact.qmd            # Contact page
├── notebooks.qmd          # Lab notebooks page
├── styles.css             # Custom site styles
│
├── posts/                 # News posts and updates
│   ├── _metadata.yml      # Shared metadata for all posts (freeze, banner)
│   ├── frontpage/         # Posts featured on the home page
│   │   └── <post-name>/
│   │       └── index.qmd
│   └── <post-name>/       # Regular news posts
│       └── index.qmd
│
├── research/              # Individual research project pages
│   ├── cod.qmd
│   ├── e5.qmd
│   ├── usda.qmd
│   └── ...
│
├── publications/
│   └── articles/          # One .qmd file per publication
│       └── <paper-slug>.qmd
│
├── img/                   # Images used across the site
├── resources/             # Downloadable resources (e.g., CV template)
├── ejs/                   # EJS templates (e.g., publications listing template)
├── _extensions/           # Quarto extensions
├── _freeze/               # Frozen computation outputs (do not edit manually)
└── docs/                  # Rendered HTML output (deployed via GitHub Pages)
```

---

## How to Update the Website

### Prerequisites

- [Quarto CLI](https://quarto.org/docs/get-started/) (version 1.3 or later)
- [R](https://www.r-project.org/) with [RStudio](https://posit.co/download/rstudio-desktop/) (recommended) — some `.qmd` files use R code chunks
- Git

### Building and Previewing Locally

```bash
# Preview the site with live reload
quarto preview

# Render the full site to the docs/ directory
quarto render
```

The rendered output goes to `docs/` and is served via GitHub Pages at the site URL.

---

### Adding a News Post

News posts appear on the **News and Updates** page (`posts.qmd`). Posts featured on the **home page** go in `posts/frontpage/`.

1. Create a new directory under `posts/` (or `posts/frontpage/` for home-page features):
   ```
   posts/<your-post-name>/
   ```

2. Create an `index.qmd` file inside that directory with this front matter:

   ```yaml
   ---
   title: "Your Post Title"
   description: "A short description of the post."
   author:
     - name: Your Name
       url: https://your-website.com
       affiliation: UW - School of Aquatic and Fishery Sciences
       affiliation-url: https://robertslab.info
   date: MM-DD-YYYY
   categories: [keyword1, keyword2]   # used for filtering
   image: /img/your-image.png         # thumbnail image
   draft: false                       # set to true to hide from listing
   ---
   ```

3. Write your post content in Markdown below the front matter.

> **Note:** Posts use `freeze: true` (set in `posts/_metadata.yml`), which means code chunks are not re-executed on each render unless you explicitly run `quarto render <file> --no-freeze`.

---

### Adding a Publication

Publications appear on the **Publications** page (`publications.qmd`) rendered via the EJS template in `ejs/article.ejs`.

1. Create a new `.qmd` file in `publications/articles/`:
   ```
   publications/articles/<authoryear>.qmd
   ```

2. Use this front matter template:

   ```yaml
   ---
   title: "Full Paper Title"
   type: "article"
   author: "Last, F.I., Last, F.I., ..."
   year: "2025"
   publication: "Journal Name"
   preprint: ""
   doi: "10.xxxx/xxxxx"
   materials: ""
   eprint: "https://link-to-full-text"
   toc: FALSE
   categories:
     - keyword1
     - keyword2
   ---
   ```

3. Optionally add a `## Citation` and `## Abstract` section below the front matter.

---

### Adding or Updating a Research Project

Research projects appear on the **Research Projects** page (`projects.qmd`) and are also listed on `research.qmd`.

1. Create or edit a `.qmd` file in `research/`:
   ```
   research/<project-name>.qmd
   ```

2. Use this front matter template:

   ```yaml
   ---
   title: "Project Title"
   status: "active"       # active or completed
   type: "grant"
   agency: "Funding Agency"
   year: "2023"
   github: "https://github.com/RobertsLab/project-name"
   image: "/img/project-image.png"
   toc: FALSE
   categories:
     - keyword1
     - keyword2
   ---
   ```

3. To feature a project on the home projects grid, add its path to the `projects.qmd` listing:
   ```yaml
   listing:
     contents:
       - "research/your-project.qmd"
   ```

---

### Updating the People Page

The **People** page (`people.qmd`) uses custom HTML cards defined directly in the file.

1. Open `people.qmd`.
2. To add a new lab member, copy an existing `<div class="person-card">` block and update:
   - Name, photo URL, links (notebook, GitHub, ORCID, etc.)
   - Biography text
3. To move someone to Alumni, find their card and move it to the alumni section at the bottom.
4. Add a headshot image to the `img/` directory and reference it in the card.

---

### Updating Site Navigation

Site navigation (navbar, sidebar) is configured in `_quarto.yml`.

- **Navbar tools** (icons in the top-right): edit the `website.navbar.tools` section.
- **Sidebar links**: edit the `website.sidebar.contents` section.
- **Site title and URL**: edit `website.title` and `website.site-url`.

---

### Updating Site Styles and Theme

- **Global theme**: configured in `_quarto.yml` under `format.html.theme` (currently uses Flatly/Darkly for light/dark mode).
- **Custom CSS**: add styles to `styles.css`. To activate it, uncomment `css: styles.css` in `_quarto.yml` under `format.html`.

---

## Deployment

The site is deployed via **GitHub Pages** from the `docs/` directory on the `main` branch. After rendering locally with `quarto render`, commit and push the updated `docs/` directory to deploy changes.

```bash
quarto render
git add docs/
git commit -m "Render updated site"
git push
```

The live site updates automatically once changes are pushed to `main`.

---

## Additional Resources

- [Lab Handbook](https://robertslab.github.io/resources/)
- [Quarto Documentation](https://quarto.org/docs/websites/)
- [Submit an Issue](https://github.com/RobertsLab/resources/issues/new)
- [Lab GitHub Organization](https://github.com/RobertsLab)
