"use server";

import prisma from "@/lib/db";

type UserServicePrice = {
  userId: number;
  serviceId: number;
  price: number;
};

export async function getServices() {
  return prisma.service.findMany();
}
export async function getUsers() {
  return prisma.user.findMany();
}
export async function getBookings() {
  return prisma.booking.findMany();
}
export async function createBooking(data: {
  userId: number;
  serviceId: number;
  price: number;
}) {
  const { userId, serviceId, price } = data;

  const newBooking = await prisma.booking.create({
    data: {
      userId,
      serviceId,
      price,
    },
  });

  return newBooking;
}
export async function getUserServicePrice(
  userId: number,
  serviceId: number,
): Promise<number | null> {
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
