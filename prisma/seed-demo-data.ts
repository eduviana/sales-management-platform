/**
 * Demo seed data for dashboard screenshots / portfolio.

 * Complements `prisma/seed.ts` (levels, users, catalog base, visits) with the
 * transactional data that the base seed deliberately does not create:
 *
 * - Employees at levels N1-N6 (+ 1 inactive) for hierarchy and distribution
 * - Extra kitchen products on the 4 base catalog categories (1 inactive)
 * - Visits (completed / no-sale / upcoming) for team and personal views
 * - Sales across Jun-Oct 2026 with all statuses, items and buyers
 * - Commission entries (EARNED + one REVERSAL + one ADJUSTMENT)
 * - Audit events for the last 7 days incl. FAILURE and DENIED (alert card)
 * - Employee progress points (seniority / visits / sales / targets)
 *
 * Every section is guarded by a count check, so the script is idempotent:
 * re-running it does not duplicate data. All inserts run in one transaction,
 * so a crash can never leave a partial state.
 *
 * Run with: npx tsx prisma/seed-demo-data.ts
 *
 * WARNING: Development only. Do not use in production.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = (() => {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  return new PrismaClient({ adapter });
})();

// ---------------------------------------------------------------------------
// Deterministic pseudo-random generator (fixed seed => reproducible demo data)
// ---------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20261010);
const randInt = (min: number, max: number): number =>
  min + Math.floor(rand() * (max - min + 1));
const pick = <T,>(items: readonly T[]): T =>
  items[Math.floor(rand() * items.length)];
const round2 = (value: number): number => Math.round(value * 100) / 100;

// ---------------------------------------------------------------------------
// Fixed ids for new records (UUID v4 format)
// ---------------------------------------------------------------------------

const ROBERTO_ID = "f6a7b8c9-0001-4a6b-8c7d-1e2f3a4b5c01"; // N6
const LUCIA_ID = "f6a7b8c9-0002-4a6b-8c7d-1e2f3a4b5c02"; // N5
const JORGE_ID = "f6a7b8c9-0003-4a6b-8c7d-1e2f3a4b5c03"; // N4
const SOFIA_ID = "f6a7b8c9-0004-4a6b-8c7d-1e2f3a4b5c04"; // N2
const DIEGO_ID = "f6a7b8c9-0005-4a6b-8c7d-1e2f3a4b5c05"; // N1
const VALENTINA_ID = "f6a7b8c9-0006-4a6b-8c7d-1e2f3a4b5c06"; // N1
const HECTOR_ID = "f6a7b8c9-0007-4a6b-8c7d-1e2f3a4b5c07"; // N1 inactive

const MARIA_ID = "8d918473-082c-4527-86e8-5afc259f3791";
const CARLOS_ID = "235b0ce6-e053-442b-a2b5-fe75557a560f";
const PROMO_ID = "f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c"; // create-promotion-test.ts

/**
 * Counted October sales (APPROVED + PENDING_REVIEW) per seller. Drives the
 * "Estado de objetivo" badges in the team performance table (rule in code:
 * ≥10 → Superando, ≥5 → En marcha, menos → En riesgo), so Maria's team shows
 * all three states instead of a uniform "En riesgo". Default: 3.
 */
const OCTOBER_SALES_PLAN: Record<string, number> = {
  [SOFIA_ID]: 10, // Superando
  [CARLOS_ID]: 5, // En marcha
  [DIEGO_ID]: 3, // En riesgo
  [VALENTINA_ID]: 2, // En riesgo
  [PROMO_ID]: 1, // En riesgo
};

/** Statuses that count for KPIs; cycles for the planned October sales. */
const COUNTED_STATUSES = [
  "APPROVED", "APPROVED", "PENDING_REVIEW", "APPROVED", "APPROVED",
  "APPROVED", "PENDING_REVIEW", "APPROVED", "APPROVED", "APPROVED",
] as const;

// Product categories created by `prisma/seed.ts` (kitchen catalog).
const CATEGORY_COOKWARE_ID = "7c4f1e2a-1001-4b8d-9e3a-2f5c6d7e8a91";
const CATEGORY_APPLIANCES_ID = "7c4f1e2a-1002-4b8d-9e3a-2f5c6d7e8a92";
const CATEGORY_CUTLERY_ID = "7c4f1e2a-1003-4b8d-9e3a-2f5c6d7e8a93";
const CATEGORY_SERVEWARE_ID = "7c4f1e2a-1004-4b8d-9e3a-2f5c6d7e8a94";

/** Date inside the demo year 2026 (monthIndex 0 = January). */
const utcDate = (monthIndex: number, day: number, hour = 12): Date =>
  new Date(Date.UTC(2026, monthIndex, day, hour, 0, 0));

