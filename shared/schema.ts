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
  spareParts: z.array(z.object({
    name: z.string().min(1, "Part name is required"),
    cost: z.number().min(0, "Cost must be positive")
  })),
  serviceCharge: z.number().min(0, "Service charge must be positive"),
  totalCost: z.number()
});

export type VehicleNumber = z.infer<typeof vehicleNumberSchema>;
export type ServiceEntry = z.infer<typeof serviceEntrySchema>;