export interface Table {
  id: string
  number: number
  capacity: number
  location: "indoor" | "outdoor" | "private"
  status: "available" | "occupied" | "reserved" | "maintenance"
  x: number // Position for visual layout
  y: number
}

export interface Restaurant {
  id: string
  name: string
  address: string
  phone: string
  email: string
  cuisine: string[]
  priceRange: "$" | "$$" | "$$$" | "$$$$"
  rating: number
  description: string
  image: string
  openingHours: {
    [key: string]: { open: string; close: string } | null
  }
  tables: Table[]
  managerId: string
}

export interface Reservation {
  id: string
  restaurantId: string
  tableId: string
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  date: string
  time: string
  duration: number // in minutes
  partySize: number
  status: "pending" | "confirmed" | "seated" | "completed" | "cancelled" | "no-show"
  specialRequests?: string
  createdAt: Date
  updatedAt: Date
  paymentId?: string
  paymentAmount?: number
  paymentStatus?: "pending" | "completed" | "failed" | "refunded"
}

// Mock data
export const mockRestaurants: Restaurant[] = [
  {
    id: "rest-1",
    name: "The Garden Bistro",
    address: "123 Main Street, Downtown",
    phone: "+1 (555) 123-4567",
    email: "info@gardenbistro.com",
    cuisine: ["Italian", "Mediterranean"],
    priceRange: "$$$",
    rating: 4.5,
    description: "Elegant dining with fresh, locally-sourced ingredients",
    image: "/elegant-italian-restaurant-interior-with-garden-th.jpg",
    openingHours: {
      monday: { open: "11:00", close: "22:00" },
      tuesday: { open: "11:00", close: "22:00" },
      wednesday: { open: "11:00", close: "22:00" },
      thursday: { open: "11:00", close: "22:00" },
      friday: { open: "11:00", close: "23:00" },
      saturday: { open: "10:00", close: "23:00" },
      sunday: { open: "10:00", close: "21:00" },
    },
    tables: [
      { id: "t1", number: 1, capacity: 2, location: "indoor", status: "available", x: 50, y: 50 },
      { id: "t2", number: 2, capacity: 4, location: "indoor", status: "occupied", x: 150, y: 50 },
      { id: "t3", number: 3, capacity: 6, location: "indoor", status: "reserved", x: 250, y: 50 },
      { id: "t4", number: 4, capacity: 2, location: "outdoor", status: "available", x: 50, y: 150 },
      { id: "t5", number: 5, capacity: 4, location: "outdoor", status: "available", x: 150, y: 150 },
      { id: "t6", number: 6, capacity: 8, location: "private", status: "available", x: 250, y: 150 },
    ],
    managerId: "2",
  },
  {
    id: "rest-2",
    name: "Spice Palace",
    address: "456 Oak Avenue, Downtown",
    phone: "+1 (555) 234-5678",
    email: "contact@spicepalace.com",
    cuisine: ["Indian", "North Indian"],
    priceRange: "$$",
    rating: 4.3,
    description: "Authentic North Indian cuisine with traditional spices and tandoor specialties",
    image: "/authentic-indian-restaurant-with-tandoor-and-tradi.jpg",
    openingHours: {
      monday: { open: "12:00", close: "22:00" },
      tuesday: { open: "12:00", close: "22:00" },
      wednesday: { open: "12:00", close: "22:00" },
      thursday: { open: "12:00", close: "22:00" },
      friday: { open: "12:00", close: "23:00" },
      saturday: { open: "12:00", close: "23:00" },
      sunday: { open: "12:00", close: "21:00" },
    },
    tables: [
      { id: "t7", number: 7, capacity: 2, location: "indoor", status: "available", x: 50, y: 50 },
      { id: "t8", number: 8, capacity: 4, location: "indoor", status: "available", x: 150, y: 50 },
      { id: "t9", number: 9, capacity: 6, location: "indoor", status: "available", x: 250, y: 50 },
      { id: "t10", number: 10, capacity: 4, location: "outdoor", status: "available", x: 50, y: 150 },
    ],
    managerId: "5",
  },
  {
    id: "rest-3",
    name: "Sakura Sushi",
    address: "789 Pine Street, Midtown",
    phone: "+1 (555) 345-6789",
    email: "info@sakurasushi.com",
    cuisine: ["Japanese", "Asian"],
    priceRange: "$$$",
    rating: 4.7,
    description: "Fresh sushi and traditional Japanese dishes in a modern setting",
    image: "/premium-japanese-sushi-bar-with-chef-preparing-s.jpg",
    openingHours: {
      monday: { open: "17:00", close: "22:00" },
      tuesday: { open: "17:00", close: "22:00" },
      wednesday: { open: "17:00", close: "22:00" },
      thursday: { open: "17:00", close: "22:00" },
      friday: { open: "17:00", close: "23:00" },
      saturday: { open: "17:00", close: "23:00" },
      sunday: { open: "17:00", close: "21:00" },
    },
    tables: [
      { id: "t11", number: 11, capacity: 2, location: "indoor", status: "available", x: 50, y: 50 },
      { id: "t12", number: 12, capacity: 4, location: "indoor", status: "available", x: 150, y: 50 },
      { id: "t13", number: 13, capacity: 6, location: "indoor", status: "available", x: 250, y: 50 },
      { id: "t14", number: 14, capacity: 8, location: "private", status: "available", x: 50, y: 150 },
    ],
    managerId: "6",
  },
  {
    id: "rest-4",
    name: "Bella Vista",
    address: "321 Elm Street, Uptown",
    phone: "+1 (555) 456-7890",
    email: "reservations@bellavista.com",
    cuisine: ["Italian", "Mediterranean"],
    priceRange: "$$$$",
    rating: 4.8,
    description: "Fine dining Italian restaurant with panoramic city views",
    image: "/upscale-italian-fine-dining-restaurant-with-city-v.jpg",
    openingHours: {
      monday: null,
      tuesday: { open: "18:00", close: "23:00" },
      wednesday: { open: "18:00", close: "23:00" },
      thursday: { open: "18:00", close: "23:00" },
      friday: { open: "18:00", close: "24:00" },
      saturday: { open: "18:00", close: "24:00" },
      sunday: { open: "18:00", close: "22:00" },
    },
    tables: [
      { id: "t15", number: 15, capacity: 2, location: "indoor", status: "available", x: 50, y: 50 },
      { id: "t16", number: 16, capacity: 4, location: "indoor", status: "available", x: 150, y: 50 },
      { id: "t17", number: 17, capacity: 6, location: "indoor", status: "available", x: 250, y: 50 },
      { id: "t18", number: 18, capacity: 2, location: "outdoor", status: "available", x: 50, y: 150 },
    ],
    managerId: "7",
  },
  {
    id: "rest-5",
    name: "Taco Libre",
    address: "654 Cedar Lane, Downtown Area",
    phone: "+1 (555) 567-8901",
    email: "hola@tacolibre.com",
    cuisine: ["Mexican", "American"],
    priceRange: "$$",
    rating: 4.2,
    description: "Vibrant Mexican cantina with authentic street food and craft cocktails",
    image: "/authentic-mexican-taqueria-with-vibrant-murals-ta.jpg",
    openingHours: {
      monday: { open: "11:00", close: "22:00" },
      tuesday: { open: "11:00", close: "22:00" },
      wednesday: { open: "11:00", close: "22:00" },
      thursday: { open: "11:00", close: "22:00" },
      friday: { open: "11:00", close: "24:00" },
      saturday: { open: "11:00", close: "24:00" },
      sunday: { open: "11:00", close: "21:00" },
    },
    tables: [
      { id: "t19", number: 19, capacity: 2, location: "indoor", status: "available", x: 50, y: 50 },
      { id: "t20", number: 20, capacity: 4, location: "indoor", status: "available", x: 150, y: 50 },
      { id: "t21", number: 21, capacity: 6, location: "outdoor", status: "available", x: 250, y: 50 },
      { id: "t22", number: 22, capacity: 8, location: "outdoor", status: "available", x: 50, y: 150 },
    ],
    managerId: "8",
  },
  {
    id: "rest-6",
    name: "Le Petit Café",
    address: "987 Maple Drive, Westside",
    phone: "+1 (555) 678-9012",
    email: "bonjour@lepetitcafe.com",
    cuisine: ["French", "European"],
    priceRange: "$$$",
    rating: 4.6,
    description: "Charming French bistro with classic dishes and extensive wine selection",
    image: "/elegant-parisian-cafe-with-outdoor-terrace-wine-g.jpg",
    openingHours: {
      monday: { open: "08:00", close: "22:00" },
      tuesday: { open: "08:00", close: "22:00" },
      wednesday: { open: "08:00", close: "22:00" },
      thursday: { open: "08:00", close: "22:00" },
      friday: { open: "08:00", close: "23:00" },
      saturday: { open: "08:00", close: "23:00" },
      sunday: { open: "09:00", close: "21:00" },
    },
    tables: [
      { id: "t23", number: 23, capacity: 2, location: "indoor", status: "available", x: 50, y: 50 },
      { id: "t24", number: 24, capacity: 4, location: "indoor", status: "available", x: 150, y: 50 },
      { id: "t25", number: 25, capacity: 2, location: "outdoor", status: "available", x: 250, y: 50 },
      { id: "t26", number: 26, capacity: 6, location: "private", status: "available", x: 50, y: 150 },
    ],
    managerId: "9",
  },
  {
    id: "rest-7",
    name: "Curry House",
    address: "234 Broadway, Midtown",
    phone: "+1 (555) 789-0123",
    email: "info@curryhouse.com",
    cuisine: ["Indian", "South Indian"],
    priceRange: "$$",
    rating: 4.4,
    description: "Authentic South Indian cuisine featuring dosas, sambar, and traditional curries",
    image: "/south-indian-restaurant-with-dosa-preparation-and-.jpg",
    openingHours: {
      monday: { open: "11:30", close: "22:00" },
      tuesday: { open: "11:30", close: "22:00" },
      wednesday: { open: "11:30", close: "22:00" },
      thursday: { open: "11:30", close: "22:00" },
      friday: { open: "11:30", close: "23:00" },
      saturday: { open: "11:30", close: "23:00" },
      sunday: { open: "11:30", close: "21:30" },
    },
    tables: [
      { id: "t27", number: 27, capacity: 2, location: "indoor", status: "available", x: 50, y: 50 },
      { id: "t28", number: 28, capacity: 4, location: "indoor", status: "available", x: 150, y: 50 },
      { id: "t29", number: 29, capacity: 6, location: "indoor", status: "available", x: 250, y: 50 },
      { id: "t30", number: 30, capacity: 4, location: "outdoor", status: "available", x: 50, y: 150 },
    ],
    managerId: "10",
  },
  {
    id: "rest-8",
    name: "Maharaja Palace",
    address: "567 Fifth Avenue, Uptown",
    phone: "+1 (555) 890-1234",
    email: "reservations@maharajapalace.com",
    cuisine: ["Indian", "North Indian", "Vegetarian"],
    priceRange: "$$$",
    rating: 4.6,
    description: "Royal Indian dining experience with premium North Indian dishes and vegetarian specialties",
    image: "/royal-indian-palace-restaurant-with-ornate-decor-g.jpg",
    openingHours: {
      monday: { open: "12:00", close: "22:30" },
      tuesday: { open: "12:00", close: "22:30" },
      wednesday: { open: "12:00", close: "22:30" },
      thursday: { open: "12:00", close: "22:30" },
      friday: { open: "12:00", close: "23:30" },
      saturday: { open: "12:00", close: "23:30" },
      sunday: { open: "12:00", close: "22:00" },
    },
    tables: [
      { id: "t31", number: 31, capacity: 2, location: "indoor", status: "available", x: 50, y: 50 },
      { id: "t32", number: 32, capacity: 4, location: "indoor", status: "available", x: 150, y: 50 },
      { id: "t33", number: 33, capacity: 6, location: "indoor", status: "available", x: 250, y: 50 },
      { id: "t34", number: 34, capacity: 8, location: "private", status: "available", x: 50, y: 150 },
      { id: "t35", number: 35, capacity: 4, location: "outdoor", status: "available", x: 150, y: 150 },
    ],
    managerId: "11",
  },
  {
    id: "rest-9",
    name: "Bombay Street Kitchen",
    address: "890 Market Street, Downtown Area",
    phone: "+1 (555) 901-2345",
    email: "hello@bombaystreet.com",
    cuisine: ["Indian", "Street Food", "Fast Casual"],
    priceRange: "$",
    rating: 4.1,
    description: "Casual Indian street food with authentic Mumbai-style chaat and quick bites",
    image: "/authentic-mumbai-street-food-stall-with-pani-puri-.jpg",
    openingHours: {
      monday: { open: "11:00", close: "21:00" },
      tuesday: { open: "11:00", close: "21:00" },
      wednesday: { open: "11:00", close: "21:00" },
      thursday: { open: "11:00", close: "21:00" },
      friday: { open: "11:00", close: "22:00" },
      saturday: { open: "11:00", close: "22:00" },
      sunday: { open: "12:00", close: "20:00" },
    },
    tables: [
      { id: "t36", number: 36, capacity: 2, location: "indoor", status: "available", x: 50, y: 50 },
      { id: "t37", number: 37, capacity: 4, location: "indoor", status: "available", x: 150, y: 50 },
      { id: "t38", number: 38, capacity: 4, location: "indoor", status: "available", x: 250, y: 50 },
      { id: "t39", number: 39, capacity: 6, location: "outdoor", status: "available", x: 50, y: 150 },
    ],
    managerId: "12",
  },
]

