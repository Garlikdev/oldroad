// Shared types for actions
export type UserServicePrice = {
  userId: number;
  serviceId: number;
  price: number;
};

export type EditBooking = {
  serviceId: number;
  price: number;
  createdAt: Date;
};

export type BookingChartData = {
  price: number;
  createdAt: Date;
};

export type CreateBookingData = {
  userId: number;
  serviceId: number;
  createdAt: Date;
  price: number;
};

export type CreateProductData = {
  userId: number;
  name: string;
  createdAt: Date;
  price: number;
};

export type CreateStartData = {
  createdAt: Date;
  price: number;
};
