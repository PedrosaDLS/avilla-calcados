#!/bin/bash
set -euo pipefail
export PGPASSWORD=AvillaProd2026Secure
psql -h 127.0.0.1 -p 5433 -U avilla -d avilla -c 'SELECT email, role FROM "User";'
psql -h 127.0.0.1 -p 5433 -U avilla -d avilla -c 'SELECT name, slug FROM "Category";'
