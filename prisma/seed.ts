import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo organization
  const demoOrg = await prisma.organization.upsert({
    where: { name: 'Demo Organization' },
    update: {},
    create: {
      name: 'Demo Organization',
      cnpj: '12.345.678/0001-90',
      plan: 'professional',
      billingEmail: 'billing@demo-org.com',
      settings: {
        theme: 'light',
        notifications: true,
        autoAssignLeads: false,
      },
    },
  });

  console.log('✅ Demo organization created');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { 
      organizationId_email: {
        organizationId: demoOrg.id,
        email: 'admin@demo.com'
      }
    },
    update: {},
    create: {
      email: 'admin@demo.com',
      name: 'Admin User',
      passwordHash: await bcrypt.hash('admin123', 12),
      role: 'admin',
      organizationId: demoOrg.id,
      isActive: true,
      emailVerified: true,
    },
  });

  console.log('✅ Admin user created');

  // Create org admin user
  const orgAdminUser = await prisma.user.upsert({
    where: { 
      organizationId_email: {
        organizationId: demoOrg.id,
        email: 'orgadmin@demo.com'
      }
    },
    update: {},
    create: {
      email: 'orgadmin@demo.com',
      name: 'Organization Admin',
      passwordHash: await bcrypt.hash('orgadmin123', 12),
      role: 'org_admin',
      organizationId: demoOrg.id,
      isActive: true,
      emailVerified: true,
    },
  });

  console.log('✅ Org admin user created');

  // Create agent user
  const agentUser = await prisma.user.upsert({
    where: { 
      organizationId_email: {
        organizationId: demoOrg.id,
        email: 'agent@demo.com'
      }
    },
    update: {},
    create: {
      email: 'agent@demo.com',
      name: 'Sales Agent',
      passwordHash: await bcrypt.hash('agent123', 12),
      role: 'agent',
      organizationId: demoOrg.id,
      isActive: true,
      emailVerified: true,
    },
  });

  console.log('✅ Agent user created');

  // Create lead segments
  const segments = [
    { name: 'Hot Leads', description: 'High-priority leads ready for contact', color: '#ef4444' },
    { name: 'Warm Leads', description: 'Qualified leads with potential', color: '#f59e0b' },
    { name: 'Cold Leads', description: 'Initial leads requiring nurturing', color: '#06b6d4' },
    { name: 'Enterprise', description: 'Large enterprise prospects', color: '#8b5cf6' },
    { name: 'SMB', description: 'Small and medium business prospects', color: '#10b981' },
  ];

  const createdSegments = [];
  for (const segment of segments) {
    const createdSegment = await prisma.leadSegment.upsert({
      where: {
        organizationId_name: {
          organizationId: demoOrg.id,
          name: segment.name,
        },
      },
      update: {},
      create: {
        ...segment,
        organizationId: demoOrg.id,
      },
    });
    createdSegments.push(createdSegment);
  }

  console.log('✅ Lead segments created');

  // Create pipeline stages
  const stages = [
    { name: 'New Lead', stageOrder: 1, color: '#6366f1' },
    { name: 'Contacted', stageOrder: 2, color: '#8b5cf6' },
    { name: 'Qualified', stageOrder: 3, color: '#06b6d4' },
    { name: 'Proposal Sent', stageOrder: 4, color: '#f59e0b' },
    { name: 'Negotiation', stageOrder: 5, color: '#ec4899' },
    { name: 'Closed Won', stageOrder: 6, color: '#10b981' },
    { name: 'Closed Lost', stageOrder: 7, color: '#ef4444' },
  ];

  const createdStages = [];
  for (const stage of stages) {
    const createdStage = await prisma.pipelineStage.upsert({
      where: {
        organizationId_stageOrder: {
          organizationId: demoOrg.id,
          stageOrder: stage.stageOrder,
        },
      },
      update: {},
      create: {
        ...stage,
        organizationId: demoOrg.id,
      },
    });
    createdStages.push(createdStage);
  }

  console.log('✅ Pipeline stages created');

  // Create demo leads
  const demoLeads = [
    {
      name: 'João Silva',
      email: 'joao.silva@empresa.com',
      phone: '+55 11 99999-1111',
      company: 'TechCorp Ltda',
      position: 'CTO',
      website: 'https://techcorp.com.br',
      linkedinUrl: 'https://linkedin.com/in/joaosilva',
      addressCity: 'São Paulo',
      addressState: 'SP',
      addressCountry: 'Brasil',
      qualityScore: 85,
      tags: ['tecnologia', 'startup', 'inovacao'],
      source: 'linkedin_scraping',
      dataConfidence: 0.92,
    },
    {
      name: 'Maria Santos',
      email: 'maria.santos@inovacorp.com',
      phone: '+55 21 98888-2222',
      company: 'InovaCorp',
      position: 'Diretora de Marketing',
      website: 'https://inovacorp.com.br',
      addressCity: 'Rio de Janeiro',
      addressState: 'RJ',
      addressCountry: 'Brasil',
      qualityScore: 78,
      tags: ['marketing', 'digital', 'growth'],
      source: 'web_scraping',
      dataConfidence: 0.87,
    },
    {
      name: 'Carlos Oliveira',
      email: 'carlos@vendascorp.com',
      phone: '+55 31 97777-3333',
      company: 'VendasCorp',
      position: 'Gerente de Vendas',
      addressCity: 'Belo Horizonte',
      addressState: 'MG',
      addressCountry: 'Brasil',
      qualityScore: 92,
      tags: ['vendas', 'b2b', 'performance'],
      source: 'manual_import',
      dataConfidence: 0.95,
    },
    {
      name: 'Ana Costa',
      email: 'ana.costa@fintech.com',
      phone: '+55 47 96666-4444',
      company: 'FinTech Solutions',
      position: 'Head de Produto',
      website: 'https://fintech-solutions.com',
      addressCity: 'Florianópolis',
      addressState: 'SC',
      addressCountry: 'Brasil',
      qualityScore: 88,
      tags: ['fintech', 'produto', 'finance'],
      source: 'crunchbase_api',
      dataConfidence: 0.90,
    },
    {
      name: 'Roberto Lima',
      email: 'roberto@logistica.com.br',
      company: 'Logística Express',
      position: 'Diretor Operacional',
      addressCity: 'Curitiba',
      addressState: 'PR',
      addressCountry: 'Brasil',
      qualityScore: 75,
      tags: ['logistica', 'operacoes', 'transporte'],
      source: 'manual_import',
      dataConfidence: 0.82,
    },
  ];

  const createdLeads = [];
  for (let i = 0; i < demoLeads.length; i++) {
    const leadData = demoLeads[i];
    const segment = createdSegments[i % createdSegments.length];

    const lead = await prisma.lead.create({
      data: {
        ...leadData,
        organizationId: demoOrg.id,
        segmentId: segment.id,
        customFields: {
          lead_score: Math.floor(Math.random() * 100),
          industry: ['Technology', 'Marketing', 'Sales', 'Finance', 'Logistics'][i],
          company_size: ['Startup', 'Small', 'Medium', 'Large', 'Enterprise'][i],
        },
      },
    });

    createdLeads.push(lead);
  }

  console.log('✅ Demo leads created');

  // Create pipeline leads (add leads to pipeline)
  for (let i = 0; i < createdLeads.length; i++) {
    const lead = createdLeads[i];
    const stage = createdStages[Math.floor(Math.random() * 5)]; // Random stage (exclude closed)
    const assignedUser = [agentUser, orgAdminUser][Math.floor(Math.random() * 2)];

    await prisma.pipelineLead.create({
      data: {
        organizationId: demoOrg.id,
        leadId: lead.id,
        stageId: stage.id,
        assignedUserId: assignedUser.id,
        estimatedValue: Math.floor(Math.random() * 100000) + 10000, // Random value between 10k-110k
        probability: Math.random(),
        closeDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date in next 90 days
        notes: `Pipeline lead for ${lead.name} at ${lead.company}`,
      },
    });
  }

  console.log('✅ Pipeline leads created');

  // Create some activities
  const activityTypes = ['call', 'email', 'meeting', 'note'] as const;
  const pipelineLeads = await prisma.pipelineLead.findMany({
    where: { organizationId: demoOrg.id },
  });

  for (const pipelineLead of pipelineLeads.slice(0, 3)) {
    for (let i = 0; i < 2; i++) {
      const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const user = [agentUser, orgAdminUser][Math.floor(Math.random() * 2)];

      await prisma.activity.create({
        data: {
          organizationId: demoOrg.id,
          pipelineLeadId: pipelineLead.id,
          userId: user.id,
          type: activityType,
          title: `${activityType} activity`,
          description: `Demo ${activityType} activity for pipeline lead`,
          scheduledAt: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
          durationMinutes: activityType === 'call' ? 30 : activityType === 'meeting' ? 60 : undefined,
          metadata: {
            demo: true,
            importance: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          },
        },
      });
    }
  }

  console.log('✅ Demo activities created');

  // Create API key for demo
  const apiKeyData = {
    key: 'lsr_demo_api_key_12345678',
    hash: await bcrypt.hash('lsr_demo_api_key_12345678', 10),
    prefix: 'lsr_demo_',
  };

  await prisma.apiKey.upsert({
    where: {
      keyPrefix: apiKeyData.prefix,
    },
    update: {},
    create: {
      organizationId: demoOrg.id,
      userId: orgAdminUser.id,
      name: 'Demo API Key',
      keyHash: apiKeyData.hash,
      keyPrefix: apiKeyData.prefix,
      permissions: ['leads:read', 'leads:write', 'contacts:read'],
      rateLimitPerHour: 1000,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    },
  });

  console.log('✅ Demo API key created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Demo Credentials:');
  console.log('Admin: admin@demo.com / admin123');
  console.log('Org Admin: orgadmin@demo.com / orgadmin123');
  console.log('Agent: agent@demo.com / agent123');
  console.log('\n🔑 Demo API Key: lsr_demo_api_key_12345678');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });