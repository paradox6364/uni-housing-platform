const prisma = require('../config/db');

exports.createBooking = async (req, res) => {
  try {
    const { studentId, studentEmail, studentName, roomTypeId, moveInDate, durationMonths, message } = req.body;

    let resolvedStudentId = studentId;
    if (!resolvedStudentId && studentEmail) {
      let student = await prisma.user.findUnique({ where: { email: studentEmail } });
      if (!student) {
        student = await prisma.user.create({
          data: {
            name: studentName || 'University Student',
            email: studentEmail,
            passwordHash: 'guest_booking',
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
        durationMonths: parseInt(durationMonths, 10) || 9,
        message: message || '',
        status: 'PENDING',
      },
      include: {
        roomType: { include: { property: true } },
        student: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Failed to submit booking request' });
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
