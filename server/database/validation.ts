import { z } from 'zod';

export const PatientSchema = z.object({
  name: z.string().nonempty(),
  person: z.string().nonempty(),
  contact: z.string().regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,8}$/, 'Invalid phone number').or(z.string().min(3).max(20)),
  location: z.enum([
    'Manama',
    'Muharraq',
    'Hamad Town',
    'Riffa',
    "A'ali",
    'Sitra',
    'Jidhafs',
    'Isa Town',
    'Budaiya',
    'Diraz',
    'Jid Ali',
    'Sanabis',
    'Tubli',
    'Durrat Al Bahrain',
    'Gudaibiya',
    'Salmabad',
    'Jurdab',
    'Diyar Al Muharraq',
    'Amwaj Islands',
    'Al Hidd',
    'Arad',
    'Busaiteen',
    'Samaheej',
    'Al Dair',
    'Zinj',
    'Other towns',
  ]).optional(),
  isBaby: z.preprocess(val => typeof val === 'number' ? Boolean(val) : val, z.boolean()).optional().default(false),
});

export const CoordinatorSchema = z.object({
  first_name: z.string().nonempty(),
  last_name: z.string().optional(),
});

export const StaffSchema = z.object({
  full_name: z.string().nonempty(),
  occupation: z.string().nonempty(),
});

export const TrackingSchema = z.object({
  patient_id: z.number().int().positive(),
  contact_person: z.string().nonempty(),
  location: z.string().nonempty(),
  from_date: z.string().refine(v => !isNaN(Date.parse(v)), { message: 'Invalid date' }),
  to_date: z.string().refine(v => !isNaN(Date.parse(v)), { message: 'Invalid date' }),
  staff_ids: z.array(z.number().int().positive()).optional(),
  staff_titles: z.array(z.string().nonempty()).optional(),
  hours_per_day: z.number().nonnegative(),
  days_per_week: z.number().int().nonnegative(),
  duration_days: z.number().int().nonnegative(),
  timing: z.string().regex(/^\d{1,2}:\d{2}\s*(AM|PM)-\d{1,2}:\d{2}\s*(AM|PM)$/, 'Invalid timing format'),
  amount: z.number().nonnegative(),
  holiday_amount: z.number().nonnegative(),
  total: z.number().nonnegative(),
  paid: z.boolean().default(false),
  contract_sent: z.boolean().nullable().default(null),
  contract_signed: z.boolean().default(false),
  status: z.enum(['renewal', 'New']),
  coordinator_id: z.number().int().positive().optional(),
  contract_status: z.enum(["Children's Contract", "Contract Valid", "Contract Suspended", "Contract Expired"]).optional(),
});

export type Patient = z.infer<typeof PatientSchema>;
export type Coordinator = z.infer<typeof CoordinatorSchema>;
export type Staff = z.infer<typeof StaffSchema>;
export type Tracking = z.infer<typeof TrackingSchema>;