export interface BookingRequest {
  restaurantId: string
  date: string
  time: string
  partySize: number
  customerName: string
  customerEmail: string
  customerPhone: string
  specialRequests?: string
  tableId?: string
  paymentId?: string
}

export interface AvailableSlot {
  time: string
  tableId: string
  tableNumber: number
  capacity: number
}

export class BookingService {
  static async getAvailableSlots(restaurantId: string, date: string, partySize: number): Promise<AvailableSlot[]> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    let restaurant = mockRestaurants.find((r) => r.id === restaurantId)

    // If not found in mock data, create a temporary restaurant structure for AI-matched restaurants
    if (!restaurant) {
      restaurant = {
        id: restaurantId,
        name: "Selected Restaurant",
        address: "",
        phone: "",
        email: "",
        cuisine: [],
        priceRange: "$$" as const,
        rating: 4.5,
        description: "",
        openingHours: {
          monday: { open: "11:00", close: "22:00" },
          tuesday: { open: "11:00", close: "22:00" },
          wednesday: { open: "11:00", close: "22:00" },
          thursday: { open: "11:00", close: "22:00" },
          friday: { open: "11:00", close: "23:00" },
          saturday: { open: "11:00", close: "23:00" },
          sunday: { open: "11:00", close: "21:00" },
        },
        tables: [
          { id: "t1", number: 1, capacity: 2, location: "indoor", status: "available", x: 50, y: 50 },
          { id: "t2", number: 2, capacity: 4, location: "indoor", status: "available", x: 150, y: 50 },
          { id: "t3", number: 3, capacity: 6, location: "indoor", status: "available", x: 250, y: 50 },
          { id: "t4", number: 4, capacity: 8, location: "indoor", status: "available", x: 50, y: 150 },
          { id: "t5", number: 5, capacity: 10, location: "private", status: "available", x: 150, y: 150 },
        ],
        managerId: "temp",
      }
    }

    const availableSlots: AvailableSlot[] = []

    const timeSlots = [
      // Lunch slots
      { time: "11:30 AM", hour: 11, minute: 30 },
      { time: "12:00 PM", hour: 12, minute: 0 },
      { time: "12:30 PM", hour: 12, minute: 30 },
      { time: "1:00 PM", hour: 13, minute: 0 },
      { time: "1:30 PM", hour: 13, minute: 30 },
      { time: "2:00 PM", hour: 14, minute: 0 },
      // Dinner slots
      { time: "5:30 PM", hour: 17, minute: 30 },
      { time: "6:00 PM", hour: 18, minute: 0 },
      { time: "6:30 PM", hour: 18, minute: 30 },
      { time: "7:00 PM", hour: 19, minute: 0 },
      { time: "7:30 PM", hour: 19, minute: 30 },
      { time: "8:00 PM", hour: 20, minute: 0 },
      { time: "8:30 PM", hour: 20, minute: 30 },
      { time: "9:00 PM", hour: 21, minute: 0 },
    ]

    // For each time slot, check if we can accommodate the party
    for (const slot of timeSlots) {
      // Find suitable tables for this party size
      const suitableTables = restaurant.tables.filter(
        (table) => table.capacity >= partySize && table.status !== "maintenance",
      )

      if (suitableTables.length > 0) {
        const isAvailable = Math.random() > 0.2 // 80% chance of availability

        if (isAvailable) {
          // Pick the best table (smallest that fits the party)
          const bestTable = suitableTables.sort((a, b) => a.capacity - b.capacity)[0]

          availableSlots.push({
            time: slot.time,
            tableId: bestTable.id,
            tableNumber: bestTable.number,
            capacity: bestTable.capacity,
          })
        }
      }
    }

    if (availableSlots.length < 3) {
      const guaranteedSlots = ["12:00 PM", "6:30 PM", "7:00 PM", "8:00 PM"]

      for (const time of guaranteedSlots) {
        // Check if this slot is already in the list
        if (!availableSlots.some((slot) => slot.time === time)) {
          const bestTable = restaurant.tables.find(
            (table) => table.capacity >= partySize && table.status !== "maintenance",
          )

          if (bestTable) {
            availableSlots.push({
              time,
              tableId: bestTable.id,
              tableNumber: bestTable.number,
              capacity: bestTable.capacity,
            })
          }
        }

        // Stop once we have enough slots
        if (availableSlots.length >= 4) break
      }
    }

