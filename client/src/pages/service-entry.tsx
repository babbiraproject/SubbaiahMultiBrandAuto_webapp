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
  const vehicleNumber = decodeURIComponent(params.number);

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
  const serviceCharge = form.watch("serviceCharge");

  const addSparePart = () => {
    const currentParts = form.getValues("spareParts");
    form.setValue("spareParts", [...currentParts, { name: "", cost: 0 }]);
  };

  const removeSparePart = (index: number) => {
    const currentParts = form.getValues("spareParts");
    form.setValue("spareParts", currentParts.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    const partsTotal = spareParts.reduce((sum, part) => sum + part.cost, 0);
    return partsTotal + serviceCharge;
  };

  async function onSubmit(data: ServiceEntry) {
    setLoading(true);
    try {
      const servicesRef = ref(database, `services/${vehicleNumber}`);
      const newServiceRef = push(servicesRef);

      const newData = {
        ...data,
        id: newServiceRef.key,
        totalCost: calculateTotal()
      };

      await push(servicesRef, newData);

      toast({
        title: "Success",
        description: "Service record saved successfully"
      });

      setLocation(`/service-history/${vehicleNumber}`);
    } catch (error) {
      console.error("Error saving service:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save service record"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <Button
          variant="ghost"
          onClick={() => setLocation(`/service-history/${vehicleNumber}`)}
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
                                placeholder="Cost"
                                {...field}
                                onChange={e => field.onChange(Number(e.target.value))}
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
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value))}
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