export interface ReservationMetrics {
  totalReservations: number
  confirmedReservations: number
  cancelledReservations: number
  noShowReservations: number
  averagePartySize: number
  peakHours: { hour: string; count: number }[]
  popularDays: { day: string; count: number }[]
}

export interface RevenueMetrics {
  totalRevenue: number
  averageRevenuePerReservation: number
  revenueByMonth: { month: string; revenue: number }[]
  revenueByRestaurant: { restaurant: string; revenue: number }[]
}

export interface CustomerMetrics {
  totalCustomers: number
  newCustomers: number
  returningCustomers: number
  customerSatisfaction: number
  topCustomers: { name: string; reservations: number; revenue: number }[]
}

export interface OperationalMetrics {
  averageTableTurnover: number
  occupancyRate: number
  waitlistConversionRate: number
  cancellationRate: number
  noShowRate: number
  tableUtilization: { tableNumber: number; utilizationRate: number }[]
}

export interface AnalyticsData {
  reservationMetrics: ReservationMetrics
  revenueMetrics: RevenueMetrics
  customerMetrics: CustomerMetrics
  operationalMetrics: OperationalMetrics
  dateRange: { start: string; end: string }
}

export class AnalyticsService {
  static async getAnalyticsData(restaurantId?: string, startDate?: string, endDate?: string): Promise<AnalyticsData> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Filter reservations based on criteria
    let filteredReservations = mockReservations
    if (restaurantId) {
      filteredReservations = filteredReservations.filter((r) => r.restaurantId === restaurantId)
    }
    if (startDate && endDate) {
      filteredReservations = filteredReservations.filter((r) => r.date >= startDate && r.date <= endDate)
    }

    // Calculate reservation metrics
    const reservationMetrics: ReservationMetrics = {
      totalReservations: filteredReservations.length,
      confirmedReservations: filteredReservations.filter((r) => r.status === "confirmed").length,
      cancelledReservations: filteredReservations.filter((r) => r.status === "cancelled").length,
      noShowReservations: filteredReservations.filter((r) => r.status === "no-show").length,
      averagePartySize:
        filteredReservations.reduce((sum, r) => sum + r.partySize, 0) / filteredReservations.length || 0,
      peakHours: this.calculatePeakHours(filteredReservations),
      popularDays: this.calculatePopularDays(filteredReservations),
    }

    // Calculate revenue metrics (mock data)
    const revenueMetrics: RevenueMetrics = {
      totalRevenue: filteredReservations.length * 85, // Mock average revenue per reservation
      averageRevenuePerReservation: 85,
      revenueByMonth: [
        { month: "Jan", revenue: 12500 },
        { month: "Feb", revenue: 15200 },
        { month: "Mar", revenue: 18900 },
        { month: "Apr", revenue: 16800 },
        { month: "May", revenue: 21300 },
        { month: "Jun", revenue: 19600 },
      ],
      revenueByRestaurant: [
        { restaurant: "The Garden Bistro", revenue: 45200 },
        { restaurant: "Ocean View", revenue: 32100 },
        { restaurant: "City Grill", revenue: 28900 },
      ],
    }

    // Calculate customer metrics (mock data)
    const customerMetrics: CustomerMetrics = {
      totalCustomers: 1250,
      newCustomers: 180,
      returningCustomers: 1070,
      customerSatisfaction: 4.6,
      topCustomers: [
        { name: "John Smith", reservations: 12, revenue: 1020 },
        { name: "Sarah Johnson", reservations: 8, revenue: 680 },
        { name: "Mike Davis", reservations: 6, revenue: 510 },
      ],
    }

    // Calculate operational metrics (mock data)
    const operationalMetrics: OperationalMetrics = {
      averageTableTurnover: 2.3,
      occupancyRate: 0.78,
      waitlistConversionRate: 0.65,
      cancellationRate: 0.12,
      noShowRate: 0.08,
      tableUtilization: [
        { tableNumber: 1, utilizationRate: 0.85 },
        { tableNumber: 2, utilizationRate: 0.92 },
        { tableNumber: 3, utilizationRate: 0.78 },
        { tableNumber: 4, utilizationRate: 0.65 },
        { tableNumber: 5, utilizationRate: 0.88 },
        { tableNumber: 6, utilizationRate: 0.72 },
      ],
    }

    return {
      reservationMetrics,
      revenueMetrics,
      customerMetrics,
      operationalMetrics,
      dateRange: {
        start: startDate || "2024-01-01",
        end: endDate || "2024-06-30",
      },
    }
  }

  private static calculatePeakHours(reservations: any[]): { hour: string; count: number }[] {
    const hourCounts: { [key: string]: number } = {}

    reservations.forEach((reservation) => {
      const hour = reservation.time.split(":")[0] + ":00"
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    })

    return Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }

  private static calculatePopularDays(reservations: any[]): { day: string; count: number }[] {
    const dayCounts: { [key: string]: number } = {}

    reservations.forEach((reservation) => {
      const date = new Date(reservation.date)
      const day = date.toLocaleDateString("en-US", { weekday: "long" })
      dayCounts[day] = (dayCounts[day] || 0) + 1
    })

    return Object.entries(dayCounts)
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => b.count - a.count)
  }

  static async exportAnalyticsReport(data: AnalyticsData, format: "csv" | "pdf"): Promise<string> {
    // Simulate export process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // In a real app, this would generate and return a download URL
    return `analytics-report-${Date.now()}.${format}`
  }
}

// Import required data
import { mockReservations } from "./restaurant"
