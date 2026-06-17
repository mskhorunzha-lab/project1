import { z } from "zod";
import {
  Criticality,
  EquipmentStatus,
  EquipmentSystem,
  EquipmentType,
  MovementType,
  Priority,
  WorkStatus,
  WorkType,
} from "@prisma/client";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : undefined))
  .optional();

const dateString = z.string().refine((value) => !Number.isNaN(new Date(value).getTime()), {
  message: "Некорректная дата",
});

export const createWorkSchema = z.object({
  title: z.string().trim().min(1, "Заполните заголовок"),
  type: z.nativeEnum(WorkType),
  category: z.string().trim().min(1, "Заполните категорию"),
  system: z.nativeEnum(EquipmentSystem),
  priority: z.nativeEnum(Priority).default("P3"),
  equipmentId: optionalText,
  serviceDeskTicket: optionalText,
  leadSpecialistId: optionalText,
  assigneeId: optionalText,
  plannedDate: dateString,
  description: optionalText,
});

export const updateWorkStatusSchema = z
  .object({
    status: z.nativeEnum(WorkStatus),
    waitReason: optionalText,
    result: optionalText,
  })
  .superRefine((value, ctx) => {
    const waitingStatuses: WorkStatus[] = [
      "WAITING_ACCESS",
      "WAITING_MATERIALS",
      "WAITING_CONTRACTOR",
      "WAITING_APPROVAL",
    ];

    if (waitingStatuses.includes(value.status) && !value.waitReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["waitReason"],
        message: "Для статуса ожидания нужна причина",
      });
    }
  });

export const createEquipmentSchema = z.object({
  name: z.string().trim().min(1, "Заполните наименование"),
  type: z.nativeEnum(EquipmentType),
  system: z.nativeEnum(EquipmentSystem),
  location: z.string().trim().min(1, "Заполните место установки"),
  manufacturer: optionalText,
  model: optionalText,
  serialNumber: optionalText,
  externalId: optionalText,
  status: z.nativeEnum(EquipmentStatus).default("OK"),
  criticality: z.nativeEnum(Criticality).default("MEDIUM"),
  regulationId: optionalText,
});

export const createWarehouseMovementSchema = z.object({
  itemId: z.string().trim().min(1, "Выберите позицию"),
  type: z.nativeEnum(MovementType),
  quantity: z.coerce.number().positive("Количество должно быть больше нуля"),
  basis: optionalText,
  workId: optionalText,
  equipmentId: optionalText,
  takenById: optionalText,
  comment: optionalText,
});

export const importRequestSchema = z.object({
  dataType: z.enum(["equipment", "warehouse"]),
});

export const checklistSchema = z.object({
  type: z.string().trim().min(1, "Не указан тип чек-листа"),
  items: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  summary: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  completed: z.boolean().default(true),
});

export function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join("; ");
}