/** Explicit calendar date (for joinedAt / dateOfBirth etc.). */
const onDate = (year: number, monthIndex: number, day: number): Date =>
  new Date(Date.UTC(year, monthIndex, day, 12, 0, 0));

const BUYER_NAMES = [
  "Luciana Acosta",
  "Fernando Méndez",
  "Paula Gutiérrez",
  "Martín Sosa",
  "Carla Benítez",
  "Diego Ferreyra",
  "Julieta Ponce",
  "Ramiro Cabrera",
  "Natalia Vega",
  "Emilio Luna",
  "Belén Ortiz",
  "Facundo Ríos",
  "Antonella Paz",
  "Tomás Guerrero",
  "Malena Sosa",
] as const;

async function main(): Promise<void> {
  console.log("Seeding demo data...");

  await prisma.$transaction(
    async (tx) => {
      // -----------------------------------------------------------------
      // Section guards (idempotency)
      // -----------------------------------------------------------------
      const runEmployees = (await tx.employee.count()) < 12;
      const runCatalog = (await tx.product.count()) < 15;
      const runVisits = (await tx.visit.count()) <= 10;
      const runSales = (await tx.sale.count()) <= 10;
      const runCommissions = (await tx.commissionEntry.count()) <= 10;
      const deniedCount = await tx.auditEvent.count({
        where: { result: "DENIED" },
      });
      const runAudit = deniedCount === 0;
      const runProgress = (await tx.employeeProgress.count()) === 0;

      // -----------------------------------------------------------------
      // 1. Employees (N4-N6 branch, extra N1/N2 team, 1 inactive)
      // -----------------------------------------------------------------
      if (runEmployees) {
        console.log("Creating demo employees...");

        const employees = [
          {
            id: ROBERTO_ID,
            employeeCode: 6,
            firstName: "Roberto",
            lastName: "Díaz",
            dni: "28765432",
            email: "roberto.diaz@royalprestige.com",
            phone: "11-5555-0006",
            dateOfBirth: onDate(1979, 4, 12),
            joinedAt: onDate(2019, 2, 12),
            currentLevelId: 6,
            supervisorId: null,
            status: "ACTIVE" as const,
            street: "San Martín",
            streetNumber: "2100",
            city: "San Isidro",
            province: "Buenos Aires",
            postalCode: "1642",
          },
          {
            id: LUCIA_ID,
            employeeCode: 7,
            firstName: "Lucía",
            lastName: "Fernández",
            dni: "32456789",
            email: "lucia.fernandez@royalprestige.com",
            phone: "11-5555-0007",
            dateOfBirth: onDate(1983, 9, 12),
            joinedAt: onDate(2020, 8, 12),
            currentLevelId: 5,
            supervisorId: ROBERTO_ID,
            status: "ACTIVE" as const,
            city: "Buenos Aires",
            province: "CABA",
          },
          {
            id: JORGE_ID,
            employeeCode: 8,
            firstName: "Jorge",
            lastName: "Ramírez",
            dni: "35678912",
            email: "jorge.ramirez@royalprestige.com",
            phone: "11-5555-0008",
            dateOfBirth: onDate(1987, 1, 12),
            joinedAt: onDate(2021, 5, 12),
            currentLevelId: 4,
            supervisorId: LUCIA_ID,
            status: "ACTIVE" as const,
            city: "Buenos Aires",
            province: "CABA",
          },
          {
            id: SOFIA_ID,
            employeeCode: 9,
            firstName: "Sofía",
            lastName: "Torres",
            dni: "42345678",
            email: "sofia.torres@royalprestige.com",
            phone: "11-5555-0009",
            dateOfBirth: onDate(1995, 6, 12),
            joinedAt: onDate(2024, 9, 12),
            currentLevelId: 2,
            supervisorId: MARIA_ID,
            status: "ACTIVE" as const,
            city: "Buenos Aires",
            province: "CABA",
          },
          {
            id: DIEGO_ID,
            employeeCode: 10,
            firstName: "Diego",
            lastName: "Paz",
            dni: "43216789",
            email: "diego.paz@royalprestige.com",
            phone: "11-5555-0010",
            dateOfBirth: onDate(1997, 2, 12),
            joinedAt: onDate(2025, 2, 12),
            currentLevelId: 1,
            supervisorId: MARIA_ID,
            status: "ACTIVE" as const,
            city: "Buenos Aires",
            province: "CABA",
          },
          {
            id: VALENTINA_ID,
            employeeCode: 11,
            firstName: "Valentina",
            lastName: "Ruiz",
            dni: "44556712",
            email: "valentina.ruiz@royalprestige.com",
            phone: "11-5555-0011",
            dateOfBirth: onDate(1999, 10, 12),
            joinedAt: onDate(2025, 7, 12),
            currentLevelId: 1,
            supervisorId: MARIA_ID,
            status: "ACTIVE" as const,
            city: "Buenos Aires",
            province: "CABA",
          },
          {
            id: HECTOR_ID,
            employeeCode: 12,
            firstName: "Héctor",
            lastName: "Molina",
            dni: "39876543",
            email: "hector.molina@royalprestige.com",
            phone: "11-5555-0012",
            dateOfBirth: onDate(1991, 3, 12),
            joinedAt: onDate(2023, 11, 12),
            currentLevelId: 1,
            supervisorId: MARIA_ID,
            status: "INACTIVE" as const,
            deactivatedAt: onDate(2026, 4, 12),
            deactivationReason: "Renuncia presentada",
          },
        ];

        for (const employee of employees) {
          await tx.employee.upsert({
            where: { id: employee.id },
            update: {},
            create: employee,
          });
        }

        // Complete the branch: N6 -> N5 -> N4 -> N3 (María)
        await tx.employee.update({
          where: { id: MARIA_ID },
          data: { supervisorId: JORGE_ID },
        });

        // Explicit employeeCode values leave the autoincrement sequence behind;
        // re-sync it so the application can keep creating employees.
        await tx.$executeRaw`
          SELECT setval(
            pg_get_serial_sequence('employee', 'employeeCode'),
            (SELECT MAX("employeeCode") FROM employee)
          )`;
      }

      // -----------------------------------------------------------------
      // 2. Catalog: 10 extra products on the 4 base categories
      // -----------------------------------------------------------------
      if (runCatalog) {
        console.log("Creating demo products...");

        // One inactive product so the catalog shows a disabled badge.
        const products = [
          { code: "SC-005", name: "Cacerola 5-PLY 24 cm con Tapa", description: "Cacerola de acero quirúrgico 5 capas con tapa de cristal", price: 319.99, categoryId: CATEGORY_COOKWARE_ID, isActive: true },
          { code: "SC-006", name: "Wok MultiPan 30 cm", description: "Wok multifunción de acero quirúrgico con tapa de cristal", price: 299.99, categoryId: CATEGORY_COOKWARE_ID, isActive: true },
          { code: "SC-007", name: "Olla Sopera 5-PLY 4 L", description: "Olla sopera de acero quirúrgico 5 capas", price: 449.99, categoryId: CATEGORY_COOKWARE_ID, isActive: true },
          { code: "EL-004", name: "Cafetera Barista", description: "Sistema para café espresso y filtrado", price: 459.0, categoryId: CATEGORY_APPLIANCES_ID, isActive: true },
          { code: "EL-005", name: "Prensa Francesa Infusor 1 L", description: "Prensa para café e infusiones de acero quirúrgico", price: 149.99, categoryId: CATEGORY_APPLIANCES_ID, isActive: false },
          { code: "CU-004", name: "Juego de Cuchillos con Bloque de Bambú (7 pzas)", description: "Set de cuchillos de cocina con bloque de bambú", price: 799.0, categoryId: CATEGORY_CUTLERY_ID, isActive: true },
          { code: "CU-005", name: "Afilador de Acero 20 cm", description: "Afilador de acero quirúrgico para uso doméstico", price: 59.99, categoryId: CATEGORY_CUTLERY_ID, isActive: true },
          { code: "AC-003", name: "Juego de Cubiertos para Servir (24 pzas)", description: "Cubiertos de acero quirúrgico para servir", price: 399.99, categoryId: CATEGORY_SERVEWARE_ID, isActive: true },
          { code: "AC-004", name: "Tazas Térmicas (2 pzas)", description: "Tazas térmicas de acero doble pared", price: 129.99, categoryId: CATEGORY_SERVEWARE_ID, isActive: true },
          { code: "AC-005", name: "Colador y Vaporero de Acero", description: "Colador y vaporero de acero quirúrgico", price: 119.99, categoryId: CATEGORY_SERVEWARE_ID, isActive: true },
        ] as const;

        for (const [index, product] of products.entries()) {
          await tx.product.upsert({
            where: { id: `d3e5f7a9-20${String(index + 1).padStart(2, "0")}-4c3b-8d4e-5f6a7b8c9d01` },
            update: {},
            create: product,
          });
        }
      }

      // -----------------------------------------------------------------
      // 3. Visits (per seller: completed = planned October sales + one
      //    no-sale + one upcoming — REG-066/REG-067; the completed/no-sale
      //    visits fall in October so the team table's "Visitas" column is
      //    never zero while the seller has sales)
      // -----------------------------------------------------------------
      const clients = await tx.client.findMany({
        select: { id: true },
        orderBy: { createdAt: "asc" },
      });

      if (runVisits && clients.length > 0) {
        console.log("Creating demo visits...");

        // Re-sync autoincrement sequences (explicit ids/values in dev data).
        await tx.$executeRaw`
          SELECT setval(
            pg_get_serial_sequence('visit', 'visitNumber'),
            (SELECT COALESCE(MAX("visitNumber"), 0) FROM visit) + 1,
            false
          )`;

        const sellers = await tx.employee.findMany({
          where: { status: "ACTIVE", currentLevelId: { not: null } },
          select: { id: true, supervisorId: true },
        });

        let clientIndex = 0;
        for (const seller of sellers) {
          const assignedById = seller.supervisorId ?? seller.id;
          const completedCount = OCTOBER_SALES_PLAN[seller.id] ?? 3;

          // Completed visits spread over Oct 1-10 (today is Oct 12).
          for (let i = 0; i < completedCount; i++) {
            const clientId = clients[clientIndex % clients.length].id;
            clientIndex += 1;
            const day = 1 + (i % 10);
            await tx.visit.create({
              data: {
                sellerId: seller.id,
                clientId,
                assignedById,
                scheduledDate: utcDate(9, day),
                completedDate: utcDate(9, day),
                status: "COMPLETED",
                notes: "Visita de seguimiento completada.",
              },
            });
          }

          // One visit without sale (counts toward "Visitas" as well).
          const noSaleClientId = clients[clientIndex % clients.length].id;
          clientIndex += 1;
          await tx.visit.create({
            data: {
              sellerId: seller.id,
              clientId: noSaleClientId,
              assignedById,
              scheduledDate: utcDate(9, 7),
              completedDate: utcDate(9, 7),
              status: "NO_SALE",
              notes: "Cliente sin compra en el momento.",
            },
          });

          // One upcoming visit (shows the ASSIGNED state in /visits).
          const upcomingClientId = clients[clientIndex % clients.length].id;
          clientIndex += 1;
          await tx.visit.create({
            data: {
              sellerId: seller.id,
              clientId: upcomingClientId,
              assignedById,
              scheduledDate: utcDate(9, 16),
              completedDate: null,
              status: "ASSIGNED",
              notes: "Visita agendada con el cliente.",
            },
          });
        }
      }

      // -----------------------------------------------------------------
      // 4. Sales (Jun-Oct 2026, all statuses, with items)
      // -----------------------------------------------------------------
      if (runSales) {
        console.log("Creating demo sales...");

        // Re-sync autoincrement sequences (explicit ids/values in dev data).
        // setval(MAX + 1, false) makes the next nextval return exactly
        // MAX + 1 — that is, 1 on an empty table (VT-0001) and MAX + 1
        // otherwise. setval rejects 0 because the sequence minvalue is 1.
        await tx.$executeRaw`
          SELECT setval(
            pg_get_serial_sequence('sale', 'saleNumber'),
            (SELECT COALESCE(MAX("saleNumber"), 0) FROM sale) + 1,
            false
          )`;

        const products = await tx.product.findMany({
          where: { isActive: true },
          select: { id: true, price: true },
        });
        const sellers = await tx.employee.findMany({
          where: { status: "ACTIVE", currentLevelId: { not: null } },
          select: { id: true, currentLevelId: true },
        });
        const clients = await tx.client.findMany({
          select: { id: true },
          orderBy: { createdAt: "asc" },
        });

        const statuses = [
          "APPROVED", "APPROVED", "PENDING_REVIEW", "APPROVED",
          "REJECTED", "APPROVED", "CANCELLED",
        ] as const;
        const rejectionReasons = [
          "Pago rechazado por el banco",
          "Cliente anuló la compra",
        ] as const;
        const paymentMethods = ["TRANSFERENCIA", "TARJETA", "EFECTIVO"] as const;

        for (const seller of sellers) {
          // Historical sales: Jun 1 - Sep 30
          for (let i = 0; i < 4; i++) {
            const day = randInt(0, 121); // Jun 1 + 121 days = Sep 30
            const saleDate = new Date(Date.UTC(2026, 5, 1 + day, 12));
            await createDemoSale(tx, {
              sellerId: seller.id,
              saleDate,
              status: pick(statuses),
              products,
              clients,
              rejectionReasons,
              paymentMethods,
            });
          }

          // Current-month sales: Oct 1 - Oct 10. Counted statuses follow
          // OCTOBER_SALES_PLAN so the team table shows varied target
          // statuses; plus one rejected/cancelled sale for realism
          // (not counted in KPIs).
          const counted = OCTOBER_SALES_PLAN[seller.id] ?? 3;
          for (let i = 0; i < counted; i++) {
            await createDemoSale(tx, {
              sellerId: seller.id,
              saleDate: utcDate(9, 1 + (i % 10)),
              status: COUNTED_STATUSES[i % COUNTED_STATUSES.length],
              products,
              clients,
              rejectionReasons,
              paymentMethods,
            });
          }

          await createDemoSale(tx, {
            sellerId: seller.id,
            saleDate: utcDate(9, 1 + randInt(0, 9)),
            status: pick(["REJECTED", "CANCELLED"] as const),
            products,
            clients,
            rejectionReasons,
            paymentMethods,
          });
        }
      }

      // -----------------------------------------------------------------
      // 5. Commission entries (EARNED per approved sale + REVERSAL +
      //    ADJUSTMENT for realism)
      // -----------------------------------------------------------------
      if (runCommissions) {
        console.log("Creating demo commission entries...");

        const approvedSales = await tx.sale.findMany({
          where: { status: "APPROVED" },
          select: {
            id: true,
            employeeId: true,
            saleDate: true,
            totalAmount: true,
          },
        });
        const rules = await tx.commissionRule.findMany();

        // A partial unique index enforces one EARNED entry per sale: skip
        // sales that already have one (the pre-existing demo sale).
        const existingEarned = await tx.commissionEntry.findMany({
          where: { type: "EARNED" },
          select: {
            id: true,
            saleId: true,
            employeeId: true,
            ruleId: true,
            amount: true,
            saleDate: true,
          },
        });
        const salesWithEarned = new Set(existingEarned.map((e) => e.saleId));

        type EarnedRef = {
          id: string;
          saleId: string;
          employeeId: string;
          ruleId: string;
          amountNumber: number;
          saleDate: Date;
        };

        const created: EarnedRef[] = existingEarned.map((entry) => ({
          id: entry.id,
          saleId: entry.saleId,
          employeeId: entry.employeeId,
          ruleId: entry.ruleId,
          amountNumber: Number(entry.amount),
          saleDate: entry.saleDate,
        }));

        for (const sale of approvedSales) {
          if (salesWithEarned.has(sale.id)) continue;

          const employee = await tx.employee.findUnique({
            where: { id: sale.employeeId },
            select: { currentLevelId: true },
          });
          if (!employee?.currentLevelId) continue;

          const applicable = rules
            .filter(
              (rule) =>
                rule.levelId === employee.currentLevelId &&
                rule.effectiveFrom <= sale.saleDate,
            )
            .sort((a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime());
          const rule = applicable[0];
          if (!rule) continue;

          const percentage = Number(rule.percentage);
          const amount = round2(Number(sale.totalAmount) * (percentage / 100));
          if (amount <= 0) continue;

          const entry = await tx.commissionEntry.create({
            data: {
              saleId: sale.id,
              employeeId: sale.employeeId,
              ruleId: rule.id,
              type: "EARNED",
              percentage,
              baseAmount: sale.totalAmount,
              amount,
              saleDate: sale.saleDate,
            },
          });
          created.push({
            id: entry.id,
            saleId: sale.id,
            employeeId: sale.employeeId,
            ruleId: rule.id,
            amountNumber: amount,
            saleDate: sale.saleDate,
          });
        }

        const septemberEarned = created.find(
          (entry) =>
            entry.saleDate >= utcDate(8, 1) && entry.saleDate < utcDate(9, 1),
        );
        const reversalBase = septemberEarned ?? created[0] ?? null;

        if (reversalBase) {
          const parentAmount = Math.abs(reversalBase.amountNumber);
          await tx.commissionEntry.create({
            data: {
              saleId: reversalBase.saleId,
              employeeId: reversalBase.employeeId,
              ruleId: reversalBase.ruleId,
              parentId: reversalBase.id,
              type: "REVERSAL",
              percentage: 20,
              baseAmount: parentAmount,
              amount: -parentAmount,
              saleDate: utcDate(9, 15),
            },
          });

          await tx.commissionEntry.create({
            data: {
              saleId: reversalBase.saleId,
              employeeId: reversalBase.employeeId,
              ruleId: reversalBase.ruleId,
              type: "ADJUSTMENT",
              percentage: 10,
              baseAmount: 50,
              amount: 5,
              saleDate: utcDate(9, 30),
            },
          });
        }
      }

      // -----------------------------------------------------------------
      // 6. Audit events (activity for the last 7 days + FAILURE/DENIED
      //    alerts for the current month)
      // -----------------------------------------------------------------
      if (runAudit) {
        console.log("Creating demo audit events...");

        const accounts = await tx.userAccount.findMany({
          select: { id: true, email: true },
        });
        const accountByEmail = new Map(accounts.map((a) => [a.email, a.id]));
        const salePool = await tx.sale.findMany({
          select: { id: true },
          take: 12,
          orderBy: { saleDate: "desc" },
        });
        const pickSaleId = (): string | null =>
          salePool.length > 0 ? pick(salePool).id : null;

        const actor = (email: string) => ({
          actorId: accountByEmail.get(email) ?? null,
          actorEmail: email,
        });
        const ADMIN = "admin@royalprestige.com";
        const SUPERVISOR = "supervisor@royalprestige.com";
        const SELLER = "seller@royalprestige.com";
        const ANA = "ana@royalprestige.com";

        type DemoEvent = {
          createdAt: Date;
          action:
            | "LOGIN_SUCCESS"
            | "LOGIN_FAILURE"
            | "LOGOUT"
            | "PASSWORD_CHANGED"
            | "EMPLOYEE_UPDATED"
            | "SALE_CREATED"
            | "SALE_SUBMITTED"
            | "SALE_APPROVED"
            | "AUTHORIZATION_DENIED";
          result: "SUCCESS" | "FAILURE" | "DENIED";
          resourceType: string;
          resourceId?: string | null;
          actorEmail?: string;
          metadata?: Record<string, string | number | boolean | string[]>;
        };

        const events: DemoEvent[] = [
          // Previous days (context for the audit explorer)
          { createdAt: utcDate(8, 29, 12), action: "LOGIN_SUCCESS", result: "SUCCESS", resourceType: "UserAccount", actorEmail: ADMIN, metadata: { method: "credentials" } },
          { createdAt: utcDate(8, 29, 15), action: "SALE_CREATED", result: "SUCCESS", resourceType: "Sale", resourceId: pickSaleId(), actorEmail: SELLER },
          { createdAt: utcDate(8, 30, 11), action: "LOGIN_SUCCESS", result: "SUCCESS", resourceType: "UserAccount", actorEmail: SUPERVISOR, metadata: { method: "credentials" } },
          { createdAt: utcDate(8, 30, 16), action: "SALE_APPROVED", result: "SUCCESS", resourceType: "Sale", resourceId: pickSaleId(), actorEmail: ADMIN },
          { createdAt: utcDate(9, 1, 12), action: "LOGIN_SUCCESS", result: "SUCCESS", resourceType: "UserAccount", actorEmail: ADMIN, metadata: { method: "credentials" } },
          { createdAt: utcDate(9, 1, 14), action: "EMPLOYEE_UPDATED", result: "SUCCESS", resourceType: "Employee", resourceId: DIEGO_ID, actorEmail: ADMIN, metadata: { fields: ["phone"] } },
          { createdAt: utcDate(9, 2, 13), action: "LOGIN_SUCCESS", result: "SUCCESS", resourceType: "UserAccount", actorEmail: SELLER, metadata: { method: "credentials" } },
          { createdAt: utcDate(9, 2, 15), action: "SALE_SUBMITTED", result: "SUCCESS", resourceType: "Sale", resourceId: pickSaleId(), actorEmail: SELLER },
          { createdAt: utcDate(9, 3, 12), action: "LOGIN_SUCCESS", result: "SUCCESS", resourceType: "UserAccount", actorEmail: SUPERVISOR, metadata: { method: "credentials" } },
          { createdAt: utcDate(9, 3, 16), action: "SALE_APPROVED", result: "SUCCESS", resourceType: "Sale", resourceId: pickSaleId(), actorEmail: ADMIN },

          // Activity window (last 7 days)
          { createdAt: utcDate(9, 4, 12), action: "LOGIN_SUCCESS", result: "SUCCESS", resourceType: "UserAccount", actorEmail: ADMIN, metadata: { method: "credentials" } },
          { createdAt: utcDate(9, 4, 15), action: "SALE_CREATED", result: "SUCCESS", resourceType: "Sale", resourceId: pickSaleId(), actorEmail: SELLER },
          { createdAt: utcDate(9, 4, 18), action: "LOGOUT", result: "SUCCESS", resourceType: "UserAccount", actorEmail: ADMIN },

          { createdAt: utcDate(9, 5, 12), action: "LOGIN_SUCCESS", result: "SUCCESS", resourceType: "UserAccount", actorEmail: SUPERVISOR, metadata: { method: "credentials" } },
          { createdAt: utcDate(9, 5, 14), action: "LOGIN_FAILURE", result: "FAILURE", resourceType: "UserAccount", actorEmail: "invitado@royalprestige.com", metadata: { reason: "User not found" } },
          { createdAt: utcDate(9, 5, 16), action: "SALE_APPROVED", result: "SUCCESS", resourceType: "Sale", resourceId: pickSaleId(), actorEmail: ADMIN },

          { createdAt: utcDate(9, 6, 12), action: "LOGIN_SUCCESS", result: "SUCCESS", resourceType: "UserAccount", actorEmail: ADMIN, metadata: { method: "credentials" } },
          { createdAt: utcDate(9, 6, 14), action: "AUTHORIZATION_DENIED", result: "DENIED", resourceType: "Employee", resourceId: MARIA_ID, actorEmail: SELLER, metadata: { permission: "employee.update", reason: "insufficient_level", scope: "TEAM" } },
          { createdAt: utcDate(9, 6, 15), action: "SALE_CREATED", result: "SUCCESS", resourceType: "Sale", resourceId: pickSaleId(), actorEmail: SELLER },

          { createdAt: utcDate(9, 7, 12), action: "LOGIN_SUCCESS", result: "SUCCESS", resourceType: "UserAccount", actorEmail: SELLER, metadata: { method: "credentials" } },
          { createdAt: utcDate(9, 7, 13), action: "LOGIN_FAILURE", result: "FAILURE", resourceType: "UserAccount", actorEmail: ANA, metadata: { reason: "Invalid password" } },
          { createdAt: utcDate(9, 7, 17), action: "PASSWORD_CHANGED", result: "SUCCESS", resourceType: "UserAccount", actorEmail: ADMIN, metadata: { method: "self_service" } },

          { createdAt: utcDate(9, 8, 12), action: "LOGIN_SUCCESS", result: "SUCCESS", resourceType: "UserAccount", actorEmail: SUPERVISOR, metadata: { method: "credentials" } },
          { createdAt: utcDate(9, 8, 14), action: "AUTHORIZATION_DENIED", result: "DENIED", resourceType: "CommissionEntry", resourceId: null, actorEmail: ANA, metadata: { permission: "commission.rule.manage", reason: "insufficient_level" } },
          { createdAt: utcDate(9, 8, 16), action: "SALE_APPROVED", result: "SUCCESS", resourceType: "Sale", resourceId: pickSaleId(), actorEmail: SUPERVISOR },

          { createdAt: utcDate(9, 9, 12), action: "LOGIN_SUCCESS", result: "SUCCESS", resourceType: "UserAccount", actorEmail: ADMIN, metadata: { method: "credentials" } },
          { createdAt: utcDate(9, 9, 14), action: "AUTHORIZATION_DENIED", result: "DENIED", resourceType: "Sale", resourceId: pickSaleId(), actorEmail: SELLER, metadata: { permission: "sale.approve", reason: "insufficient_level" } },
          { createdAt: utcDate(9, 9, 16), action: "SALE_APPROVED", result: "SUCCESS", resourceType: "Sale", resourceId: pickSaleId(), actorEmail: ADMIN },

          { createdAt: utcDate(9, 10, 9), action: "LOGIN_SUCCESS", result: "SUCCESS", resourceType: "UserAccount", actorEmail: SUPERVISOR, metadata: { method: "credentials" } },
          { createdAt: utcDate(9, 10, 10), action: "AUTHORIZATION_DENIED", result: "DENIED", resourceType: "Authorization", resourceId: null, actorEmail: ANA, metadata: { permission: "team.read", reason: "out_of_scope" } },
          { createdAt: utcDate(9, 10, 11), action: "LOGIN_FAILURE", result: "FAILURE", resourceType: "UserAccount", actorEmail: SELLER, metadata: { reason: "Invalid password" } },
          { createdAt: utcDate(9, 10, 12), action: "SALE_CREATED", result: "SUCCESS", resourceType: "Sale", resourceId: pickSaleId(), actorEmail: SELLER },
        ];

        for (const event of events) {
          const { actorEmail, ...rest } = event;
          const identity = actorEmail ? actor(actorEmail) : {};
          await tx.auditEvent.create({
            data: {
              ...identity,
              ...rest,
              resourceId: rest.resourceId ?? null,
              metadata: rest.metadata ?? undefined,
            },
          });
        }
      }

      // -----------------------------------------------------------------
      // 7. Employee progress points (feeds team progression summary and
      //    monthly target bonuses)
      // -----------------------------------------------------------------
      if (runProgress) {
        console.log("Creating demo progress entries...");

        const teamEmails = [
          "carlos.lopez@royalprestige.com",
          "ana.martinez@royalprestige.com",
          "promocion.test@royalprestige.com",
          "sofia.torres@royalprestige.com",
          "diego.paz@royalprestige.com",
          "valentina.ruiz@royalprestige.com",
          "maria.garcia@royalprestige.com",
        ];
        const employees = await tx.employee.findMany({
          where: { email: { in: teamEmails } },
          select: { id: true, email: true, joinedAt: true },
        });

        const approvedSales = await tx.sale.findMany({
          where: { status: "APPROVED" },
          select: { employeeId: true, saleDate: true },
        });

        const monthsBetween = (from: Date, to: Date): number =>
          (to.getUTCFullYear() - from.getUTCFullYear()) * 12 +
          (to.getUTCMonth() - from.getUTCMonth());

        const octoberSales = approvedSales.filter(
          (s) => s.saleDate >= utcDate(9, 1) && s.saleDate <= utcDate(9, 31),
        );
        const septemberSales = approvedSales.filter(
          (s) => s.saleDate >= utcDate(8, 1) && s.saleDate < utcDate(9, 1),
        );

        type ProgressRow = {
          employeeId: string;
          type: "SENIORITY" | "VISIT" | "SALE" | "TARGET_ACHIEVED";
          points: number;
          description: string;
          period: string | null;
        };

        const rows: ProgressRow[] = [];

        for (const employee of employees) {
          rows.push({
            employeeId: employee.id,
            type: "SENIORITY",
            points: monthsBetween(employee.joinedAt, utcDate(9, 1)),
            description: "Antigüedad acumulada en la empresa",
            period: null,
          });

          const octSales = octoberSales.filter(
            (s) => s.employeeId === employee.id,
          ).length;
          const sepSales = septemberSales.filter(
            (s) => s.employeeId === employee.id,
          ).length;

          if (octSales > 0) {
            rows.push({
              employeeId: employee.id,
              type: "SALE",
              points: octSales * 5,
              description: `Ventas aprobadas del mes (${octSales})`,
              period: "2026-10",
            });
          }
          if (sepSales > 0) {
            rows.push({
              employeeId: employee.id,
              type: "SALE",
              points: sepSales * 5,
              description: `Ventas aprobadas de septiembre (${sepSales})`,
              period: "2026-09",
            });
          }

          rows.push({
            employeeId: employee.id,
            type: "VISIT",
            points: randInt(2, 5) * 2,
            description: "Visitas completadas del mes",
            period: "2026-10",
          });
          rows.push({
            employeeId: employee.id,
            type: "VISIT",
            points: randInt(2, 6) * 2,
            description: "Visitas completadas de septiembre",
            period: "2026-09",
          });
        }

        // Monthly target bonuses (N1 achieved October and September)
        const targetAchievers = employees.filter((e) =>
          [
            "carlos.lopez@royalprestige.com",
            "sofia.torres@royalprestige.com",
            "ana.martinez@royalprestige.com",
            "promocion.test@royalprestige.com",
          ].includes(e.email ?? ""),
        );
        for (const employee of targetAchievers) {
          rows.push({
            employeeId: employee.id,
            type: "TARGET_ACHIEVED",
            points: 10,
            description: "Objetivo mensual alcanzado",
            period: "2026-10",
          });
          rows.push({
            employeeId: employee.id,
            type: "TARGET_ACHIEVED",
            points: 10,
            description: "Objetivo mensual alcanzado",
            period: "2026-09",
          });
        }

        await tx.employeeProgress.createMany({ data: rows });
      }
    },
    { maxWait: 10_000, timeout: 60_000 },
  );

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  const counts = {
    employees: await prisma.employee.count(),
    products: await prisma.product.count(),
    productCategories: await prisma.productCategory.count(),
    visits: await prisma.visit.count(),
    sales: await prisma.sale.count(),
    saleItems: await prisma.saleItem.count(),
    commissionEntries: await prisma.commissionEntry.count(),
    auditEvents: await prisma.auditEvent.count(),
    progressEntries: await prisma.employeeProgress.count(),
  };
  console.log("Demo data summary:", counts);
  console.log("Demo seed completed successfully!");
}

type Tx = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

async function createDemoSale(
  tx: Tx,
  params: {
    sellerId: string;
    saleDate: Date;
    status:
      | "APPROVED"
      | "PENDING_REVIEW"
      | "REJECTED"
      | "CANCELLED"
      | "DRAFT";
    products: Array<{ id: string; price: unknown }>;
    clients: Array<{ id: string }>;
    rejectionReasons: readonly string[];
    paymentMethods: readonly string[];
  },
): Promise<void> {
  const { sellerId, saleDate, status, products, clients } = params;

  const itemCount = randInt(1, 3);
  const items: Array<{ productId: string; quantity: number; unitPrice: number; subtotal: number }> = [];
  const used = new Set<string>();
  for (let i = 0; i < itemCount; i++) {
    const product = pick(products);
    if (used.has(product.id)) continue;
    used.add(product.id);
    const quantity = randInt(1, 3);
    const unitPrice = Number(product.price);
    items.push({
      productId: product.id,
      quantity,
      unitPrice,
      subtotal: round2(unitPrice * quantity),
    });
  }
  if (items.length === 0) return;

  const totalAmount = round2(
    items.reduce((sum, item) => sum + item.subtotal, 0),
  );
  const approved = status === "APPROVED";
  const paymentMethod = approved ? pick(params.paymentMethods) : null;

  const sale = await tx.sale.create({
    data: {
      employeeId: sellerId,
      saleDate,
      status,
      totalAmount,
      approvedAt: approved
        ? new Date(saleDate.getTime() + 4 * 60 * 60 * 1000)
        : null,
      buyerName: pick(BUYER_NAMES),
      rejectionReason:
        status === "REJECTED" ? pick(params.rejectionReasons) : null,
      notes: status === "CANCELLED" ? "Cancelada por el cliente." : null,
      clientId: clients.length > 0 ? pick(clients).id : null,
      paymentMethod,
      paymentStatus: approved ? "PAID" : null,
    },
  });

  await tx.saleItem.createMany({
    data: items.map((item) => ({ ...item, saleId: sale.id })),
  });
}

main()
  .catch((error) => {
    console.error("Demo seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
