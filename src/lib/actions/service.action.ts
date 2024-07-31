"use server";

import prisma from "@/lib/db";
import moment from "moment";

type UserServicePrice = {
  userId: number;
  serviceId: number;
  price: number;
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

export async function getBookings() {
  return prisma.booking.findMany();
}

export async function getBookingsByUser(userId: number, date?: string) {
  const filterDate = date
    ? moment(date).startOf("day")
    : moment().startOf("day");
  const endDate = moment(filterDate).endOf("day");

  return prisma.booking.findMany({
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

export async function createBooking(data: {
  userId: number;
  serviceId: number;
  price: number;
}) {
  try {
    const { userId, serviceId, price } = data;

    const newBooking = await prisma.booking.create({
      data: {
        userId,
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
