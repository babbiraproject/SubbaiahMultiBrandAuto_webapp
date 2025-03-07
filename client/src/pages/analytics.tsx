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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

type AnalyticsData = {
  monthlyRevenue: { name: string; amount: number }[];
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

          // Flatten the data structure
          Object.values(data).forEach((vehicleServices: any) => {
            Object.values(vehicleServices).forEach((service: ServiceEntry) => {
              allServices.push(service);
            });
          });

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

          // Calculate monthly revenue
          const monthlyRevenue = allServices.reduce((acc: any, service) => {
            const month = new Date(service.date).toLocaleString('default', { month: 'long', year: 'numeric' });
            const existing = acc.find((item: any) => item.name === month);
            if (existing) {
              existing.amount += service.totalCost;
            } else {
              acc.push({ name: month, amount: service.totalCost });
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
  }, [selectedDate]);

  const calculateDailyRevenue = (services: ServiceEntry[]) => {
    return services.reduce((sum, service) => sum + service.totalCost, 0);
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
                {analyticsData.todayServices.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Today's Vehicles:</p>
                    <ul className="space-y-2">
                      {analyticsData.todayServices.map((service) => (
                        <li key={service.id} className="text-sm">
                          {service.vehicleNumber} - ₹{service.totalCost}
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
                  {analyticsData.selectedDateServices.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-2">Vehicles Serviced:</p>
                      <ul className="space-y-2">
                        {analyticsData.selectedDateServices.map((service) => (
                          <li key={service.id} className="text-sm">
                            {service.vehicleNumber} - ₹{service.totalCost}
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
                  <Bar dataKey="amount" fill="hsl(212, 100%, 39%)" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}