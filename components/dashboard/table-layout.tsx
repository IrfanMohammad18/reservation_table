"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Table, Restaurant, Reservation } from "@/lib/restaurant"
import { RestaurantService } from "@/lib/restaurant"
import { format } from "date-fns"

interface TableLayoutProps {
  restaurant: Restaurant
  onTableUpdate?: () => void
}

export function TableLayout({ restaurant, onTableUpdate }: TableLayoutProps) {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])

  useState(() => {
    const allReservations = RestaurantService.getReservationsByRestaurant(restaurant.id)
    setReservations(allReservations)
  })

  const getStatusColor = (status: Table["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-500 hover:bg-green-600"
      case "occupied":
        return "bg-red-500 hover:bg-red-600"
      case "reserved":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "maintenance":
        return "bg-gray-500 hover:bg-gray-600"
      default:
        return "bg-gray-300 hover:bg-gray-400"
    }
  }

  const getStatusText = (status: Table["status"]) => {
    switch (status) {
      case "available":
        return "Available"
      case "occupied":
        return "Occupied"
      case "reserved":
        return "Reserved"
      case "maintenance":
        return "Maintenance"
      default:
        return "Unknown"
    }
  }

  const getLocationIcon = (location: Table["location"]) => {
    switch (location) {
      case "indoor":
        return "🏠"
      case "outdoor":
        return "🌳"
      case "private":
        return "🔒"
      default:
        return "📍"
    }
  }

  const getCurrentReservation = (tableId: string): Reservation | null => {
    const today = new Date().toISOString().split("T")[0]
    return (
      reservations.find(
        (r) => r.tableId === tableId && r.date === today && (r.status === "confirmed" || r.status === "seated"),
      ) || null
    )
  }

  const getUpcomingReservations = (tableId: string): Reservation[] => {
    const today = new Date().toISOString().split("T")[0]
    return reservations.filter(
      (r) => r.tableId === tableId && r.date >= today && r.status !== "cancelled" && r.status !== "completed",
    )
  }

  const handleStatusChange = (tableId: string, newStatus: Table["status"]) => {
    RestaurantService.updateTableStatus(restaurant.id, tableId, newStatus)
    onTableUpdate?.()
  }

  const handleTableSelect = (table: Table) => {
    setSelectedTable(table)
  }

  const currentReservation = selectedTable ? getCurrentReservation(selectedTable.id) : null
  const upcomingReservations = selectedTable ? getUpcomingReservations(selectedTable.id) : []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Restaurant Floor Plan</span>
            <div className="text-sm text-muted-foreground">{restaurant.tables.length} tables total</div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-200 rounded-lg p-8 min-h-[500px]">
            <div className="absolute top-2 left-2 text-xs text-muted-foreground">Restaurant Floor Plan</div>

            {restaurant.tables.map((table) => {
              const currentRes = getCurrentReservation(table.id)
              const hasUpcoming = getUpcomingReservations(table.id).length > 0

              return (
                <div
                  key={table.id}
                  className={`absolute w-20 h-20 rounded-xl border-3 border-white shadow-lg cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-xl ${getStatusColor(
                    table.status,
                  )} ${selectedTable?.id === table.id ? "ring-4 ring-primary ring-offset-2 scale-110" : ""}`}
                  style={{
                    left: `${Math.min(table.x, 85)}%`,
                    top: `${Math.min(table.y, 75)}%`,
                  }}
                  onClick={() => handleTableSelect(table)}
                >
                  <div className="flex flex-col items-center justify-center h-full text-white text-xs font-bold relative">
                    <div className="absolute -top-1 -right-1 text-xs">{getLocationIcon(table.location)}</div>
                    <span className="text-sm">T{table.number}</span>
                    <span className="text-xs">{table.capacity}p</span>
                    {hasUpcoming && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-400 rounded-full border border-white"></div>
                    )}
                  </div>
                </div>
              )
            })}

            <div className="absolute bottom-2 right-2 flex items-center space-x-4 text-xs bg-white/80 backdrop-blur-sm rounded-lg p-2">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Occupied</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Reserved</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-500 rounded"></div>
                <span>Maintenance</span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {restaurant.tables.filter((t) => t.status === "available").length}
                </div>
                <div className="text-sm text-muted-foreground">Available</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {restaurant.tables.filter((t) => t.status === "occupied").length}
                </div>
                <div className="text-sm text-muted-foreground">Occupied</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {restaurant.tables.filter((t) => t.status === "reserved").length}
                </div>
                <div className="text-sm text-muted-foreground">Reserved</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {restaurant.tables.filter((t) => t.status === "maintenance").length}
                </div>
                <div className="text-sm text-muted-foreground">Maintenance</div>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>

      {selectedTable && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Table {selectedTable.number} Details</span>
                <span className="text-lg">{getLocationIcon(selectedTable.location)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Capacity</p>
                  <p className="text-2xl font-bold">{selectedTable.capacity} people</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <Badge variant="outline" className="capitalize">
                    {selectedTable.location}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Current Status</p>
                <Badge className={`${getStatusColor(selectedTable.status)} text-white`}>
                  {getStatusText(selectedTable.status)}
                </Badge>
              </div>

              {currentReservation && (
                <Alert>
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium">Current Reservation:</p>
                      <p>
                        {currentReservation.customerName} - {currentReservation.time}
                      </p>
                      <p className="text-sm">Party of {currentReservation.partySize}</p>
                      {currentReservation.paymentAmount && (
                        <p className="text-sm text-green-600 font-medium">
                          Paid: ${currentReservation.paymentAmount.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Change Status</p>
                <div className="flex flex-wrap gap-2">
                  {(["available", "occupied", "reserved", "maintenance"] as const).map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={selectedTable.status === status ? "default" : "outline"}
                      onClick={() => handleStatusChange(selectedTable.id, status)}
                    >
                      {getStatusText(status)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reservations for Table {selectedTable.number}</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingReservations.length > 0 ? (
                <div className="space-y-3">
                  {upcomingReservations.slice(0, 5).map((reservation) => (
                    <div key={reservation.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{reservation.customerName}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(reservation.date), "MMM dd")} at {reservation.time}
                          </p>
                          <p className="text-sm text-muted-foreground">Party of {reservation.partySize}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="mb-1">
                            {reservation.status}
                          </Badge>
                          {reservation.paymentAmount && (
                            <p className="text-sm text-green-600 font-medium">
                              ${reservation.paymentAmount.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                      {reservation.specialRequests && (
                        <p className="text-xs text-muted-foreground mt-2">Note: {reservation.specialRequests}</p>
                      )}
                    </div>
                  ))}
                  {upcomingReservations.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center">
                      +{upcomingReservations.length - 5} more reservations
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No upcoming reservations for this table</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
