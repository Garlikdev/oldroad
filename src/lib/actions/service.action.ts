"use server";

import prisma from "@/lib/db";
import moment from "moment-timezone";

type UserServicePrice = {
  userId: number;
  serviceId: number;
  price: number;
};

type EditBooking = {
  serviceId: number;
  price: number;
  createdAt: Date;
};

export async function getServices() {
  return prisma.service.findMany();
}

export async function getUserServices(userId: number) {
  const services = await prisma.service.findMany({
    where: {
      prices: {
        some: {
          userId,
        },
      },
    },
  });
  return services;
}

// Users

export async function getUsers() {
  return prisma.user.findMany();
}

export async function getUser(pin: number) {
  const userData = await prisma.user.findUnique({
    where: { pin },
    select: {
      id: true,
      name: true,
      role: true,
      // Add other fields you want to include in the returned user data
      pin: false, // This excludes the pin field
    },
  });
  return userData ? userData : null;
}

// Usługi

export async function getAllBookings(userId: number, date?: string) {
  const timezone = "Europe/Warsaw"; // GMT+2

  const filterDate = date
    ? moment.tz(date, timezone).startOf("day")
    : moment.tz(timezone).startOf("day");

  const endDate = moment(filterDate).endOf("day");

  let bookings;
  if (userId === 3) {
    bookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: filterDate.toDate(),
          lt: endDate.toDate(),
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        service: true,
        user: true,
      },
    });
  } else {
    bookings = await prisma.booking.findMany({
      where: {
        userId,
        createdAt: {
          gte: filterDate.toDate(),
          lt: endDate.toDate(),
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        service: true,
        user: true,
      },
    });
  }

  return bookings;
}

export async function getBookingById(bookingId: number) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: true,
      user: true,
    },
  });
  return booking;
}

export async function editBooking(bookingId: number, data: EditBooking) {
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data,
  });
  return booking;
}

export async function getBookingsByUser(userId: number, date?: Date) {
  const timezone = "Europe/Warsaw"; // GMT+2

  const filterDate = date
    ? moment.tz(date, timezone).startOf("day")
    : moment.tz(timezone).startOf("day");

  const endDate = moment(filterDate).endOf("day");

  const bookings = await prisma.booking.findMany({
    where: {
      userId,
      createdAt: {
        gte: filterDate.toDate(),
        lt: endDate.toDate(),
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      service: true,
      user: true,
    },
  });

  return bookings;
}

export async function getMonthlyEarningsByUser(year: number, month: number) {
  const timezone = "Europe/Warsaw"; // GMT+2

  const startDate = moment
    .tz({ year, month: month - 1 }, timezone)
    .startOf("month")
    .toDate();
  const endDate = moment(startDate).endOf("month").toDate();

  // First, group by userId and aggregate data
  const result = await prisma.booking.groupBy({
    by: ["userId"],
    where: {
      createdAt: {
        gte: startDate,
        lt: endDate,
      },
    },
    _sum: {
      price: true,
    },
    _count: {
      id: true,
    },
  });

  // Now, fetch user details separately
  const userIds = result.map((entry) => entry.userId);
  const users = await prisma.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
  });

  // Combine the user data with the aggregation results
  const userMonthlyEarnings = result.map((entry) => {
    const user = users.find((u) => u.id === entry.userId);
    return {
      userName: user?.name ?? "Unknown",
      totalBookings: entry._count.id,
      totalPrice: entry._sum.price,
    };
  });

  return userMonthlyEarnings;
}

export async function createBooking(data: {
  userId: number;
  serviceId: number;
  createdAt: Date;
  price: number;
}) {
  try {
    const { userId, serviceId, price, createdAt } = data;

    const newBooking = await prisma.booking.create({
      data: {
        userId,
        createdAt,
        serviceId,
        price,
      },
    });

    return newBooking;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getUserServicePrice(userId: number, serviceId: number) {
  try {
    const userServicePrice: UserServicePrice | null =
      await prisma.userServicePrice.findUnique({
        where: {
          userId_serviceId: {
            userId,
            serviceId,
          },
        },
      });

    return userServicePrice ? userServicePrice.price : null;
  } catch (error) {
    console.error("Brak ustalonej ceny usługi");
    return null;
  }
}

// startowy hajs
export async function createStart(data: { createdAt: Date; price: number }) {
  try {
    const { price, createdAt } = data;

    const newStart = await prisma.start.create({
      data: {
        price,
        createdAt,
      },
    });

    return newStart;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getAllStarts(date?: string) {
  const timezone = "Europe/Warsaw"; // GMT+2

  const filterDate = date
    ? moment.tz(date, timezone).startOf("day")
    : moment.tz(timezone).startOf("day");

  const endDate = moment(filterDate).endOf("day");

  const starts = await prisma.start.findMany({
    where: {
      createdAt: {
        gte: filterDate.toDate(),
        lt: endDate.toDate(),
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return starts;
}
