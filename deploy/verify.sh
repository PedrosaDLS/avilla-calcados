#!/bin/bash
set -euo pipefail
cd /var/www/avilla
set -a
source .env
set +a
npx tsx -e "
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const u = await prisma.user.findUnique({ where: { email: 'pedrin127silva@gmail.com' } });
console.log('ADMIN', u?.role, u?.email);
const cats = await prisma.category.count();
console.log('CATEGORIES', cats);
await prisma.\$disconnect();
await pool.end();
"
curl -s -o /dev/null -w "LOCAL3010 %{http_code}\n" http://127.0.0.1:3010/
curl -s -o /dev/null -w "LOCAL8088 %{http_code}\n" http://127.0.0.1:8088/
