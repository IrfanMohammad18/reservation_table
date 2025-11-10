"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ChefHat, Utensils, Flame, AlertTriangle, Users, Clock, MapPin } from "lucide-react"

export interface UserPreferences {
  hasPreferences: boolean
  cuisineTypes: string[]
  foodStyle: string
  spicyLevel: number
  allergies: string[]
  partySize: number
  preferredTime: string
  location: string
}

interface PreferenceQuestionnaireProps {
  onComplete: (preferences: UserPreferences) => void
}

export function PreferenceQuestionnaire({ onComplete }: PreferenceQuestionnaireProps) {
  const [step, setStep] = useState(0)
  const [customCuisine, setCustomCuisine] = useState("")
  const [isRequestingLocation, setIsRequestingLocation] = useState(false)
  const [locationGranted, setLocationGranted] = useState(false)
  const [userLocation, setUserLocation] = useState("")
  const [preferences, setPreferences] = useState<UserPreferences>({
    hasPreferences: false,
    cuisineTypes: [],
    foodStyle: "",
    spicyLevel: 2,
    allergies: [],
    partySize: 2,
    preferredTime: "",
    location: "",
  })

  const requestLocationAccess = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser. You can still search manually.")
      setPreferences((prev) => ({ ...prev, hasPreferences: false }))
      nextStep()
      return
    }

    setIsRequestingLocation(true)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000,
        })
      })

      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }

      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.lat}&longitude=${coords.lng}&localityLanguage=en`,
        )

        if (response.ok) {
          const data = await response.json()
          const city = data.city || data.locality || data.principalSubdivision
          const area = data.localityInfo?.administrative?.[2]?.name || data.localityInfo?.administrative?.[1]?.name

          const locationName = area && area !== city ? `${area}, ${city}` : city || "Current Location"
          setUserLocation(locationName)
          setPreferences((prev) => ({ ...prev, location: locationName }))
        }
      } catch (error) {
        console.error("Reverse geocoding failed:", error)
        setUserLocation("Current Location")
        setPreferences((prev) => ({ ...prev, location: "Current Location" }))
      }

      setLocationGranted(true)
      setPreferences((prev) => ({ ...prev, hasPreferences: false }))

      setTimeout(() => {
        nextStep()
      }, 1500)
    } catch (error) {
      console.error("Location access denied:", error)

      let errorMessage = "Location access was denied. You can still find restaurants by searching manually."
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location services or search manually."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable. You can search manually instead."
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out. You can search manually instead."
            break
        }
      }

      alert(errorMessage)
      setPreferences((prev) => ({ ...prev, hasPreferences: false }))
      nextStep()
    } finally {
      setIsRequestingLocation(false)
    }
  }

  const cuisineOptions = [
    { id: "italian", name: "Italian", icon: "🍝", description: "Pizza, Pasta, Risotto" },
    { id: "north-indian", name: "North Indian", icon: "🍛", description: "Curry, Naan, Biryani" },
    { id: "south-indian", name: "South Indian", icon: "🥥", description: "Dosa, Idli, Sambar" },
    { id: "chinese", name: "Chinese", icon: "🥢", description: "Noodles, Dim Sum, Stir Fry" },
    { id: "mexican", name: "Mexican", icon: "🌮", description: "Tacos, Burritos, Quesadillas" },
    { id: "thai", name: "Thai", icon: "🍜", description: "Pad Thai, Tom Yum, Green Curry" },
  ]

  const foodStyleOptions = [
    { id: "fast-food", name: "Fast Food", description: "Quick service, casual dining" },
    { id: "casual", name: "Casual Dining", description: "Relaxed atmosphere, table service" },
    { id: "fine-dining", name: "Fine Dining", description: "Upscale, premium experience" },
    { id: "buffet", name: "Buffet", description: "All-you-can-eat variety" },
  ]

  const commonAllergies = ["Nuts", "Dairy", "Gluten", "Shellfish", "Eggs", "Soy", "Fish", "Sesame"]

  const spicyLevels = [
    { level: 0, name: "No Spice", description: "Mild and gentle" },
    { level: 1, name: "Mild", description: "Just a hint of spice" },
    { level: 2, name: "Medium", description: "Balanced heat" },
    { level: 3, name: "Hot", description: "Spicy kick" },
    { level: 4, name: "Very Hot", description: "Intense heat" },
  ]

  const handleCuisineToggle = (cuisineId: string) => {
    setPreferences((prev) => ({
      ...prev,
      cuisineTypes: prev.cuisineTypes.includes(cuisineId)
        ? prev.cuisineTypes.filter((id) => id !== cuisineId)
        : [...prev.cuisineTypes, cuisineId],
    }))
  }

  const handleCustomCuisineAdd = () => {
    if (customCuisine.trim() && !preferences.cuisineTypes.includes(customCuisine.trim().toLowerCase())) {
      setPreferences((prev) => ({
        ...prev,
        cuisineTypes: [...prev.cuisineTypes, customCuisine.trim().toLowerCase()],
      }))
      setCustomCuisine("")
    }
  }

  const handleAllergyToggle = (allergy: string) => {
    setPreferences((prev) => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter((a) => a !== allergy)
        : [...prev.allergies, allergy],
    }))
  }

  const nextStep = () => {
    if (step < 6) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 0) setStep(step - 1)
  }

  const handleComplete = () => {
    onComplete(preferences)
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center mb-4">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Welcome to TableBook!</CardTitle>
              <CardDescription className="text-lg">
                Do you have any previous dining preferences saved with us?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant={preferences.hasPreferences ? "default" : "outline"}
                  className="h-20 text-left justify-start p-6"
                  onClick={() => {
                    setPreferences((prev) => ({ ...prev, hasPreferences: true }))
                    setStep(6) // Skip to final step if has preferences
                  }}
                >
                  <div>
                    <div className="font-semibold">Yes, use my preferences</div>
                    <div className="text-sm opacity-70">Load saved dining preferences</div>
                  </div>
                </Button>
                <Button
                  variant={!preferences.hasPreferences ? "default" : "outline"}
                  className="h-20 text-left justify-start p-6"
                  onClick={requestLocationAccess}
                  disabled={isRequestingLocation}
                >
                  <div className="flex items-center">
                    {isRequestingLocation ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3"></div>
                    ) : locationGranted ? (
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    ) : (
                      <MapPin className="w-5 h-5 mr-3" />
                    )}
                    <div>
                      <div className="font-semibold">
                        {isRequestingLocation
                          ? "Getting your location..."
                          : locationGranted
                            ? `Location found: ${userLocation}`
                            : "No, I'm new here"}
                      </div>
                      <div className="text-sm opacity-70">
                        {isRequestingLocation
                          ? "Please allow location access"
                          : locationGranted
                            ? "Finding nearby restaurants"
                            : "Help me find nearby restaurants"}
                      </div>
                    </div>
                  </div>
                </Button>
              </div>

              {!locationGranted && !isRequestingLocation && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Why do we need your location?</p>
                      <p>
                        We'll use your location to find the best restaurants near you and show accurate distances and
                        travel times.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )

      case 1:
        return (
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-4">
                <Utensils className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">What cuisine do you crave?</CardTitle>
              <CardDescription>Select all the cuisines you'd like to explore (you can choose multiple)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cuisineOptions.map((cuisine) => (
                  <Card
                    key={cuisine.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      preferences.cuisineTypes.includes(cuisine.id)
                        ? "ring-2 ring-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => handleCuisineToggle(cuisine.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">{cuisine.icon}</div>
                      <div className="font-semibold">{cuisine.name}</div>
                      <div className="text-sm text-muted-foreground">{cuisine.description}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="border-t pt-6">
                <Label htmlFor="custom-cuisine" className="text-sm font-medium mb-2 block">
                  Don't see your favorite cuisine? Add it here:
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="custom-cuisine"
                    value={customCuisine}
                    onChange={(e) => setCustomCuisine(e.target.value)}
                    placeholder="e.g., Korean, Lebanese, Ethiopian..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleCustomCuisineAdd()
                      }
                    }}
                  />
                  <Button type="button" onClick={handleCustomCuisineAdd} disabled={!customCuisine.trim()}>
                    Add
                  </Button>
                </div>
              </div>

              {preferences.cuisineTypes.length > 0 && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium mb-2 block">Selected Cuisines:</Label>
                  <div className="flex flex-wrap gap-2">
                    {preferences.cuisineTypes.map((type) => (
                      <Badge
                        key={type}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleCuisineToggle(type)}
                      >
                        {type} ✕
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">What's your dining style?</CardTitle>
              <CardDescription>Choose the type of dining experience you prefer</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={preferences.foodStyle}
                onValueChange={(value) => setPreferences((prev) => ({ ...prev, foodStyle: value }))}
                className="space-y-4"
              >
                {foodStyleOptions.map((style) => (
                  <div key={style.id} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50">
                    <RadioGroupItem value={style.id} id={style.id} />
                    <Label htmlFor={style.id} className="flex-1 cursor-pointer">
                      <div className="font-semibold">{style.name}</div>
                      <div className="text-sm text-muted-foreground">{style.description}</div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        )

      case 3:
        return (
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mb-4">
                <Flame className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">How spicy do you like it?</CardTitle>
              <CardDescription>Tell us your preferred spice level</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="px-4">
                <Slider
                  value={[preferences.spicyLevel]}
                  onValueChange={(value) => setPreferences((prev) => ({ ...prev, spicyLevel: value[0] }))}
                  max={4}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">
                  {Array.from({ length: preferences.spicyLevel + 1 }, (_, i) => (
                    <span key={i} className="text-red-500">
                      🌶️
                    </span>
                  ))}
                  {preferences.spicyLevel === 0 && <span className="text-2xl">😌</span>}
                </div>
                <div className="font-semibold text-lg">{spicyLevels[preferences.spicyLevel].name}</div>
                <div className="text-muted-foreground">{spicyLevels[preferences.spicyLevel].description}</div>
              </div>
            </CardContent>
          </Card>
        )

      case 4:
        return (
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Any food allergies?</CardTitle>
              <CardDescription>Select any allergies or dietary restrictions we should know about</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {commonAllergies.map((allergy) => (
                  <div key={allergy} className="flex items-center space-x-2">
                    <Checkbox
                      id={allergy}
                      checked={preferences.allergies.includes(allergy)}
                      onCheckedChange={() => handleAllergyToggle(allergy)}
                    />
                    <Label htmlFor={allergy} className="text-sm font-medium cursor-pointer">
                      {allergy}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Label htmlFor="other-allergies" className="text-sm font-medium">
                  Other allergies or dietary restrictions:
                </Label>
                <Input id="other-allergies" placeholder="e.g., Vegetarian, Vegan, Keto..." className="mt-2" />
              </div>
            </CardContent>
          </Card>
        )

      case 5:
        return (
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Party details</CardTitle>
              <CardDescription>Tell us about your dining party and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="party-size" className="text-sm font-medium mb-2 block">
                  How many people? ({preferences.partySize} {preferences.partySize === 1 ? "person" : "people"})
                </Label>
                <Slider
                  value={[preferences.partySize]}
                  onValueChange={(value) => setPreferences((prev) => ({ ...prev, partySize: value[0] }))}
                  max={12}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-4">
                <Label className="text-sm font-medium">Preferred dining time:</Label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Input
                        type="time"
                        value={preferences.preferredTime}
                        onChange={(e) => setPreferences((prev) => ({ ...prev, preferredTime: e.target.value }))}
                        className="w-full"
                        placeholder="Select time"
                      />
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        type="button"
                        variant={
                          preferences.preferredTime && preferences.preferredTime < "12:00" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          if (preferences.preferredTime) {
                            const [hours, minutes] = preferences.preferredTime.split(":")
                            const hour24 = Number.parseInt(hours)
                            if (hour24 >= 12) {
                              const newHour = hour24 === 12 ? 0 : hour24 - 12
                              const newTime = `${newHour.toString().padStart(2, "0")}:${minutes}`
                              setPreferences((prev) => ({ ...prev, preferredTime: newTime }))
                            }
                          } else {
                            setPreferences((prev) => ({ ...prev, preferredTime: "11:00" }))
                          }
                        }}
                      >
                        AM
                      </Button>
                      <Button
                        type="button"
                        variant={
                          preferences.preferredTime && preferences.preferredTime >= "12:00" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          if (preferences.preferredTime) {
                            const [hours, minutes] = preferences.preferredTime.split(":")
                            const hour24 = Number.parseInt(hours)
                            if (hour24 < 12) {
                              const newHour = hour24 === 0 ? 12 : hour24 + 12
                              const newTime = `${newHour.toString().padStart(2, "0")}:${minutes}`
                              setPreferences((prev) => ({ ...prev, preferredTime: newTime }))
                            }
                          } else {
                            setPreferences((prev) => ({ ...prev, preferredTime: "19:00" }))
                          }
                        }}
                      >
                        PM
                      </Button>
                    </div>
                  </div>
                  {preferences.preferredTime && (
                    <div className="text-sm text-muted-foreground">
                      Selected time: {(() => {
                        const [hours, minutes] = preferences.preferredTime.split(":")
                        const hour24 = Number.parseInt(hours)
                        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
                        const period = hour24 >= 12 ? "PM" : "AM"
                        return `${hour12}:${minutes} ${period}`
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 6:
        return (
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Perfect! Let's find your restaurant</CardTitle>
              <CardDescription>Based on your preferences, we'll recommend the best restaurants for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold">Your Preferences Summary:</h3>
                <div className="space-y-2 text-sm">
                  {preferences.cuisineTypes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <span className="font-medium">Cuisines:</span>
                      {preferences.cuisineTypes.map((type) => (
                        <Badge key={type} variant="secondary">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {preferences.foodStyle && (
                    <div>
                      <span className="font-medium">Style:</span> {preferences.foodStyle}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Spice Level:</span> {spicyLevels[preferences.spicyLevel].name}
                  </div>
                  <div>
                    <span className="font-medium">Party Size:</span> {preferences.partySize}{" "}
                    {preferences.partySize === 1 ? "person" : "people"}
                  </div>
                  {preferences.allergies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <span className="font-medium">Allergies:</span>
                      {preferences.allergies.map((allergy) => (
                        <Badge key={allergy} variant="outline">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Button onClick={handleComplete} className="w-full" size="lg">
                Find My Perfect Restaurant
              </Button>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Step {step + 1} of 7</span>
            <span className="text-sm text-muted-foreground">{Math.round(((step + 1) / 7) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / 7) * 100}%` }}
            ></div>
          </div>
        </div>

        {renderStep()}

        {step > 0 && step < 6 && (
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={prevStep}>
              Previous
            </Button>
            <Button
              onClick={nextStep}
              disabled={(step === 1 && preferences.cuisineTypes.length === 0) || (step === 2 && !preferences.foodStyle)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
