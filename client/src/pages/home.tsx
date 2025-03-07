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
import { Wrench } from "lucide-react";

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
      setLocation(`/service-history/${encodeURIComponent(data.number)}`);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Wrench className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Service Records</h1>
          <p className="text-sm text-muted-foreground">
            Enter a vehicle number to view or create service records
          </p>
        </CardHeader>
        <CardContent>
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? "Loading..." : "Search Records"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
