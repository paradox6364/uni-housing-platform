const prisma = require('../config/db');

exports.createBooking = async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      studentEmail,
      roomTypeId,
      moveInDate,
      durationMonths,
      leaseDurationMonths,
    } = req.body;

    const months = durationMonths || leaseDurationMonths;

    if (!roomTypeId || !moveInDate || !months) {
      return res.status(400).json({ error: 'Missing required booking fields.' });
    }

    if (req.user && req.user.role === 'LANDLORD') {
      return res.status(403).json({ error: 'Landlord accounts cannot book rooms.' });
    }

    let resolvedStudentId = req.user?.id || studentId;

    if (!resolvedStudentId) {
      if (!studentEmail) {
        return res.status(400).json({ error: 'Student email or account is required.' });
      }

      const normalizedEmail = studentEmail.toLowerCase().trim();
      let student = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!student) {
        student = await prisma.user.create({
          data: {
            name: studentName || 'Student Applicant',
            email: normalizedEmail,
            passwordHash: 'password123',
            role: 'STUDENT',
          },
        });
      }
      resolvedStudentId = student.id;
    }

    const booking = await prisma.booking.create({
      data: {
        studentId: resolvedStudentId,
        roomTypeId,
        moveInDate: new Date(moveInDate),
        durationMonths: parseInt(months, 10),
        status: 'PENDING',
      },
      include: {
        student: {
          select: { id: true, name: true, email: true, phone: true },
        },
        roomType: {
          include: { property: true },
        },
      },
    });

    return res.status(201).json(booking);
  } catch (error) {
    console.error('CreateBooking Error:', error);
    return res.status(500).json({ error: 'Failed to create booking request.' });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        student: { select: { id: true, name: true, email: true, phone: true } },
        roomType: { include: { property: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // APPROVED or REJECTED
    const updated = await prisma.booking.update({
      where: { id },
      data: { status },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking status' });
  }
};
