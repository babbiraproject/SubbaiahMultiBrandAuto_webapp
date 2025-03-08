import { z } from "zod";

export const vehicleNumberSchema = z.object({
  number: z.string()
    .min(1, "Vehicle number is required")
    .max(20, "Vehicle number too long")
});

export const serviceEntrySchema = z.object({
  id: z.string(),
  vehicleNumber: z.string(),
  date: z.string(),
  kilometerReading: z.number().min(0, "Kilometer reading must be positive"),
  spareParts: z.array(z.object({
    name: z.string().min(1, "Part name is required"),
    cost: z.number().min(0, "Cost must be positive")
  })),
  serviceItems: z.array(z.object({
    description: z.string().min(1, "Service description is required"),
    cost: z.number().min(0, "Cost must be positive")
  })),
  totalSpareCost: z.number(),
  totalServiceCost: z.number(),
  totalCost: z.number()
});

export type VehicleNumber = z.infer<typeof vehicleNumberSchema>;
export type ServiceEntry = z.infer<typeof serviceEntrySchema>;