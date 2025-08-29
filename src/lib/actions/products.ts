"use server";

import prisma from "@/lib/db";
import moment from "moment-timezone";
import { isUserAdmin } from "./users";
import type { CreateProductData } from "./types";

export async function getUserProducts(userId: number) {
  const products = await prisma.product.findMany({
    where: {
      userId,
    },
  });
  return products;
}

export async function getAllProducts(userId: number, date?: string) {
  const timezone = "Europe/Warsaw"; // GMT+2

  const filterDate = date
    ? moment.tz(date, timezone).startOf("day")
    : moment.tz(timezone).startOf("day");

  const endDate = moment(filterDate).endOf("day");

  const isAdmin = await isUserAdmin(userId);

  let products;
  if (isAdmin) {
    products = await prisma.product.findMany({
      where: {
        createdAt: {
          gte: filterDate.toDate(),
          lt: endDate.toDate(),
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
      },
    });
  } else {
    products = await prisma.product.findMany({
      where: {
        userId,
        createdAt: {
          gte: filterDate.toDate(),
          lt: endDate.toDate(),
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
      },
    });
  }

  return products;
}

export async function createProduct(data: CreateProductData) {
  try {
    const { userId, name, price, createdAt } = data;

    const newProduct = await prisma.product.create({
      data: {
        userId,
        createdAt,
        name,
        price,
      },
    });

    return newProduct;
  } catch (err) {
    console.error(err);
    return null;
  }
}
