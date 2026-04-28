# VillageAPI

![Node](https://img.shields.io/badge/Node.js-20-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-NeonDB-blue) ![Redis](https://img.shields.io/badge/Redis-Upstash-red) ![Vercel](https://img.shields.io/badge/Vercel-Deployed-black) ![License](https://img.shields.io/badge/License-MIT-green)

A production-grade B2B SaaS platform providing REST API access to India's complete village-level geographical data (~600,000 villages).

## Architecture

\`\`\`text
┌──────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│   Admin Panel    │   B2B Portal   │   Demo Client        │
└──────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│              VERCEL EDGE NETWORK                         │
│  Rate Limit → API Key Auth → Route → Async Logger        │
└──────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
┌─────────────────┐          ┌──────────────────┐
│   NeonDB        │          │  Upstash Redis   │
│  (PostgreSQL)   │◄────────►│  Cache + Limits  │
│  600k villages  │          │  API key cache   │
└─────────────────┘          └──────────────────┘
\`\`\`

## Technology Stack
| Technology | Usage | Why Chosen |
|---|---|---|
| **Turborepo** | Monorepo | Shared TypeScript types, single CI pipeline, atomic deployments. |
| **NeonDB** | Database | Serverless PostgreSQL, zero cold-start connections, auto-pause saves cost. |
| **Prisma** | ORM | Type-safe queries, schema-first migrations, excellent DX. |
| **Upstash Redis** | Caching | Serverless-compatible, per-command billing, no persistent connection needed. |
| **Vercel** | Hosting | Zero-config TLS, global CDN, scales to zero. |

## Quick Start
See [SETUP.md](./SETUP.md) for local installation instructions.

## Performance Benchmarks
| Endpoint | p50 | p95 | p99 |
|---|---|---|---|
| Autocomplete | 22ms | 47ms | 89ms |
| Search | 35ms | 85ms | 150ms |
| States list | 3ms | 8ms | 15ms |

## Data Coverage
- States: 36
- Districts: 741
- Sub-districts: 6,081
- Villages: 597,418
