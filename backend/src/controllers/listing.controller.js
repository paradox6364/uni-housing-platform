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

        const commute = estimateCommute(
          distanceToUniKm,
          prop.walkMins,
          prop.transitMins
        );
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

exports.getMyProperties = async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      where: { landlordId: req.user.id },
      include: {
        rooms: {
          orderBy: { pricePerMonth: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(properties);
  } catch (error) {
    console.error('GetMyProperties Error:', error);
    return res.status(500).json({ error: 'Failed to fetch your properties.' });
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
          commute: estimateCommute(
            distanceToUniKm,
            property.walkMins,
            property.transitMins
          ),
        };
      })
      .sort((a, b) => a.distanceToUniKm - b.distanceToUniKm);

    const primaryUniversity = nearbyUniversities[0] || null;
    const startingPrice =
      property.rooms.length > 0 ? property.rooms[0].pricePerMonth : null;

    const defaultCommute = estimateCommute(
      primaryUniversity ? primaryUniversity.distanceToUniKm : 1.2,
      property.walkMins,
      property.transitMins
    );

    return res.json({
      ...property,
      startingPrice,
      distanceToUniKm: primaryUniversity ? primaryUniversity.distanceToUniKm : 1.2,
      commute: primaryUniversity ? primaryUniversity.commute : defaultCommute,
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
      walkMins,
      transitMins,
      amenities = [],
      images = [],
      landlordId,
      rooms = [],
    } = req.body;

    if (!title || !address || !city) {
      return res.status(400).json({ error: 'Title, address, and city are required.' });
    }

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

    const parsedWalkMins =
      walkMins !== undefined && walkMins !== '' && !Number.isNaN(parseInt(walkMins, 10))
        ? parseInt(walkMins, 10)
        : null;
    const parsedTransitMins =
      transitMins !== undefined &&
      transitMins !== '' &&
      !Number.isNaN(parseInt(transitMins, 10))
        ? parseInt(transitMins, 10)
        : null;

    const property = await prisma.property.create({
      data: {
        title: title.trim(),
        description: description || `Modern student accommodation in ${city}`,
        address: address.trim(),
        city: city.trim(),
        latitude: parseFloat(latitude) || 51.5246,
        longitude: parseFloat(longitude) || -0.134,
        walkMins: parsedWalkMins,
        transitMins: parsedTransitMins,
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

exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      address,
      city,
      latitude,
      longitude,
      walkMins,
      transitMins,
      amenities,
      images,
      rooms = [],
    } = req.body;

    const existingProperty = await prisma.property.findUnique({
      where: { id },
      include: { rooms: { orderBy: { pricePerMonth: 'asc' } } },
    });

    if (!existingProperty) {
      return res.status(404).json({ error: 'Property not found.' });
    }

    if (existingProperty.landlordId !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied. You can only edit your own properties.',
      });
    }

    const parsedWalkMins =
      walkMins === '' || walkMins === null
        ? null
        : walkMins !== undefined && !Number.isNaN(parseInt(walkMins, 10))
        ? parseInt(walkMins, 10)
        : existingProperty.walkMins;

    const parsedTransitMins =
      transitMins === '' || transitMins === null
        ? null
        : transitMins !== undefined && !Number.isNaN(parseInt(transitMins, 10))
        ? parseInt(transitMins, 10)
        : existingProperty.transitMins;

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        title: title ? title.trim() : existingProperty.title,
        description:
          description !== undefined ? description : existingProperty.description,
        address: address ? address.trim() : existingProperty.address,
        city: city ? city.trim() : existingProperty.city,
        latitude:
          latitude !== undefined
            ? parseFloat(latitude)
            : existingProperty.latitude,
        longitude:
          longitude !== undefined
            ? parseFloat(longitude)
            : existingProperty.longitude,
        walkMins: parsedWalkMins,
        transitMins: parsedTransitMins,
        amenities: Array.isArray(amenities)
          ? amenities
          : existingProperty.amenities,
        images: Array.isArray(images) ? images : existingProperty.images,
      },
    });

    if (Array.isArray(rooms) && rooms.length > 0) {
      const r = rooms[0];
      if (existingProperty.rooms.length > 0) {
        await prisma.roomType.update({
          where: { id: existingProperty.rooms[0].id },
          data: {
            name: r.name || existingProperty.rooms[0].name,
            category: normalizeCategory(r.category),
            pricePerMonth:
              r.pricePerMonth !== undefined
                ? parseFloat(r.pricePerMonth)
                : existingProperty.rooms[0].pricePerMonth,
            sizeSqm:
              r.sizeSqm !== undefined
                ? parseFloat(r.sizeSqm)
                : existingProperty.rooms[0].sizeSqm,
          },
        });
      } else {
        await prisma.roomType.create({
          data: {
            propertyId: id,
            name: r.name || 'Standard Student Room',
            category: normalizeCategory(r.category),
            pricePerMonth: parseFloat(r.pricePerMonth) || 800,
            currency: r.currency || 'USD',
            sizeSqm: r.sizeSqm ? parseFloat(r.sizeSqm) : 18,
            availableFrom: new Date(),
          },
        });
      }
    }

    const refreshed = await prisma.property.findUnique({
      where: { id: updatedProperty.id },
      include: { rooms: { orderBy: { pricePerMonth: 'asc' } } },
    });

    return res.json(refreshed);
  } catch (error) {
    console.error('UpdateProperty Error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to update property.',
    });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const existingProperty = await prisma.property.findUnique({
      where: { id },
    });

    if (!existingProperty) {
      return res.status(404).json({ error: 'Property not found.' });
    }

    if (existingProperty.landlordId !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied. You can only delete your own properties.',
      });
    }

    await prisma.$transaction([
      prisma.booking.deleteMany({
        where: {
          roomType: {
            propertyId: id,
          },
        },
      }),
      prisma.roomType.deleteMany({
        where: { propertyId: id },
      }),
      prisma.property.delete({
        where: { id },
      }),
    ]);

    return res.json({ message: 'Property deleted successfully.', id });
  } catch (error) {
    console.error('DeleteProperty Error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to delete property.',
    });
  }
};