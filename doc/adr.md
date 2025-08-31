# Architecture Decision Record (ADR)
## Lead Generation Platform - Node.js Implementation

**Status:** APPROVED  
**Date:** 2025-08-19  
**Decision Makers:** Technical Team  
**Stakeholders:** Development Team, DevOps, Product Management  

---

## Context

Este ADR documenta as decisões arquiteturais para implementação da plataforma de geração de leads em Node.js, servindo como guia definitivo para agentes de IA e desenvolvedores trabalharem no projeto.

**Migração:** Python/Selenium → Node.js/Puppeteer  
**Objetivo:** Plataforma SaaS multi-tenant para comercialização de leads  
**Arquitetura:** Full-stack JavaScript com microserviços  

---

## Executive Summary

### Decisões Principais
1. **Runtime:** Node.js 20+ LTS com TypeScript
2. **Backend Framework:** Fastify com plugins oficiais
3. **Database:** PostgreSQL + Prisma ORM
4. **Frontend:** Next.js 14+ App Router
5. **Message Queue:** RabbitMQ (não Redis)
6. **Web Scraping:** Puppeteer + Playwright
7. **Authentication:** NextAuth.js + JWT
8. **Deployment:** Docker + Kubernetes
9. **Monitoring:** Prometheus + Grafana + Pino

---

## ADR-001: Runtime e Linguagem

### Decision
**Adotar Node.js 20+ LTS com TypeScript para todo o stack**

### Status
✅ **APPROVED**

### Context
Necessidade de unificar o stack tecnológico e melhorar produtividade da equipe.

### Options Considered
1. **Python + FastAPI** (atual)
2. **Node.js + TypeScript** (escolhido)
3. **Go + Gin**
4. **Rust + Axum**

### Decision Rationale
```yaml
Node.js Advantages:
  - Single language para frontend/backend
  - Excelente performance para I/O intensivo
  - Ecosystem rico com NPM
  - TypeScript para type safety
  - Deployment simplificado (uma runtime)

TypeScript Benefits:
  - Type safety em todo o codebase
  - Better IDE support
  - Shared types entre frontend/backend
  - Compile-time error detection
  - Better refactoring capabilities
```

### Implementation
```bash
# Node.js version management
nvm use 20
node --version  # v20.10.0+

# TypeScript configuration
npm install -g typescript
npm install -D @types/node tsx

# Project setup
npm init -y
npm install typescript @types/node
```

### Consequences
- **Positive:** Produtividade aumentada, stack unificado
- **Negative:** Learning curve para equipe Python
- **Neutral:** Performance similar ao Python para casos de uso

---

## ADR-002: Backend Framework

### Decision
**Usar Fastify como framework principal do backend**

### Status
✅ **APPROVED**

### Context
Necessidade de framework performático com bom ecosystem para APIs REST.

### Options Considered
1. **Express.js** - Mais popular, ecosystem maior
2. **Fastify** - Mais performático, TypeScript nativo (escolhido)
3. **Koa.js** - Moderno mas menor ecosystem
4. **NestJS** - Enterprise, mas overhead desnecessário

### Decision Rationale
```yaml
Fastify Advantages:
  - Performance superior (2x mais rápido que Express)
  - TypeScript first-class support
  - Schema validation built-in
  - Plugin architecture robusta
  - JSON schema para documentação automática
  - Logging estruturado integrado

Technical Specs:
  - Requests/sec: ~76,000 (vs Express ~30,000)
  - Memory usage: 30% menor que Express
  - Built-in validation com Ajv
  - Swagger/OpenAPI automático
```

### Implementation
```typescript
// server.ts
import Fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

const server = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  }
}).withTypeProvider<TypeBoxTypeProvider>();

// Plugins essenciais
await server.register(import('@fastify/cors'));
await server.register(import('@fastify/jwt'));
await server.register(import('@fastify/rate-limit'));
await server.register(import('@fastify/swagger'));
await server.register(import('@fastify/swagger-ui'));

// Routes
await server.register(import('./routes/auth'), { prefix: '/api/v1/auth' });
await server.register(import('./routes/leads'), { prefix: '/api/v1/leads' });
await server.register(import('./routes/organizations'), { prefix: '/api/v1/organizations' });

const start = async () => {
  try {
    await server.listen({ port: 3001, host: '0.0.0.0' });
    console.log('Server running on http://localhost:3001');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
```

### Consequences
- **Positive:** Performance superior, TypeScript nativo, documentação automática
- **Negative:** Menor ecosystem que Express
- **Risk:** Curva de aprendizado para plugins específicos

---

## ADR-003: Database e ORM

### Decision
**PostgreSQL como database principal com Prisma como ORM**

### Status
✅ **APPROVED**

### Context
Manter compatibilidade com schema existente e adicionar type safety.

### Options Considered
1. **PostgreSQL + TypeORM** - Popular mas verbose
2. **PostgreSQL + Prisma** - Type-safe, modern (escolhido)
3. **PostgreSQL + Sequelize** - Maduro mas não type-safe
4. **MongoDB + Mongoose** - NoSQL mas quebra compatibilidade

### Decision Rationale
```yaml
Prisma Advantages:
  - Type-safe database access
  - Auto-generated client
  - Database introspection
  - Migration system robusto
  - Excellent TypeScript integration
  - Studio para admin visual
  - Query optimization automática

PostgreSQL Benefits:
  - ACID compliance
  - JSON support para dados flexíveis
  - PostGIS para dados geográficos
  - Mature ecosystem
  - Excelente performance para reads/writes
```