    // Sort by time and limit to reasonable number
    const sortedSlots = availableSlots.sort((a, b) => {
      const timeA = this.parseTime(a.time)
      const timeB = this.parseTime(b.time)
      return timeA - timeB
    })

    return sortedSlots.slice(0, 10) // Limit to 10 slots max
  }

  static async createReservation(booking: BookingRequest): Promise<string> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newReservation: Reservation = {
      id: `res-${Date.now()}`,
      restaurantId: booking.restaurantId,
      tableId: booking.tableId || "t1",
      customerId: "temp-customer",
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      date: booking.date,
      time: booking.time,
      duration: 120,
      partySize: booking.partySize,
      status: booking.paymentId ? "confirmed" : "pending",
      specialRequests: booking.specialRequests,
      createdAt: new Date(),
      updatedAt: new Date(),
      paymentId: booking.paymentId,
    }

    mockReservations.push(newReservation)

    if (booking.tableId) {
      const restaurant = mockRestaurants.find((r) => r.id === booking.restaurantId)
      if (restaurant) {
        const table = restaurant.tables.find((t) => t.id === booking.tableId)
        if (table) {
          table.status = "reserved"
        }
      }
    }

    return newReservation.id
  }

  static searchRestaurants(
    query = "",
    cuisine = "all",
    location = "",
    userCoords?: { lat: number; lng: number },
  ): Restaurant[] {
    console.log("[v0] Searching restaurants with:", { query, cuisine, location, userCoords })

    let results = mockRestaurants.filter((restaurant) => {
      // Match query against name and description
      const matchesQuery =
        !query ||
        restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
        restaurant.description.toLowerCase().includes(query.toLowerCase())

      // Match cuisine (more flexible matching)
      const matchesCuisine =
        cuisine === "all" || !cuisine || restaurant.cuisine.some((c) => c.toLowerCase().includes(cuisine.toLowerCase()))

      let matchesLocation = true
      if (location && location !== "Detecting location...") {
        if (userCoords) {
          // If we have user coordinates, show all restaurants but sort by proximity later
          matchesLocation = true
        } else {
          // Text-based location matching
          matchesLocation =
            restaurant.address.toLowerCase().includes(location.toLowerCase()) ||
            this.isLocationNearby(restaurant.address, location)
        }
      }

      console.log("[v0] Restaurant:", restaurant.name, {
        matchesQuery,
        matchesCuisine,
        matchesLocation,
        query,
        cuisine,
        location,
      })

      return matchesQuery && matchesCuisine && matchesLocation
    })

    if (userCoords && results.length > 0) {
      results = this.sortByProximity(results, userCoords)

      const maxDistance = 0.1 // Roughly 10km in coordinate degrees
      results = results.filter((restaurant) => {
        const coords = this.getRestaurantCoords(restaurant.id, userCoords)
        const distance = this.calculateDistance(userCoords, coords)
        return distance <= maxDistance
      })

      console.log("[v0] Filtered by proximity, showing", results.length, "nearby restaurants")
    }

    // If no results and location was specified, try broader search
    if (results.length === 0 && location && location !== "Detecting location...") {
      console.log("[v0] No exact matches, trying broader location search")
      results = mockRestaurants.filter((restaurant) => {
        const matchesQuery =
          !query ||
          restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
          restaurant.description.toLowerCase().includes(query.toLowerCase())

        const matchesCuisine =
          cuisine === "all" ||
          !cuisine ||
          restaurant.cuisine.some((c) => c.toLowerCase().includes(cuisine.toLowerCase()))

        return matchesQuery && matchesCuisine
      })

      if (userCoords) {
        results = this.sortByProximity(results, userCoords)
      }
    }

    console.log("[v0] Search results:", results.length, "restaurants found")
    return results
  }

  private static isLocationNearby(restaurantAddress: string, searchLocation: string): boolean {
    const addressParts = restaurantAddress.toLowerCase().split(/[,\s]+/)
    const locationParts = searchLocation.toLowerCase().split(/[,\s]+/)

    // Check if any part of the search location matches any part of the restaurant address
    return locationParts.some(
      (part) =>
        part.length > 2 && addressParts.some((addressPart) => addressPart.includes(part) || part.includes(addressPart)),
    )
  }

  private static getRestaurantCoords(
    restaurantId: string,
    userCoords: { lat: number; lng: number },
  ): { lat: number; lng: number } {
    // More realistic restaurant coordinates based on common city areas
    const restaurantCoords: { [key: string]: { lat: number; lng: number } } = {
      "rest-1": { lat: userCoords.lat + 0.005, lng: userCoords.lng + 0.008 }, // Very close - 0.5km
      "rest-2": { lat: userCoords.lat + 0.01, lng: userCoords.lng + 0.01 }, // Close - 1km
      "rest-3": { lat: userCoords.lat + 0.015, lng: userCoords.lng + 0.012 }, // Medium - 1.5km
      "rest-4": { lat: userCoords.lat + 0.02, lng: userCoords.lng + 0.018 }, // Medium - 2km
      "rest-5": { lat: userCoords.lat + 0.008, lng: userCoords.lng + 0.006 }, // Close - 0.8km
      "rest-6": { lat: userCoords.lat + 0.025, lng: userCoords.lng - 0.01 }, // Far - 2.5km
      "rest-7": { lat: userCoords.lat + 0.012, lng: userCoords.lng + 0.015 }, // Medium - 1.2km
      "rest-8": { lat: userCoords.lat + 0.018, lng: userCoords.lng + 0.022 }, // Medium - 1.8km
      "rest-9": { lat: userCoords.lat + 0.006, lng: userCoords.lng + 0.004 }, // Very close - 0.6km
    }

    return restaurantCoords[restaurantId] || { lat: userCoords.lat + 0.1, lng: userCoords.lng + 0.1 }
  }

  private static calculateDistance(
    coords1: { lat: number; lng: number },
    coords2: { lat: number; lng: number },
  ): number {
    return Math.sqrt(Math.pow(coords2.lat - coords1.lat, 2) + Math.pow(coords2.lng - coords1.lng, 2))
  }

  private static sortByProximity(restaurants: Restaurant[], userCoords: { lat: number; lng: number }): Restaurant[] {
    return restaurants.sort((a, b) => {
      const coordsA = this.getRestaurantCoords(a.id, userCoords)
      const coordsB = this.getRestaurantCoords(b.id, userCoords)

      const distanceA = this.calculateDistance(userCoords, coordsA)
      const distanceB = this.calculateDistance(userCoords, coordsB)

      return distanceA - distanceB
    })
  }

  static async getLocationFromCoords(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      )

      if (response.ok) {
        const data = await response.json()
        // Return a formatted location string
        const city = data.city || data.locality || data.principalSubdivision
        const area = data.localityInfo?.administrative?.[2]?.name || data.localityInfo?.administrative?.[1]?.name

        if (area && area !== city) {
          return `${area}, ${city}`
        }
        return city || "Current Location"
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error)
    }

    const locations = [
      { name: "Downtown", lat: 40.7128, lng: -74.006, radius: 0.02 },
      { name: "Midtown", lat: 40.7589, lng: -73.9851, radius: 0.02 },
      { name: "Uptown", lat: 40.7831, lng: -73.9712, radius: 0.02 },
      { name: "Westside", lat: 40.7505, lng: -74.0021, radius: 0.02 },
      { name: "Downtown Area", lat: 40.708, lng: -74.0113, radius: 0.02 },
    ]

    for (const location of locations) {
      const distance = Math.sqrt(Math.pow(lat - location.lat, 2) + Math.pow(lng - location.lng, 2))
      if (distance <= location.radius) {
        return location.name
      }
    }

    return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})` // Show coordinates as fallback
  }

  private static parseTime(timeStr: string): number {
    const [time, period] = timeStr.split(" ")
    const [hours, minutes] = time.split(":").map(Number)
    let hour24 = hours

    if (period === "PM" && hours !== 12) {
      hour24 += 12
    } else if (period === "AM" && hours === 12) {
      hour24 = 0
    }

    return hour24 * 60 + minutes
  }
}

// Import required types and data
import { mockRestaurants, mockReservations, type Restaurant, type Reservation } from "./restaurant"
