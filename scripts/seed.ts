import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hidden test account
  const testHash = await bcrypt.hash('m#OJNI1aYI', 10);
  await prisma.user.upsert({
    where: { email: 'abacus-c249ebe7@example.com' },
    update: {},
    create: {
      name: 'Test Admin',
      email: 'abacus-c249ebe7@example.com',
      passwordHash: testHash,
      role: 'admin',
      plan: 'premium',
      onboardingCompleted: true,
      aiCredits: 50,
    },
  });

  // Admin account requested by user
  const adminHash = await bcrypt.hash('Admin@2024', 10);
  await prisma.user.upsert({
    where: { email: 'admin@momentocomdeus.com.br' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@momentocomdeus.com.br',
      passwordHash: adminHash,
      role: 'admin',
      plan: 'premium',
      onboardingCompleted: true,
      aiCredits: 50,
    },
  });

  // App settings
  const settings = [
    { key: 'free_ai_credits', value: '3' },
    { key: 'premium_ai_credits', value: '50' },
    { key: 'prayer_credit_cost', value: '1' },
    { key: 'reflection_credit_cost', value: '1' },
    { key: 'my_moment_credit_cost', value: '2' },
    { key: 'price_monthly_brl', value: '19.90' },
    { key: 'price_yearly_brl', value: '149.90' },
  ];
  for (const s of settings) {
    await prisma.appSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  // Demo songs
  const songs = [
    { title: 'Momento de Oração', artist: 'Momento com Deus', category: 'Oração', isFree: true, durationSeconds: 240 },
    { title: 'Paz que Excede', artist: 'Momento com Deus', category: 'Paz', isFree: true, durationSeconds: 210 },
    { title: 'Gratidão', artist: 'Momento com Deus', category: 'Gratidão', isFree: true, durationSeconds: 195 },
    { title: 'Adoração ao Criador', artist: 'Momento com Deus', category: 'Adoração', isFree: false, durationSeconds: 270 },
    { title: 'Amanhecer com Deus', artist: 'Momento com Deus', category: 'Começar o dia', isFree: true, durationSeconds: 180 },
    { title: 'Noite de Descanso', artist: 'Momento com Deus', category: 'Antes de dormir', isFree: false, durationSeconds: 300 },
    { title: 'Força nos Momentos Difíceis', artist: 'Momento com Deus', category: 'Momentos difíceis', isFree: true, durationSeconds: 225 },
  ];
  for (const song of songs) {
    const existing = await prisma.song.findFirst({ where: { title: song.title } });
    if (!existing) {
      await prisma.song.create({ data: song });
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