### Implementation
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Business {
  id                   String    @id @default(uuid()) @db.Uuid
  businessSegmentId    Int?      @map("business_segment_id")
  municipalityId       Int?      @map("municipality_id")
  
  name                 String    @db.VarChar(500)
  phone                String?   @db.VarChar(50)
  email                String?   @db.VarChar(200)
  website              String?   @db.VarChar(500)
  fullAddress          String?   @map("full_address")
  
  dataQualityScore     Int       @default(0) @map("data_quality_score")
  verified             Boolean   @default(false)
  
  createdAt            DateTime  @default(now()) @map("created_at")
  updatedAt            DateTime  @updatedAt @map("updated_at")
  
  businessSegment      BusinessSegment? @relation(fields: [businessSegmentId], references: [id])
  municipality         Municipality?    @relation(fields: [municipalityId], references: [id])
  
  @@unique([name, phone, municipalityId])
  @@map("businesses")
}
```

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
    errorFormat: 'pretty',
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Connection health check
export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}
```

### Consequences
- **Positive:** Type safety, excellent DX, migration system
- **Negative:** Learning curve, menos controle sobre queries complexas
- **Risk:** Vendor lock-in ao Prisma (mitigável com database-first approach)

---

## ADR-004: Message Queue System

### Decision
**RabbitMQ como sistema de filas para processamento assíncrono**

### Status
✅ **APPROVED**

### Context
Necessidade de processamento assíncrono para scraping e notificações, substituindo proposta anterior de Redis.

### Options Considered
1. **Redis + Bull** - Simples mas limitado
2. **RabbitMQ + amqplib** - Robusto, reliable (escolhido)
3. **Apache Kafka** - Overkill para o caso de uso
4. **AWS SQS** - Vendor lock-in

### Decision Rationale
```yaml
RabbitMQ Advantages:
  - Message persistence garantida
  - Dead letter queues para error handling
  - Exchange patterns flexíveis
  - High availability com clustering
  - Management UI built-in
  - Protocol AMQP padrão da indústria
  - Melhor para reliable job processing

Use Cases:
  - Scraping jobs com retry logic
  - Email notifications
  - Data processing pipelines
  - Webhook deliveries
  - Report generation
```

### Implementation
```typescript
// lib/queue.ts
import amqp, { Connection, Channel } from 'amqplib';

class QueueManager {
  private connection: Connection | null = null;
  private channel: Channel | null = null;

  async connect() {
    this.connection = await amqp.connect(process.env.RABBITMQ_URL!);
    this.channel = await this.connection.createChannel();
    
    // Declare exchanges
    await this.channel.assertExchange('scraping', 'direct', { durable: true });
    await this.channel.assertExchange('notifications', 'topic', { durable: true });
    
    // Declare queues with dead letter exchange
    await this.channel.assertQueue('scraping.municipality', {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'scraping.dlx',
        'x-message-ttl': 3600000, // 1 hour
        'x-max-retries': 3
      }
    });
    
    await this.channel.assertQueue('notifications.email', {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'notifications.dlx'
      }
    });
  }

  async publishScrapingJob(municipalityId: string, segment: string, options: any) {
    const job = {
      id: crypto.randomUUID(),
      municipalityId,
      segment,
      options,
      createdAt: new Date().toISOString(),
      retries: 0
    };

    await this.channel!.publish(
      'scraping',
      'municipality',
      Buffer.from(JSON.stringify(job)),
      {
        persistent: true,
        messageId: job.id,
        timestamp: Date.now()
      }
    );
  }

  async consumeScrapingJobs(handler: (job: any) => Promise<void>) {
    await this.channel!.consume('scraping.municipality', async (msg) => {
      if (!msg) return;

      try {
        const job = JSON.parse(msg.content.toString());
        await handler(job);
        this.channel!.ack(msg);
      } catch (error) {
        console.error('Job processing failed:', error);
        // Requeue with delay or send to DLX
        this.channel!.nack(msg, false, false);
      }
    });
  }
}

export const queueManager = new QueueManager();
```

```typescript
// workers/scrapingWorker.ts
import { queueManager } from '../lib/queue';
import { GoogleMapsScraper } from '../services/scraper';
import { prisma } from '../lib/db';

class ScrapingWorker {
  private scraper: GoogleMapsScraper;

  constructor() {
    this.scraper = new GoogleMapsScraper();
  }

  async start() {
    await queueManager.connect();
    
    await queueManager.consumeScrapingJobs(async (job) => {
      await this.processScrapingJob(job);
    });

    console.log('Scraping worker started');
  }

  async processScrapingJob(job: any) {
    const { municipalityId, segment, options } = job;
    
    try {
      // Update session status
      const session = await prisma.scrapingSession.create({
        data: {
          businessSegmentId: await this.getSegmentId(segment),
          municipalityId: parseInt(municipalityId),
          configuration: options,
          status: 'running'
        }
      });

      // Initialize scraper
      await this.scraper.initialize();

      // Get municipality info
      const municipality = await prisma.municipality.findUnique({
        where: { id: parseInt(municipalityId) },
        include: { state: true }
      });

      // Perform scraping
      const businesses = await this.scraper.searchPlaces(
        segment,
        `${municipality!.name} ${municipality!.state.code}`,
        options.maxResults || 100
      );

      // Save results
      const savedBusinesses = [];
      for (const business of businesses) {
        const saved = await prisma.business.upsert({
          where: {
            name_phone_municipalityId: {
              name: business.name,
              phone: business.phone || '',
              municipalityId: parseInt(municipalityId)
            }
          },
          update: {
            updatedAt: new Date(),
            lastVerifiedAt: new Date()
          },
          create: {
            ...business,
            businessSegmentId: await this.getSegmentId(segment),
            municipalityId: parseInt(municipalityId)
          }
        });
        savedBusinesses.push(saved);
      }

      // Update session
      await prisma.scrapingSession.update({
        where: { id: session.id },
        data: {
          status: 'completed',
          totalResults: savedBusinesses.length,
          finishedAt: new Date()
        }
      });

      console.log(`Scraping job completed: ${savedBusinesses.length} businesses`);

    } catch (error) {
      console.error('Scraping job failed:', error);
      throw error;
    } finally {
      await this.scraper.close();
    }
  }

  private async getSegmentId(segmentName: string): Promise<number> {
    const segment = await prisma.businessSegment.findFirst({
      where: { name: segmentName }
    });
    return segment!.id;
  }
}

// Start worker if this file is run directly
if (require.main === module) {
  const worker = new ScrapingWorker();
  worker.start().catch(console.error);
}
```

