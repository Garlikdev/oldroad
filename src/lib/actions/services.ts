"use server";

import prisma from "@/lib/db";
import type { UserServicePrice } from "./types";

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
  } catch {
    console.error("Brak ustalonej ceny usługi");
    return null;
  }
}

export async function setUserServicePrice(userId: number, serviceId: number, price: number) {
  try {
    const userServicePrice = await prisma.userServicePrice.upsert({
      where: {
        userId_serviceId: {
          userId,
          serviceId,
        },
      },
      update: {
        price,
      },
      create: {
        userId,
        serviceId,
        price,
      },
    });

    return userServicePrice;
  } catch (error) {
    console.error("Błąd podczas ustawiania ceny usługi:", error);
    throw new Error("Nie udało się ustawić ceny usługi");
  }
}

export async function getUserServicePrices(userId: number) {
  try {
    const userServicePrices = await prisma.userServicePrice.findMany({
      where: {
        userId,
      },
      include: {
        service: true,
      },
      orderBy: {
        service: {
          name: "asc",
        },
      },
    });

    return userServicePrices;
  } catch (error) {
    console.error("Błąd podczas pobierania cen usług:", error);
    throw new Error("Nie udało się pobrać cen usług");
  }
}

export async function updateUserServicePrice(userId: number, serviceId: number, price: number) {
  return setUserServicePrice(userId, serviceId, price);
}
