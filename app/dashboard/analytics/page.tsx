"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { MetricsOverview } from "@/components/analytics/metrics-overview"
import { RevenueCharts } from "@/components/analytics/revenue-charts"
import { OperationalInsights } from "@/components/analytics/operational-insights"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnalyticsService, type AnalyticsData } from "@/lib/analytics"
import { format, subDays, subMonths } from "date-fns"

export default function AnalyticsPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [dateRange, setDateRange] = useState("30days")
  const [isExporting, setIsExporting] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
      return
    }

    if (user?.role !== "admin") {
      router.push("/dashboard")
      return
    }

    loadAnalyticsData()
  }, [user, isAuthenticated, isLoading, router, dateRange])

  const loadAnalyticsData = async () => {
    setIsLoadingData(true)
    try {
      let startDate: string
      const endDate = format(new Date(), "yyyy-MM-dd")

      switch (dateRange) {
        case "7days":
          startDate = format(subDays(new Date(), 7), "yyyy-MM-dd")
          break
        case "30days":
          startDate = format(subDays(new Date(), 30), "yyyy-MM-dd")
          break
        case "3months":
          startDate = format(subMonths(new Date(), 3), "yyyy-MM-dd")
          break
        case "6months":
          startDate = format(subMonths(new Date(), 6), "yyyy-MM-dd")
          break
        default:
          startDate = format(subDays(new Date(), 30), "yyyy-MM-dd")
      }

      const data = await AnalyticsService.getAnalyticsData(undefined, startDate, endDate)
      setAnalyticsData(data)
    } catch (error) {
      console.error("Failed to load analytics data:", error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleExport = async (format: "csv" | "pdf") => {
    if (!analyticsData) return

    setIsExporting(true)
    try {
      const filename = await AnalyticsService.exportAnalyticsReport(analyticsData, format)
      // In a real app, this would trigger a download
      console.log(`Report exported: ${filename}`)
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar className="w-64 flex-shrink-0" />

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
                <p className="text-muted-foreground">Comprehensive business intelligence and performance metrics</p>
              </div>
              <div className="flex items-center space-x-4">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="3months">Last 3 months</SelectItem>
                    <SelectItem value="6months">Last 6 months</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => handleExport("csv")} disabled={isExporting}>
                  Export CSV
                </Button>
                <Button variant="outline" onClick={() => handleExport("pdf")} disabled={isExporting}>
                  Export PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  size="lg"
                  className="hover:bg-card hover:border-primary/50 transition-all duration-300 shadow-lg bg-transparent"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {analyticsData ? (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Report Period</CardTitle>
                  <CardDescription>
                    {format(new Date(analyticsData.dateRange.start), "MMM dd, yyyy")} -{" "}
                    {format(new Date(analyticsData.dateRange.end), "MMM dd, yyyy")}
                  </CardDescription>
                </CardHeader>
              </Card>

              <div>
                <h2 className="text-2xl font-bold mb-6">Key Metrics</h2>
                <MetricsOverview data={analyticsData} />
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-6">Revenue & Reservations</h2>
                <RevenueCharts data={analyticsData} />
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-6">Operational Insights</h2>
                <OperationalInsights data={analyticsData} />
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No analytics data available</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
