"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BookingSuccessProps {
  reservationId: string
  onNewBooking: () => void
}

export function BookingSuccess({ reservationId, onNewBooking }: BookingSuccessProps) {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <CardTitle className="text-2xl text-green-700">Reservation Submitted!</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="font-medium text-green-900">Reservation ID</p>
          <p className="text-lg font-mono text-green-700">{reservationId}</p>
        </div>

        <div className="text-sm text-muted-foreground space-y-2">
          <p>Your reservation request has been submitted successfully!</p>
          <p>The restaurant will confirm your booking within 15 minutes.</p>
          <p>You will receive a confirmation email shortly.</p>
        </div>

        <div className="space-y-2">
          <Button onClick={onNewBooking} className="w-full">
            Make Another Reservation
          </Button>
          <Button variant="outline" className="w-full bg-transparent" onClick={() => (window.location.href = "/")}>
            Back to Home
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
