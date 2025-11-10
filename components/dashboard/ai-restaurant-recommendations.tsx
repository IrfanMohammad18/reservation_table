"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Star, Sparkles, Navigation } from "lucide-react"
import { mapsService, type AIRecommendation } from "@/lib/maps-service"

export function AIRestaurantRecommendations() {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationName, setLocationName] = useState("")

  const detectLocation = async () => {
    setLoading(true)
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        })
      })

      const { latitude, longitude } = position.coords
      setUserLocation({ lat: latitude, lng: longitude })

      // Get location name
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
        )
        const data = await response.json()
        const location = `${data.locality || data.city || "Unknown"}, ${data.principalSubdivision || data.countryName || ""}`
        setLocationName(location)
      } catch (error) {
        setLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
      }

      // Get nearby restaurants
      const nearbyRestaurants = await mapsService.getNearbyRestaurants(latitude, longitude)

      // Get AI recommendations
      const aiRecommendations = await mapsService.getAIRecommendations(nearbyRestaurants, {
        cuisine: "indian",
        priceRange: 2,
        rating: 4.0,
      })

      setRecommendations(aiRecommendations)
    } catch (error) {
      console.error("Error getting location:", error)
      alert("Unable to get your location. Please enable location services.")
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-blue-500"
    if (score >= 40) return "bg-yellow-500"
    return "bg-gray-500"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Perfect Match"
    if (score >= 60) return "Great Match"
    if (score >= 40) return "Good Match"
    return "Alternative"
  }

  const getAIRecommendationImageQuery = (restaurant: any) => {
    const cuisineType = restaurant.cuisine?.toLowerCase() || "restaurant"

    const premiumQueries = {
      italian: `premium Italian restaurant signature dish with fresh pasta, truffle garnish, elegant plating, and fine dining presentation`,
      indian: `exquisite Indian cuisine with aromatic spices, traditional copper serving dishes, garnished curry, and royal presentation`,
      "north indian": `luxury North Indian dish with rich gravy, basmati rice, naan bread, elegant brass serving bowls, and royal garnish`,
      "south indian": `authentic South Indian feast with dosa, sambar, coconut chutney, banana leaf presentation, and traditional serving style`,
      mediterranean: `gourmet Mediterranean platter with fresh seafood, olive oil drizzle, herbs, elegant white plate, and seaside ambiance`,
      asian: `sophisticated Asian fusion dish with artistic plating, chopsticks, bamboo elements, and contemporary presentation`,
      american: `premium American cuisine with grilled steak, seasonal vegetables, wine pairing, and upscale restaurant ambiance`,
      mexican: `artisanal Mexican dish with colorful presentation, fresh ingredients, traditional pottery, and vibrant garnishes`,
      french: `elegant French cuisine with wine sauce, microgreens, fine china, crystal glasses, and Michelin-star presentation`,
      japanese: `premium sushi platter with fresh sashimi, wasabi, ginger, wooden board, and authentic Japanese presentation`,
      european: `refined European dish with seasonal ingredients, wine pairing, elegant plating, and continental fine dining style`,
      "street food": `gourmet street food with elevated presentation, fresh ingredients, colorful garnish, and modern food truck style`,
      vegetarian: `beautiful vegetarian dish with colorful vegetables, fresh herbs, artistic plating, and healthy presentation`,
    }

    return (
      premiumQueries[cuisineType] ||
      `premium ${cuisineType} restaurant signature dish with professional plating, garnish, and fine dining presentation`
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          AI Restaurant Recommendations
        </CardTitle>
        {!userLocation && (
          <Button onClick={detectLocation} disabled={loading} className="w-fit bg-transparent" variant="outline">
            <Navigation className="h-4 w-4 mr-2" />
            {loading ? "Detecting Location..." : "Get AI Recommendations"}
          </Button>
        )}
        {locationName && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            Recommendations for: {locationName}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Finding the best restaurants for you...</p>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <Card key={rec.restaurant.id} className="border-l-4 border-l-purple-600">
                <CardContent className="p-4">
                  <div className="flex gap-4 mb-4">
                    <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={
                          rec.restaurant.image ||
                          `/placeholder.svg?height=80&width=80&query=${encodeURIComponent(getAIRecommendationImageQuery(rec.restaurant)) || "/placeholder.svg"}`
                        }
                        alt={`${rec.restaurant.name} - Premium ${rec.restaurant.cuisine} cuisine`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{rec.restaurant.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {rec.restaurant.rating} • {rec.restaurant.priceRange} • {rec.restaurant.cuisine}
                          </div>
                        </div>
                        <Badge className={`${getScoreColor(rec.matchScore)} text-white`}>
                          {getScoreLabel(rec.matchScore)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {rec.restaurant.address}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {rec.restaurant.phone}
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>AI Analysis:</strong> {rec.reason}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {rec.highlights.map((highlight, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      Book Table
                    </Button>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && recommendations.length === 0 && userLocation && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No restaurants found in your area. Try expanding your search radius.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
