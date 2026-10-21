const prisma = require('../config/db');
const { calculateDistanceKm, estimateCommute } = require('../utils/geo');

exports.searchByUniversity = async (req, res) => {
  try {
    const {
      universityId,
      maxDistanceKm = 15,
      maxPrice,
      category,
    } = req.query;

    if (!universityId) {
      return res.status(400).json({ error: 'universityId query parameter is required' });
    }

    const university = await prisma.university.findUnique({
      where: { id: universityId },
    });

    if (!university) {
      return res.status(404).json({ error: 'University not found' });
    }

    const roomFilter = { isAvailable: true };
    if (maxPrice) roomFilter.pricePerMonth = { lte: parseFloat(maxPrice) };
    if (category) roomFilter.category = category;

    const properties = await prisma.property.findMany({
      where: {
        city: university.city,
        rooms: { some: roomFilter },
      },
      include: {
        rooms: {
          where: roomFilter,
          orderBy: { pricePerMonth: 'asc' },
        },
      },
    });

    const results = properties
      .map((prop) => {
        const distanceToUniKm = calculateDistanceKm(
          university.latitude,
          university.longitude,
          prop.latitude,
          prop.longitude
        );

        const commute = estimateCommute(distanceToUniKm);
        const startingPrice =
          prop.rooms.length > 0 ? prop.rooms[0].pricePerMonth : null;

        return {
          ...prop,
          distanceToUniKm,
          commute,
          startingPrice,
        };
      })
      .filter((prop) => prop.distanceToUniKm <= parseFloat(maxDistanceKm))
      .sort((a, b) => a.distanceToUniKm - b.distanceToUniKm);

    return res.json({
      university,
      count: results.length,
      listings: results,
    });
  } catch (error) {
    console.error('SearchByUniversity Error:', error);
    return res.status(500).json({ error: 'Failed to search listings' });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        rooms: {
          orderBy: { pricePerMonth: 'asc' },
        },
        landlord: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Find universities in the same city to compute commute & map markers
    const universities = await prisma.university.findMany({
      where: { city: property.city },
    });

    const nearbyUniversities = universities
      .map((uni) => {
        const distanceToUniKm = calculateDistanceKm(
          uni.latitude,
          uni.longitude,
          property.latitude,
          property.longitude
        );
        return {
          ...uni,
          distanceToUniKm,
          commute: estimateCommute(distanceToUniKm),
        };
      })
      .sort((a, b) => a.distanceToUniKm - b.distanceToUniKm);

    const primaryUniversity = nearbyUniversities[0] || null;
    const startingPrice =
      property.rooms.length > 0 ? property.rooms[0].pricePerMonth : null;

    return res.json({
      ...property,
      startingPrice,
      distanceToUniKm: primaryUniversity ? primaryUniversity.distanceToUniKm : 1.2,
      commute: primaryUniversity
        ? primaryUniversity.commute
        : { walkMins: 15, transitMins: 6 },
      primaryUniversity,
      nearbyUniversities,
    });
  } catch (error) {
    console.error('GetPropertyById Error:', error);
    return res.status(500).json({ error: 'Failed to fetch property details' });
  }
};

exports.createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      address,
      city,
      latitude,
      longitude,
      amenities = [],
      images = [],
      landlordId,
      rooms = [],
    } = req.body;

    let ownerId = req.user?.id || landlordId;

    if (!ownerId) {
      const defaultLandlord = await prisma.user.findFirst({
        where: { role: 'LANDLORD' },
      });
      if (!defaultLandlord) {
        return res.status(400).json({ error: 'No landlord account found.' });
      }
      ownerId = defaultLandlord.id;
    }

    const property = await prisma.property.create({
      data: {
        title,
        description,
        address,
        city,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        amenities,
        images,
        landlordId: ownerId,
        rooms: {
          create: rooms.map((r) => ({
            name: r.name,
            category: r.category || 'PRIVATE_ROOM',
            pricePerMonth: parseFloat(r.pricePerMonth),
            currency: r.currency || 'USD',
            sizeSqm: r.sizeSqm ? parseFloat(r.sizeSqm) : 18,
            availableFrom: r.availableFrom
              ? new Date(r.availableFrom)
              : new Date(),
          })),
        },
      },
      include: { rooms: true },
    });

    return res.status(201).json(property);
  } catch (error) {
    console.error('CreateProperty Error:', error);
    return res.status(500).json({ error: 'Failed to create property.' });
  }
};