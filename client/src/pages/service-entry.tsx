import { useState } from "react";
import { useLocation } from "wouter";
import { ref, push } from "firebase/database";
import { database } from "@/lib/firebase";
import { ServiceEntry, serviceEntrySchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

export default function ServiceEntryPage({ params }: { params: { number: string } }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const vehicleNumber = decodeURIComponent(params.number).toUpperCase();

  // Initialize form with default values
  const form = useForm<ServiceEntry>({
    resolver: zodResolver(serviceEntrySchema),
    defaultValues: {
      id: "",
      vehicleNumber,
      date: new Date().toISOString().split('T')[0],
      spareParts: [],
      serviceCharge: 0,
      totalCost: 0
    }
  });

  const spareParts = form.watch("spareParts");
  const serviceCharge = form.watch("serviceCharge") || 0;

  const addSparePart = () => {
    const currentParts = form.getValues("spareParts");
    form.setValue("spareParts", [...currentParts, { name: "", cost: 0 }]);
  };

  const removeSparePart = (index: number) => {
    const currentParts = form.getValues("spareParts");
    form.setValue("spareParts", currentParts.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    const partsTotal = spareParts.reduce((sum, part) => sum + (Number(part.cost) || 0), 0);
    return partsTotal + (Number(serviceCharge) || 0);
  };

  async function onSubmit(data: ServiceEntry) {
    setLoading(true);
    try {
      console.log("Attempting to save service record:", { vehicleNumber, data });
      const servicesRef = ref(database, `services/${vehicleNumber}`);

      // Format the data
      const newData = {
        ...data,
        id: Date.now().toString(),
        date: new Date(data.date).toISOString(),
        spareParts: data.spareParts.map(part => ({
          name: part.name.trim(),
          cost: Number(part.cost) || 0
        })),
        serviceCharge: Number(data.serviceCharge) || 0,
        totalCost: calculateTotal()
      };

      // Push to Firebase
      await push(servicesRef, newData);
      console.log("Service record saved successfully");

      toast({
        title: "Success",
        description: "Service record saved successfully"
      });

      setLocation(`/service-history/${encodeURIComponent(vehicleNumber)}`);
    } catch (error: any) {
      console.error("Error saving service:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);

      // Show specific error message based on error code
      let errorMessage = "Failed to save service record. ";
      if (error.code === "PERMISSION_DENIED") {
        errorMessage += "Please check if you have write permissions.";
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

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-primary">Subbaiah Multi Brand Auto</h1>
        </div>

        <Button
          variant="ghost"
          onClick={() => setLocation(`/service-history/${encodeURIComponent(vehicleNumber)}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold">New Service Entry</h1>
            <p className="text-sm text-muted-foreground">
              Vehicle Number: {vehicleNumber}
            </p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Spare Parts</h3>
                    <Button type="button" variant="outline" onClick={addSparePart}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Part
                    </Button>
                  </div>

                  {spareParts.map((_, index) => (
                    <div key={index} className="flex gap-4">
                      <FormField
                        control={form.control}
                        name={`spareParts.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder="Part name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`spareParts.${index}.cost`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="1"
                                placeholder="Cost"
                                {...field}
                                value={field.value || ""}
                                onChange={e => {
                                  const value = e.target.value;
                                  field.onChange(value === "" ? "" : Number(value));
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeSparePart(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <FormField
                  control={form.control}
                  name="serviceCharge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Charge</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="Enter service charge"
                          {...field}
                          value={field.value || ""}
                          onChange={e => {
                            const value = e.target.value;
                            field.onChange(value === "" ? "" : Number(value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4 border-t">
                  <p className="text-lg font-bold">
                    Total Cost: ₹{calculateTotal()}
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Saving..." : "Save Service Record"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}