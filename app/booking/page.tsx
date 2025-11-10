"use client"

import { useState } from "react"
import { RestaurantSearch } from "@/components/booking/restaurant-search"
import { ReservationForm } from "@/components/booking/reservation-form"
import { BookingSuccess } from "@/components/booking/booking-success"
import { PreferenceQuestionnaire, type UserPreferences } from "@/components/booking/preference-questionnaire"
import { AIRestaurantMatcher } from "@/components/booking/ai-restaurant-matcher"
import type { Restaurant } from "@/lib/restaurant"

export default function BookingPage() {
  const [step, setStep] = useState<"preferences" | "ai-matching" | "search" | "booking" | "success">("preferences")
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [reservationId, setReservationId] = useState<string>("")
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null)

  const handlePreferencesComplete = (preferences: UserPreferences) => {
    setUserPreferences(preferences)
    if (preferences.hasPreferences) {
      // If user has previous preferences, go directly to search
      setStep("search")
    } else {
      // If new user, show AI matching
      setStep("ai-matching")
    }
  }

  const handleRestaurantSelect = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant)
    setStep("booking")
  }

  const handleBookingComplete = (id: string) => {
    setReservationId(id)
    setStep("success")
  }

  const handleNewBooking = () => {
    setStep("preferences")
    setSelectedRestaurant(null)
    setReservationId("")
    setUserPreferences(null)
  }

  const handleBackToSearch = () => {
    setStep("search")
    setSelectedRestaurant(null)
  }

  const handleBackToPreferences = () => {
    setStep("preferences")
    setUserPreferences(null)
  }

  const handleBackToAIMatching = () => {
    setStep("ai-matching")
    setSelectedRestaurant(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card/30 to-background">
      <header className="border-b border-border/50 bg-gradient-to-r from-background/95 to-card/95 backdrop-blur-md shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  TableBook
                </h1>
                <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full"></div>
                <span className="text-muted-foreground font-semibold text-lg">AI-Powered Reservations</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 shadow-lg ${
                    step === "preferences"
                      ? "gradient-primary text-white scale-110"
                      : step === "ai-matching" || step === "search" || step === "booking" || step === "success"
                        ? "bg-primary/20 text-primary border-2 border-primary/30"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  1
                </div>
                <div
                  className={`w-16 h-2 rounded-full transition-all duration-500 ${
                    step === "ai-matching" || step === "search" || step === "booking" || step === "success"
                      ? "gradient-primary"
                      : "bg-border"
                  }`}
                ></div>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 shadow-lg ${
                    step === "ai-matching" || step === "search"
                      ? "gradient-primary text-white scale-110"
                      : step === "booking" || step === "success"
                        ? "bg-primary/20 text-primary border-2 border-primary/30"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  2
                </div>
                <div
                  className={`w-16 h-2 rounded-full transition-all duration-500 ${
                    step === "booking" || step === "success" ? "gradient-primary" : "bg-border"
                  }`}
                ></div>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 shadow-lg ${
                    step === "booking"
                      ? "gradient-primary text-white scale-110"
                      : step === "success"
                        ? "bg-primary/20 text-primary border-2 border-primary/30"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  3
                </div>
                <div
                  className={`w-16 h-2 rounded-full transition-all duration-500 ${
                    step === "success" ? "gradient-primary" : "bg-border"
                  }`}
                ></div>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 shadow-lg ${
                    step === "success" ? "gradient-primary text-white scale-110" : "bg-muted text-muted-foreground"
                  }`}
                >
                  4
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-foreground">
                  {step === "preferences" && "Set Preferences"}
                  {step === "ai-matching" && "AI Recommendations"}
                  {step === "search" && "Find Restaurant"}
                  {step === "booking" && "Make Reservation"}
                  {step === "success" && "Booking Complete"}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  Step{" "}
                  {step === "preferences"
                    ? "1"
                    : step === "ai-matching" || step === "search"
                      ? "2"
                      : step === "booking"
                        ? "3"
                        : "4"}{" "}
                  of 4
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="gradient-card backdrop-blur-md rounded-3xl shadow-2xl border border-border/20 overflow-hidden animate-fade-in-up">
            {step === "preferences" && <PreferenceQuestionnaire onComplete={handlePreferencesComplete} />}

            {step === "ai-matching" && userPreferences && (
              <AIRestaurantMatcher
                preferences={userPreferences}
                onRestaurantSelect={handleRestaurantSelect}
                onBack={handleBackToPreferences}
              />
            )}

            {step === "search" && <RestaurantSearch onRestaurantSelect={handleRestaurantSelect} />}

            {step === "booking" && selectedRestaurant && (
              <ReservationForm
                restaurant={selectedRestaurant}
                onBookingComplete={handleBookingComplete}
                onBack={step === "ai-matching" ? handleBackToAIMatching : handleBackToSearch}
              />
            )}

            {step === "success" && <BookingSuccess reservationId={reservationId} onNewBooking={handleNewBooking} />}
          </div>
        </div>
      </main>
    </div>
  )
}
