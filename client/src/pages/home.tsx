import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { vehicleNumberSchema } from "@shared/schema";
import { Wrench, CarFront, ClipboardCheck, History } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof vehicleNumberSchema>>({
    resolver: zodResolver(vehicleNumberSchema),
    defaultValues: {
      number: ""
    }
  });

  async function onSubmit(data: z.infer<typeof vehicleNumberSchema>) {
    setLoading(true);
    try {
      setLocation(`/service-history/${encodeURIComponent(data.number.toUpperCase())}`);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Wrench className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-primary">
                Subbaiah Multi Brand Auto
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                Your Trusted Auto Service Partner
              </p>
            </div>
          </div>

          <Card className="border-2">
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter vehicle number" 
                            {...field} 
                            className="text-lg uppercase"
                            onChange={(e) => {
                              const value = e.target.value.toUpperCase();
                              e.target.value = value;
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? "Searching..." : "Search Records"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <CarFront className="w-8 h-8 mx-auto text-primary mb-2" />
                <h3 className="font-semibold">Vehicle Records</h3>
                <p className="text-sm text-muted-foreground">
                  Track service history for any vehicle
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <ClipboardCheck className="w-8 h-8 mx-auto text-primary mb-2" />
                <h3 className="font-semibold">Service Details</h3>
                <p className="text-sm text-muted-foreground">
                  Record parts and labor costs
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <History className="w-8 h-8 mx-auto text-primary mb-2" />
                <h3 className="font-semibold">Service History</h3>
                <p className="text-sm text-muted-foreground">
                  View complete service timeline
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}