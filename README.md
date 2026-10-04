# Prepd

Prepd is a nonprofit study site built to help students prepare for their exams. It is a student-run project, built by students for students.

> **Status:** Active development

## Features

- Study resources and practice material for students
- Simple, fast, mobile-friendly interface
- Free to use, no paywalls

## Tech Stack

| Layer    | Technology |
| -------- | ---------- |
| Backend  | [Supabase](https://supabase.com) (database, auth, storage) |
| Hosting  | [Netlify](https://www.netlify.com) |
| Frontend | HTML, CSS, JavaScript |

## Getting Started

### Prerequisites

- A modern web browser
- Access to the project's Supabase project (ask a maintainer)
- [Node.js](https://nodejs.org) (optional, for running a local dev server)

### Run Locally

1. Clone the repository:
```bash
   git clone https://github.com/<owner>/prepd.git
   cd prepd
```
2. Create a `.env` file (or update the config) with your Supabase credentials:
```
   SUPABASE_URL=your-project-url
   SUPABASE_ANON_KEY=your-anon-key
```
3. Start a local server:
```bash
   npx serve .
```
4. Open `http://localhost:3000` in your browser.

> Never commit secret keys. Only the public `anon` key belongs in client code. Keep the `service_role` key private.

## Project Structure

```
prepd/
├── index.html        # Landing page
├── css/              # Stylesheets
├── js/               # Client-side scripts
├── assets/           # Images and static files
└── README.md
```

## Deployment

The site is deployed on Netlify. Changes pushed to the `main` branch deploy automatically. Environment variables are managed in the Netlify dashboard under **Site settings → Environment variables**.

## Contributing

1. Fork the repo or create a feature branch (`git checkout -b feature/your-feature`)
2. Make your changes and test them locally
3. Commit with a clear message (`git commit -m "Add: short description"`)
4. Push and open a pull request

For database changes, coordinate with a maintainer who has Supabase access before altering tables or policies.

## Team

Prepd is built and maintained by two students as a nonprofit effort.

## License

Add a license (e.g. MIT) here.

## Contact

Questions or ideas? Open an issue or reach out to the maintainers.
