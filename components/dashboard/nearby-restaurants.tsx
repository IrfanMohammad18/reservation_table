"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookingService, type Restaurant } from "@/lib/booking"
import { MapPin, Star, Clock } from "lucide-react"

export function NearbyRestaurants() {
  const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([])
  const [userLocation, setUserLocation] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")

  const detectLocation = async () => {
    setIsLoading(true)
    setError("")

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser")
      setIsLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords

          const locationName = await BookingService.getLocationFromCoords(latitude, longitude)
          setUserLocation(locationName)

          const restaurants = await BookingService.searchRestaurants({
            location: locationName,
            userCoords: { lat: latitude, lng: longitude },
          })

          setNearbyRestaurants(restaurants)
        } catch (err) {
          setError("Failed to get location details")
        } finally {
          setIsLoading(false)
        }
      },
      (error) => {
        let errorMessage = "Failed to get your location"
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable."
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out."
            break
        }
        setError(errorMessage)
        setIsLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      },
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Nearby Restaurants</span>
            </CardTitle>
            <CardDescription>
              {userLocation ? `Restaurants near ${userLocation}` : "Discover restaurants in your area"}
            </CardDescription>
          </div>
          <Button onClick={detectLocation} disabled={isLoading} variant="outline" size="sm">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                Detecting...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 mr-2" />
                Use My Location
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md mb-4">{error}</div>}

        {nearbyRestaurants.length > 0 ? (
          <div className="space-y-4">
            {nearbyRestaurants.slice(0, 5).map((restaurant) => (
              <div
                key={restaurant.id}
                className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={
                      restaurant.image ||
                      `/placeholder.svg?height=64&width=64&query=${encodeURIComponent(`${restaurant.cuisine.join(" ") || "/placeholder.svg"} restaurant exterior storefront or interior dining area, professional photography, inviting atmosphere`)}`
                    }
                    alt={`${restaurant.name} - ${restaurant.cuisine.join(", ")} restaurant`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-sm">{restaurant.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{restaurant.address}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{restaurant.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{restaurant.priceRange}</span>
                        </div>
                        {restaurant.distance && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{restaurant.distance.toFixed(1)} km</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {restaurant.cuisine.slice(0, 3).map((cuisine) => (
                      <Badge key={cuisine} variant="secondary" className="text-xs">
                        {cuisine}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {nearbyRestaurants.length > 5 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                And {nearbyRestaurants.length - 5} more restaurants nearby
              </p>
            )}
          </div>
        ) : userLocation && !isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No restaurants found in your area</p>
          </div>
        ) : !userLocation && !isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Click "Use My Location" to find nearby restaurants</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
