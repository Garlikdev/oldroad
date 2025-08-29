"use server";

import prisma from "@/lib/db";
import { type Prisma } from "@prisma/client";
import moment from "moment-timezone";
import { isUserAdmin } from "./users";
import type { EditBooking, BookingChartData, CreateBookingData } from "./types";

export async function getAllBookings(userId: number, date?: string) {
  const timezone = "Europe/Warsaw"; // GMT+2

  const filterDate = date
    ? moment.tz(date, timezone).startOf("day")
    : moment.tz(timezone).startOf("day");

  const endDate = moment(filterDate).endOf("day");

  const isAdmin = await isUserAdmin(userId);

  let bookings;
  if (isAdmin) {
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

export async function getAllBookingsChart(
  userId: number,
  startDate: string,
  endDate: string,
): Promise<BookingChartData[]> {
  const timezone = "Europe/Warsaw";

  try {
    const filterStart = moment.tz(startDate, timezone).startOf("day");
    const filterEnd = moment.tz(endDate, timezone).endOf("day");

    const isAdmin = await isUserAdmin(userId);

    const whereClause: Prisma.BookingWhereInput = {
      AND: [
        { createdAt: { gte: filterStart.toDate() } },
        { createdAt: { lte: filterEnd.toDate() } },
        !isAdmin ? { userId } : {},
      ],
    };

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      select: {
        price: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return bookings;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch bookings");
  }
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

export async function createBooking(data: CreateBookingData) {
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
