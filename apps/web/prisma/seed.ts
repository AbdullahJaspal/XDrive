import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const operator = await prisma.operator.upsert({
    where: { licenceNumber: 'WLV-DEV-001' },
    update: {},
    create: {
      licenceNumber: 'WLV-DEV-001',
      legalName: 'X Drive Dev Operator Ltd',
      tradingName: 'X Drive',
      addressLine1: '1 Operator House',
      city: 'Wolverhampton',
      postcode: 'WV1 1AA',
      contactEmail: 'operator@phv-dev.local',
      contactPhone: '+447700900000',
      bookingRetentionYears: 2,
    },
  });

  const passwordHash = await bcrypt.hash('ChangeMe123!', 12);

  await prisma.user.upsert({
    where: { email: 'admin@phv-dev.local' },
    update: {},
    create: {
      email: 'admin@phv-dev.local',
      passwordHash,
      firstName: 'Operator',
      lastName: 'Admin',
      role: UserRole.OPERATOR_ADMIN,
      status: 'ACTIVE',
      emailVerified: true,
      operatorId: operator.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'dispatcher@phv-dev.local' },
    update: {},
    create: {
      email: 'dispatcher@phv-dev.local',
      passwordHash,
      firstName: 'Dispatch',
      lastName: 'Lead',
      role: UserRole.DISPATCHER,
      status: 'ACTIVE',
      emailVerified: true,
      operatorId: operator.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'customer@phv-dev.local' },
    update: {},
    create: {
      email: 'customer@phv-dev.local',
      passwordHash,
      firstName: 'Alex',
      lastName: 'Passenger',
      phone: '07700900123',
      role: UserRole.CUSTOMER,
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  console.log('Seed completed:', { operatorId: operator.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
