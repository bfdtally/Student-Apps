# Educational Apps Lab — Student Apps

This repository is the central publishing home for student-created educational web applications. All student apps live in this one repository and are served by one Render static site.

## Public URL structure

The intended public domain is:

```text
https://apps.ealapps.com
```

Each app receives a short folder-based URL:

```text
https://apps.ealapps.com/white-reading/
https://apps.ealapps.com/jones-math/
https://apps.ealapps.com/smith-science/
```

## Repository structure

```text
/
├── index.html              # Public Student Apps catalog
├── apps.json               # Catalog data used by the root page
├── README.md               # Publishing instructions
└── white-reading/
    └── index.html          # Reading Path app
```

Each student app is self-contained inside its own folder. Its HTML, CSS, JavaScript, images, audio, and other assets should remain inside that folder.

## Add another student app

1. Choose a unique, short slug containing lowercase letters, numbers, and hyphens. A recommended pattern is `lastname-topic`, such as `jones-math`.
2. Create a folder at the repository root using that exact slug.
3. Put the app's `index.html` and all of its assets inside the folder.
4. Add one entry to the `apps` array in `apps.json`.
5. Commit and push the changes to `main`.
6. Render automatically republishes the existing static site.

Example catalog entry:

```json
{
  "title": "Math Fact Quest",
  "student": "Jordan Jones",
  "slug": "jones-math",
  "description": "A short description of the educational experience.",
  "url": "/jones-math/"
}
```

The folder and URL must match:

```text
jones-math/index.html  →  /jones-math/
```

## App requirements

- Every app folder must include an `index.html` file.
- Use relative asset paths inside an app, such as `./images/example.png`.
- Do not place student information, passwords, private data, or API secrets in an app.
- Apps should not require Node, npm, React, a database, or a build command to run on this shared site.
- If an exported app has multiple files, copy the complete exported folder into its slug folder.
- Test the root catalog and the app's direct folder URL before publishing.

## Render static-site settings

Connect this repository to one Render **Static Site** with these settings:

```text
Branch: main
Build command: leave blank
Publish directory: .
Auto-deploy: On Commit
```

After the Render site is working, add `apps.ealapps.com` as its custom domain and configure the DNS record Render provides.

No server, database, authentication system, package installation, or build process is required.
