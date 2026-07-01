# Marajo Group

Marajo Group is a modern Next.js real estate platform for showcasing properties, managing bookings, and supporting customer inquiries. The project brings the original PHP experience into a fast, maintainable React/Next.js application.

## Features

- Property showcase and marketing pages
- Parking reservation flow
- Facilities and court booking flow
- Workforce booking experience
- Authenticated user account and booking history
- Contact and inquiry handling
- Search experience for properties and content

## Tech stack

- Next.js 16
- React 19
- TypeScript
- PostgreSQL
- JWT and bcrypt for authentication
- Nodemailer for transactional email

## Local development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a local environment file:
   ```bash
   cp .env.local.example .env.local
   ```
3. Fill in the required variables such as:
   - `DB_HOST`
   - `DB_USER`
   - `DB_PASS`
   - `DB_NAME`
   - `JWT_SECRET`
4. Run the app locally:
   ```bash
   npm run dev
   ```

## Environment variables

The app expects database, JWT, and optional email/Turnstile configuration values. Configure them in `.env.local` before running the application.

## Deployment

This repository is prepared for deployment on Vercel. After connecting the GitHub repository in Vercel, add the same environment variables in the Vercel project settings.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
