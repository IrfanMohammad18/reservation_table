import type { Restaurant } from "./restaurant"

export interface GooglePlacesRestaurant {
  place_id: string
  name: string
  vicinity: string
  rating: number
  price_level?: number
  types: string[]
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  formatted_phone_number?: string
  formatted_address?: string
  opening_hours?: {
    open_now: boolean
    weekday_text: string[]
  }
  photos?: Array<{
    photo_reference: string
    height: number
    width: number
  }>
}

export interface AIRecommendation {
  restaurant: Restaurant
  reason: string
  matchScore: number
  highlights: string[]
}

class MapsService {
  // Simulate Google Places API call with realistic restaurant data
  async getNearbyRestaurants(lat: number, lng: number, radius = 5000): Promise<GooglePlacesRestaurant[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate realistic restaurants based on location
    const restaurants: GooglePlacesRestaurant[] = [
      {
        place_id: "ChIJ1234567890",
        name: "Maharaja Indian Cuisine",
        vicinity: "123 Main Street, Downtown",
        rating: 4.5,
        price_level: 2,
        types: ["restaurant", "food", "establishment", "indian_restaurant"],
        geometry: {
          location: { lat: lat + 0.001, lng: lng + 0.001 },
        },
        formatted_phone_number: "+1 (555) 123-4567",
        formatted_address: "123 Main Street, Downtown, NY 10001",
        opening_hours: {
          open_now: true,
          weekday_text: ["Monday: 11:00 AM – 10:00 PM", "Tuesday: 11:00 AM – 10:00 PM"],
        },
      },
      {
        place_id: "ChIJ0987654321",
        name: "Spice Garden Indian Restaurant",
        vicinity: "456 Oak Avenue, Midtown",
        rating: 4.3,
        price_level: 2,
        types: ["restaurant", "food", "establishment", "indian_restaurant"],
        geometry: {
          location: { lat: lat + 0.002, lng: lng - 0.001 },
        },
        formatted_phone_number: "+1 (555) 234-5678",
        formatted_address: "456 Oak Avenue, Midtown, NY 10002",
        opening_hours: {
          open_now: true,
          weekday_text: ["Monday: 12:00 PM – 11:00 PM", "Tuesday: 12:00 PM – 11:00 PM"],
        },
      },
      {
        place_id: "ChIJ1122334455",
        name: "Bombay Palace",
        vicinity: "789 Pine Street, Uptown",
        rating: 4.7,
        price_level: 3,
        types: ["restaurant", "food", "establishment", "indian_restaurant"],
        geometry: {
          location: { lat: lat - 0.001, lng: lng + 0.002 },
        },
        formatted_phone_number: "+1 (555) 345-6789",
        formatted_address: "789 Pine Street, Uptown, NY 10003",
        opening_hours: {
          open_now: false,
          weekday_text: ["Monday: 5:00 PM – 11:00 PM", "Tuesday: 5:00 PM – 11:00 PM"],
        },
      },
      {
        place_id: "ChIJ5566778899",
        name: "Curry House Express",
        vicinity: "321 Elm Street, Westside",
        rating: 4.1,
        price_level: 1,
        types: ["restaurant", "food", "establishment", "indian_restaurant", "meal_takeaway"],
        geometry: {
          location: { lat: lat + 0.003, lng: lng - 0.002 },
        },
        formatted_phone_number: "+1 (555) 456-7890",
        formatted_address: "321 Elm Street, Westside, NY 10004",
        opening_hours: {
          open_now: true,
          weekday_text: ["Monday: 10:00 AM – 10:00 PM", "Tuesday: 10:00 AM – 10:00 PM"],
        },
      },
      {
        place_id: "ChIJ9988776655",
        name: "Tandoori Nights",
        vicinity: "654 Cedar Lane, Eastside",
        rating: 4.4,
        price_level: 2,
        types: ["restaurant", "food", "establishment", "indian_restaurant"],
        geometry: {
          location: { lat: lat - 0.002, lng: lng - 0.001 },
        },
        formatted_phone_number: "+1 (555) 567-8901",
        formatted_address: "654 Cedar Lane, Eastside, NY 10005",
        opening_hours: {
          open_now: true,
          weekday_text: ["Monday: 4:00 PM – 11:00 PM", "Tuesday: 4:00 PM – 11:00 PM"],
        },
      },
    ]

    return restaurants
  }

  // Calculate distance between two coordinates
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // AI-powered restaurant recommendations
  async getAIRecommendations(
    restaurants: GooglePlacesRestaurant[],
    userPreferences: {
      cuisine?: string
      priceRange?: number
      rating?: number
      distance?: number
    },
  ): Promise<AIRecommendation[]> {
    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const recommendations: AIRecommendation[] = restaurants.map((restaurant) => {
      let matchScore = 0
      const highlights: string[] = []
      let reason = ""

      // Rating scoring
      if (restaurant.rating >= 4.5) {
        matchScore += 30
        highlights.push("Excellent ratings")
      } else if (restaurant.rating >= 4.0) {
        matchScore += 20
        highlights.push("Great reviews")
      }

      // Price level scoring
      if (restaurant.price_level === userPreferences.priceRange) {
        matchScore += 25
        highlights.push("Perfect price range")
      }

      // Cuisine matching
      if (userPreferences.cuisine && restaurant.types.includes("indian_restaurant")) {
        matchScore += 35
        highlights.push("Matches cuisine preference")
      }

      // Opening hours
      if (restaurant.opening_hours?.open_now) {
        matchScore += 10
        highlights.push("Currently open")
      }

      // Generate AI reason
      if (matchScore >= 80) {
        reason = "Highly recommended based on your preferences. Excellent match for cuisine, price, and quality."
      } else if (matchScore >= 60) {
        reason = "Good match for your preferences with solid ratings and convenient location."
      } else if (matchScore >= 40) {
        reason = "Decent option that meets some of your criteria. Worth considering."
      } else {
        reason = "Alternative option with unique features that might interest you."
      }

      return {
        restaurant: {
          id: restaurant.place_id,
          name: restaurant.name,
          cuisine: "Indian",
          rating: restaurant.rating,
          priceRange: "$".repeat(restaurant.price_level || 1),
          location: restaurant.vicinity,
          address: restaurant.formatted_address || restaurant.vicinity,
          phone: restaurant.formatted_phone_number || "Not available",
          image: "/indian-restaurant-interior.png",
          availableTimes: ["6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM"],
          coordinates: restaurant.geometry.location,
        },
        reason,
        matchScore,
        highlights,
      }
    })

    // Sort by match score
    return recommendations.sort((a, b) => b.matchScore - a.matchScore)
  }
}

export const mapsService = new MapsService()
