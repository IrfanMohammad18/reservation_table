"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RestaurantService, type Restaurant, type Reservation } from "@/lib/restaurant"
import { NearbyRestaurants } from "@/components/dashboard/nearby-restaurants"
import { AIRestaurantRecommendations } from "@/components/dashboard/ai-restaurant-recommendations"

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
      return
    }

    if (user && (user.role === "manager" || user.role === "admin")) {
      const restaurantData = RestaurantService.getRestaurantByManagerId(user.id)
      if (restaurantData) {
        setRestaurant(restaurantData)
        const reservationData = RestaurantService.getReservationsByRestaurant(restaurantData.id)
        setReservations(reservationData)
      }
    } else if (user?.role === "customer") {
      router.push("/booking")
    }
  }, [user, isAuthenticated, isLoading, router])

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card/30 to-background">
        <div className="text-center animate-fade-in-up">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-6"></div>
          <p className="text-muted-foreground text-lg font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role === "customer") {
    return null
  }

  const todayReservations = reservations.filter((r) => {
    const today = new Date().toISOString().split("T")[0]
    return r.date === today
  })

  const pendingReservations = reservations.filter((r) => r.status === "pending")
  const confirmedReservations = reservations.filter((r) => r.status === "confirmed")

  const availableTables = restaurant?.tables.filter((t) => t.status === "available").length || 0
  const occupiedTables = restaurant?.tables.filter((t) => t.status === "occupied").length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card/20 to-background flex">
      <Sidebar className="w-64 flex-shrink-0 shadow-2xl" />

      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 gradient-card rounded-3xl p-8 border border-border/20 shadow-xl animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">
                  Dashboard
                </h1>
                <p className="text-muted-foreground text-xl leading-relaxed">
                  Welcome back, <span className="font-bold text-foreground">{user.name}</span>! Here's what's happening
                  at{" "}
                  <span className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {restaurant?.name || "your restaurant"}
                  </span>{" "}
                  today.
                </p>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 animate-slide-in-right">
            <Card className="gradient-card border border-border/20 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-bold text-card-foreground">Today's Reservations</CardTitle>
                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors duration-300">
                  <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary mb-2">{todayReservations.length}</div>
                <p className="text-sm text-muted-foreground font-medium">
                  {pendingReservations.length} pending approval
                </p>
              </CardContent>
            </Card>

            <Card className="gradient-card border border-border/20 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-bold text-card-foreground">Available Tables</CardTitle>
                <div className="p-3 bg-accent/10 rounded-xl group-hover:bg-accent/20 transition-colors duration-300">
                  <svg className="h-5 w-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-accent mb-2">{availableTables}</div>
                <p className="text-sm text-muted-foreground font-medium">{occupiedTables} currently occupied</p>
              </CardContent>
            </Card>

            <Card className="gradient-card border border-border/20 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-bold text-card-foreground">Confirmed Today</CardTitle>
                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors duration-300">
                  <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary mb-2">{confirmedReservations.length}</div>
                <p className="text-sm text-muted-foreground font-medium">Ready to serve</p>
              </CardContent>
            </Card>

            <Card className="gradient-card border border-border/20 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-bold text-card-foreground">Restaurant Rating</CardTitle>
                <div className="p-3 bg-accent/10 rounded-xl group-hover:bg-accent/20 transition-colors duration-300">
                  <svg className="h-5 w-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-accent mb-2">{restaurant?.rating || "4.5"}</div>
                <p className="text-sm text-muted-foreground font-medium">Average customer rating</p>
              </CardContent>
            </Card>
          </div>

          {restaurant && (
            <Card className="mb-10 gradient-card border border-border/20 shadow-xl animate-fade-in-up">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-2xl">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {restaurant.name}
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground">{restaurant.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <p className="font-bold text-foreground flex items-center text-lg">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      Address
                    </p>
                    <p className="text-muted-foreground pl-13">{restaurant.address}</p>
                  </div>
                  <div className="space-y-3">
                    <p className="font-bold text-foreground flex items-center text-lg">
                      <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      Contact
                    </p>
                    <p className="text-muted-foreground pl-13">{restaurant.phone}</p>
                    <p className="text-muted-foreground pl-13">{restaurant.email}</p>
                  </div>
                  <div className="space-y-3">
                    <p className="font-bold text-foreground flex items-center text-lg">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      </div>
                      Cuisine
                    </p>
                    <p className="text-muted-foreground pl-13">{restaurant.cuisine.join(", ")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            <NearbyRestaurants />
            <AIRestaurantRecommendations />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-in-right">
            <Card
              className="cursor-pointer gradient-card border border-border/20 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500 group"
              onClick={() => router.push("/dashboard/reservations")}
            >
              <CardHeader>
                <CardTitle className="flex items-center space-x-4 text-xl">
                  <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors duration-300">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <span className="text-card-foreground">Manage Reservations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-muted-foreground">
                  View and manage all restaurant reservations
                </CardDescription>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer gradient-card border border-border/20 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500 group"
              onClick={() => router.push("/dashboard/tables")}
            >
              <CardHeader>
                <CardTitle className="flex items-center space-x-4 text-xl">
                  <div className="p-3 bg-accent/10 rounded-xl group-hover:bg-accent/20 transition-colors duration-300">
                    <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <span className="text-card-foreground">Table Layout</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-muted-foreground">
                  Configure table layout and availability
                </CardDescription>
              </CardContent>
            </Card>

            {user.role === "admin" && (
              <Card
                className="cursor-pointer gradient-card border border-border/20 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500 group"
                onClick={() => router.push("/dashboard/analytics")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-4 text-xl">
                    <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors duration-300">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <span className="text-card-foreground">Analytics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-muted-foreground">
                    View detailed analytics and reports
                  </CardDescription>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
