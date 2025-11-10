"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookingService } from "@/lib/booking"
import type { Restaurant } from "@/lib/restaurant"
import { MapPin } from "lucide-react"

interface RestaurantSearchProps {
  onRestaurantSelect: (restaurant: Restaurant) => void
}

export function RestaurantSearch({ onRestaurantSelect }: RestaurantSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCuisine, setSelectedCuisine] = useState<string>("all")
  const [location, setLocation] = useState("")
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [locationPermission, setLocationPermission] = useState<"granted" | "denied" | "prompt">("prompt")
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)

  const cuisineTypes = [
    "Italian",
    "Mediterranean",
    "Asian",
    "American",
    "Mexican",
    "Indian",
    "North Indian",
    "South Indian",
    "French",
    "Japanese",
    "European",
    "Street Food",
    "Vegetarian",
  ]

  useEffect(() => {
    searchRestaurants()
  }, [searchQuery, selectedCuisine, location])

  useEffect(() => {
    searchRestaurants()
  }, [])

  const searchRestaurants = async () => {
    setIsLoading(true)
    try {
      console.log("[v0] Starting restaurant search...")
      const results = await BookingService.searchRestaurants(
        searchQuery,
        selectedCuisine,
        location,
        userCoords || undefined,
      )
      console.log("[v0] Search completed, found:", results.length, "restaurants")
      setRestaurants(results)
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const requestLocation = async () => {
    if ("geolocation" in navigator) {
      try {
        setIsLoading(true)
        setLocation("Detecting location...")

        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000,
          })
        })

        console.log("[v0] Location obtained:", position.coords)

        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }

        setUserCoords(coords)

        const locationName = await BookingService.getLocationFromCoords(coords.lat, coords.lng)
        setLocation(locationName)
        setLocationPermission("granted")

        console.log("[v0] Set location to:", locationName, "with coords:", coords)

        setIsLoading(true)
        try {
          const results = await BookingService.searchRestaurants(searchQuery, selectedCuisine, locationName, coords)
          console.log("[v0] Location-based search completed, found:", results.length, "nearby restaurants")
          setRestaurants(results)
        } catch (error) {
          console.error("Location-based search failed:", error)
        }
      } catch (error) {
        setLocationPermission("denied")
        setLocation("")
        console.error("Location access denied:", error)

        if (error instanceof GeolocationPositionError) {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              alert(
                "Location access denied. Please enable location services and try again, or enter your location manually.",
              )
              break
            case error.POSITION_UNAVAILABLE:
              alert("Location information unavailable. Please enter your location manually.")
              break
            case error.TIMEOUT:
              alert("Location request timed out. Please try again or enter your location manually.")
              break
            default:
              alert("An error occurred while retrieving your location. Please enter your location manually.")
          }
        } else {
          alert("Location access denied. You can still search by entering a location manually.")
        }
      } finally {
        setIsLoading(false)
      }
    } else {
      alert("Geolocation is not supported by this browser. Please enter your location manually.")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Find Restaurants</CardTitle>
          <CardDescription>
            {locationPermission === "granted" && userCoords
              ? `Showing restaurants near your location`
              : "Search for restaurants by name, cuisine, or location"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={requestLocation}
              variant="outline"
              disabled={locationPermission === "granted" || isLoading}
              className="whitespace-nowrap bg-transparent"
            >
              {isLoading && location === "Detecting location..." ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Detecting...
                </>
              ) : locationPermission === "granted" ? (
                <>
                  <MapPin className="w-4 h-4 mr-2 text-green-600" />
                  Location Enabled
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 mr-2" />
                  Use My Location
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
              <SelectTrigger>
                <SelectValue placeholder="Select cuisine type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cuisines</SelectItem>
                {cuisineTypes.map((cuisine) => (
                  <SelectItem key={cuisine} value={cuisine.toLowerCase()}>
                    {cuisine}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder={locationPermission === "granted" ? "Location detected successfully!" : "Enter location..."}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={locationPermission === "granted" ? "border-green-200 bg-green-50" : ""}
            />
          </div>

          {locationPermission === "granted" && userCoords && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ Location detected successfully! Showing {restaurants.length} restaurants near you.
              </p>
            </div>
          )}

          {locationPermission === "denied" && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Location access denied. You can still search by entering a location manually.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">
              {locationPermission === "granted" ? "Finding nearby restaurants..." : "Searching restaurants..."}
            </p>
          </div>
        ) : restaurants.length > 0 ? (
          restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onSelect={() => onRestaurantSelect(restaurant)}
              showDistance={locationPermission === "granted" && userCoords !== null}
              userCoords={userCoords}
            />
          ))
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                {searchQuery || selectedCuisine !== "all" || location
                  ? "No restaurants found. Try adjusting your search criteria."
                  : "Loading restaurants..."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function RestaurantCard({
  restaurant,
  onSelect,
  showDistance = false,
  userCoords,
}: {
  restaurant: Restaurant
  onSelect: () => void
  showDistance?: boolean
  userCoords?: { lat: number; lng: number } | null
}) {
  // Calculate distance if coordinates are available
  const getDistance = () => {
    if (!showDistance || !userCoords) return null

    // Mock distance calculation - in real app, you'd use actual coordinates
    const distances = {
      "rest-1": 0.5,
      "rest-2": 1.2,
      "rest-3": 0.8,
      "rest-4": 2.1,
      "rest-5": 1.5,
      "rest-6": 0.3,
      "rest-7": 1.8,
      "rest-8": 2.5,
      "rest-9": 0.7,
    }

    return distances[restaurant.id as keyof typeof distances] || Math.random() * 3
  }

  const distance = getDistance()

  const getRestaurantImageQuery = (restaurant: Restaurant) => {
    const cuisineType = restaurant.cuisine[0]?.toLowerCase() || "restaurant"
    const priceRange = restaurant.priceRange

    const imageQueries = {
      italian: `elegant Italian restaurant interior with exposed brick walls, warm lighting, wine bottles, checkered tablecloths, and authentic Italian decor`,
      indian: `authentic Indian restaurant with traditional decor, warm spices display, tandoor oven, colorful tapestries, and ornate brass details`,
      "north indian": `royal North Indian restaurant with rich red and gold decor, traditional artwork, elegant dining setup, and Mughlai ambiance`,
      "south indian": `traditional South Indian restaurant with banana leaf service, wooden furniture, temple-style architecture, and authentic Kerala decor`,
      mediterranean: `Mediterranean restaurant with blue and white decor, olive trees, stone walls, seaside ambiance, and rustic charm`,
      asian: `modern Asian fusion restaurant with bamboo elements, zen garden, minimalist design, and contemporary Asian artwork`,
      american: `classic American diner with red leather booths, checkered floors, neon signs, and vintage Americana decor`,
      mexican: `vibrant Mexican restaurant with colorful tiles, papel picado, rustic wooden tables, and festive atmosphere`,
      french: `sophisticated French bistro with vintage posters, wine cellar, elegant table settings, and Parisian charm`,
      japanese: `authentic Japanese restaurant with sushi bar, wooden elements, paper lanterns, and minimalist zen design`,
      european: `cozy European cafe with outdoor seating, cobblestone patio, flower boxes, and continental charm`,
      "street food": `bustling street food market with food stalls, colorful signage, casual seating, and vibrant atmosphere`,
      vegetarian: `fresh vegetarian restaurant with green plants, natural lighting, organic decor, and healthy food displays`,
    }

    const baseQuery =
      imageQueries[cuisineType] ||
      `upscale ${cuisineType} restaurant with elegant interior design, professional lighting, and inviting dining atmosphere`

    if (priceRange === "$$$" || priceRange === "$$$$") {
      return `luxury ${baseQuery} with premium finishes, crystal chandeliers, and fine dining presentation`
    } else if (priceRange === "$$") {
      return `modern ${baseQuery} with comfortable seating and contemporary design`
    } else {
      return `cozy ${baseQuery} with casual atmosphere and welcoming environment`
    }
  }

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onSelect}>
      <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
        <img
          src={
            restaurant.image ||
            `/placeholder.svg?height=192&width=400&query=${encodeURIComponent(getRestaurantImageQuery(restaurant)) || "/placeholder.svg"}`
          }
          alt={`${restaurant.name} - ${restaurant.cuisine.join(", ")} restaurant interior`}
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <Badge variant="secondary" className="bg-white/90 text-black">
            {restaurant.priceRange}
          </Badge>
          {distance && (
            <Badge variant="outline" className="bg-white/90 text-black border-white/50">
              {distance.toFixed(1)} km
            </Badge>
          )}
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl">{restaurant.name}</CardTitle>
            <CardDescription className="mt-1">{restaurant.description}</CardDescription>
          </div>
          <div className="text-right ml-4">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span className="text-sm font-medium">{restaurant.rating}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {restaurant.address}
            {distance && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                ~{Math.ceil(distance * 3)} min walk
              </span>
            )}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            {restaurant.cuisine.join(", ")}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            {restaurant.phone}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
