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

## Production Deployment

The project is hosted in production at **[https://vikanmatrimony.in](https://vikanmatrimony.in)**.

### Architecture
- **Domain & SSL**: Cloudflare / Nginx Reverse Proxy with Let's Encrypt SSL
- **Frontend**: Next.js 16 (App Router) managed by `pm2` (`vikan-frontend`)
- **Backend API**: ASP.NET Core 10.0 Web API managed by `systemd` (`vikan-api.service`)
- **Database**: PostgreSQL (`vikan_db`)

### Deploying Updates to Production

SSH into the live server (`/var/www/vikan/app`):

```bash
# 1. Pull latest code
cd /var/www/vikan/app && git pull origin main

# 2. Update and restart frontend (Next.js)
npm run build && pm2 restart vikan-frontend

# 3. Update and restart backend (.NET API)
dotnet publish vikan-api/VikanMatrimony.WebApi/VikanMatrimony.WebApi.csproj -c Release -o /var/www/vikan/backend-bin/
systemctl restart vikan-api.service
```
