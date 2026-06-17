import { PrismaClient } from "@prisma/client";
import { addDays, subDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  await prisma.warehouseMovement.deleteMany();
  await prisma.workMaterial.deleteMany();
  await prisma.checklistResponse.deleteMany();
  await prisma.work.deleteMany();
  await prisma.upsDetails.deleteMany();
  await prisma.acsDetails.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.warehouseItem.deleteMany();
  await prisma.maintenanceRegulation.deleteMany();
  await prisma.importLog.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: { email: "admin@corp.local", name: "Администратор", role: "ADMIN" },
  });
  const manager = await prisma.user.create({
    data: { email: "manager@corp.local", name: "Сидоров А.В.", role: "MANAGER" },
  });
  const lead1 = await prisma.user.create({
    data: { email: "lead1@corp.local", name: "Иванов И.И.", role: "LEAD_SPECIALIST" },
  });
  const lead2 = await prisma.user.create({
    data: { email: "lead2@corp.local", name: "Петров П.П.", role: "LEAD_SPECIALIST" },
  });
  const spec1 = await prisma.user.create({
    data: { email: "spec1@corp.local", name: "Козлов К.К.", role: "SPECIALIST" },
  });
  const warehouse = await prisma.user.create({
    data: { email: "warehouse@corp.local", name: "Новиков Н.Н.", role: "WAREHOUSE" },
  });

  const regUps = await prisma.maintenanceRegulation.create({
    data: {
      name: "ТО ИБП — стандартный",
      system: "UPS",
      equipmentType: "UPS",
      intervalDays: 180,
      checklistType: "UPS_MAINTENANCE",
    },
  });
  const regAcs = await prisma.maintenanceRegulation.create({
    data: {
      name: "ТО двери СКУД",
      system: "ACS",
      equipmentType: "ACS_DOOR",
      intervalDays: 90,
      checklistType: "ACS_MAINTENANCE",
    },
  });

  const ups1 = await prisma.equipment.create({
    data: {
      externalId: "UPS-001",
      type: "UPS",
      system: "UPS",
      name: "ИБП шкаф СКС-12",
      manufacturer: "APC",
      model: "SMT1500",
      serialNumber: "AS12345",
      location: "Корпус 1, этаж 2, серверная",
      criticality: "HIGH",
      status: "OK",
      regulationId: regUps.id,
      lastMaintenance: subDays(new Date(), 200),
      nextMaintenance: subDays(new Date(), 20),
      qrCode: "QR-UPS-001",
      upsDetails: {
        create: {
          powerVA: 1500,
          loadPercent: 45,
          batteryType: "12V 9Ah",
          batteryCount: 2,
          batteryStatus: "Норма",
        },
      },
    },
  });

  const ups2 = await prisma.equipment.create({
    data: {
      externalId: "UPS-002",
      type: "UPS",
      system: "UPS",
      name: "ИБП ЦОД-1",
      manufacturer: "Eaton",
      model: "9PX 3000",
      location: "ЦОД, зал 1",
      criticality: "HIGH",
      status: "LIMITED",
      regulationId: regUps.id,
      lastMaintenance: subDays(new Date(), 100),
      nextMaintenance: addDays(new Date(), 80),
      qrCode: "QR-UPS-002",
    },
  });

  const door1 = await prisma.equipment.create({
    data: {
      externalId: "ACS-DOOR-001",
      type: "ACS_DOOR",
      system: "ACS",
      name: "Дверь КПП-1",
      location: "КПП-1",
      criticality: "HIGH",
      status: "OK",
      regulationId: regAcs.id,
      lastMaintenance: subDays(new Date(), 100),
      nextMaintenance: subDays(new Date(), 5),
      qrCode: "QR-ACS-DOOR-001",
      acsDetails: {
        create: {
          readerModel: "Sigur E500",
          lockType: "Электромагнитный",
          exitButton: true,
          controller: "SK-2NET",
          batteryStatus: "Норма",
        },
      },
    },
  });

  await prisma.equipment.create({
    data: {
      externalId: "ACS-DOOR-002",
      type: "ACS_DOOR",
      system: "ACS",
      name: "Дверь склад А",
      location: "Склад А, вход",
      criticality: "MEDIUM",
      status: "FAULTY",
      regulationId: regAcs.id,
      lastMaintenance: subDays(new Date(), 120),
      nextMaintenance: subDays(new Date(), 30),
    },
  });

  const zipItems = await Promise.all([
    prisma.warehouseItem.create({
      data: {
        externalId: "ZIP-001",
        name: "АКБ 12В 9Ач",
        category: "АКБ",
        model: "12V 9Ah",
        storageLocation: "Склад-1/Полка-2",
        quantity: 12,
        minQuantity: 20,
        reorderPoint: 25,
        emergencyReserve: 10,
        criticality: "HIGH",
      },
    }),
    prisma.warehouseItem.create({
      data: {
        externalId: "ZIP-002",
        name: "БП 12В 3А",
        category: "Блок питания",
        model: "12V 3A",
        storageLocation: "Склад-1/Полка-3",
        quantity: 3,
        minQuantity: 10,
        reorderPoint: 15,
        emergencyReserve: 5,
        criticality: "HIGH",
      },
    }),
    prisma.warehouseItem.create({
      data: {
        externalId: "ZIP-003",
        name: "Считыватель СКУД",
        category: "СКУД",
        storageLocation: "Склад-1/Полка-1",
        quantity: 2,
        minQuantity: 5,
        reorderPoint: 5,
        emergencyReserve: 3,
        criticality: "MEDIUM",
      },
    }),
  ]);

  const works = await Promise.all([
    prisma.work.create({
      data: {
        number: "WRK-2025-00001",
        type: "MAINTENANCE",
        category: "Плановое ТО — ИБП",
        system: "UPS",
        equipmentId: ups1.id,
        priority: "PLANNED",
        leadSpecialistId: lead1.id,
        assigneeId: spec1.id,
        plannedDate: subDays(new Date(), 20),
        status: "IN_PROGRESS",
        title: "ТО: ИБП шкаф СКС-12",
        description: "Плановое обслуживание по регламенту",
      },
    }),
    prisma.work.create({
      data: {
        number: "WRK-2025-00002",
        type: "MAINTENANCE",
        category: "Плановое ТО — СКУД",
        system: "ACS",
        equipmentId: door1.id,
        priority: "PLANNED",
        leadSpecialistId: lead2.id,
        plannedDate: subDays(new Date(), 5),
        status: "NEW",
        title: "ТО: Дверь КПП-1",
      },
    }),
    prisma.work.create({
      data: {
        number: "WRK-2025-00003",
        serviceDeskTicket: "SD-10452",
        type: "TICKET",
        category: "Авария — локальный отказ",
        system: "ACS",
        priority: "P2",
        leadSpecialistId: lead2.id,
        assigneeId: spec1.id,
        plannedDate: addDays(new Date(), 1),
        status: "WAITING_MATERIALS",
        waitReason: "Нет считывателя на складе",
        title: "Не работает считыватель — склад А",
        description: "Связано с заявкой SD-10452",
      },
    }),
    prisma.work.create({
      data: {
        number: "WRK-2025-00004",
        type: "REPAIR",
        category: "Замена компонента",
        system: "UPS",
        equipmentId: ups2.id,
        priority: "P3",
        leadSpecialistId: lead1.id,
        plannedDate: addDays(new Date(), 3),
        status: "ASSIGNED",
        assigneeId: spec1.id,
        title: "Замена АКБ — ИБП ЦОД-1",
      },
    }),
  ]);

  await prisma.warehouseMovement.create({
    data: {
      itemId: zipItems[0].id,
      quantity: 2,
      type: "ISSUE",
      basis: works[0].number,
      workId: works[0].id,
      equipmentId: ups1.id,
      takenById: spec1.id,
      givenById: warehouse.id,
      comment: "Выдача АКБ для ТО",
    },
  });

  console.log("Seed completed:", {
    users: 5,
    equipment: 4,
    warehouse: zipItems.length,
    works: works.length,
    manager: manager.name,
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
