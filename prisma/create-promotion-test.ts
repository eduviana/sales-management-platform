/**
 * Dev-only script: create a Level 1 account with enough points to test
 * the ADMIN promotion flow from the employees table.
 *
 * Points (REG-082): seniority = 1 point per month since joinedAt.
 * N1 -> N2 requires 100 points. joinedAt 2018-01-15 gives ~105 months.
 *
 * Run with: npx tsx prisma/create-promotion-test.ts
 *
 * WARNING: Development only.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const prisma = (() => {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  return new PrismaClient({ adapter });
})();

const EMPLOYEE_ID = "f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c";
const USER_ACCOUNT_ID = "e2f3a4b5-c6d7-4e8f-9a0b-1c2d3e4f5a6b";

async function main() {
  console.log("Creating Level 1 promotion-test account...");

  // Level 1 seller under María García (N3)
  await prisma.employee.upsert({
    where: { id: EMPLOYEE_ID },
    update: {},
    create: {
      id: EMPLOYEE_ID,
      employeeCode: 5,
      firstName: "Prueba",
      lastName: "Promoción",
      dni: "45999999",
      email: "promocion.test@royalprestige.com",
      phone: "11-5555-0099",
      dateOfBirth: new Date("1993-04-12"),
      joinedAt: new Date("2018-01-15"),
      currentLevelId: 1,
      supervisorId: "8d918473-082c-4527-86e8-5afc259f3791",
      status: "ACTIVE",
      street: "Calle de Prueba",
      streetNumber: "777",
      city: "Buenos Aires",
      province: "CABA",
      postalCode: "C1010",
    },
  });

  // Level history (open record) — required by ChangeLevelUseCase
  const existingHistory = await prisma.employeeLevelHistory.findFirst({
    where: { employeeId: EMPLOYEE_ID, endedAt: null },
  });
  if (!existingHistory) {
    await prisma.employeeLevelHistory.create({
      data: {
        employeeId: EMPLOYEE_ID,
        levelId: 1,
        startedAt: new Date("2018-01-15"),
        reason: "Cuenta de prueba para ascenso (promotion flow)",
      },
    });
  }

  // User account so it is a real login account
  const passwordHash = await bcrypt.hash("promotest123", 12);
  await prisma.userAccount.upsert({
    where: { id: USER_ACCOUNT_ID },
    update: {},
    create: {
      id: USER_ACCOUNT_ID,
      employeeId: EMPLOYEE_ID,
      email: "promocion.test@royalprestige.com",
      passwordHash,
      status: "ACTIVE",
      mustChangePassword: false,
    },
  });

  const emp = await prisma.employee.findUnique({
    where: { id: EMPLOYEE_ID },
    select: { employeeCode: true, firstName: true, lastName: true, currentLevelId: true, joinedAt: true },
  });

  const months =
    (new Date().getFullYear() - emp!.joinedAt.getFullYear()) * 12 +
    (new Date().getMonth() - emp!.joinedAt.getMonth());

  console.log("Created:");
  console.log(`  ${emp!.firstName} ${emp!.lastName} (code ${emp!.employeeCode}) — N${emp!.currentLevelId}`);
  console.log(`  joinedAt: ${emp!.joinedAt.toISOString().slice(0, 10)} (~${months} months, seniority = ${months} points)`);
  console.log(`  N1→N2 threshold: 100 points → bar at 100%`);
  console.log("");
  console.log("Login (optional): promocion.test@royalprestige.com / promotest123");

  await prisma.$disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Script failed:", e);
    process.exit(1);
  });