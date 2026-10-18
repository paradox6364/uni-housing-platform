const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  const passwordHash = await bcrypt.hash('password123', 10);

  const landlord = await prisma.user.upsert({
    where: { email: 'landlord@unihousing.com' },
    update: {},
    create: {
      name: 'Ahmed Hassan (Verified Landlord)',
      email: 'landlord@unihousing.com',
      passwordHash,
      phone: '+201012345678',
      role: 'LANDLORD',
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@unihousing.com' },
    update: {},
    create: {
      name: 'Samir Mohamed',
      email: 'student@unihousing.com',
      passwordHash,
      phone: '+201122334455',
      role: 'STUDENT',
    },
  });

  // Clear existing demo universities/properties to avoid duplicates on re-seed
  await prisma.booking.deleteMany();
  await prisma.roomType.deleteMany();
  await prisma.property.deleteMany();
  await prisma.university.deleteMany();

  const cairoUni = await prisma.university.create({
    data: {
      name: 'Cairo University',
      city: 'Giza',
      country: 'Egypt',
      latitude: 30.0276,
      longitude: 31.2101,
    },
  });

  const ainShamsUni = await prisma.university.create({
    data: {
      name: 'Ain Shams University',
      city: 'Cairo',
      country: 'Egypt',
      latitude: 30.0764,
      longitude: 31.2844,
    },
  });

  await prisma.property.create({
    data: {
      title: 'Dokki Student Suites',
      description: 'Modern furnished student apartments 10 minutes from Cairo University main gate.',
      address: '14 Tahrir St, Dokki',
      city: 'Giza',
      latitude: 30.0385,
      longitude: 31.2125,
      amenities: ['High-Speed WiFi', 'Air Conditioning', 'Study Desk', 'Washing Machine'],
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
      landlordId: landlord.id,
      rooms: {
        create: [
          {
            name: 'Twin Shared Room',
            category: 'SHARED_ROOM',
            pricePerMonth: 150,
            currency: 'USD',
            sizeSqm: 24,
            availableFrom: new Date('2026-09-01'),
          },
          {
            name: 'Single Private En-Suite',
            category: 'PRIVATE_ROOM',
            pricePerMonth: 250,
            currency: 'USD',
            sizeSqm: 18,
            availableFrom: new Date('2026-09-01'),
          }
        ],
      },
    },
  });

  await prisma.property.create({
    data: {
      title: 'Bein El-Sarayat Campus Lofts',
      description: 'Right across from Cairo University! All bills included with 24/7 security.',
      address: '8 Bein El-Sarayat St, Giza',
      city: 'Giza',
      latitude: 30.0312,
      longitude: 31.2065,
      amenities: ['All Bills Included', '24/7 Security', 'Study Lounge', 'WiFi'],
      images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'],
      landlordId: landlord.id,
      rooms: {
        create: [
          {
            name: 'Standard Private Room',
            category: 'PRIVATE_ROOM',
            pricePerMonth: 210,
            currency: 'USD',
            sizeSqm: 16,
            availableFrom: new Date('2026-09-01'),
          },
          {
            name: 'Deluxe Studio Apartment',
            category: 'ENTIRE_PLACE',
            pricePerMonth: 340,
            currency: 'USD',
            sizeSqm: 32,
            availableFrom: new Date('2026-09-01'),
          }
        ],
      },
    },
  });

  await prisma.property.create({
    data: {
      title: 'Abbassia Metro Student Residence',
      description: '5 minutes walk to Ain Shams University main campus and Abbassia Metro.',
      address: '19 El-Khalifa El-Maamoun, Abbassia',
      city: 'Cairo',
      latitude: 30.0725,
      longitude: 31.2810,
      amenities: ['WiFi', 'Air Conditioning', 'Elevator', 'Near Metro'],
      images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80'],
      landlordId: landlord.id,
      rooms: {
        create: [
          {
            name: 'Private Balcony Room',
            category: 'PRIVATE_ROOM',
            pricePerMonth: 195,
            currency: 'USD',
            sizeSqm: 19,
            availableFrom: new Date('2026-09-01'),
          }
        ],
      },
    },
  });

  console.log('✅ Seed complete!');
  console.log('   Demo Landlord Login: landlord@unihousing.com / password123');
  console.log('   Demo Student Login:  student@unihousing.com  / password123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