### Consequences
- **Positive:** Reliability, persistence, complex routing, monitoring
- **Negative:** Infraestrutura adicional, mais complexo que Redis
- **Risk:** Learning curve AMQP, configuração cluster para HA

---

## ADR-005: Web Scraping Technology

### Decision
**Puppeteer como principal + Playwright como fallback**

### Status
✅ **APPROVED**

### Context
Substituir Selenium por tecnologia mais moderna e performática.

### Options Considered
1. **Selenium WebDriver** - Atual, maduro mas lento
2. **Puppeteer** - Rápido, Node.js nativo (principal)
3. **Playwright** - Multi-browser, robust (fallback)
4. **Scraping APIs** - Terceirizados mas caros

### Decision Rationale
```yaml
Puppeteer Advantages:
  - 3x mais rápido que Selenium
  - Native Node.js integration
  - Melhor handling de Google Maps SPA
  - Built-in network monitoring
  - Screenshot e PDF generation
  - Execução paralela eficiente

Playwright Benefits:
  - Multi-browser support (Chrome, Firefox, Safari)
  - Better handling de dynamic content
  - Network interception avançada
  - Auto-wait para elementos
  - Trace viewer para debugging
```

### Implementation
```typescript
// services/scraper.ts
import puppeteer, { Browser, Page } from 'puppeteer';
import { playwright } from 'playwright';

export interface ScrapingOptions {
  headless?: boolean;
  timeout?: number;
  maxResults?: number;
  usePlaywright?: boolean;
}

export interface BusinessData {
  name: string;
  phone?: string;
  website?: string;
  address?: string;
  rating?: number;
  hours?: string;
  category?: string;
}

export class GoogleMapsScraper {
  private browser: Browser | null = null;
  private usePlaywright: boolean = false;

  constructor(private options: ScrapingOptions = {}) {
    this.usePlaywright = options.usePlaywright || false;
  }

  async initialize(): Promise<void> {
    try {
      if (this.usePlaywright) {
        // Playwright fallback
        const { chromium } = playwright;
        this.browser = await chromium.launch({
          headless: this.options.headless ?? true,
          args: [
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--window-size=1920,1080'
          ]
        }) as any;
      } else {
        // Puppeteer primary
        this.browser = await puppeteer.launch({
          headless: this.options.headless ?? true,
          args: [
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--window-size=1920,1080',
            '--disable-blink-features=AutomationControlled',
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          ]
        });
      }
    } catch (error) {
      if (!this.usePlaywright) {
        console.log('Puppeteer failed, falling back to Playwright');
        this.usePlaywright = true;
        await this.initialize();
      } else {
        throw new Error(`Both Puppeteer and Playwright failed: ${error}`);
      }
    }
  }

  async searchPlaces(
    segment: string, 
    location: string, 
    maxResults: number = 50
  ): Promise<BusinessData[]> {
    if (!this.browser) {
      await this.initialize();
    }

    const page = await this.browser!.newPage();
    
    try {
      // Set viewport and user agent
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Navigate to Google Maps
      const query = encodeURIComponent(`${segment} ${location}`);
      const url = `https://www.google.com/maps/search/${query}`;
      
      await page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: this.options.timeout || 30000 
      });

      // Handle cookie consent
      await this.handleCookieConsent(page);

      // Wait for results feed
      await page.waitForSelector('div[role="feed"]', { timeout: 15000 });

      // Scroll to load more results
      const businesses = await this.extractBusinesses(page, maxResults);

      return businesses;

    } catch (error) {
      console.error('Scraping failed:', error);
      throw error;
    } finally {
      await page.close();
    }
  }

  private async handleCookieConsent(page: Page): Promise<void> {
    const consentSelectors = [
      'button:has-text("Accept all")',
      'button:has-text("Aceitar tudo")',
      'button[aria-label*="Accept"]'
    ];

    for (const selector of consentSelectors) {
      try {
        await page.click(selector, { timeout: 3000 });
        await page.waitForTimeout(1000);
        break;
      } catch {
        // Continue to next selector
      }
    }
  }

  private async extractBusinesses(page: Page, maxResults: number): Promise<BusinessData[]> {
    const businesses: BusinessData[] = [];
    
    // Scroll to load results
    await this.scrollToLoadResults(page, maxResults);

    // Extract business data
    const businessElements = await page.$$('div[role="feed"] > div > div[jsaction]');
    
    for (let i = 0; i < Math.min(businessElements.length, maxResults); i++) {
      try {
        const element = businessElements[i];
        
        // Click to load details
        await element.click();
        await page.waitForTimeout(1500);

        // Extract business information
        const business = await this.extractBusinessDetails(page);
        
        if (business && business.name !== 'N/A') {
          businesses.push(business);
        }

      } catch (error) {
        console.warn(`Failed to extract business ${i}:`, error);
      }
    }

    return businesses;
  }

  private async extractBusinessDetails(page: Page): Promise<BusinessData | null> {
    try {
      const business: BusinessData = {
        name: 'N/A',
        phone: undefined,
        website: undefined,
        address: undefined,
        rating: undefined,
        hours: undefined,
        category: undefined
      };

      // Extract name
      try {
        const nameElement = await page.$('h1[data-attrid="title"]');
        if (nameElement) {
          business.name = await page.evaluate(el => el.textContent?.trim() || 'N/A', nameElement);
        }
      } catch {}

      // Extract phone
      try {
        const phoneElement = await page.$('button[data-tooltip*="telefone"], button[aria-label*="Phone"]');
        if (phoneElement) {
          const phoneText = await page.evaluate(el => el.textContent?.trim() || '', phoneElement);
          const phoneMatch = phoneText.match(/[\+]?[\d\s\(\)\-]{10,}/);
          if (phoneMatch) {
            business.phone = phoneMatch[0].trim();
          }
        }
      } catch {}

      // Extract website
      try {
        const websiteElement = await page.$('a[data-tooltip*="website"], a[aria-label*="Website"]');
        if (websiteElement) {
          business.website = await page.evaluate(el => el.href, websiteElement);
        }
      } catch {}

      // Extract address
      try {
        const addressElement = await page.$('button[data-tooltip*="address"], button[aria-label*="Address"]');
        if (addressElement) {
          business.address = await page.evaluate(el => el.textContent?.trim() || '', addressElement);
        }
      } catch {}

      // Extract rating
      try {
        const ratingElement = await page.$('span.MW4etd');
        if (ratingElement) {
          const ratingText = await page.evaluate(el => el.textContent?.trim() || '', ratingElement);
          const rating = parseFloat(ratingText);
          if (!isNaN(rating)) {
            business.rating = rating;
          }
        }
      } catch {}

      // Extract hours
      try {
        const hoursElement = await page.$('button[data-tooltip*="hours"], button[aria-label*="Hours"]');
        if (hoursElement) {
          business.hours = await page.evaluate(el => el.textContent?.trim() || '', hoursElement);
        }
      } catch {}

      return business;

    } catch (error) {
      console.error('Error extracting business details:', error);
      return null;
    }
  }

  private async scrollToLoadResults(page: Page, maxResults: number): Promise<void> {
    const feedSelector = 'div[role="feed"]';
    
    try {
      let lastCount = 0;
      let sameCountAttempts = 0;
      const maxAttempts = 10;

      while (sameCountAttempts < maxAttempts) {
        // Scroll down
        await page.evaluate((selector) => {
          const feed = document.querySelector(selector);
          if (feed) {
            feed.scrollTop = feed.scrollHeight;
          }
        }, feedSelector);

        await page.waitForTimeout(2000);

        // Count current results
        const currentCount = await page.$$eval(
          'div[role="feed"] > div > div[jsaction]',
          elements => elements.length
        );

        if (currentCount >= maxResults * 1.5) {
          break;
        }

        if (currentCount === lastCount) {
          sameCountAttempts++;
        } else {
          sameCountAttempts = 0;
        }

        lastCount = currentCount;

        // Check if we've reached the end
        const endMessage = await page.$('span:has-text("Você chegou ao final da lista")');
        if (endMessage) {
          break;
        }
      }

    } catch (error) {
      console.warn('Scrolling error:', error);
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
```

### Consequences
- **Positive:** Performance 3x melhor, Node.js nativo, melhor debugging
- **Negative:** Menos estável que Selenium para alguns sites
- **Risk:** Google Maps pode implementar contramedidas específicas

---

## ADR-006: Frontend Framework

### Decision
**Next.js 14+ com App Router e TypeScript**

### Status
✅ **APPROVED**

### Context
Necessidade de frontend moderno, SEO-friendly e integrado com o backend Node.js.

### Options Considered
1. **React SPA** - Simples mas sem SSR
2. **Next.js** - Full-stack, SSR, otimizado (escolhido)
3. **Nuxt.js** - Vue.js, boa opção mas diferente ecosystem
4. **Remix** - Moderno mas menor ecosystem

### Decision Rationale
```yaml
Next.js Advantages:
  - Server-side rendering para SEO
  - App Router com nested layouts
  - API routes integradas
  - Image optimization automática
  - TypeScript first-class support
  - Vercel deployment otimizado
  - Performance automática (code splitting, etc)

App Router Benefits:
  - React Server Components
  - Streaming UI
  - Nested layouts
  - Better data fetching
  - Simplified routing
```

### Implementation
```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Lead Management Platform',
  description: 'Plataforma de geração e gestão de leads',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

// app/(dashboard)/layout.tsx
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// app/(dashboard)/leads/page.tsx
import { Suspense } from 'react';
import { LeadTable } from '@/components/leads/LeadTable';
import { LeadStats } from '@/components/leads/LeadStats';

interface LeadsPageProps {
  searchParams: {
    page?: string;
    segment?: string;
    municipality?: string;
  };
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
      
      <Suspense fallback={<div>Carregando estatísticas...</div>}>
        <LeadStats />
      </Suspense>
      
      <Suspense fallback={<div>Carregando leads...</div>}>
        <LeadTable searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
```

### Consequences
- **Positive:** SEO otimizado, performance automática, DX excelente
- **Negative:** Learning curve App Router, vendor lock-in Vercel features
- **Risk:** Breaking changes em updates do Next.js

---

## ADR-007: Authentication & Authorization

### Decision
**NextAuth.js para frontend + JWT para API backend**

### Status
✅ **APPROVED**

### Context
Sistema multi-tenant precisa de autenticação robusta e autorização granular.

### Options Considered
1. **Auth0** - Terceirizado, robusto mas caro
2. **NextAuth.js + JWT** - Open source, flexível (escolhido)
3. **Custom JWT** - Controle total mas mais trabalho
4. **Passport.js** - Maduro mas não integra bem com Next.js

### Decision Rationale
```yaml
NextAuth.js Benefits:
  - Integração perfeita com Next.js
  - Multiple providers (Google, GitHub, etc)
  - Session management automático
  - Type-safe com TypeScript
  - CSRF protection built-in
  - Database adapters prontos

JWT for API:
  - Stateless authentication
  - Cross-service compatibility
  - Mobile app ready
  - Refresh token rotation
  - Claim-based authorization
```

### Implementation
```typescript
// lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from './db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { organization: true }
        });

        if (!user || !await bcrypt.compare(credentials.password, user.passwordHash)) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
          organization: user.organization
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.organizationId = user.organizationId;
        token.organization = user.organization;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.organizationId = token.organizationId as string;
        session.user.organization = token.organization as any;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error'
  }
};

