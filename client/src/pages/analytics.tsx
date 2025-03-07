import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ref, get } from "firebase/database";
import { database } from "@/lib/firebase";
import { ServiceEntry } from "@shared/schema";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
};

export default function Analytics() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    monthlyRevenue: [],
    commonParts: [],
    averageServiceCost: 0,
    totalServices: 0
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
            totalServices: allServices.length
          });
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

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
              <h2 className="text-xl font-semibold">Service Summary</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Services</p>
                  <p className="text-2xl font-bold">{analyticsData.totalServices}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Service Cost</p>
                  <p className="text-2xl font-bold">₹{analyticsData.averageServiceCost.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Most Common Parts</h2>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analyticsData.commonParts.map((part, index) => (
                  <li key={part.name} className="flex justify-between items-center">
                    <span>{part.name}</span>
                    <span className="font-medium">{part.count} times</span>
                  </li>
                ))}
              </ul>
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
