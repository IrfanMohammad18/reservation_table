"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { AnalyticsData } from "@/lib/analytics"

interface OperationalInsightsProps {
  data: AnalyticsData
}

export function OperationalInsights({ data }: OperationalInsightsProps) {
  const { operationalMetrics, customerMetrics, reservationMetrics } = data

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      {/* Table Utilization */}
      <Card>
        <CardHeader>
          <CardTitle>Table Utilization</CardTitle>
          <CardDescription>Individual table performance and efficiency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {operationalMetrics.tableUtilization.map((table) => (
              <div key={table.tableNumber} className="flex items-center space-x-4">
                <div className="w-20">
                  <span className="text-sm font-medium">Table {table.tableNumber}</span>
                </div>
                <div className="flex-1">
                  <Progress value={table.utilizationRate * 100} className="h-2" />
                </div>
                <div className="w-16 text-right">
                  <span className="text-sm font-medium">{formatPercentage(table.utilizationRate)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Popular Days */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Days</CardTitle>
          <CardDescription>Busiest days of the week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {reservationMetrics.popularDays.map((day, index) => (
              <div key={day.day} className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{day.count}</div>
                <div className="text-sm text-muted-foreground">{day.day}</div>
                {index === 0 && <Badge className="mt-2 bg-green-100 text-green-800">Most Popular</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Customers</CardTitle>
          <CardDescription>Most valuable and frequent customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customerMetrics.topCustomers.map((customer, index) => (
              <div key={customer.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">{customer.reservations} reservations</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${customer.revenue}</p>
                  <p className="text-sm text-muted-foreground">total revenue</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Occupancy Rate</span>
              <span className="text-sm">{formatPercentage(operationalMetrics.occupancyRate)}</span>
            </div>
            <Progress value={operationalMetrics.occupancyRate * 100} />

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Waitlist Conversion</span>
              <span className="text-sm">{formatPercentage(operationalMetrics.waitlistConversionRate)}</span>
            </div>
            <Progress value={operationalMetrics.waitlistConversionRate * 100} />

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Cancellation Rate</span>
              <span className="text-sm">{formatPercentage(operationalMetrics.cancellationRate)}</span>
            </div>
            <Progress value={operationalMetrics.cancellationRate * 100} className="[&>div]:bg-red-500" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operational Efficiency</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold">{operationalMetrics.averageTableTurnover}x</div>
              <div className="text-sm text-muted-foreground">Average Table Turnover</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-xl font-bold">{formatPercentage(operationalMetrics.noShowRate)}</div>
                <div className="text-xs text-muted-foreground">No-Show Rate</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-xl font-bold">{customerMetrics.customerSatisfaction}/5</div>
                <div className="text-xs text-muted-foreground">Satisfaction</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
