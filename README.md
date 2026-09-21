# Merzado
Merzado is a B2B request-for-quotation marketplace. Buyers publish sourcing requests, and suppliers discover open RFQs, submit quotes, and track quote outcomes.

## Stack

- Next.js 16 and React 19
- TypeScript and Tailwind CSS
- Drizzle ORM with Supabase Postgres
- Supabase Storage for RFQ reference images
- Auth.js with demo credentials and GitHub sign-in
- Leaflet and OpenStreetMap for delivery locations

## Local setup

Install dependencies:

```bash
pnpm install
```

Create `.env.local` with the following values:

```env
DATABASE_URL="your-supabase-transaction-pooler-url"
DIRECT_DATABASE_URL="your-supabase-session-pooler-url"

AUTH_SECRET="your-auth-secret"
NEXTAUTH_URL="http://localhost:3000"

AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"

NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-secret-key"
```

The service role key is server-only. Never expose it in client-side code or commit it.

In Supabase Storage, create a public bucket named:

```text
rfq-images
```

Apply the database migrations:

```bash
pnpm db:migrate
```

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available commands

```bash
pnpm dev          # Start the development server
pnpm build        # Create a production build
pnpm start        # Serve the production build
pnpm lint         # Run ESLint
pnpm db:generate  # Generate a Drizzle migration
pnpm db:migrate   # Apply Drizzle migrations
```

## Product workflows

### Buyers

- Choose a buyer workspace during sign-in.
- Create up to 10 RFQs per account.
- Add a category, deadline, delivery location, coordinates, and reference image.
- Review supplier quotes and award one quote.

### Suppliers

- Browse open buyer RFQs.
- Filter by product, location, quantity, deadline, and category.
- Submit one quote per RFQ.
- Review pending, awarded, rejected, and closed quotes in **My quotes**.

GitHub accounts can switch between buyer and supplier workspaces through the role selection flow. Demo login is available for local testing when configured in the login screen.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
