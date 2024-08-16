"use server";

import prisma from "@/lib/db";
import moment from "moment-timezone";

type UserServicePrice = {
  userId: number;
  serviceId: number;
  price: number;
};

type EditBooking = {
  userId: number;
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

export type User = {
  id: number;
  name: string;
  pin: number;
};

export async function getUser(pin: number) {
  const userData: User | null = await prisma.user.findUnique({
    where: { pin },
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
