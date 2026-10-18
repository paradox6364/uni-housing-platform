const prisma = require('../config/db');
const { calculateDistanceKm, estimateCommute } = require('../utils/geo');

exports.searchByUniversity = async (req, res) => {
  try {
    const { universityId, maxDistanceKm = 15, maxPrice, category } = req.query;
    if (!universityId) return res.status(400).json({ error: 'Please provide a universityId' });

    const university = await prisma.university.findUnique({ where: { id: universityId } });
    if (!university) return res.status(404).json({ error: 'University not found' });

    const properties = await prisma.property.findMany({
      where: {
        rooms: {
          some: {
            isAvailable: true,
            ...(maxPrice && { pricePerMonth: { lte: parseFloat(maxPrice) } }),
            ...(category && { category }),
          },
        },
      },
      include: {
        rooms: { where: { isAvailable: true }, orderBy: { pricePerMonth: 'asc' } },
        landlord: { select: { id: true, name: true, phone: true } },
      },
    });

    const results = properties
      .map((property) => {
        const distanceKm = calculateDistanceKm(university.latitude, university.longitude, property.latitude, property.longitude);
        return {
          ...property,
          distanceToUniKm: distanceKm,
          commute: estimateCommute(distanceKm),
          startingPrice: property.rooms.length > 0 ? property.rooms[0].pricePerMonth : null,
        };
      })
      .filter((item) => item.distanceToUniKm <= parseFloat(maxDistanceKm))
      .sort((a, b) => a.distanceToUniKm - b.distanceToUniKm);

    res.json({ university, totalFound: results.length, listings: results });
  } catch (error) {
    res.status(500).json({ error: 'Failed to search listings' });
  }
};

exports.createProperty = async (req, res) => {
  try {
    const { title, description, address, city, latitude, longitude, amenities, images, landlordId, rooms } = req.body;
    let ownerId = landlordId;
    if (!ownerId) {
      const firstLandlord = await prisma.user.findFirst({ where: { role: 'LANDLORD' } });
      ownerId = firstLandlord?.id;
    }

    const newProperty = await prisma.property.create({
      data: {
        title, description, address, city,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        amenities: amenities || [],
        images: images || [],
        landlordId: ownerId,
        rooms: {
          create: (rooms || []).map((r) => ({
            name: r.name,
            category: r.category || 'PRIVATE_ROOM',
            pricePerMonth: parseFloat(r.pricePerMonth),
            currency: r.currency || 'USD',
            sizeSqm: r.sizeSqm ? parseFloat(r.sizeSqm) : 18,
            availableFrom: new Date(r.availableFrom || '2026-09-01'),
          })),
        },
      },
      include: { rooms: true },
    });
    res.status(201).json(newProperty);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create property listing' });
  }
};
