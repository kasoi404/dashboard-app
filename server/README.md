# Stock Management - Server

## Setup

1. Install deps

```
cd /workspace/server
npm i
```

2. Run dev

```
npm run dev
```

3. Seed admin

```
curl -X POST http://localhost:4000/auth/seed-admin
# username: admin, password: admin123
```

Env variables: copy `.env.example` to `.env` and set SMTP to enable low stock emails.