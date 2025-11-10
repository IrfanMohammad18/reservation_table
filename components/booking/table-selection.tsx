"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Restaurant, Table } from "@/lib/restaurant"

interface TableSelectionProps {
  restaurant: Restaurant
  partySize: number
  selectedDate: string
  selectedTime: string
  onTableSelect: (table: Table) => void
  onBack: () => void
}

export function TableSelection({
  restaurant,
  partySize,
  selectedDate,
  selectedTime,
  onTableSelect,
  onBack,
}: TableSelectionProps) {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [availableTables, setAvailableTables] = useState<Table[]>([])

  const restaurantTables = restaurant?.tables || []

  // ✅ Filter and sort tables dynamically
  useEffect(() => {
    const filtered = restaurantTables
      .filter((table) => table.capacity >= partySize && table.status === "available")
      .sort((a, b) => a.capacity - b.capacity) // smallest capacity first

    setAvailableTables(filtered)
    setSelectedTable(null)
  }, [partySize, restaurantTables])

  const handleTableSelect = (table: Table) => {
    setSelectedTable(table)
  }

  const handleConfirmSelection = () => {
    if (selectedTable) onTableSelect(selectedTable)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Select Your Table</CardTitle>
            <CardDescription>
              Choose your preferred table for {partySize}{" "}
              {partySize === 1 ? "person" : "people"} on {selectedDate}
              {selectedTime && ` at ${selectedTime}`}
            </CardDescription>
          </div>
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Restaurant Info */}
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-semibold">{restaurant.name}</h3>
          <p className="text-sm text-muted-foreground">{restaurant.address}</p>
        </div>

        {/* No Tables Available */}
        {availableTables.length === 0 ? (
          <Alert>
            <AlertDescription>
              No tables available for {partySize}{" "}
              {partySize === 1 ? "person" : "people"} at this time.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Available Tables */}
            <div className="space-y-4">
              <h4 className="font-medium text-green-700">
                Available Tables ({availableTables.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableTables.map((table) => {
                  const isBestFit = availableTables[0]?.id === table.id
                  const isSelected = selectedTable?.id === table.id

                  return (
                    <Card
                      key={table.id}
                      onClick={() => handleTableSelect(table)}
                      className={`cursor-pointer border transition-all duration-200 ${
                        isSelected
                          ? "ring-2 ring-green-500 border-green-500 shadow-lg"
                          : isBestFit
                          ? "border-yellow-400 hover:border-yellow-500 ring-1 ring-yellow-300"
                          : "hover:border-green-400"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between mb-2 items-center">
                          <span className="font-semibold">
                            Table {table.number}
                          </span>
                          <div className="flex gap-2">
                            {isBestFit && (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                Best Fit
                              </Badge>
                            )}
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              Available
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Seats {table.capacity} • {table.location}
                          {table.capacity > partySize && (
                            <span className="text-xs text-green-600 ml-1">
                              ({table.capacity - partySize} extra seat
                              {table.capacity - partySize > 1 ? "s" : ""})
                            </span>
                          )}
                        </p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Selected Table Info */}
            {selectedTable && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <h4 className="font-medium text-primary mb-2">Selected Table</h4>
                <p className="text-sm">
                  Table {selectedTable.number} • {selectedTable.capacity} people •{" "}
                  {selectedTable.location}
                </p>
              </div>
            )}

            {/* Confirm Button */}
            <Button
              className="w-full"
              disabled={!selectedTable}
              onClick={handleConfirmSelection}
            >
              {selectedTable
                ? `Continue with Table ${selectedTable.number}`
                : "Select a table to continue"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
