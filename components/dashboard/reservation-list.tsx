"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Reservation } from "@/lib/restaurant"
import { RestaurantService } from "@/lib/restaurant"
import { format } from "date-fns"

interface ReservationListProps {
  reservations: Reservation[]
  onReservationUpdate?: () => void
}

export function ReservationList({ reservations, onReservationUpdate }: ReservationListProps) {
  const [filter, setFilter] = useState<string>("all")

  const getStatusColor = (status: Reservation["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "seated":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "no-show":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status?: Reservation["paymentStatus"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      case "refunded":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleStatusChange = (reservationId: string, newStatus: Reservation["status"]) => {
    RestaurantService.updateReservationStatus(reservationId, newStatus)
    onReservationUpdate?.()
  }

  const filteredReservations = reservations.filter((reservation) => {
    if (filter === "all") return true
    return reservation.status === filter
  })

  const todayReservations = filteredReservations.filter((r) => {
    const today = new Date().toISOString().split("T")[0]
    return r.date === today
  })

  const upcomingReservations = filteredReservations.filter((r) => {
    const today = new Date().toISOString().split("T")[0]
    return r.date > today
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Reservations</h3>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="seated">Seated</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no-show">No Show</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {todayReservations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today's Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onStatusChange={handleStatusChange}
                  getStatusColor={getStatusColor}
                  getPaymentStatusColor={getPaymentStatusColor}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {upcomingReservations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onStatusChange={handleStatusChange}
                  getStatusColor={getStatusColor}
                  getPaymentStatusColor={getPaymentStatusColor}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredReservations.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No reservations found for the selected filter.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ReservationCard({
  reservation,
  onStatusChange,
  getStatusColor,
  getPaymentStatusColor,
}: {
  reservation: Reservation
  onStatusChange: (id: string, status: Reservation["status"]) => void
  getStatusColor: (status: Reservation["status"]) => string
  getPaymentStatusColor: (status?: Reservation["paymentStatus"]) => string
}) {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold">{reservation.customerName}</h4>
          <p className="text-sm text-muted-foreground">{reservation.customerEmail}</p>
          <p className="text-sm text-muted-foreground">{reservation.customerPhone}</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <Badge className={getStatusColor(reservation.status)}>{reservation.status}</Badge>
          {reservation.paymentStatus && (
            <Badge variant="outline" className={getPaymentStatusColor(reservation.paymentStatus)}>
              Payment: {reservation.paymentStatus}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
        <div>
          <p className="font-medium">Date</p>
          <p>{format(new Date(reservation.date), "MMM dd, yyyy")}</p>
        </div>
        <div>
          <p className="font-medium">Time</p>
          <p>{reservation.time}</p>
        </div>
        <div>
          <p className="font-medium">Party Size</p>
          <p>{reservation.partySize} people</p>
        </div>
        <div>
          <p className="font-medium">Table</p>
          <p>Table {reservation.tableId.replace(/^t/, "")}</p>
        </div>
        {reservation.paymentAmount && (
          <div>
            <p className="font-medium">Amount</p>
            <p className="text-green-600 font-semibold">${reservation.paymentAmount.toFixed(2)}</p>
          </div>
        )}
      </div>

      {reservation.paymentId && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Payment Details</p>
              <p className="text-xs text-muted-foreground">ID: {reservation.paymentId}</p>
            </div>
            <div className="text-right">
              {reservation.paymentAmount && (
                <p className="text-sm font-semibold">${reservation.paymentAmount.toFixed(2)}</p>
              )}
              <p className="text-xs text-muted-foreground capitalize">{reservation.paymentStatus || "pending"}</p>
            </div>
          </div>
        </div>
      )}

      {reservation.specialRequests && (
        <div>
          <p className="font-medium text-sm">Special Requests</p>
          <p className="text-sm text-muted-foreground">{reservation.specialRequests}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {reservation.status === "pending" && (
          <>
            <Button size="sm" onClick={() => onStatusChange(reservation.id, "confirmed")}>
              Confirm
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onStatusChange(reservation.id, "cancelled")}>
              Cancel
            </Button>
          </>
        )}
        {reservation.status === "confirmed" && (
          <>
            <Button size="sm" onClick={() => onStatusChange(reservation.id, "seated")}>
              Seat Customer
            </Button>
            <Button size="sm" variant="outline" onClick={() => onStatusChange(reservation.id, "no-show")}>
              No Show
            </Button>
          </>
        )}
        {reservation.status === "seated" && (
          <Button size="sm" onClick={() => onStatusChange(reservation.id, "completed")}>
            Complete
          </Button>
        )}
        {reservation.paymentStatus === "failed" && (
          <Button size="sm" variant="outline">
            Retry Payment
          </Button>
        )}
        {reservation.paymentStatus === "completed" && reservation.status === "cancelled" && (
          <Button size="sm" variant="outline">
            Process Refund
          </Button>
        )}
      </div>
    </div>
  )
}
