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

  const driverUser = await prisma.user.upsert({
    where: { email: 'driver@phv-dev.local' },
    update: {
      operatorId: operator.id,
      status: 'ACTIVE',
      emailVerified: true,
    },
    create: {
      email: 'driver@phv-dev.local',
      passwordHash,
      firstName: 'James',
      lastName: 'Mitchell',
      phone: '07700900456',
      role: UserRole.DRIVER,
      status: 'ACTIVE',
      emailVerified: true,
      operatorId: operator.id,
    },
  });

  const vehicle = await prisma.vehicle.upsert({
    where: {
      operatorId_registration: {
        operatorId: operator.id,
        registration: 'BD24 XDR',
      },
    },
    update: {},
    create: {
      operatorId: operator.id,
      registration: 'BD24 XDR',
      make: 'Mercedes-Benz',
      model: 'E-Class',
      colour: 'Black',
      year: 2024,
      seats: 4,
      isWheelchairAccessible: false,
      status: 'ACTIVE',
    },
  });

  const driver = await prisma.driver.upsert({
    where: { userId: driverUser.id },
    update: {
      status: 'ON_DUTY',
      employeeNumber: 'DRV-001',
    },
    create: {
      operatorId: operator.id,
      userId: driverUser.id,
      employeeNumber: 'DRV-001',
      status: 'ON_DUTY',
      approvedAt: new Date(),
    },
  });

  await prisma.driverVehicle.upsert({
    where: {
      driverId_vehicleId: {
        driverId: driver.id,
        vehicleId: vehicle.id,
      },
    },
    update: { isPrimary: true, endedAt: null },
    create: {
      driverId: driver.id,
      vehicleId: vehicle.id,
      isPrimary: true,
    },
  });

  const licenceExpiry = new Date();
  licenceExpiry.setFullYear(licenceExpiry.getFullYear() + 1);

  const existingDriverLicence = await prisma.complianceDocument.findFirst({
    where: { driverId: driver.id, licenceType: 'PHV_DRIVER' },
  });
  if (!existingDriverLicence) {
    await prisma.complianceDocument.create({
      data: {
        driverId: driver.id,
        licenceType: 'PHV_DRIVER',
        licenceNumber: 'WLV-DRV-SEED-001',
        issuingAuthority: 'Wolverhampton City Council',
        expiryDate: licenceExpiry,
        status: 'VALID',
      },
    });
  }

  const existingVehicleLicence = await prisma.complianceDocument.findFirst({
    where: { vehicleId: vehicle.id, licenceType: 'PHV_VEHICLE' },
  });
  if (!existingVehicleLicence) {
    await prisma.complianceDocument.create({
      data: {
        vehicleId: vehicle.id,
        licenceType: 'PHV_VEHICLE',
        licenceNumber: 'WLV-VEH-SEED-001',
        issuingAuthority: 'Wolverhampton City Council',
        expiryDate: licenceExpiry,
        status: 'VALID',
      },
    });
  }

  const queueReference = 'PHV-SEED-QUEUE-001';
  const existingQueue = await prisma.booking.findUnique({
    where: { reference: queueReference },
  });
  if (!existingQueue) {
    await prisma.booking.create({
      data: {
        operatorId: operator.id,
        reference: queueReference,
        status: 'REQUESTED',
        source: 'PHONE',
        pickupAddress: 'Grand Central, Birmingham',
        pickupPostcode: 'B2 4QA',
        pickupLat: 52.4778,
        pickupLng: -1.8986,
        dropoffAddress: 'Jewellery Quarter, Birmingham',
        dropoffPostcode: 'B18 6HN',
        dropoffLat: 52.4892,
        dropoffLng: -1.912,
        passengerName: 'Tom Hughes',
        passengerPhone: '07700900888',
        fareEstimatePence: 1800,
        retentionExpiresAt: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000),
      },
    });
  }

  const sampleReference = 'PHV-SEED-DRIVER-001';
  const existingBooking = await prisma.booking.findUnique({
    where: { reference: sampleReference },
  });

  if (!existingBooking) {
    const scheduledAt = new Date();
    scheduledAt.setHours(scheduledAt.getHours() + 2);

    await prisma.booking.create({
      data: {
        operatorId: operator.id,
        reference: sampleReference,
        status: 'DISPATCHED',
        source: 'OPERATOR',
        driverId: driver.id,
        vehicleId: vehicle.id,
        pickupAddress: 'Birmingham New Street Station',
        pickupPostcode: 'B2 4QA',
        pickupLat: 52.4778,
        pickupLng: -1.8986,
        dropoffAddress: 'Birmingham Airport (BHX) Terminal 1',
        dropoffPostcode: 'B26 3QJ',
        dropoffLat: 52.4524,
        dropoffLng: -1.7336,
        scheduledAt,
        passengerName: 'Sarah Mitchell',
        passengerPhone: '07700900789',
        passengerEmail: 'sarah@example.com',
        notes: 'Meet at main station entrance. Flight BA1234.',
        fareEstimatePence: 4500,
        dispatchedAt: new Date(),
        retentionExpiresAt: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log('Seed completed:', {
    operatorId: operator.id,
    driverId: driver.id,
    driverLogin: 'driver@phv-dev.local / ChangeMe123!',
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