export const mockReservations: Reservation[] = [
  {
    id: "res-1",
    restaurantId: "rest-1",
    tableId: "t2",
    customerId: "3",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    customerPhone: "+1 (555) 987-6543",
    date: "2024-01-15",
    time: "19:00",
    duration: 120,
    partySize: 4,
    status: "confirmed",
    specialRequests: "Window seat preferred",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
    paymentId: "pay-1",
    paymentAmount: 150,
    paymentStatus: "completed",
  },
  {
    id: "res-2",
    restaurantId: "rest-1",
    tableId: "t3",
    customerId: "4",
    customerName: "Jane Smith",
    customerEmail: "jane@example.com",
    customerPhone: "+1 (555) 456-7890",
    date: "2024-01-15",
    time: "20:00",
    duration: 90,
    partySize: 6,
    status: "pending",
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-12"),
    paymentId: "pay-2",
    paymentAmount: 200,
    paymentStatus: "pending",
  },
]

export class RestaurantService {
  static getRestaurantByManagerId(managerId: string): Restaurant | null {
    return mockRestaurants.find((r) => r.managerId === managerId) || null
  }

  static getReservationsByRestaurant(restaurantId: string): Reservation[] {
    return mockReservations.filter((r) => r.restaurantId === restaurantId)
  }

  static updateReservationStatus(reservationId: string, status: Reservation["status"]): void {
    const reservation = mockReservations.find((r) => r.id === reservationId)
    if (reservation) {
      reservation.status = status
      reservation.updatedAt = new Date()
    }
  }

  static updateTableStatus(restaurantId: string, tableId: string, status: Table["status"]): void {
    const restaurant = mockRestaurants.find((r) => r.id === restaurantId)
    if (restaurant) {
      const table = restaurant.tables.find((t) => t.id === tableId)
      if (table) {
        table.status = status
      }
    }
  }

  static updateReservationPayment(
    reservationId: string,
    paymentId: string,
    paymentAmount: number,
    paymentStatus: Reservation["paymentStatus"],
  ): void {
    const reservation = mockReservations.find((r) => r.id === reservationId)
    if (reservation) {
      reservation.paymentId = paymentId
      reservation.paymentAmount = paymentAmount
      reservation.paymentStatus = paymentStatus
      reservation.updatedAt = new Date()
    }
  }
}
