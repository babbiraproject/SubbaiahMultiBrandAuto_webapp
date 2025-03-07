import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ref, get } from "firebase/database";
import { database } from "@/lib/firebase";
import { ServiceEntry } from "@shared/schema";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, ArrowLeft, Plus } from "lucide-react";

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
          setServices(Object.values(data));
        } else {
          setLocation(`/service-entry/${vehicleNumber}`);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch service records"
        });
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, [vehicleNumber, setLocation, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-4">
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
            <h1 className="text-2xl font-bold">Service History</h1>
            <p className="text-sm text-muted-foreground">
              Vehicle Number: {vehicleNumber}
            </p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {services.map((service) => (
                  <Card key={service.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <CalendarDays className="w-4 h-4 mr-2" />
                        {new Date(service.date).toLocaleDateString()}
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium">Spare Parts</h3>
                        <ul className="list-disc list-inside space-y-1">
                          {service.spareParts.map((part, idx) => (
                            <li key={idx}>
                              {part.name} - ₹{part.cost}
                            </li>
                          ))}
                        </ul>
                        <div className="pt-2 border-t">
                          <p>Service Charge: ₹{service.serviceCharge}</p>
                          <p className="font-bold">Total: ₹{service.totalCost}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}