import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ref, get } from "firebase/database";
import { database } from "@/lib/firebase";
import { ServiceEntry } from "@shared/schema";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, ArrowLeft, Plus, IndianRupee, Settings, Wrench, CarFront } from "lucide-react";

type GroupedServices = {
  [key: string]: ServiceEntry[];
};

export default function ServiceHistory({ params }: { params: { number: string } }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<ServiceEntry[]>([]);
  const vehicleNumber = decodeURIComponent(params.number);

  useEffect(() => {
    async function fetchServices() {
      try {
        const servicesRef = ref(database, `services/${vehicleNumber}`);
        const snapshot = await get(servicesRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const servicesArray = Object.values(data) as ServiceEntry[];
          // Sort by date in descending order
          setServices(servicesArray.sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
          ));
        } else {
          // If no records exist, redirect to create new service entry
          toast({
            title: "No Records Found",
            description: "No service records found for this vehicle. Create a new service record.",
            duration: 3000
          });
          setLocation(`/service-entry/${encodeURIComponent(vehicleNumber)}`);
        }
      } catch (error: any) {
        console.error("Error fetching services:", error);

        let errorMessage = "Failed to fetch service records. ";
        if (error.code === "PERMISSION_DENIED") {
          errorMessage += "Please check if you have read permissions.";
        } else {
          errorMessage += "Please check your connection and try again.";
        }

        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage
        });
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, [vehicleNumber, setLocation, toast]);

  const groupServicesByMonth = (services: ServiceEntry[]): GroupedServices => {
    return services.reduce((groups, service) => {
      const date = new Date(service.date);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });

      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(service);
      return groups;
    }, {} as GroupedServices);
  };

  const calculateTotalExpense = () => {
    return services.reduce((total, service) => total + service.totalCost, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const groupedServices = groupServicesByMonth(services);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-primary">Subbaiah Multi Brand Auto</h1>
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={() => setLocation(`/service-entry/${vehicleNumber}`)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Service
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">Service History</h1>
                <p className="text-sm text-muted-foreground">
                  Vehicle Number: {vehicleNumber}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-xl font-bold flex items-center">
                  <IndianRupee className="w-4 h-4 mr-1" />
                  {calculateTotalExpense()}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6">
                {Object.entries(groupedServices).map(([monthYear, monthServices]) => (
                  <div key={monthYear}>
                    <h2 className="text-lg font-semibold mb-3">{monthYear}</h2>
                    <div className="space-y-4">
                      {monthServices.map((service) => (
                        <Card key={service.id} className="border-l-4 border-l-primary">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center text-sm text-muted-foreground">
                                <CalendarDays className="w-4 h-4 mr-2" />
                                {new Date(service.date).toLocaleDateString('default', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long'
                                })}
                              </div>
                              <div className="flex items-center text-sm font-medium">
                                <Wrench className="w-4 h-4 mr-2" />
                                {service.spareParts.length} parts replaced
                              </div>
                            </div>

                            <div className="flex items-center text-sm text-muted-foreground mb-4">
                              <CarFront className="w-4 h-4 mr-2" />
                              Kilometer Reading: {service.kilometerReading.toLocaleString()} km
                            </div>

                            <div className="space-y-3">
                              <div>
                                <h3 className="font-medium flex items-center gap-2">
                                  <Settings className="w-4 h-4" />
                                  Spare Parts
                                </h3>
                                <ul className="mt-2 space-y-1">
                                  {service.spareParts.map((part, idx) => (
                                    <li key={idx} className="flex justify-between text-sm">
                                      <span>{part.name}</span>
                                      <span className="font-medium">₹{part.cost}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="pt-2 border-t">
                                <div className="flex justify-between text-sm">
                                  <span>Service Charge</span>
                                  <span>₹{service.serviceCharge}</span>
                                </div>
                                <div className="flex justify-between font-bold mt-1">
                                  <span>Total</span>
                                  <span>₹{service.totalCost}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}