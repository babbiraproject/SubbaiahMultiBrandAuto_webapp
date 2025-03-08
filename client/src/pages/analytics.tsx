import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ref, get } from "firebase/database";
import { database } from "@/lib/firebase";
import { ServiceEntry } from "@shared/schema";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

type AnalyticsData = {
  monthlyRevenue: { 
    name: string; 
    amount: number;
    serviceCost: number;
    spareCost: number;
    month: string;
    year: string;
  }[];
  commonParts: { name: string; count: number }[];
  averageServiceCost: number;
  totalServices: number;
  todayServices: ServiceEntry[];
  selectedDateServices: ServiceEntry[];
};

export default function Analytics() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    monthlyRevenue: [],
    commonParts: [],
    averageServiceCost: 0,
    totalServices: 0,
    todayServices: [],
    selectedDateServices: []
  });

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const servicesRef = ref(database, "services");
        const snapshot = await get(servicesRef);

        if (snapshot.exists()) {
          const allServices: ServiceEntry[] = [];
          const data = snapshot.val();
          const years = new Set<string>();

          // Flatten the data structure
          Object.values(data).forEach((vehicleServices: any) => {
            Object.values(vehicleServices).forEach((service: ServiceEntry) => {
              allServices.push(service);
              const year = new Date(service.date).getFullYear().toString();
              years.add(year);
            });
          });

          // Set available years
          const yearsArray = Array.from(years).sort((a, b) => b.localeCompare(a));
          setAvailableYears(yearsArray);
          
          // If no years are selected yet and we have years, select the most recent
          if (yearsArray.length > 0 && !selectedYear) {
            setSelectedYear(yearsArray[0]);
          }

          // Get today's services
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayServices = allServices.filter(service => {
            const serviceDate = new Date(service.date);
            serviceDate.setHours(0, 0, 0, 0);
            return serviceDate.getTime() === today.getTime();
          });

          // Get selected date services
          const selectedDateStart = new Date(selectedDate);
          selectedDateStart.setHours(0, 0, 0, 0);
          const selectedDateServices = allServices.filter(service => {
            const serviceDate = new Date(service.date);
            serviceDate.setHours(0, 0, 0, 0);
            return serviceDate.getTime() === selectedDateStart.getTime();
          });

          // Calculate monthly revenue with month and year separated
          const monthlyRevenue = allServices.reduce((acc: any, service) => {
            const date = new Date(service.date);
            const month = date.toLocaleString('default', { month: 'long' });
            const year = date.getFullYear().toString();
            const monthYear = `${month} ${year}`;
            
            const existing = acc.find((item: any) => item.name === monthYear);
            if (existing) {
              existing.amount += service.totalCost;
              existing.serviceCost += (service.totalServiceCost || 0);
              existing.spareCost += (service.totalSpareCost || 0);
            } else {
              acc.push({ 
                name: monthYear, 
                month,
                year,
                amount: service.totalCost,
                serviceCost: (service.totalServiceCost || 0),
                spareCost: (service.totalSpareCost || 0)
              });
            }
            return acc;
          }, []).sort((a: any, b: any) => {
            return new Date(b.name).getTime() - new Date(a.name).getTime();
          });

          // Calculate common parts
          const partsCount = allServices.reduce((acc: any, service) => {
            service.spareParts.forEach(part => {
              acc[part.name] = (acc[part.name] || 0) + 1;
            });
            return acc;
          }, {});

          const commonParts = Object.entries(partsCount)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => (b.count as number) - (a.count as number))
            .slice(0, 5);

          // Calculate average service cost
          const totalCost = allServices.reduce((sum, service) => sum + service.totalCost, 0);
          const averageServiceCost = totalCost / allServices.length;

          setAnalyticsData({
            monthlyRevenue,
            commonParts,
            averageServiceCost,
            totalServices: allServices.length,
            todayServices,
            selectedDateServices
          });
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [selectedDate, selectedYear]);

  const calculateDailyRevenue = (services: ServiceEntry[]) => {
    return services.reduce((sum, service) => sum + service.totalCost, 0);
  };

  const calculateDailyServiceCost = (services: ServiceEntry[]) => {
    return services.reduce((sum, service) => sum + (service.totalServiceCost || 0), 0);
  };

  const calculateDailySpareCost = (services: ServiceEntry[]) => {
    return services.reduce((sum, service) => sum + (service.totalSpareCost || 0), 0);
  };

  // Get monthly data for the selected year
  const getMonthlyDataForYear = () => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    // Create a template with all months
    const monthlyData = months.map(month => ({
      month,
      amount: 0,
      serviceCost: 0,
      spareCost: 0
    }));
    
    // Fill in data from analytics
    analyticsData.monthlyRevenue.forEach(item => {
      if (item.year === selectedYear) {
        const monthIndex = months.indexOf(item.month);
        if (monthIndex !== -1) {
          monthlyData[monthIndex] = {
            month: item.month,
            amount: item.amount,
            serviceCost: item.serviceCost,
            spareCost: item.spareCost
          };
        }
      }
    });
    
    return monthlyData;
  };

  // Calculate yearly totals
  const calculateYearlyTotals = () => {
    const monthlyData = getMonthlyDataForYear();
    return {
      totalAmount: monthlyData.reduce((sum, item) => sum + item.amount, 0),
      totalServiceCost: monthlyData.reduce((sum, item) => sum + item.serviceCost, 0),
      totalSpareCost: monthlyData.reduce((sum, item) => sum + item.spareCost, 0)
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-primary">Subbaiah Multi Brand Auto</h1>
        </div>

        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Today's Summary</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Vehicles Serviced Today</p>
                  <p className="text-2xl font-bold">{analyticsData.todayServices.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Today's Revenue</p>
                  <p className="text-2xl font-bold">₹{calculateDailyRevenue(analyticsData.todayServices)}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Service Cost</p>
                    <p className="text-lg font-semibold">₹{calculateDailyServiceCost(analyticsData.todayServices)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Spare Parts Cost</p>
                    <p className="text-lg font-semibold">₹{calculateDailySpareCost(analyticsData.todayServices)}</p>
                  </div>
                </div>
                {analyticsData.todayServices.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Today's Vehicles:</p>
                    <ul className="space-y-2">
                      {analyticsData.todayServices.map((service) => (
                        <li key={service.id} className="text-sm">
                          <div className="flex justify-between items-center">
                            <span>{service.vehicleNumber}</span>
                            <span className="font-medium">₹{service.totalCost}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                            <span>Service: ₹{service.totalServiceCost || 0}</span>
                            <span>Parts: ₹{service.totalSpareCost || 0}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Date Analytics</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
                <div>
                  <p className="text-sm text-muted-foreground">Selected Date Revenue</p>
                  <p className="text-2xl font-bold">₹{calculateDailyRevenue(analyticsData.selectedDateServices)}</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Service Cost</p>
                      <p className="text-lg font-semibold">₹{calculateDailyServiceCost(analyticsData.selectedDateServices)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Spare Parts Cost</p>
                      <p className="text-lg font-semibold">₹{calculateDailySpareCost(analyticsData.selectedDateServices)}</p>
                    </div>
                  </div>
                  {analyticsData.selectedDateServices.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-2">Vehicles Serviced:</p>
                      <ul className="space-y-2">
                        {analyticsData.selectedDateServices.map((service) => (
                          <li key={service.id} className="text-sm">
                            <div className="flex justify-between items-center">
                              <span>{service.vehicleNumber}</span>
                              <span className="font-medium">₹{service.totalCost}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                              <span>Service: ₹{service.totalServiceCost || 0}</span>
                              <span>Parts: ₹{service.totalSpareCost || 0}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Monthly Revenue</h2>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="hsl(212, 100%, 39%)" name="Total Revenue" />
                  <Bar dataKey="serviceCost" fill="hsl(142, 76%, 36%)" name="Service Cost" />
                  <Bar dataKey="spareCost" fill="hsl(346, 84%, 61%)" name="Spare Parts Cost" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Monthly Revenue Table</h3>
              
              <div className="mb-4">
                <Select
                  value={selectedYear}
                  onValueChange={(value) => setSelectedYear(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Service Cost</TableHead>
                      <TableHead className="text-right">Spare Parts Cost</TableHead>
                      <TableHead className="text-right">Total Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getMonthlyDataForYear().map((item) => (
                      <TableRow key={item.month}>
                        <TableCell className="font-medium">{item.month}</TableCell>
                        <TableCell className="text-right">₹{item.serviceCost.toLocaleString()}</TableCell>
                        <TableCell className="text-right">₹{item.spareCost.toLocaleString()}</TableCell>
                        <TableCell className="text-right">₹{item.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    {/* Yearly Total Row */}
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell>Yearly Total</TableCell>
                      <TableCell className="text-right">₹{calculateYearlyTotals().totalServiceCost.toLocaleString()}</TableCell>
                      <TableCell className="text-right">₹{calculateYearlyTotals().totalSpareCost.toLocaleString()}</TableCell>
                      <TableCell className="text-right">₹{calculateYearlyTotals().totalAmount.toLocaleString()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}