// Backend JWT utilities
export function generateApiToken(user: any): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId
    },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );
}

export function verifyApiToken(token: string): any {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    throw new Error('Invalid token');
  }
}
```

```typescript
// middleware/auth.ts (Fastify)
import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyApiToken } from '../lib/auth';

export async function authenticateToken(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authHeader = request.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    reply.code(401).send({ error: 'Access token required' });
    return;
  }

  try {
    const decoded = verifyApiToken(token);
    request.user = decoded;
  } catch (error) {
    reply.code(403).send({ error: 'Invalid token' });
    return;
  }
}

export async function requireRole(roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user || !roles.includes(request.user.role)) {
      reply.code(403).send({ error: 'Insufficient permissions' });
      return;
    }
  };
}

export async function requireOrganization() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user?.organizationId) {
      reply.code(403).send({ error: 'Organization required' });
      return;
    }
  };
}
```

### Consequences
- **Positive:** Integração perfeita, flexível, seguro
- **Negative:** Complexidade session management
- **Risk:** Breaking changes NextAuth.js, JWT token management

---

## ADR-008: UI Framework e Design System

### Decision
**Tailwind CSS + Radix UI + Shadcn/ui**

### Status
✅ **APPROVED**

### Context
Necessidade de UI consistente, acessível e fácil de manter.

### Options Considered
1. **Material-UI** - Completo mas pesado
2. **Chakra UI** - Simples mas limitado
3. **Tailwind + Radix** - Flexível, performático (escolhido)
4. **Ant Design** - Enterprise mas opinionated

### Decision Rationale
```yaml
Tailwind CSS:
  - Utility-first approach
  - Customização completa
  - Bundle size otimizado
  - Design system consistente
  - Dark mode built-in

