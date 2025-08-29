"use server";

import prisma from "@/lib/db";
import { getStartOfTodayInPoland, getEndOfTodayInPoland } from "@/lib/utils";
import { isUserAdmin } from "./users";

export async function getTodaySumBookings(userId?: number) {
  const filterDate = getStartOfTodayInPoland();
  const endDate = getEndOfTodayInPoland();

  const bookings = await prisma.booking.findMany({
    where: {
      createdAt: {
        gte: filterDate,
        lt: endDate,
      },
      ...(userId && { userId }),
    },
    select: {
      price: true,
    },
  });

  const totalSumBookings = bookings.reduce(
    (sum, booking) => sum + booking.price,
    0,
  );

  return totalSumBookings;
}

export async function getTodaySumProducts(userId?: number) {
  const filterDate = getStartOfTodayInPoland();
  const endDate = getEndOfTodayInPoland();

  const products = await prisma.product.findMany({
    where: {
      createdAt: {
        gte: filterDate,
        lt: endDate,
      },
      ...(userId && { userId }),
    },
    select: {
      price: true,
    },
  });

  const totalSumProducts = products.reduce(
    (sum, product) => sum + product.price,
    0,
  );

  return totalSumProducts;
}

export async function getTodayStart(_userId?: number) {
  const filterDate = getStartOfTodayInPoland();
  const endDate = getEndOfTodayInPoland();

  const start = await prisma.start.findFirst({
    where: {
      createdAt: {
        gte: filterDate,
        lt: endDate,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      price: true,
    },
  });

  const startPrice = start ? start.price : 0;
  return startPrice;
}

export async function getTodayBookingCount(userId?: number) {
  const filterDate = getStartOfTodayInPoland();
  const endDate = getEndOfTodayInPoland();

  const bookingCount = await prisma.booking.count({
    where: {
      createdAt: {
        gte: filterDate,
        lt: endDate,
      },
      ...(userId && { userId }),
    },
  });

  return bookingCount;
}

export async function getDashboardData(userId: number) {
  // Use centralized timezone utilities
  const filterDate = getStartOfTodayInPoland();
  const endDate = getEndOfTodayInPoland();

  // Check if user is admin
  const isAdmin = await isUserAdmin(userId);

  // Single query to get all dashboard data
  const [
    userBookingsResult,
    userProductsResult,
    startResult,
    userBookingCountResult,
    allBookingsResult,
    allProductsResult,
    allBookingCountResult
  ] = await Promise.all([
    // User bookings sum
    prisma.booking.aggregate({
      where: {
        userId,
        createdAt: {
          gte: filterDate,
          lt: endDate,
        },
      },
      _sum: {
        price: true,
      },
    }),

    // User products sum
    prisma.product.aggregate({
      where: {
        userId,
        createdAt: {
          gte: filterDate,
          lt: endDate,
        },
      },
      _sum: {
        price: true,
      },
    }),

    // Global start cash
    prisma.start.findFirst({
      where: {
        createdAt: {
          gte: filterDate,
          lt: endDate,
        },
      },
      select: {
        price: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    // User booking count
    prisma.booking.count({
      where: {
        userId,
        createdAt: {
          gte: filterDate,
          lt: endDate,
        },
      },
    }),

    // All bookings sum (only for admin)
    isAdmin ? prisma.booking.aggregate({
      where: {
        createdAt: {
          gte: filterDate,
          lt: endDate,
        },
      },
      _sum: {
        price: true,
      },
    }) : Promise.resolve(null),

    // All products sum (only for admin)
    isAdmin ? prisma.product.aggregate({
      where: {
        createdAt: {
          gte: filterDate,
          lt: endDate,
        },
      },
      _sum: {
        price: true,
      },
    }) : Promise.resolve(null),

    // All booking count (only for admin)
    isAdmin ? prisma.booking.count({
      where: {
        createdAt: {
          gte: filterDate,
          lt: endDate,
        },
      },
    }) : Promise.resolve(null),
  ]);

  return {
    // User data (always returned)
    userBookings: userBookingsResult._sum.price || 0,
    userProducts: userProductsResult._sum.price || 0,
    userBookingCount: userBookingCountResult,
    startCash: startResult?.price || 0,

    // Admin data (only returned if user is admin)
    ...(isAdmin && {
      allBookings: allBookingsResult?._sum.price || 0,
      allProducts: allProductsResult?._sum.price || 0,
      allBookingCount: allBookingCountResult || 0,
    }),

    isAdmin,
  };
}

// Legacy functions for backward compatibility
export async function getTodaySumBookingsLegacy() {
  return getTodaySumBookings();
}

export async function getTodaySumProductsLegacy() {
  return getTodaySumProducts();
}

export async function getTodayStartLegacy() {
  return getTodayStart();
}
