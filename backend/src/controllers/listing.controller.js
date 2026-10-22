const prisma = require('../config/db');
const { calculateDistanceKm, estimateCommute } = require('../utils/geo');

const VALID_CATEGORIES = ['PRIVATE_ROOM', 'SHARED_ROOM', 'ENTIRE_PLACE'];

const normalizeCategory = (category) => {
  if (VALID_CATEGORIES.includes(category)) {
    return category;
  }
  return 'PRIVATE_ROOM';
};

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
    if (category && VALID_CATEGORIES.includes(category)) {
      roomFilter.category = category;
    }

    const properties = await prisma.property.findMany({
      where: {
        city: {
          equals: university.city,
          mode: 'insensitive',
        },
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

    const universities = await prisma.university.findMany({
      where: {
        city: {
          equals: property.city,
          mode: 'insensitive',
        },
      },
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

    if (!title || !address || !city) {
      return res.status(400).json({ error: 'Title, address, and city are required.' });
    }

    // Verify that the landlord user exists in the database
    let candidateId = req.user?.id || landlordId;
    let landlordUser = null;

    if (candidateId) {
      landlordUser = await prisma.user.findUnique({
        where: { id: candidateId },
      });
    }

    if (!landlordUser && req.user?.email) {
      landlordUser = await prisma.user.findUnique({
        where: { email: req.user.email },
      });
    }

    if (!landlordUser) {
      landlordUser = await prisma.user.findFirst({
        where: { role: 'LANDLORD' },
      });
    }

    if (!landlordUser) {
      return res.status(400).json({ error: 'No valid landlord account found in database.' });
    }

    const property = await prisma.property.create({
      data: {
        title: title.trim(),
        description: description || `Modern student accommodation in ${city}`,
        address: address.trim(),
        city: city.trim(),
        latitude: parseFloat(latitude) || 51.5246,
        longitude: parseFloat(longitude) || -0.134,
        amenities: Array.isArray(amenities) ? amenities : [],
        images: Array.isArray(images) ? images : [],
        landlordId: landlordUser.id,
        rooms: {
          create: rooms.map((r) => ({
            name: r.name || 'Standard Student Room',
            category: normalizeCategory(r.category),
            pricePerMonth: parseFloat(r.pricePerMonth) || 800,
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
    return res.status(500).json({
      error: error.message || 'Failed to create property.',
    });
  }
};