Radix UI:
  - Componentes acessíveis
  - Unstyled (flexibilidade)
  - Keyboard navigation
  - Screen reader support
  - WAI-ARIA compliance

Shadcn/ui:
  - Best practices components
  - Copy-paste approach
  - Tailwind + Radix integration
  - TypeScript first
  - Customizable design tokens
```

### Implementation
```bash
# Setup Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install Radix UI components
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select @radix-ui/react-toast

# Install Shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input card table
```

```typescript
// tailwind.config.js
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
  darkMode: ['class'],
};

export default config;
```

```tsx
// components/ui/Button.tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

### Consequences
- **Positive:** Performance excelente, acessibilidade garantida, flexibilidade total
- **Negative:** Curva de aprendizado Tailwind, mais verboso que CSS-in-JS
- **Risk:** Mudanças Radix UI podem quebrar componentes

---

## ADR-009: State Management

### Decision
**Zustand para client state + SWR para server state**

### Status
✅ **APPROVED**

### Context
Frontend precisa gerenciar estado local e sincronização com servidor.

### Options Considered
1. **Redux Toolkit** - Maduro mas verbose
2. **Zustand + SWR** - Simples, performático (escolhido)
3. **Jotai** - Atomic state, modern mas novo
4. **React Query** - Excelente mas overlap com SWR

### Decision Rationale
```yaml
Zustand Benefits:
  - Minimal boilerplate
  - TypeScript friendly
  - No providers needed
  - DevTools support
  - Small bundle size (800 bytes)

SWR Advantages:
  - Automatic caching
  - Background revalidation
  - Error handling built-in
  - Optimistic updates
  - Real-time sync
  - Next.js integration
```

### Implementation
```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        
        login: (user, token) => {
          set({ 
            user, 
            token, 
            isAuthenticated: true 
          }, false, 'auth/login');
        },
        
        logout: () => {
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false 
          }, false, 'auth/logout');
        },
        
        updateUser: (userData) => {
          const currentUser = get().user;
          if (currentUser) {
            set({ 
              user: { ...currentUser, ...userData } 
            }, false, 'auth/updateUser');
          }
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ 
          user: state.user, 
          token: state.token, 
          isAuthenticated: state.isAuthenticated 
        }),
      }
    ),
    { name: 'auth-store' }
  )
);

// stores/uiStore.ts
import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: 'light',
  
  toggleSidebar: () => set((state) => ({ 
    sidebarOpen: !state.sidebarOpen 
  })),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  setTheme: (theme) => set({ theme }),
}));

// hooks/useLeads.ts
import useSWR from 'swr';
import { useAuthStore } from '@/stores/authStore';

interface LeadFilters {
  page?: number;
  limit?: number;
  segment?: string;
  municipality?: string;
  minQuality?: number;
}

interface LeadsResponse {
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const fetcher = async (url: string, token: string): Promise<LeadsResponse> => {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch leads');
  }
  
  return response.json();
};

export function useLeads(filters: LeadFilters = {}) {
  const { token } = useAuthStore();
  
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });
  
  const url = `/api/v1/leads?${queryParams.toString()}`;
  
  const { data, error, mutate, isLoading } = useSWR(
    token ? [url, token] : null,
    ([url, token]) => fetcher(url, token),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  return {
    leads: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  };
}

// hooks/useLeadActions.ts
import { useAuthStore } from '@/stores/authStore';
import { mutate } from 'swr';

export function useLeadActions() {
  const { token } = useAuthStore();

  const requestAccess = async (leadId: string) => {
    const response = await fetch(`/api/v1/leads/${leadId}/access`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to request access');
    }

    // Invalidate leads cache
    mutate(
      (key) => Array.isArray(key) && key[0].includes('/api/v1/leads'),
      undefined,
      { revalidate: true }
    );

    return response.json();
  };

  const exportLeads = async (filters: any) => {
    const response = await fetch('/api/v1/leads/export', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters),
    });

    if (!response.ok) {
      throw new Error('Failed to export leads');
    }

    // Handle file download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return {
    requestAccess,
    exportLeads,
  };
}
```

### Consequences
- **Positive:** Simple, performático, type-safe, integração perfeita
- **Negative:** Dois sistemas de state para aprender
- **Risk:** SWR pode ter issues com SSR complexo

---

## ADR-010: Development Guidelines for AI Agents

