export interface TimeSlot {
  time: string
  available: boolean
  tableIds: string[]
  capacity: number
  waitlistCount: number
}

export interface AvailabilityCalendar {
  date: string
  slots: TimeSlot[]
  totalCapacity: number
  bookedCapacity: number
  availableCapacity: number
}

export interface WaitlistEntry {
  id: string
  restaurantId: string
  date: string
  time: string
  partySize: number
  customerName: string
  customerEmail: string
  customerPhone: string
  priority: number
  createdAt: Date
  notified: boolean
}

export interface BlockedTimeSlot {
  id: string
  restaurantId: string
  date: string
  startTime: string
  endTime: string
  reason: string
  tableIds?: string[]
  createdBy: string
  createdAt: Date
}

// Mock waitlist data
export const mockWaitlist: WaitlistEntry[] = []

// Mock blocked slots data
export const mockBlockedSlots: BlockedTimeSlot[] = [
  {
    id: "block-1",
    restaurantId: "rest-1",
    date: "2024-01-15",
    startTime: "15:00",
    endTime: "17:00",
    reason: "Private event setup",
    tableIds: ["t6"],
    createdBy: "2",
    createdAt: new Date(),
  },
]

export class AvailabilityService {
  private static readonly SLOT_DURATION = 30 // minutes
  private static readonly DINING_DURATION = 120 // minutes
  private static readonly OPENING_HOUR = 11
  private static readonly CLOSING_HOUR = 23

  static generateTimeSlots(): string[] {
    const slots: string[] = []
    for (let hour = this.OPENING_HOUR; hour < this.CLOSING_HOUR; hour++) {
      for (let minute = 0; minute < 60; minute += this.SLOT_DURATION) {
        const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        slots.push(time)
      }
    }
    return slots
  }

  static async getAvailabilityCalendar(restaurantId: string, date: string): Promise<AvailabilityCalendar> {
    const restaurant = mockRestaurants.find((r) => r.id === restaurantId)
    if (!restaurant) throw new Error("Restaurant not found")

    const timeSlots = this.generateTimeSlots()
    const slots: TimeSlot[] = []

    for (const time of timeSlots) {
      const availability = await this.checkSlotAvailability(restaurantId, date, time)
      slots.push(availability)
    }

    const totalCapacity = restaurant.tables.reduce((sum, table) => sum + table.capacity, 0)
    const bookedCapacity = slots.reduce((sum, slot) => sum + (slot.capacity - (slot.available ? slot.capacity : 0)), 0)

    return {
      date,
      slots,
      totalCapacity,
      bookedCapacity,
      availableCapacity: totalCapacity - bookedCapacity,
    }
  }

  static async checkSlotAvailability(restaurantId: string, date: string, time: string): Promise<TimeSlot> {
    const restaurant = mockRestaurants.find((r) => r.id === restaurantId)
    if (!restaurant) throw new Error("Restaurant not found")

    // Check for blocked time slots
    const isBlocked = this.isTimeSlotBlocked(restaurantId, date, time)
    if (isBlocked) {
      return {
        time,
        available: false,
        tableIds: [],
        capacity: 0,
        waitlistCount: this.getWaitlistCount(restaurantId, date, time),
      }
    }

    // Get available tables for this time slot
    const availableTables = restaurant.tables.filter((table) => {
      // Check if table is available (not in maintenance, etc.)
      if (table.status === "maintenance") return false

      // Check if table is already booked for this time slot
      const isBooked = this.isTableBooked(restaurantId, table.id, date, time)
      return !isBooked
    })

    const totalCapacity = availableTables.reduce((sum, table) => sum + table.capacity, 0)

    return {
      time,
      available: availableTables.length > 0,
      tableIds: availableTables.map((t) => t.id),
      capacity: totalCapacity,
      waitlistCount: this.getWaitlistCount(restaurantId, date, time),
    }
  }

