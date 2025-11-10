"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { ReservationList } from "@/components/dashboard/reservation-list"
import { RestaurantService, type Restaurant, type Reservation } from "@/lib/restaurant"
import { Button } from "@/components/ui/button"

export default function ReservationsPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])

  const loadData = () => {
    if (user && (user.role === "manager" || user.role === "admin")) {
      const restaurantData = RestaurantService.getRestaurantByManagerId(user.id)
      if (restaurantData) {
        setRestaurant(restaurantData)
        const reservationData = RestaurantService.getReservationsByRestaurant(restaurantData.id)
        setReservations(reservationData)
      }
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
      return
    }

    if (user?.role === "customer") {
      router.push("/booking")
      return
    }

    loadData()
  }, [user, isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || user.role === "customer") {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar className="w-64 flex-shrink-0" />

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Reservations</h1>
              <p className="text-muted-foreground">Manage all restaurant reservations and bookings</p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              size="lg"
              className="hover:bg-card hover:border-primary/50 transition-all duration-300 shadow-lg bg-transparent"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </Button>
          </div>

          <ReservationList reservations={reservations} onReservationUpdate={loadData} />
        </div>
      </main>
    </div>
  )
}
