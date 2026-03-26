import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const stages = [
    { name: 'lead', label: 'Lead', color: 'bg-blue-500/20 text-blue-400', order: 1 },
    { name: 'contacted', label: 'Contacté', color: 'bg-yellow-500/20 text-yellow-400', order: 2 },
    { name: 'negotiation', label: 'Négociation', color: 'bg-orange-500/20 text-orange-400', order: 3 },
    { name: 'won', label: 'Gagné', color: 'bg-green-500/20 text-green-400', order: 4 },
    { name: 'lost', label: 'Perdu', color: 'bg-red-500/20 text-red-400', order: 5 },
  ];

  for (const s of stages) {
    await prisma.pipelineStage.upsert({
      where: { name: s.name },
      update: s,
      create: s,
    });
  }
  console.log('Stages seeded!');
}

main().finally(() => prisma.$disconnect());