  static isTableBooked(restaurantId: string, tableId: string, date: string, time: string): boolean {
    return mockReservations.some((reservation) => {
      if (
        reservation.restaurantId !== restaurantId ||
        reservation.tableId !== tableId ||
        reservation.date !== date ||
        reservation.status === "cancelled"
      ) {
        return false
      }

      // Check if the requested time conflicts with existing reservation
      const reservationStart = this.timeToMinutes(reservation.time)
      const reservationEnd = reservationStart + reservation.duration
      const requestedTime = this.timeToMinutes(time)
      const requestedEnd = requestedTime + this.DINING_DURATION

      return (
        (requestedTime >= reservationStart && requestedTime < reservationEnd) ||
        (requestedEnd > reservationStart && requestedEnd <= reservationEnd) ||
        (requestedTime <= reservationStart && requestedEnd >= reservationEnd)
      )
    })
  }

  static isTimeSlotBlocked(restaurantId: string, date: string, time: string): boolean {
    return mockBlockedSlots.some((block) => {
      if (block.restaurantId !== restaurantId || block.date !== date) return false

      const blockStart = this.timeToMinutes(block.startTime)
      const blockEnd = this.timeToMinutes(block.endTime)
      const requestedTime = this.timeToMinutes(time)

      return requestedTime >= blockStart && requestedTime < blockEnd
    })
  }

  static getWaitlistCount(restaurantId: string, date: string, time: string): number {
    return mockWaitlist.filter(
      (entry) => entry.restaurantId === restaurantId && entry.date === date && entry.time === time,
    ).length
  }

  static async addToWaitlist(
    entry: Omit<WaitlistEntry, "id" | "priority" | "createdAt" | "notified">,
  ): Promise<string> {
    const waitlistEntry: WaitlistEntry = {
      ...entry,
      id: `wait-${Date.now()}`,
      priority: mockWaitlist.length + 1,
      createdAt: new Date(),
      notified: false,
    }

    mockWaitlist.push(waitlistEntry)
    return waitlistEntry.id
  }

  static async blockTimeSlot(block: Omit<BlockedTimeSlot, "id" | "createdAt">): Promise<string> {
    const blockedSlot: BlockedTimeSlot = {
      ...block,
      id: `block-${Date.now()}`,
      createdAt: new Date(),
    }

    mockBlockedSlots.push(blockedSlot)
    return blockedSlot.id
  }

  static async removeBlockedSlot(blockId: string): Promise<void> {
    const index = mockBlockedSlots.findIndex((block) => block.id === blockId)
    if (index > -1) {
      mockBlockedSlots.splice(index, 1)
    }
  }

  static getBlockedSlots(restaurantId: string, date?: string): BlockedTimeSlot[] {
    return mockBlockedSlots.filter((block) => {
      if (block.restaurantId !== restaurantId) return false
      if (date && block.date !== date) return false
      return true
    })
  }

  static getWaitlistEntries(restaurantId: string): WaitlistEntry[] {
    return mockWaitlist.filter((entry) => entry.restaurantId === restaurantId).sort((a, b) => a.priority - b.priority)
  }

  static async notifyWaitlistCustomer(waitlistId: string): Promise<void> {
    const entry = mockWaitlist.find((w) => w.id === waitlistId)
    if (entry) {
      entry.notified = true
      // In a real app, this would send an email/SMS notification
      console.log(`Notified ${entry.customerName} about table availability`)
    }
  }

  static findBestTable(restaurantId: string, date: string, time: string, partySize: number): string | null {
    const restaurant = mockRestaurants.find((r) => r.id === restaurantId)
    if (!restaurant) return null

    // Find available tables that can accommodate the party size
    const suitableTables = restaurant.tables.filter((table) => {
      if (table.capacity < partySize || table.status === "maintenance") return false
      return !this.isTableBooked(restaurantId, table.id, date, time)
    })

    if (suitableTables.length === 0) return null

    // Sort by capacity (prefer smaller tables that still fit the party)
    suitableTables.sort((a, b) => a.capacity - b.capacity)
    return suitableTables[0].id
  }

  private static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
  }
}

// Import required types and data
import { mockRestaurants, mockReservations } from "./restaurant"