### Decision
**Padrões específicos para desenvolvimento por agentes de IA**

### Status
✅ **APPROVED**

### Context
Agentes de IA precisam de guidelines claros para manter consistência e qualidade.

### AI Agent Development Rules

#### File Structure Standards
```typescript
// ALWAYS follow this structure for new features
src/
├── app/                     # Next.js App Router
│   ├── (auth)/             # Auth route group
│   ├── (dashboard)/        # Protected routes
│   ├── api/               # API routes
│   └── globals.css
├── components/            # Reusable UI components
│   ├── ui/               # Base components (Button, Input, etc)
│   ├── forms/            # Form components
│   ├── charts/           # Chart components
│   └── layout/           # Layout components
├── lib/                  # Utilities and configurations
│   ├── db.ts            # Prisma client
│   ├── auth.ts          # Authentication config
│   ├── queue.ts         # RabbitMQ setup
│   └── utils.ts         # Helper functions
├── hooks/               # Custom React hooks
├── stores/              # Zustand stores
├── types/               # TypeScript type definitions
├── workers/             # Background job processors
└── services/           # Business logic services
```

#### Naming Conventions
```typescript
// Files: kebab-case
lead-management.ts
user-profile.tsx
scraping-worker.ts

// Components: PascalCase
export function LeadTable() {}
export function UserProfile() {}

// Functions: camelCase
function calculateQualityScore() {}
async function processScrapingJob() {}

// Constants: SCREAMING_SNAKE_CASE
const MAX_RESULTS_PER_PAGE = 100;
const DEFAULT_TIMEOUT = 30000;

// Types/Interfaces: PascalCase
interface UserData {}
type LeadStatus = 'active' | 'inactive';
```

#### Code Quality Requirements

```typescript
// ALWAYS include proper TypeScript types
interface LeadData {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  segment: BusinessSegment;
  municipality: Municipality;
  dataQualityScore: number;
  createdAt: Date;
  updatedAt: Date;
}

// ALWAYS handle errors properly
async function fetchLeads(filters: LeadFilters): Promise<LeadData[]> {
  try {
    const response = await fetch('/api/v1/leads', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch leads:', error);
    throw new Error('Unable to load leads. Please try again.');
  }
}

// ALWAYS validate input data
import { z } from 'zod';

const LeadFiltersSchema = z.object({
  segment: z.string().optional(),
  municipality: z.string().optional(),
  minQuality: z.number().min(0).max(100).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

type LeadFilters = z.infer<typeof LeadFiltersSchema>;

// ALWAYS use proper logging
import { logger } from '@/lib/logger';

logger.info('Starting scraping job', { 
  municipalityId, 
  segment, 
  jobId 
});

logger.error('Scraping job failed', { 
  error: error.message, 
  stack: error.stack, 
  jobId 
});
```

#### Database Interaction Patterns

```typescript
// ALWAYS use transactions for related operations
async function createLeadWithAccess(
  leadData: LeadData, 
  organizationId: string
): Promise<{ lead: Business; access: LeadAccess }> {
  return await prisma.$transaction(async (tx) => {
    const lead = await tx.business.create({
      data: leadData,
    });

    const access = await tx.leadAccess.create({
      data: {
        organizationId,
        businessId: lead.id,
        accessType: 'view',
        cost: 0.50,
      },
    });

    return { lead, access };
  });
}

// ALWAYS include proper relations
async function getLeadsWithDetails(filters: LeadFilters) {
  return await prisma.business.findMany({
    where: buildWhereClause(filters),
    include: {
      businessSegment: true,
      municipality: {
        include: {
          state: true,
        },
      },
      neighborhood: true,
    },
    orderBy: {
      dataQualityScore: 'desc',
    },
    take: filters.limit,
    skip: (filters.page - 1) * filters.limit,
  });
}

// ALWAYS handle unique constraints
async function upsertBusiness(businessData: BusinessData): Promise<Business> {
  return await prisma.business.upsert({
    where: {
      name_phone_municipalityId: {
        name: businessData.name,
        phone: businessData.phone || '',
        municipalityId: businessData.municipalityId,
      },
    },
    update: {
      updatedAt: new Date(),
      lastVerifiedAt: new Date(),
      dataQualityScore: calculateQualityScore(businessData),
    },
    create: {
      ...businessData,
      dataQualityScore: calculateQualityScore(businessData),
    },
  });
}
```

#### API Endpoint Patterns

