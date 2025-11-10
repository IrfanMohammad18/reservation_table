"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AvailabilityService, type BlockedTimeSlot } from "@/lib/availability"
import { format, addDays } from "date-fns"

interface TimeBlockingProps {
  restaurantId: string
  userId: string
}

export function TimeBlocking({ restaurantId, userId }: TimeBlockingProps) {
  const [blockedSlots, setBlockedSlots] = useState<BlockedTimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    reason: "",
  })

  // Generate next 30 days for date selection
  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(new Date(), i)
    return {
      value: format(date, "yyyy-MM-dd"),
      label: format(date, "EEE, MMM dd"),
    }
  })

  // Generate time options
  const timeOptions = []
  for (let hour = 11; hour < 23; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      timeOptions.push(time)
    }
  }

  useEffect(() => {
    loadBlockedSlots()
  }, [restaurantId])

  const loadBlockedSlots = async () => {
    setIsLoading(true)
    try {
      const slots = AvailabilityService.getBlockedSlots(restaurantId)
      setBlockedSlots(slots)
    } catch (error) {
      console.error("Failed to load blocked slots:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.startTime >= formData.endTime) {
      setError("End time must be after start time")
      return
    }

    try {
      await AvailabilityService.blockTimeSlot({
        restaurantId,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        reason: formData.reason,
        createdBy: userId,
      })

      setFormData({ date: "", startTime: "", endTime: "", reason: "" })
      setShowForm(false)
      loadBlockedSlots()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to block time slot")
    }
  }

  const handleRemoveBlock = async (blockId: string) => {
    try {
      await AvailabilityService.removeBlockedSlot(blockId)
      loadBlockedSlots()
    } catch (error) {
      console.error("Failed to remove blocked slot:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Time Blocking</CardTitle>
            <Button onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "Block Time Slot"}</Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 border rounded-lg">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Select
                    value={formData.date}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, date: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select date" />
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

                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Select
                    value={formData.startTime}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, startTime: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Start time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Select
                    value={formData.endTime}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, endTime: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="End time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="Reason for blocking this time slot..."
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={!formData.date || !formData.startTime || !formData.endTime || !formData.reason}
              >
                Block Time Slot
              </Button>
            </form>
          )}

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading blocked slots...</p>
            </div>
          ) : blockedSlots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No blocked time slots</p>
            </div>
          ) : (
            <div className="space-y-3">
              {blockedSlots.map((slot) => (
                <div key={slot.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">
                        {format(new Date(slot.date), "MMM dd, yyyy")} • {slot.startTime} - {slot.endTime}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">{slot.reason}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Created {format(slot.createdAt, "MMM dd, yyyy 'at' HH:mm")}
                      </p>
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => handleRemoveBlock(slot.id)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
