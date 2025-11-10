"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import type { Restaurant, Table } from "@/lib/restaurant"
import { format } from "date-fns"

interface PaymentFormProps {
  restaurant: Restaurant
  selectedTable: Table
  bookingDetails: {
    date: string
    time: string
    partySize: number
    customerName: string
    customerEmail: string
    customerPhone: string
    specialRequests?: string
  }
  onPaymentComplete: (paymentId: string) => void
  onBack: () => void
}

interface PaymentData {
  cardNumber: string
  expiryDate: string
  cvv: string
  cardholderName: string
  billingAddress: string
  city: string
  zipCode: string
  paymentMethod: "card" | "paypal" | "apple-pay" | "phonepe" | "google-pay"
}

export function PaymentForm({
  restaurant,
  selectedTable,
  bookingDetails,
  onPaymentComplete,
  onBack,
}: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [paymentData, setPaymentData] = useState<PaymentData>({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    billingAddress: "",
    city: "",
    zipCode: "",
    paymentMethod: "card",
  })

  // Calculate pricing based on restaurant price range and party size
  const calculatePricing = () => {
    const basePrices = {
      $: 15,
      $$: 25,
      $$$: 45,
      $$$$: 75,
    }

    const basePrice = basePrices[restaurant.priceRange] || 25
    const reservationFee = 5
    const tableUpcharge = selectedTable.location === "private" ? 20 : selectedTable.location === "outdoor" ? 5 : 0
    const subtotal = basePrice * bookingDetails.partySize + reservationFee + tableUpcharge
    const tax = subtotal * 0.08 // 8% tax
    const total = subtotal + tax

    return {
      basePrice,
      reservationFee,
      tableUpcharge,
      subtotal,
      tax,
      total,
    }
  }

  const pricing = calculatePricing()

  const handlePayment = async () => {
    setIsLoading(true)
    setError("")

    try {
      // Validate payment data
      if (paymentData.paymentMethod === "card") {
        if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv || !paymentData.cardholderName) {
          throw new Error("Please fill in all card details")
        }

        // Basic card number validation (simplified)
        if (paymentData.cardNumber.replace(/\s/g, "").length < 13) {
          throw new Error("Please enter a valid card number")
        }
      }

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate payment success/failure
      if (Math.random() > 0.1) {
        // 90% success rate
        const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        onPaymentComplete(paymentId)
      } else {
        throw new Error("Payment failed. Please try again or use a different payment method.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed")
    } finally {
      setIsLoading(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Payment & Confirmation</CardTitle>
            <CardDescription>Complete your reservation with secure payment</CardDescription>
          </div>
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Booking Summary */}
        <div className="p-4 border rounded-lg bg-muted/50">
          <h3 className="font-semibold mb-3">Reservation Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Restaurant:</span>
              <span className="font-medium">{restaurant.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Date & Time:</span>
              <span className="font-medium">
                {format(new Date(bookingDetails.date), "MMM dd, yyyy")} at {bookingDetails.time}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Party Size:</span>
              <span className="font-medium">{bookingDetails.partySize} people</span>
            </div>
            <div className="flex justify-between">
              <span>Table:</span>
              <div className="flex items-center space-x-2">
                <span className="font-medium">Table {selectedTable.number}</span>
                <Badge variant="outline" className="text-xs">
                  {selectedTable.location}
                </Badge>
              </div>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span className="font-medium">{bookingDetails.customerName}</span>
            </div>
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-3">Pricing Breakdown</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>
                Base Price ({bookingDetails.partySize} × ${pricing.basePrice}):
              </span>
              <span>${(pricing.basePrice * bookingDetails.partySize).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Reservation Fee:</span>
              <span>${pricing.reservationFee.toFixed(2)}</span>
            </div>
            {pricing.tableUpcharge > 0 && (
              <div className="flex justify-between">
                <span>{selectedTable.location === "private" ? "Private Room" : "Outdoor Seating"} Fee:</span>
                <span>${pricing.tableUpcharge.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal:</span>
              <span>${pricing.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax (8%):</span>
              <span>${pricing.tax.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span>${pricing.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-4">
          <Label>Payment Method</Label>
          <Select
            value={paymentData.paymentMethod}
            onValueChange={(value: "card" | "paypal" | "apple-pay" | "phonepe" | "google-pay") =>
              setPaymentData((prev) => ({ ...prev, paymentMethod: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="card">Credit/Debit Card</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
              <SelectItem value="phonepe">PhonePe</SelectItem>
              <SelectItem value="google-pay">Google Pay</SelectItem>
              <SelectItem value="apple-pay">Apple Pay</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payment Form */}
        {paymentData.paymentMethod === "card" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number *</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={paymentData.cardNumber}
                onChange={(e) =>
                  setPaymentData((prev) => ({
                    ...prev,
                    cardNumber: formatCardNumber(e.target.value),
                  }))
                }
                maxLength={19}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={paymentData.expiryDate}
                  onChange={(e) =>
                    setPaymentData((prev) => ({
                      ...prev,
                      expiryDate: formatExpiryDate(e.target.value),
                    }))
                  }
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV *</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={paymentData.cvv}
                  onChange={(e) =>
                    setPaymentData((prev) => ({
                      ...prev,
                      cvv: e.target.value.replace(/\D/g, "").substring(0, 4),
                    }))
                  }
                  maxLength={4}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardholderName">Cardholder Name *</Label>
              <Input
                id="cardholderName"
                placeholder="John Doe"
                value={paymentData.cardholderName}
                onChange={(e) =>
                  setPaymentData((prev) => ({
                    ...prev,
                    cardholderName: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingAddress">Billing Address</Label>
              <Input
                id="billingAddress"
                placeholder="123 Main Street"
                value={paymentData.billingAddress}
                onChange={(e) =>
                  setPaymentData((prev) => ({
                    ...prev,
                    billingAddress: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="New York"
                  value={paymentData.city}
                  onChange={(e) =>
                    setPaymentData((prev) => ({
                      ...prev,
                      city: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  placeholder="10001"
                  value={paymentData.zipCode}
                  onChange={(e) =>
                    setPaymentData((prev) => ({
                      ...prev,
                      zipCode: e.target.value.replace(/\D/g, "").substring(0, 5),
                    }))
                  }
                  maxLength={5}
                />
              </div>
            </div>
          </div>
        )}

        {paymentData.paymentMethod === "paypal" && (
          <div className="p-6 border-2 border-blue-200 rounded-lg bg-blue-50">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">PP</span>
              </div>
              <h3 className="font-semibold text-blue-900">Pay with PayPal</h3>

              {/* QR Code for PayPal */}
              <div className="bg-white p-4 rounded-lg border-2 border-blue-300">
                <img src="/paypal-qr-code-for-payment.jpg" alt="PayPal QR Code" className="w-32 h-32" />
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-blue-800 font-medium">Scan QR code with PayPal app or click below</p>
                <p className="text-xs text-blue-600">Amount: ${pricing.total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {paymentData.paymentMethod === "phonepe" && (
          <div className="p-6 border-2 border-purple-200 rounded-lg bg-purple-50">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PhonePe</span>
              </div>
              <h3 className="font-semibold text-purple-900">Pay with PhonePe</h3>

              {/* QR Code for PhonePe */}
              <div className="bg-white p-4 rounded-lg border-2 border-purple-300">
                <img src="/phonepay_irfan.jpeg" alt="PhonePe QR Code" className="w-32 h-32" />
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-purple-800 font-medium">Scan QR code with PhonePe app</p>
                <p className="text-xs text-purple-600">
                  UPI ID: restaurant@phonepe | Amount: ₹{(pricing.total * 83).toFixed(0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {paymentData.paymentMethod === "google-pay" && (
          <div className="p-6 border-2 border-green-200 rounded-lg bg-green-50">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">GPay</span>
              </div>
              <h3 className="font-semibold text-green-900">Pay with Google Pay</h3>

              {/* QR Code for Google Pay */}
              <div className="bg-white p-4 rounded-lg border-2 border-green-300">
                <img src="/google-pay-qr-code-for-upi-payment.jpg" alt="Google Pay QR Code" className="w-32 h-32" />
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-green-800 font-medium">Scan QR code with Google Pay app</p>
                <p className="text-xs text-green-600">
                  UPI ID: restaurant@googlepay | Amount: ₹{(pricing.total * 83).toFixed(0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {paymentData.paymentMethod === "apple-pay" && (
          <div className="p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-black rounded-lg mx-auto flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">Use Touch ID or Face ID to pay with Apple Pay.</p>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 text-green-800">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span className="text-sm font-medium">Secure Payment</span>
          </div>
          <p className="text-xs text-green-700 mt-1">
            Your payment information is encrypted and secure. We never store your card details.
          </p>
        </div>

        <Button className="w-full" onClick={handlePayment} disabled={isLoading} size="lg">
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing Payment...
            </>
          ) : (
            `Pay $${pricing.total.toFixed(2)} & Confirm Reservation`
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          By completing this reservation, you agree to our terms of service and cancellation policy.
        </p>
      </CardContent>
    </Card>
  )
}