```typescript
// ALWAYS follow RESTful conventions
// routes/leads.ts
import { FastifyInstance } from 'fastify';
import { Type } from '@sinclair/typebox';

export async function leadsRoutes(fastify: FastifyInstance) {
  // GET /api/v1/leads - List leads with pagination
  fastify.get('/leads', {
    schema: {
      querystring: Type.Object({
        page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
        limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 20 })),
        segment: Type.Optional(Type.String()),
        municipality: Type.Optional(Type.String()),
        minQuality: Type.Optional(Type.Integer({ minimum: 0, maximum: 100 })),
      }),
      response: {
        200: Type.Object({
          data: Type.Array(Type.Object({
            id: Type.String(),
            name: Type.String(),
            phone: Type.Optional(Type.String()),
            // ... other fields
          })),
          pagination: Type.Object({
            page: Type.Integer(),
            limit: Type.Integer(),
            total: Type.Integer(),
            pages: Type.Integer(),
          }),
        }),
      },
    },
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const filters = request.query;
    const user = request.user;
    
    // Apply organization filter for multi-tenancy
    const whereClause = {
      ...buildFilters(filters),
      // Only show leads this organization has access to
      leadAccesses: {
        some: {
          organizationId: user.organizationId,
        },
      },
    };
    
    const [leads, total] = await Promise.all([
      prisma.business.findMany({
        where: whereClause,
        include: {
          businessSegment: true,
          municipality: {
            include: { state: true },
          },
        },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: { dataQualityScore: 'desc' },
      }),
      prisma.business.count({ where: whereClause }),
    ]);
    
    return {
      data: leads,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit),
      },
    };
  });

  // POST /api/v1/leads/:id/access - Request access to a lead
  fastify.post('/leads/:id/access', {
    schema: {
      params: Type.Object({
        id: Type.String({ format: 'uuid' }),
      }),
      body: Type.Object({
        accessType: Type.Union([
          Type.Literal('view'),
          Type.Literal('contact'),
          Type.Literal('export'),
        ]),
      }),
      response: {
        201: Type.Object({
          id: Type.String(),
          accessType: Type.String(),
          cost: Type.Number(),
          grantedAt: Type.String({ format: 'date-time' }),
        }),
      },
    },
    preHandler: [fastify.authenticate, fastify.requireOrganization],
  }, async (request, reply) => {
    const { id: leadId } = request.params;
    const { accessType } = request.body;
    const user = request.user;
    
    // Check if organization has quota
    const organization = await prisma.organization.findUnique({
      where: { id: user.organizationId },
    });
    
    if (!organization || organization.usedQuota >= organization.monthlyQuota) {
      return reply.code(402).send({ 
        error: 'Monthly quota exceeded' 
      });
    }
    
    // Calculate cost based on access type
    const cost = calculateAccessCost(accessType);
    
    // Create access record
    const access = await prisma.leadAccess.create({
      data: {
        organizationId: user.organizationId,
        businessId: leadId,
        accessType,
        cost,
      },
    });
    
    // Update organization quota
    await prisma.organization.update({
      where: { id: user.organizationId },
      data: {
        usedQuota: {
          increment: 1,
        },
      },
    });
    
    reply.code(201).send(access);
  });
}
```

#### RabbitMQ Job Patterns

```typescript
// ALWAYS follow job processing patterns
// workers/scrapingWorker.ts
import { queueManager } from '@/lib/queue';
import { GoogleMapsScraper } from '@/services/scraper';

interface ScrapingJob {
  id: string;
  municipalityId: string;
  segment: string;
  strategies: string[];
  maxResults: number;
  sessionId: string;
  retries: number;
}

export class ScrapingWorker {
  async start() {
    await queueManager.connect();
    
    // ALWAYS handle jobs with proper error handling
    await queueManager.consumeScrapingJobs(async (job: ScrapingJob) => {
      const startTime = Date.now();
      
      try {
        logger.info('Starting scraping job', { 
          jobId: job.id, 
          municipalityId: job.municipalityId, 
          segment: job.segment 
        });
        
        await this.processJob(job);
        
        logger.info('Scraping job completed', { 
          jobId: job.id, 
          duration: Date.now() - startTime 
        });
        
      } catch (error) {
        logger.error('Scraping job failed', { 
          jobId: job.id, 
          error: error.message, 
          stack: error.stack,
          retries: job.retries 
        });
        
        // ALWAYS implement retry logic
        if (job.retries < 3) {
          await this.retryJob({ ...job, retries: job.retries + 1 });
        } else {
          await this.moveToDeadLetter(job, error);
        }
        
        throw error;
      }
    });
  }
  
  private async processJob(job: ScrapingJob) {
    // ALWAYS update session status
    await prisma.scrapingSession.update({
      where: { id: job.sessionId },
      data: { status: 'running', startedAt: new Date() },
    });
    
    const scraper = new GoogleMapsScraper();
    await scraper.initialize();
    
    try {
      const municipality = await this.getMunicipalityData(job.municipalityId);
      const results = await scraper.searchPlaces(
        job.segment,
        `${municipality.name} ${municipality.state.code}`,
        job.maxResults
      );
      
      // ALWAYS process results in batches
      const savedBusinesses = await this.processBatchResults(results, job);
      
      // ALWAYS update session with final results
      await prisma.scrapingSession.update({
        where: { id: job.sessionId },
        data: {
          status: 'completed',
          totalResults: savedBusinesses.length,
          finishedAt: new Date(),
        },
      });
      
    } finally {
      await scraper.close();
    }
  }
}
```

#### Testing Requirements

```typescript
// ALWAYS write tests for critical functions
// __tests__/services/scraper.test.ts
import { GoogleMapsScraper } from '@/services/scraper';
import { jest } from '@jest/globals';

describe('GoogleMapsScraper', () => {
  let scraper: GoogleMapsScraper;
  
  beforeEach(() => {
    scraper = new GoogleMapsScraper({ headless: true });
  });
  
  afterEach(async () => {
    await scraper.close();
  });
  
  describe('searchPlaces', () => {
    it('should extract business data correctly', async () => {
      const results = await scraper.searchPlaces(
        'dentistas',
        'Franca SP',
        5
      );
      
      expect(results).toHaveLength(5);
      expect(results[0]).toMatchObject({
        name: expect.any(String),
        phone: expect.any(String),
      });
    });
    
    it('should handle errors gracefully', async () => {
      const invalidScraper = new GoogleMapsScraper({ 
        timeout: 1 // Very short timeout to force error
      });
      
      await expect(
        invalidScraper.searchPlaces('invalid', 'invalid', 1)
      ).rejects.toThrow();
    });
  });
});

// __tests__/api/leads.test.ts
import { FastifyInstance } from 'fastify';
import { build } from '@/server';

describe('/api/v1/leads', () => {
  let app: FastifyInstance;
  
  beforeAll(async () => {
    app = build({ logger: false });
    await app.ready();
  });
  
  afterAll(async () => {
    await app.close();
  });
  
  describe('GET /api/v1/leads', () => {
    it('should return paginated leads', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/leads?page=1&limit=10',
        headers: {
          authorization: 'Bearer valid-jwt-token',
        },
      });
      
      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data).toMatchObject({
        data: expect.any(Array),
        pagination: {
          page: 1,
          limit: 10,
          total: expect.any(Number),
          pages: expect.any(Number),
        },
      });
    });
    
    it('should require authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/leads',
      });
      
      expect(response.statusCode).toBe(401);
    });
  });
});
```

