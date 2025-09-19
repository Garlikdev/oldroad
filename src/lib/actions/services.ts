"use server";

import prisma from "@/lib/db";
import type { UserServicePrice } from "./types";

export async function getUserServices(userId: number) {
  const services = await prisma.service.findMany({
    where: {
      prices: {
        some: {
          userId,
          enabled: true, // Only get services that are enabled for this user
        },
      },
    },
  });
  return services;
}

// Get ALL services (enabled + disabled) for a user - used for historical editing
export async function getUserServicesAll(userId: number) {
  const services = await prisma.service.findMany({
    where: {
      prices: {
        some: {
          userId, // Get all services this user ever had, regardless of enabled status
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
          enabled: true, // Only return price if service is enabled
        },
      });

    return userServicePrice ? userServicePrice.price : null;
  } catch {
    console.error("Brak ustalonej ceny usługi");
    return null;
  }
}

// Get price for any service (enabled or disabled) - used for historical editing
export async function getUserServicePriceAll(userId: number, serviceId: number) {
  try {
    const userServicePrice: UserServicePrice | null =
      await prisma.userServicePrice.findUnique({
        where: {
          userId_serviceId: {
            userId,
            serviceId,
          },
          // No enabled filter - get price regardless of enabled status
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
        enabled: true, // Ensure service is enabled when setting price
      },
      create: {
        userId,
        serviceId,
        price,
        enabled: true, // Default to enabled when creating
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
        enabled: true, // Only get enabled services
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
