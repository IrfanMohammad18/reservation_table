"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label" // ✅ Fixed missing import
import type { Restaurant, Table } from "@/lib/restaurant"
import { TableSelection } from "./table-selection"
import { PaymentForm } from "./payment-form"
import { format } from "date-fns"

interface ReservationFormProps {
  restaurant: Restaurant
  onBookingComplete: (reservationId: string) => void
  onBack: () => void
}

export function ReservationForm({ restaurant, onBookingComplete, onBack }: ReservationFormProps) {
  const [step, setStep] = useState<"datetime" | "table" | "payment" | "confirmation">("datetime")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  const [bookingData, setBookingData] = useState({
    date: "",
    time: "",
    partySize: 2,
  })

  const handleSubmit = async (paymentId?: string) => {
    setIsLoading(true)
    setError("")
    try {
      const reservationId = "RESV-" + Math.random().toString(36).substr(2, 9)
      onBookingComplete(reservationId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTableSelect = (table: Table) => {
    setSelectedTable(table)
    setStep("payment")
  }

  const handlePaymentComplete = (paymentId: string) => {
    handleSubmit(paymentId)
  }

  if (step === "datetime") {
    return (
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="pb-8">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Select Date
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-2">
                Choose your preferred reservation date
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={onBack}
              className="hover:bg-card transition-all duration-300 bg-transparent"
            >
              ← Back to Search
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="p-6 gradient-card rounded-2xl border border-border/20 shadow-lg">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-card-foreground">{restaurant.name}</h3>
                <p className="text-muted-foreground">{restaurant.address}</p>
              </div>
            </div>
          </div>

          <Label className="text-base font-semibold text-foreground">Select Date</Label>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date)
                if (date) {
                  const formattedDate = format(date, "yyyy-MM-dd")
                  setBookingData((prev) => ({ ...prev, date: formattedDate }))
                }
              }}
              disabled={(date) => date < new Date()}
              className="rounded-md border border-border/50 p-4 bg-card shadow-lg"
            />
          </div>

          <Button
            className="w-full h-14 text-lg font-semibold gradient-primary hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
            disabled={!bookingData.date}
            onClick={() => setStep("table")}
          >
            Continue to Table Selection →
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (step === "table") {
    return (
      <TableSelection
        restaurant={restaurant}
        partySize={bookingData.partySize}
        selectedDate={bookingData.date}
        selectedTime={bookingData.time}
        onTableSelect={handleTableSelect}
        onBack={() => setStep("datetime")}
      />
    )
  }

  if (step === "payment" && selectedTable) {
    return (
      <PaymentForm
        restaurant={restaurant}
        selectedTable={selectedTable}
        bookingDetails={bookingData}
        onPaymentComplete={handlePaymentComplete}
        onBack={() => setStep("table")}
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirm Your Reservation</CardTitle>
        <CardDescription>Review and confirm your booking details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold text-lg mb-2">{restaurant.name}</h3>
          <p>{format(new Date(bookingData.date), "EEEE, MMM dd, yyyy")}</p>
          <p>{bookingData.partySize} guests</p>
          {selectedTable && (
            <p>
              Table {selectedTable.number} • {selectedTable.capacity} seats • {selectedTable.location}
            </p>
          )}
        </div>

        <div className="flex space-x-4">
          <Button variant="outline" onClick={() => setStep("table")} className="flex-1">
            Back
          </Button>
          <Button onClick={() => handleSubmit()} disabled={isLoading} className="flex-1">
            {isLoading ? "Confirming..." : "Confirm Reservation"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
