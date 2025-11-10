"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AvailabilityService, type WaitlistEntry } from "@/lib/availability"
import { format } from "date-fns"

interface WaitlistManagementProps {
  restaurantId: string
}

export function WaitlistManagement({ restaurantId }: WaitlistManagementProps) {
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadWaitlist()
  }, [restaurantId])

  const loadWaitlist = async () => {
    setIsLoading(true)
    try {
      const entries = AvailabilityService.getWaitlistEntries(restaurantId)
      setWaitlistEntries(entries)
    } catch (error) {
      console.error("Failed to load waitlist:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotifyCustomer = async (waitlistId: string) => {
    try {
      await AvailabilityService.notifyWaitlistCustomer(waitlistId)
      loadWaitlist() // Refresh the list
    } catch (error) {
      console.error("Failed to notify customer:", error)
    }
  }

  const todayEntries = waitlistEntries.filter((entry) => {
    const today = new Date().toISOString().split("T")[0]
    return entry.date === today
  })

  const upcomingEntries = waitlistEntries.filter((entry) => {
    const today = new Date().toISOString().split("T")[0]
    return entry.date > today
  })

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading waitlist...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Waitlist Management</CardTitle>
        </CardHeader>
        <CardContent>
          {waitlistEntries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No customers on waitlist</p>
            </div>
          ) : (
            <div className="space-y-6">
              {todayEntries.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4">Today's Waitlist</h3>
                  <div className="space-y-3">
                    {todayEntries.map((entry) => (
                      <WaitlistCard key={entry.id} entry={entry} onNotify={handleNotifyCustomer} />
                    ))}
                  </div>
                </div>
              )}

              {upcomingEntries.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4">Upcoming Waitlist</h3>
                  <div className="space-y-3">
                    {upcomingEntries.map((entry) => (
                      <WaitlistCard key={entry.id} entry={entry} onNotify={handleNotifyCustomer} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function WaitlistCard({ entry, onNotify }: { entry: WaitlistEntry; onNotify: (id: string) => void }) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold">{entry.customerName}</h4>
          <p className="text-sm text-muted-foreground">{entry.customerEmail}</p>
          <p className="text-sm text-muted-foreground">{entry.customerPhone}</p>
        </div>
        <div className="text-right">
          <Badge variant="outline">Priority #{entry.priority}</Badge>
          {entry.notified && <Badge className="ml-2 bg-blue-100 text-blue-800">Notified</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="font-medium">Date</p>
          <p>{format(new Date(entry.date), "MMM dd, yyyy")}</p>
        </div>
        <div>
          <p className="font-medium">Time</p>
          <p>{entry.time}</p>
        </div>
        <div>
          <p className="font-medium">Party Size</p>
          <p>{entry.partySize} people</p>
        </div>
      </div>

      <div className="flex space-x-2">
        {!entry.notified && (
          <Button size="sm" onClick={() => onNotify(entry.id)}>
            Notify Customer
          </Button>
        )}
        <Button size="sm" variant="outline">
          Contact Customer
        </Button>
      </div>
    </div>
  )
}
