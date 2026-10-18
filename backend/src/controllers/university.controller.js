const prisma = require('../config/db');

exports.getUniversities = async (req, res) => {
  try {
    const { q } = req.query;
    const universities = await prisma.university.findMany({
      where: q ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { city: { contains: q, mode: 'insensitive' } },
        ],
      } : {},
      orderBy: { name: 'asc' },
    });
    res.json(universities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch universities' });
  }
};

exports.createUniversity = async (req, res) => {
  try {
    const { name, city, country, latitude, longitude, logoUrl } = req.body;
    const uni = await prisma.university.create({
      data: { name, city, country, latitude: parseFloat(latitude), longitude: parseFloat(longitude), logoUrl },
    });
    res.status(201).json(uni);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create university' });
  }
};
