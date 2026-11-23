# BeeStash

BeeStash is a campus marketplace prototype built with React and Vite. Accounts, listings, carts, and orders are stored in the browser. The app needs no database, environment variables, or payment service.

## Build and run with Docker Compose

Start Docker Desktop, or Docker Engine with the Compose plugin. From the repository root, run:

```bash
docker compose up -d --build
```

Open [http://localhost:5173](http://localhost:5173). Stop any Vite dev server on port 5173 before starting the container. The image builds the app with Node.js 22 and serves the result with [unprivileged NGINX](https://github.com/nginx/docker-nginx-unprivileged) on container port 8080. For a public deployment, serve the app over HTTPS so the browser can use the Web Crypto API required by account flows.

## Demo account

- Email: `bina.nusantara@binus.ac.id`
- Password: `beestash-demo`
- Verification code: `28024`

These are the defaults for a fresh browser. If you changed the demo account email in your profile, use the updated email.

## Verify, view logs, and stop

Open [/barang/kulkas](http://localhost:5173/barang/kulkas) directly to check that a product link loads. NGINX serves the React entry page for app routes. Missing static assets return HTTP 404.

```bash
curl -fsS -o /dev/null -w 'HTTP %{http_code}\n' http://localhost:5173/barang/kulkas
docker compose logs beestash
docker compose down
```

After changing the code, run `docker compose up -d --build` again to rebuild and update the container.

## Develop without Docker

With Node.js 22 installed, run:

```bash
npm ci
npm run dev -- --port 5173 --strictPort
```

Use `npm run lint` and `npm run typecheck` before committing. Run `npm run build` to create the production files in `dist/`.
