"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AvailabilityService, type TimeSlot } from "@/lib/availability"
import { format, addDays } from "date-fns"

interface AvailabilityCalendarProps {
  restaurantId: string
}

export function AvailabilityCalendarComponent({ restaurantId }: AvailabilityCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [calendar, setCalendar] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Generate next 14 days
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(new Date(), i)
    return {
      value: format(date, "yyyy-MM-dd"),
      label: format(date, "EEE, MMM dd"),
    }
  })

  useEffect(() => {
    loadAvailability()
  }, [selectedDate, restaurantId])

  const loadAvailability = async () => {
    setIsLoading(true)
    try {
      const data = await AvailabilityService.getAvailabilityCalendar(restaurantId, selectedDate)
      setCalendar(data)
    } catch (error) {
      console.error("Failed to load availability:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSlotColor = (slot: TimeSlot) => {
    if (!slot.available) return "bg-red-100 text-red-800"
    if (slot.capacity <= 4) return "bg-yellow-100 text-yellow-800"
    return "bg-green-100 text-green-800"
  }

  const getSlotText = (slot: TimeSlot) => {
    if (!slot.available) {
      return slot.waitlistCount > 0 ? `Waitlist (${slot.waitlistCount})` : "Unavailable"
    }
    return `${slot.capacity} seats`
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading availability...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Real-time Availability</CardTitle>
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableDates.map((date) => (
                  <SelectItem key={date.value} value={date.value}>
                    {date.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {calendar && (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold">{calendar.totalCapacity}</p>
                  <p className="text-sm text-muted-foreground">Total Capacity</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{calendar.availableCapacity}</p>
                  <p className="text-sm text-muted-foreground">Available</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{calendar.bookedCapacity}</p>
                  <p className="text-sm text-muted-foreground">Booked</p>
                </div>
              </div>

              {/* Time Slots Grid */}
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {calendar.slots.map((slot) => (
                  <div key={slot.time} className="text-center">
                    <div className="text-sm font-medium mb-1">{slot.time}</div>
                    <Badge className={getSlotColor(slot)} variant="outline">
                      {getSlotText(slot)}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                  <span>High Availability (5+ seats)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
                  <span>Limited Availability (1-4 seats)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                  <span>Unavailable / Waitlist</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export { AvailabilityCalendarComponent as AvailabilityCalendar }
