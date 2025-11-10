"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Phone, Users, Utensils } from "lucide-react"
import type { UserPreferences } from "./preference-questionnaire"
import type { Restaurant } from "@/lib/restaurant"

interface AIRestaurantMatcherProps {
  preferences: UserPreferences
  onRestaurantSelect: (restaurant: Restaurant) => void
  onBack: () => void
}

interface MatchedRestaurant extends Restaurant {
  matchScore: number
  matchReasons: string[]
  aiRecommendation: string
  tables: { id: string; number: number; capacity: number; location: string; status: string; x: number; y: number }[]
}

export function AIRestaurantMatcher({ preferences, onRestaurantSelect, onBack }: AIRestaurantMatcherProps) {
  const [matchedRestaurants, setMatchedRestaurants] = useState<MatchedRestaurant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const findMatchingRestaurants = async () => {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const prefs = preferences || {
        cuisineTypes: [],
        spiceLevel: "Medium",
        diningStyle: "casual",
        allergies: [],
        partySize: 2,
      }

      const allRestaurants: MatchedRestaurant[] = [
        {
          id: "ai-1",
          name: "Spice Garden",
          cuisine: "North Indian",
          rating: 4.8,
          priceRange: "$$",
          location: "Downtown",
          address: "123 Curry Street, Downtown",
          phone: "+1 (555) 123-4567",
          image: "/authentic-indian-restaurant-with-tandoor-and-tradi.jpg",
          coordinates: { lat: 40.7128, lng: -74.006 },
          distance: 0.8,
          tables: [
            { id: "ai-t1", number: 1, capacity: 2, location: "indoor", status: "available", x: 50, y: 50 },
            { id: "ai-t2", number: 2, capacity: 4, location: "indoor", status: "available", x: 150, y: 50 },
          ],
          matchScore: 95,
          matchReasons: [
            "Perfect match for North Indian cuisine preference",
            `Accommodates spice level: ${prefs.spiceLevel}`,
            "No allergens in signature dishes",
            "Available for party of " + prefs.partySize,
          ],
          aiRecommendation:
            "Highly recommended! Their butter chicken and biryani are exceptional, with customizable spice levels.",
        },
        {
          id: "ai-3",
          name: "Chennai Express",
          cuisine: "South Indian",
          rating: 4.7,
          priceRange: "$$",
          location: "Curry Hill",
          address: "789 Dosa Lane, Curry Hill",
          phone: "+1 (555) 345-6789",
          image: "/south-indian-restaurant-with-dosa-preparation-and-.jpg",
          coordinates: { lat: 40.7505, lng: -73.9934 },
          distance: 0.5,
          tables: [
            { id: "ai-t11", number: 11, capacity: 2, location: "indoor", status: "available", x: 50, y: 50 },
            { id: "ai-t12", number: 12, capacity: 4, location: "indoor", status: "available", x: 150, y: 50 },
          ],
          matchScore: 92,
          matchReasons: [
            "Excellent match for South Indian cuisine",
            `Authentic flavors with ${prefs.spiceLevel} spice options`,
            "Vegetarian and allergy-friendly",
          ],
          aiRecommendation:
            "Authentic South Indian flavors! Their dosas are crispy perfection and sambar is beautifully balanced.",
        },
        {
          id: "ai-2",
          name: "Bella Vista",
          cuisine: "Italian",
          rating: 4.6,
          priceRange: "$$$",
          location: "Little Italy",
          address: "456 Pasta Avenue, Little Italy",
          phone: "+1 (555) 234-5678",
          image: "/elegant-italian-restaurant-interior-with-garden-th.jpg",
          coordinates: { lat: 40.7589, lng: -73.9851 },
          distance: 1.2,
          tables: [
            { id: "ai-t20", number: 20, capacity: 2, location: "indoor", status: "available", x: 50, y: 50 },
            { id: "ai-t21", number: 21, capacity: 4, location: "indoor", status: "available", x: 150, y: 50 },
          ],
          matchScore: 88,
          matchReasons: [
            "Matches Italian cuisine preference",
            `Excellent for ${prefs.diningStyle} dining`,
            "Allergy-friendly options available",
          ],
          aiRecommendation:
            "Perfect for Italian food lovers! Their pasta and wood-fired pizzas are outstanding with gluten-free options.",
        },
      ]

      let filtered = allRestaurants

      if (prefs.cuisineTypes.length > 0) {
        filtered = filtered.filter((restaurant) => {
          return prefs.cuisineTypes.some((cuisine) => {
            const normalizedCuisine = cuisine.toLowerCase().replace(/[-\s]/g, "")
            const restaurantCuisine = restaurant.cuisine.toLowerCase().replace(/[-\s]/g, "")
            return (
              restaurantCuisine.includes(normalizedCuisine) ||
              normalizedCuisine.includes(restaurantCuisine) ||
              (normalizedCuisine.includes("indian") && restaurantCuisine.includes("indian"))
            )
          })
        })
      }

      if (prefs.diningStyle === "fast food") {
        filtered = filtered.filter((r) => r.cuisine.toLowerCase().includes("fast") || r.priceRange === "$")
      } else if (prefs.diningStyle === "casual" || prefs.diningStyle === "fine dining") {
        filtered = filtered.filter((r) => !r.cuisine.toLowerCase().includes("fast"))
      }

      filtered = filtered.map((restaurant) => {
        let adjustedScore = restaurant.matchScore
        if (
          prefs.cuisineTypes.some((cuisine) => restaurant.cuisine.toLowerCase().includes(cuisine.toLowerCase()))
        )
          adjustedScore += 5
        if (
          prefs.spiceLevel &&
          restaurant.matchReasons.some((reason) => reason.toLowerCase().includes(prefs.spiceLevel.toLowerCase()))
        )
          adjustedScore += 3
        if (
          prefs.allergies.length > 0 &&
          restaurant.matchReasons.some(
            (reason) => reason.toLowerCase().includes("allergy") || reason.toLowerCase().includes("dietary"),
          )
        )
          adjustedScore += 2
        return { ...restaurant, matchScore: Math.min(adjustedScore, 100) }
      })

      setMatchedRestaurants(filtered.sort((a, b) => b.matchScore - a.matchScore))
      setLoading(false)
    }

    findMatchingRestaurants()
  }, [preferences])

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <h2 className="text-2xl font-bold mt-4">Finding your perfect restaurants...</h2>
        <p className="text-muted-foreground">
          Our AI is analyzing your preferences and matching you with the best options
        </p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="outline" onClick={onBack} className="mb-4 bg-transparent">
          ← Back to Preferences
        </Button>
        <h2 className="text-3xl font-bold mb-2">AI-Recommended Restaurants</h2>
        <p className="text-muted-foreground mb-6">
          Based on your preferences, here are the perfect matches for you
        </p>

        <div className="space-y-6">
          {matchedRestaurants.map((restaurant) => (
            <Card key={restaurant.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <img
                    src={
                      restaurant.image ||
                      `/placeholder.svg?height=300&width=400&query=${encodeURIComponent(
                        `premium ${restaurant.cuisine} restaurant interior`,
                      )}`
                    }
                    alt={restaurant.name}
                    className="w-full h-48 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-2/3 p-6">
                  <CardHeader className="p-0 mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl mb-2">{restaurant.name}</CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center">
                            <Utensils className="w-4 h-4 mr-1" />
                            {restaurant.cuisine}
                          </span>
                          <span className="flex items-center">
                            <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                            {restaurant.rating}
                          </span>
                          <span>{restaurant.priceRange}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground mb-3">
                          <MapPin className="w-4 h-4 mr-1" />
                          {restaurant.address} • {restaurant.distance} km away
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {restaurant.matchScore}% Match
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0 space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Why this restaurant is perfect for you:</h4>
                      <ul className="space-y-1">
                        {restaurant.matchReasons.map((reason, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">AI Recommendation:</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200">{restaurant.aiRecommendation}</p>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {restaurant.phone}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          Table for {preferences?.partySize || 2}
                        </span>
                      </div>
                      <Button onClick={() => onRestaurantSelect(restaurant)}>Book Table</Button>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}

          {matchedRestaurants.length === 0 && (
            <Card className="text-center p-8">
              <CardContent>
                <h3 className="text-xl font-semibold mb-2">No perfect matches found</h3>
                <p className="text-muted-foreground mb-4">
                  We couldn't find restaurants that match all your preferences in your area.
                </p>
                <Button variant="outline" onClick={onBack}>
                  Adjust Preferences
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
