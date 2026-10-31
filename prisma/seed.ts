import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { MonthPart, Recurrence, TaskType } from "@/generated/prisma/enums";
import { getDatabaseConnectionString } from "@/lib/database-url";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: getDatabaseConnectionString(process.env["DATABASE_URL"] ?? ""),
  }),
});

const seed = async () => {
  const existingPlantCount = await prisma.plant.count();
  if (existingPlantCount > 0) {
    console.log(`Seed skipped: the database already contains ${existingPlantCount} plant(s).`);
    return;
  }

  await prisma.plant.create({
    data: {
      name: "Rosier",
      variety: "Pierre de Ronsard",
      location: "Façade sud",
      sunExposure: "Plein soleil",
      watering: "Arroser au pied en cas de sécheresse",
      careTasks: {
        create: [
          {
            type: TaskType.PRUNING,
            instructions: "Couper au-dessus d'un œil tourné vers l'extérieur.",
            startMonth: 2,
            startPart: MonthPart.LATE,
            endMonth: 3,
            endPart: MonthPart.EARLY,
          },
          {
            type: TaskType.FERTILIZING,
            title: "Engrais pour rosiers",
            startMonth: 4,
            startPart: MonthPart.MID,
            endMonth: 7,
            endPart: MonthPart.LATE,
            recurrence: Recurrence.EVERY_WEEKS,
            interval: 4,
          },
        ],
      },
    },
  });

  await prisma.plant.create({
    data: {
      name: "Tomate cerise",
      location: "Potager",
      sunExposure: "Plein soleil",
      soil: "Riche et drainé",
      careTasks: {
        create: [
          {
            type: TaskType.SOWING,
            title: "Semis en intérieur",
            startMonth: 3,
            startPart: MonthPart.EARLY,
            endMonth: 3,
            endPart: MonthPart.LATE,
          },
          {
            type: TaskType.PLANTING,
            startMonth: 5,
            startPart: MonthPart.MID,
            endMonth: 5,
            endPart: MonthPart.LATE,
          },
          {
            type: TaskType.WATERING,
            startMonth: 6,
            startPart: MonthPart.EARLY,
            endMonth: 8,
            endPart: MonthPart.LATE,
            recurrence: Recurrence.EVERY_DAYS,
            interval: 3,
          },
          {
            type: TaskType.HARVESTING,
            startMonth: 7,
            startPart: MonthPart.MID,
            endMonth: 9,
            endPart: MonthPart.LATE,
            recurrence: Recurrence.EVERY_WEEKS,
            interval: 1,
          },
        ],
      },
    },
  });

  await prisma.plant.create({
    data: {
      name: "Lavande",
      location: "Bordure de l'allée",
      sunExposure: "Plein soleil",
      soil: "Sec et pauvre",
      careTasks: {
        create: [
          {
            type: TaskType.PRUNING,
            instructions: "Tailler après la floraison sans couper dans le vieux bois.",
            startMonth: 8,
            startPart: MonthPart.LATE,
            endMonth: 9,
            endPart: MonthPart.MID,
          },
        ],
      },
    },
  });

  await prisma.plant.create({
    data: {
      name: "Hortensia",
      location: "Massif nord",
      sunExposure: "Mi-ombre",
      careTasks: {
        create: [
          {
            type: TaskType.MULCHING,
            title: "Protéger du froid",
            startMonth: 11,
            startPart: MonthPart.LATE,
            endMonth: 2,
            endPart: MonthPart.EARLY,
          },
        ],
      },
    },
  });

  console.log("Seed completed: 4 plants created.");
};

seed()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
