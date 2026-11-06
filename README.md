# Western Quantum Club website

A starter for migrating the club’s [current Wix website](https://www.westernquantumclub.ca/) into a shared GitHub repository. All seven main pages work locally. The landing page has starter copy; the other pages have clear migration placeholders. This is a starting template, not a completed copy of the Wix site.

Uses plain HTML, CSS, and JavaScript. No npm install, framework, build step, or external fonts are needed. JavaScript provides the shared navigation and footer, so keep it enabled in your browser.

## Run locally

You need Python 3, Git, a browser, and a text editor such as VS Code. On macOS, commands below go in Terminal, not the Python prompt.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open **http://localhost:8000** in your browser. Keep the terminal running, edit a file, save, and refresh the browser to see changes. Stop the server with **Control+C**. If port 8000 is busy, use `8001` and open http://localhost:8001 instead.

After cloning on another computer, `cd` into that clone and run the same `python3` command (`python -m http.server 8000 --bind 127.0.0.1` on Windows if Python is installed as `python`). VS Code’s Live Server extension is another option. Serve from the repository root; opening HTML files directly does not reliably resolve folder links.

## Page assignments

Each director can own one page and its future subpages. Replace the placeholder checklist with real content as migration proceeds.

| Page | File to edit | Local address |
| --- | --- | --- |
| Landing page | `index.html` | `/` |
| About us | `about/index.html` | `/about/` |
| Projects | `projects/index.html` | `/projects/` |
| Events | `events/index.html` | `/events/` |
| Education | `education/index.html` | `/education/` |
| Media | `media/index.html` | `/media/` |
| Contact us | `contact/index.html` | `/contact/` |

The contact page includes the email address currently listed on Wix. Confirm it before launch. The WQC badge and quantum graphic are template artwork; add the club’s approved logo and imagery when available.

## Shared files

```text
Website/
├── index.html                 # Landing page
├── about/index.html
├── projects/index.html
├── events/index.html
├── education/index.html
├── media/index.html
├── contact/index.html
├── assets/
│   ├── css/styles.css         # Shared styling and colour variables
│   ├── js/site.js             # Navigation, active page, mobile menu, footer
│   └── images/                # Put approved images here
└── README.md
```

Edit your assigned HTML file first. Coordinate changes to shared files with the website lead to reduce merge conflicts. Each page’s `data-page` value matches its ID in `site.js`; this highlights the current navigation link. Navigation URLs are resolved relative to the shared script, so the template also supports a future GitHub Pages repository subpath.

## Connect to GitHub

A local Git repository has been initialized on `main`. There is no remote and no initial commit. Create an **empty GitHub repository** (leave GitHub’s README, licence, and .gitignore options unchecked), then run these commands from this folder. Replace `YOUR-ORG/YOUR-REPO` with the repository you created:

```sh
git add .
git commit -m "Add WQC website starter"
git remote add origin https://github.com/YOUR-ORG/YOUR-REPO.git
git push -u origin main
```

If Git asks who you are, configure `git config user.name "Your Name"` and `git config user.email "you@example.com"` in this repository, then retry the commit. GitHub may require sign-in through your credential manager or GitHub CLI.

Creating a repository does not host the site automatically. Hosting and moving the custom domain from Wix can be decided later; this starter needs only static hosting. No deployment or domain changes have been configured.

## Director workflow

1. Accept the repository invitation, clone it, and start the local server.
2. Start a branch for your assigned page:

   ```sh
   git switch main
   git pull --ff-only
   git switch -c migrate/about
   ```

3. Edit your page and add its images. Use a different branch name for each page, such as `migrate/events`.
4. Preview on desktop and a narrow mobile window. Check navigation, image loading, readable text, and working links. Use the keyboard to check focus and the mobile menu.
5. Commit the files you changed and push your branch. For the About page, for example:

   ```sh
   git add about/ assets/images/about/
   git commit -m "Migrate About page"
   git push -u origin migrate/about
   ```

   Only include the image folder in `git add` if you created it. Use `git status` to review the files before committing.

6. Open a pull request into `main` on GitHub. Include what changed and a screenshot; ask the website lead to review it before merging. Pull the latest `main` before starting your next task.

## Adding content and future subpages

- Keep your page’s document structure, stylesheet/script links, header/footer placeholders, and skip link. Replace the sections inside `<main>`. Give each page one descriptive `<h1>` and a useful title and description.
- Store images in a folder such as `assets/images/about/`. From `about/index.html`, use `../assets/images/about/team.jpg` and descriptive `alt` text. Compress large photographs before committing them.
- Use relative internal links (`../events/` from About, `events/` from Home). Avoid leading `/` paths: those can break under a GitHub Pages repository subpath.
- To add a future subpage, create a folder such as `projects/example-project/index.html` and copy the Projects page as a starting point. Change asset links to `../../assets/...`, the breadcrumb Home link to `../../`, and the title, heading, and description. Keep `data-page="projects"` so Projects remains active. Link to `example-project/` from `projects/index.html`.
- Shared colours are CSS variables at the top of `assets/css/styles.css`. Shared navigation labels and routes are in `assets/js/site.js`.
- Contact is an email link, not a submission form. Mailing-list signup, event registration, and other Wix integrations need separate decisions when those features are migrated.

Before publishing, replace all migration placeholders, confirm current club information and links, and review the completed pages together.