#### Environment Configuration

```bash
# .env.example - ALWAYS provide example env file
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/leadgen"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="your-jwt-secret"

# Google OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# RabbitMQ
RABBITMQ_URL="amqp://localhost:5672"

# Redis (for caching)
REDIS_URL="redis://localhost:6379"

# External APIs
GOOGLE_MAPS_API_KEY=""

# Monitoring
PROMETHEUS_PORT=9090
```

#### Performance Guidelines

```typescript
// ALWAYS implement caching for expensive operations
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function getCachedLeads(cacheKey: string, fetchFn: () => Promise<any>) {
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch and cache
  const data = await fetchFn();
  await redis.setex(cacheKey, 300, JSON.stringify(data)); // 5 minute cache
  
  return data;
}

// ALWAYS implement pagination
async function getPaginatedResults<T>(
  query: any,
  page: number,
  limit: number
): Promise<{ data: T[]; total: number; pages: number }> {
  const [data, total] = await Promise.all([
    query.skip((page - 1) * limit).take(limit),
    query.count(),
  ]);
  
  return {
    data,
    total,
    pages: Math.ceil(total / limit),
  };
}

// ALWAYS optimize database queries
async function getLeadsOptimized(filters: LeadFilters) {
  return await prisma.business.findMany({
    where: buildWhereClause(filters),
    select: {
      // Only select needed fields
      id: true,
      name: true,
      phone: true,
      dataQualityScore: true,
      businessSegment: {
        select: {
          name: true,
          category: true,
        },
      },
      municipality: {
        select: {
          name: true,
          state: {
            select: {
              name: true,
              code: true,
            },
          },
        },
      },
    },
  });
}
```

### Consequences
- **Positive:** Consistency, quality, maintainability
- **Negative:** Learning curve for AI agents, mais verbose
- **Risk:** Guidelines podem ficar outdated rapidamente

---

## Summary of Decisions

| ADR | Decision | Technology | Rationale |
|-----|----------|------------|-----------|
| 001 | Runtime | Node.js 20+ + TypeScript | Unified stack, performance |
| 002 | Backend | Fastify | Performance, TypeScript native |
| 003 | Database | PostgreSQL + Prisma | Type safety, compatibility |
| 004 | Queue | RabbitMQ + amqplib | Reliability, message persistence |
| 005 | Scraping | Puppeteer + Playwright | Performance, Node.js native |
| 006 | Frontend | Next.js 14+ App Router | SSR, performance, integration |
| 007 | Auth | NextAuth.js + JWT | Flexibility, integration |
| 008 | UI | Tailwind + Radix + Shadcn | Performance, accessibility |
| 009 | State | Zustand + SWR | Simplicity, performance |
| 010 | Guidelines | AI Agent Standards | Consistency, quality |

---

## Implementation Checklist

### Phase 1: Foundation (Weeks 1-2)
- [ ] Setup Node.js project with TypeScript
- [ ] Configure Prisma with existing PostgreSQL schema
- [ ] Setup RabbitMQ connection and basic queues
- [ ] Initialize Next.js project with Tailwind
- [ ] Configure authentication with NextAuth.js

### Phase 2: Backend Core (Weeks 3-6)
- [ ] Implement Fastify server with authentication middleware
- [ ] Create lead CRUD API endpoints
- [ ] Setup organization and user management
- [ ] Implement quota and billing system
- [ ] Create comprehensive API documentation

### Phase 3: Scraping Migration (Weeks 7-9)
- [ ] Migrate scraper from Selenium to Puppeteer
- [ ] Implement RabbitMQ workers for background processing
- [ ] Create job scheduling and retry logic
- [ ] Setup monitoring and error handling
- [ ] Performance testing and optimization

### Phase 4: Frontend Development (Weeks 10-13)
- [ ] Build authentication pages and flows
- [ ] Create lead management interface
- [ ] Implement dashboard with analytics
- [ ] Build admin panel for organizations
- [ ] Add real-time updates with WebSockets

### Phase 5: Integration & Testing (Weeks 14-15)
- [ ] End-to-end testing with Playwright
- [ ] API testing with Supertest
- [ ] Performance testing and optimization
- [ ] Security audit and penetration testing
- [ ] Load testing with K6

### Phase 6: Deployment (Week 16)
- [ ] Docker containerization
- [ ] Kubernetes deployment configuration
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Monitoring setup with Prometheus/Grafana
- [ ] Production deployment and rollout

---

## Conclusion

This ADR provides comprehensive guidance for implementing the lead generation platform using modern Node.js technologies. The decisions prioritize performance, type safety, and developer experience while maintaining scalability for the multi-tenant SaaS model.

**Key Success Factors:**
1. **Type Safety**: TypeScript throughout the entire stack
2. **Performance**: Optimized technologies for I/O intensive operations
3. **Reliability**: RabbitMQ for guaranteed message processing
4. **Developer Experience**: Modern tooling and clear patterns
5. **Scalability**: Architecture designed for growth

**For AI Agents:**
- Follow the established patterns and naming conventions
- Always implement proper error handling and logging
- Use TypeScript strictly and validate all inputs
- Write tests for all critical functionality
- Maintain consistent code style and documentation

This ADR serves as the definitive guide for all technical decisions and implementation details for the project.

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"id": "1", "content": "Analisar decis\u00f5es arquiteturais para Node.js", "status": "completed"}, {"id": "2", "content": "Definir stack com RabbitMQ para filas", "status": "completed"}, {"id": "3", "content": "Documentar decis\u00f5es de tecnologia", "status": "completed"}, {"id": "4", "content": "Especificar padr\u00f5es de desenvolvimento", "status": "completed"}, {"id": "5", "content": "Criar guidelines para agentes de IA", "status": "completed"}, {"id": "6", "content": "Documentar estrutura do projeto", "status": "completed"}, {"id": "7", "content": "Finalizar ADR completo", "status": "completed"}]