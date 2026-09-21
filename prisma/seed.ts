/**
 * Development seed script.
 *
 * Creates test data for development and testing:
 * - Commercial levels (1-7)
 * - ADMIN user (admin@royalprestige.com / admin123)
 * - Level 3 supervisor (supervisor@royalprestige.com / supervisor123)
 * - Level 1 seller (seller@royalprestige.com / seller123)
 * - Product categories
 * - Products
 *
 * Run with: npx prisma db seed
 *
 * WARNING: Development only. Do not use in production.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const prisma = (() => {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  return new PrismaClient({ adapter });
})();

async function main() {
  console.log("Seeding database...");

  // =========================================================================
  // Clean all tables (respecting FK order)
  // =========================================================================
  console.log("Cleaning existing data...");

  await prisma.$executeRawUnsafe("TRUNCATE TABLE training_material CASCADE");
  await prisma.$executeRawUnsafe("TRUNCATE TABLE training_module CASCADE");
  await prisma.$executeRawUnsafe("TRUNCATE TABLE training_course CASCADE");
  await prisma.$executeRawUnsafe("TRUNCATE TABLE training_category CASCADE");
  await prisma.$executeRawUnsafe("TRUNCATE TABLE monthly_target CASCADE");
  await prisma.$executeRawUnsafe("TRUNCATE TABLE audit_event CASCADE");
  await prisma.$executeRawUnsafe("TRUNCATE TABLE employee_level_history CASCADE");
  await prisma.$executeRawUnsafe("TRUNCATE TABLE employee_supervisor_history CASCADE");
  await prisma.$executeRawUnsafe("TRUNCATE TABLE commission_entry CASCADE");
  await prisma.$executeRawUnsafe("TRUNCATE TABLE referral_contact CASCADE");
  await prisma.$executeRawUnsafe("TRUNCATE TABLE sale_item CASCADE");
  await prisma.$executeRawUnsafe("TRUNCATE TABLE sale CASCADE");
  await prisma.$executeRawUnsafe("TRUNCATE TABLE visit CASCADE");
  await prisma.$executeRawUnsafe("TRUNCATE TABLE client CASCADE");
  await prisma.$executeRawUnsafe("TRUNCATE TABLE password_reset_token CASCADE");
  await prisma.$executeRawUnsafe("TRUNCATE TABLE user_account CASCADE");
  await prisma.$executeRawUnsafe("TRUNCATE TABLE employee CASCADE");
  await prisma.$executeRawUnsafe("TRUNCATE TABLE product CASCADE");
  await prisma.$executeRawUnsafe("TRUNCATE TABLE product_category CASCADE");
  await prisma.$executeRawUnsafe("TRUNCATE TABLE commission_rule CASCADE");
  await prisma.$executeRawUnsafe("TRUNCATE TABLE level CASCADE");

  // =========================================================================
  // Levels
  // =========================================================================
  console.log("Creating levels...");

  const levels = [
    { id: 1, code: "N1", rank: 1, name: "Vendedor" },
    { id: 2, code: "N2", rank: 2, name: "Vendedor Junior" },
    { id: 3, code: "N3", rank: 3, name: "Distribuidor" },
    { id: 4, code: "N4", rank: 4, name: "Blue" },
    { id: 5, code: "N5", rank: 5, name: "Royal" },
    { id: 6, code: "N6", rank: 6, name: "Premier" },
    { id: 7, code: "N7", rank: 7, name: "Max" },
  ];

  for (const level of levels) {
    await prisma.level.upsert({
      where: { id: level.id },
      update: {},
      create: level,
    });
  }

  // =========================================================================
  // Commission rules
  // =========================================================================
  // Development reference data. Rules are versioned rows; future changes must
  // create a new version instead of mutating historical entries.
  const commissionRuleEffectiveFrom = new Date("2026-01-01T00:00:00.000Z");
  const commissionRates = [15, 20, 30, 40, 50, 60, 70] as const;

  for (const [index, percentage] of commissionRates.entries()) {
    const levelId = index + 1;
    const existingRule = await prisma.commissionRule.findFirst({
      where: { levelId, effectiveFrom: commissionRuleEffectiveFrom },
    });

    if (!existingRule) {
      await prisma.commissionRule.create({
        data: {
          levelId,
          percentage,
          effectiveFrom: commissionRuleEffectiveFrom,
        },
      });
    }
  }

  // =========================================================================
  // Employees
  // =========================================================================
  console.log("Creating employees...");

  // ADMIN employee (no level)
  await prisma.employee.upsert({
    where: { id: "04a05803-44c5-4c77-b770-de0145e95807" },
    update: {},
    create: {
      id: "04a05803-44c5-4c77-b770-de0145e95807",
      employeeCode: 1,
      firstName: "Admin",
      lastName: "Sistema",
      dni: "00000000",
      email: "admin@royalprestige.com",
      phone: "11-0000-0000",
      dateOfBirth: new Date("1980-01-01"),
      joinedAt: new Date("2024-01-01"),
      currentLevelId: null,
      supervisorId: null,
      status: "ACTIVE",
    },
  });

  // Level 3 supervisor
  await prisma.employee.upsert({
    where: { id: "8d918473-082c-4527-86e8-5afc259f3791" },
    update: {},
    create: {
      id: "8d918473-082c-4527-86e8-5afc259f3791",
      employeeCode: 2,
      firstName: "María",
      lastName: "García",
      dni: "30123456",
      email: "maria.garcia@royalprestige.com",
      phone: "11-5555-0001",
      dateOfBirth: new Date("1985-03-15"),
      joinedAt: new Date("2023-06-15"),
      currentLevelId: 3,
      supervisorId: null,
      status: "ACTIVE",
      street: "Av. Libertador",
      streetNumber: "1234",
      floor: "5",
      apartment: "B",
      city: "Buenos Aires",
      province: "CABA",
      postalCode: "C1425",
    },
  });

  // Level 1 seller (under supervisor)
  await prisma.employee.upsert({
    where: { id: "235b0ce6-e053-442b-a2b5-fe75557a560f" },
    update: {},
    create: {
      id: "235b0ce6-e053-442b-a2b5-fe75557a560f",
      employeeCode: 3,
      firstName: "Carlos",
      lastName: "López",
      dni: "40123456",
      email: "carlos.lopez@royalprestige.com",
      phone: "11-5555-0002",
      dateOfBirth: new Date("1990-07-22"),
      joinedAt: new Date("2024-03-01"),
      currentLevelId: 1,
      supervisorId: "8d918473-082c-4527-86e8-5afc259f3791",
      status: "ACTIVE",
      street: "Calle Falsa",
      streetNumber: "456",
      city: "Buenos Aires",
      province: "CABA",
      postalCode: "C1000",
    },
  });

  // Level 1 seller without supervisor (for testing OWN scope)
  await prisma.employee.upsert({
    where: { id: "45b2ffb4-cb07-41e7-8e0e-d0eaec7f5c24" },
    update: {},
    create: {
      id: "45b2ffb4-cb07-41e7-8e0e-d0eaec7f5c24",
      employeeCode: 4,
      firstName: "Ana",
      lastName: "Martínez",
      dni: "41123456",
      email: "ana.martinez@royalprestige.com",
      phone: "11-5555-0003",
      dateOfBirth: new Date("1992-11-10"),
      joinedAt: new Date("2024-06-01"),
      currentLevelId: 1,
      supervisorId: null,
      status: "ACTIVE",
    },
  });

  // =========================================================================
  // User Accounts
  // =========================================================================
  console.log("Creating user accounts...");

  const passwordHash = await bcrypt.hash("admin123", 12);
  const supervisorHash = await bcrypt.hash("supervisor123", 12);
  const sellerHash = await bcrypt.hash("seller123", 12);

  await prisma.userAccount.upsert({
    where: { id: "3b728855-bc4c-4f01-b4cb-39969337511b" },
    update: {},
    create: {
      id: "3b728855-bc4c-4f01-b4cb-39969337511b",
      employeeId: "04a05803-44c5-4c77-b770-de0145e95807",
      email: "admin@royalprestige.com",
      passwordHash,
      status: "ACTIVE",
      mustChangePassword: false,
    },
  });

  await prisma.userAccount.upsert({
    where: { id: "99f76732-8a4f-4878-84cd-7c49053433da" },
    update: {},
    create: {
      id: "99f76732-8a4f-4878-84cd-7c49053433da",
      employeeId: "8d918473-082c-4527-86e8-5afc259f3791",
      email: "supervisor@royalprestige.com",
      passwordHash: supervisorHash,
      status: "ACTIVE",
      mustChangePassword: false,
    },
  });

  await prisma.userAccount.upsert({
    where: { id: "3435224e-b4be-44f3-8d65-b55b3b642896" },
    update: {},
    create: {
      id: "3435224e-b4be-44f3-8d65-b55b3b642896",
      employeeId: "235b0ce6-e053-442b-a2b5-fe75557a560f",
      email: "seller@royalprestige.com",
      passwordHash: sellerHash,
      status: "ACTIVE",
      mustChangePassword: false,
    },
  });

  await prisma.userAccount.upsert({
    where: { id: "0ad45491-5787-4101-aa8b-a0b7ed16fa6d" },
    update: {},
    create: {
      id: "0ad45491-5787-4101-aa8b-a0b7ed16fa6d",
      employeeId: "45b2ffb4-cb07-41e7-8e0e-d0eaec7f5c24",
      email: "ana@royalprestige.com",
      passwordHash: sellerHash,
      status: "ACTIVE",
      mustChangePassword: false,
    },
  });

  // =========================================================================
  // Clients for María García (development reference data)
  // =========================================================================
  console.log("Creating sample clients for María García...");

  const mariaEmployeeId = "8d918473-082c-4527-86e8-5afc259f3791";

  const sampleClients = [
    ["3ce656bd-07b3-4412-8d0f-2e13642a0ab5", "100", "Lucía Fernández", "11-5550-0100"],
    ["1ceceb52-cd25-40e6-8041-e5cb3c8c3ea5", "101", "Joaquín Ramírez", "11-5550-0101"],
    ["3c727afa-776b-4338-bdb9-edca9f5eb582", "102", "Valentina Torres", "11-5550-0102"],
    ["8bd1195b-14ad-4f8b-89c5-02e379e46892", "103", "Mateo González", "11-5550-0103"],
    ["d622a09e-deda-4b63-86bf-635a0dae44e4", "104", "Sofía Rodríguez", "11-5550-0104"],
    ["89905cd9-60f1-45b9-a5a4-7bd5a9837fd7", "105", "Tomás Silva", "11-5550-0105"],
    ["b9452ee1-2b2c-4c76-8236-f8f514052f84", "106", "Camila Sosa", "11-5550-0106"],
    ["41add1f1-e7a4-4522-9a8a-c1dec9ca0c16", "107", "Benjamín Castro", "11-5550-0107"],
    ["853184d4-3bd3-4aa9-b1fd-8f590f3eb01b", "108", "Martina López", "11-5550-0108"],
    ["b3a8bc4b-9f91-4f6a-aacb-d8ebda9e66eb", "109", "Santiago Morales", "11-5550-0109"],
    ["21734b71-44d7-48aa-9b88-1995485e4e77", "110", "Julieta Ortiz", "11-5550-0110"],
    ["17e25f69-21c6-4a1a-b86f-08d22923dd22", "111", "Nicolás Núñez", "11-5550-0111"],
    ["3a9593ed-1fa8-4eb1-85bb-5c142587edf3", "112", "Renata Vega", "11-5550-0112"],
    ["7dc37378-8d10-431a-addc-3f12837a2ade", "113", "Facundo Molina", "11-5550-0113"],
    ["68590b69-1837-4451-96cb-5bf0ce180e02", "114", "Emilia Rojas", "11-5550-0114"],
    ["4461a9fb-779c-4a50-8725-f0c07a1a33b3", "115", "Franco Herrera", "11-5550-0115"],
    ["9ca5c815-514e-4096-aacd-751c62231c83", "116", "Agustina Pereyra", "11-5550-0116"],
    ["5dc1b360-2654-4cfc-8a8d-04addec9b5fb", "117", "Máximo Cabrera", "11-5550-0117"],
    ["f7e43aff-ee67-49de-92c5-e85db7fd5b86", "118", "Pilar Acosta", "11-5550-0118"],
    ["8fdb8a6d-1bcd-43dd-800b-cf5fe122f2d3", "119", "Gonzalo Benítez", "11-5550-0119"],
  ] as const;

  for (const [clientId, suffix, name, phone] of sampleClients) {
    await prisma.client.upsert({
      where: { id: clientId },
      update: {
        name,
        documentNumber: `20${Number(suffix) + 10000000}`,
        phone,
        email: `cliente${suffix}@example.com`,
        address: `Calle ${Number(suffix) - 90} ${100 + Number(suffix)}, Buenos Aires`,
        street: `Calle ${Number(suffix) - 90}`,
        streetNumber: String(100 + Number(suffix)),
        city: "Buenos Aires",
        province: "CABA",
        postalCode: `10${Number(suffix)}`,
        addressNotes: "Domicilio de prueba para visita.",
        ownerEmployeeId: mariaEmployeeId,
      },
      create: {
        id: clientId,
        name,
        documentNumber: `20${Number(suffix) + 10000000}`,
        phone,
        email: `cliente${suffix}@example.com`,
        address: `Calle ${Number(suffix) - 90} ${100 + Number(suffix)}, Buenos Aires`,
        street: `Calle ${Number(suffix) - 90}`,
        streetNumber: String(100 + Number(suffix)),
        city: "Buenos Aires",
        province: "CABA",
        postalCode: `10${Number(suffix)}`,
        addressNotes: "Domicilio de prueba para visita.",
        ownerEmployeeId: mariaEmployeeId,
      },
    });
  }

  // =========================================================================
  // Development visits assigned to Carlos López
  // =========================================================================
  console.log("Recreating sample visits for Carlos López...");

  const carlosEmployeeId = "235b0ce6-e053-442b-a2b5-fe75557a560f";

  const sampleVisits = [
    ["0e7e57ba-4775-4f48-a65a-3da99bfc844a", "3ce656bd-07b3-4412-8d0f-2e13642a0ab5", "2026-09-15"],
    ["2a7b78a1-baaf-4b06-8ac9-81d573598d01", "1ceceb52-cd25-40e6-8041-e5cb3c8c3ea5", "2026-09-16"],
    ["a5703f3d-f639-4e1c-869a-141f1347589a", "3c727afa-776b-4338-bdb9-edca9f5eb582", "2026-09-17"],
    ["444031a3-130e-4d9c-8124-5a491db9dd16", "8bd1195b-14ad-4f8b-89c5-02e379e46892", "2026-09-18"],
  ] as const;

  for (const [visitId, clientId, scheduledDate] of sampleVisits) {
    await prisma.visit.create({
      data: {
        id: visitId,
        sellerId: carlosEmployeeId,
        clientId,
        assignedById: mariaEmployeeId,
        scheduledDate: new Date(`${scheduledDate}T12:00:00.000Z`),
        status: "ASSIGNED",
        notes: "Visita de prueba para validar el flujo de resultados.",
      },
    });
  }

  // =========================================================================
  // Level History
  // =========================================================================
  console.log("Creating level history...");

  for (const empId of [
    "8d918473-082c-4527-86e8-5afc259f3791",
    "235b0ce6-e053-442b-a2b5-fe75557a560f",
    "45b2ffb4-cb07-41e7-8e0e-d0eaec7f5c24",
  ]) {
    const emp = await prisma.employee.findUnique({ where: { id: empId } });
    if (emp?.currentLevelId) {
      const existingHistory = await prisma.employeeLevelHistory.findFirst({
        where: { employeeId: empId, endedAt: null },
      });
      if (!existingHistory) {
        await prisma.employeeLevelHistory.create({
          data: {
            employeeId: empId,
            levelId: emp.currentLevelId,
            startedAt: emp.joinedAt,
          },
        });
      }
    }
  }

  // =========================================================================
  // Product Categories
  // =========================================================================
  console.log("Creating product categories...");

  const skinCare = await prisma.productCategory.upsert({
    where: { id: "349298ab-17ab-4c66-93d8-9436b2701690" },
    update: {},
    create: {
      id: "349298ab-17ab-4c66-93d8-9436b2701690",
      name: "Cuidado de la Piel",
      description: "Productos para el cuidado facial y corporal",
    },
  });

  const fragrance = await prisma.productCategory.upsert({
    where: { id: "9e292f95-36a2-49dd-837a-e7646cbbb3da" },
    update: {},
    create: {
      id: "9e292f95-36a2-49dd-837a-e7646cbbb3da",
      name: "Fragancias",
      description: "Perfumes y fragancias para hombre y mujer",
    },
  });

  const makeup = await prisma.productCategory.upsert({
    where: { id: "974b1b1b-d847-407a-87cd-a970d5ccedbc" },
    update: {},
    create: {
      id: "974b1b1b-d847-407a-87cd-a970d5ccedbc",
      name: "Maquillaje",
      description: "Productos de maquillaje y belleza",
    },
  });

  // =========================================================================
  // Products
  // =========================================================================
  console.log("Creating products...");

  await prisma.product.upsert({
    where: { id: "559e01bc-d819-4dce-9de7-351ab47308ad" },
    update: {},
    create: {
      id: "559e01bc-d819-4dce-9de7-351ab47308ad",
      code: "CP-001",
      name: "Crema Hidratante Facial",
      description: "Crema hidratante para todo tipo de piel",
      price: 45.99,
      categoryId: skinCare.id,
      isActive: true,
    },
  });

  await prisma.product.upsert({
    where: { id: "c450c4c9-8fd8-4401-8a67-84c606d17882" },
    update: {},
    create: {
      id: "c450c4c9-8fd8-4401-8a67-84c606d17882",
      code: "CP-002",
      name: "Serum Vitamina C",
      description: "Serum antioxidante con vitamina C pura",
      price: 62.50,
      categoryId: skinCare.id,
      isActive: true,
    },
  });

  await prisma.product.upsert({
    where: { id: "1749c8d0-1dee-44e2-a3e3-0846dc60adcc" },
    update: {},
    create: {
      id: "1749c8d0-1dee-44e2-a3e3-0846dc60adcc",
      code: "FR-001",
      name: "Eau de Parfum Royal",
      description: "Fragancia floral para mujer",
      price: 89.00,
      categoryId: fragrance.id,
      isActive: true,
    },
  });

  await prisma.product.upsert({
    where: { id: "71afa9e3-ad27-4d6e-b1c2-4501afad9ce9" },
    update: {},
    create: {
      id: "71afa9e3-ad27-4d6e-b1c2-4501afad9ce9",
      code: "FR-002",
      name: "Colonia Prestige",
      description: "Fragancia cítrica para hombre",
      price: 75.00,
      categoryId: fragrance.id,
      isActive: true,
    },
  });

  await prisma.product.upsert({
    where: { id: "8fb0f8b3-2c35-4188-9a13-cbb04105e312" },
    update: {},
    create: {
      id: "8fb0f8b3-2c35-4188-9a13-cbb04105e312",
      code: "MQ-001",
      name: "Base de Maquillaje",
      description: "Base líquida de cobertura media",
      price: 38.75,
      categoryId: makeup.id,
      isActive: true,
    },
  });

  await prisma.product.upsert({
    where: { id: "495bddd0-f528-4bd6-a239-7ec66b4665c6" },
    update: {},
    create: {
      id: "495bddd0-f528-4bd6-a239-7ec66b4665c6",
      code: "CP-003",
      name: "Protector Solar FPS 50",
      description: "Protector solar facial de amplio espectro",
      price: 32.00,
      categoryId: skinCare.id,
      isActive: false,
    },
  });

  // =========================================================================
  // Training Content
  // =========================================================================
  console.log("Creating training content...");

  // --- Category 1: Productos ---
  const catProductos = await prisma.trainingCategory.upsert({
    where: { id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d" },
    update: {},
    create: {
      id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
      name: "Productos y Catálogo",
      description: "Conocimiento del producto, catálogo y técnicas de presentación",
    },
  });

  const courseConocimiento = await prisma.trainingCourse.upsert({
    where: { id: "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e" },
    update: {},
    create: {
      id: "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
      categoryId: catProductos.id,
      name: "Conocimiento de Producto",
      description: "Aprende sobre nuestra línea de productos, ingredientes y beneficios",
      status: "PUBLISHED",
    },
  });

  const modIngredientes = await prisma.trainingModule.create({
    data: {
      courseId: courseConocimiento.id,
      name: "Ingredientes Activos",
      description: "Componentes clave de nuestros productos",
      sortOrder: 1,
    },
  });

  await prisma.trainingMaterial.create({
    data: {
      moduleId: modIngredientes.id,
      name: "Guía de Ingredientes - Crema Hidratante",
      description: "Ingredientes principales y sus beneficios para la piel",
      type: "PDF",
      url: "https://example.com/docs/guia-ingredientes-crema.pdf",
      levelId: null, // Global: todos los niveles
      status: "PUBLISHED",
    },
  });

  await prisma.trainingMaterial.create({
    data: {
      moduleId: modIngredientes.id,
      name: "Video: Cómo explicar ingredientes al cliente",
      description: "Técnicas para comunicar los beneficios de los ingredientes",
      type: "VIDEO",
      url: "https://youtube.com/watch?v=example1",
      levelId: 1, // Solo N1 y superiores
      status: "PUBLISHED",
    },
  });

  const modCatalogo = await prisma.trainingModule.create({
    data: {
      courseId: courseConocimiento.id,
      name: "Manejo del Catálogo",
      description: "Cómo utilizar y presentar el catálogo de productos",
      sortOrder: 2,
    },
  });

  await prisma.trainingMaterial.create({
    data: {
      moduleId: modCatalogo.id,
      name: "Catálogo Virtual 2026",
      description: "Catálogo completo de productos Royal Prestige",
      type: "PDF",
      url: "https://example.com/docs/catalogo-2026.pdf",
      levelId: null,
      status: "PUBLISHED",
    },
  });

  await prisma.trainingMaterial.create({
    data: {
      moduleId: modCatalogo.id,
      name: "Video: Presentación del catálogo",
      description: "Cómo mostrar el catálogo a los clientes de forma efectiva",
      type: "VIDEO",
      url: "https://youtube.com/watch?v=example2",
      levelId: 2, // N2 y superiores
      status: "PUBLISHED",
    },
  });

  // --- Category 2: Técnicas de Venta ---
  const catVentas = await prisma.trainingCategory.upsert({
    where: { id: "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f" },
    update: {},
    create: {
      id: "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f",
      name: "Técnicas de Venta",
      description: "Estrategias y habilidades para vender de manera efectiva",
    },
  });

  const courseBasico = await prisma.trainingCourse.upsert({
    where: { id: "d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80" },
    update: {},
    create: {
      id: "d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80",
      categoryId: catVentas.id,
      name: "Ventas Básicas",
      description: "Fundamentos de la venta y atención al cliente",
      status: "PUBLISHED",
    },
  });

  const modAtencion = await prisma.trainingModule.create({
    data: {
      courseId: courseBasico.id,
      name: "Atención al Cliente",
      description: "Primeros pasos en la interacción con el cliente",
      sortOrder: 1,
    },
  });

  await prisma.trainingMaterial.create({
    data: {
      moduleId: modAtencion.id,
      name: "Manual de Atención al Cliente",
      description: "Guía completa para una excelente atención",
      type: "PDF",
      url: "https://example.com/docs/manual-atencion.pdf",
      levelId: 1,
      status: "PUBLISHED",
    },
  });

  await prisma.trainingMaterial.create({
    data: {
      moduleId: modAtencion.id,
      name: "Enlace: Plantilla de seguimiento",
      description: "Hoja de cálculo para registrar seguimiento a clientes",
      type: "LINK",
      url: "https://docs.google.com/spreadsheets/d/example",
      levelId: null,
      status: "PUBLISHED",
    },
  });

  const modCierre = await prisma.trainingModule.create({
    data: {
      courseId: courseBasico.id,
      name: "Técnicas de Cierre",
      description: "Estrategias para concretar la venta",
      sortOrder: 2,
    },
  });

  await prisma.trainingMaterial.create({
    data: {
      moduleId: modCierre.id,
      name: "Guía de Cierre de Ventas",
      description: "Las 5 técnicas de cierre más efectivas",
      type: "PDF",
      url: "https://example.com/docs/guia-cierre.pdf",
      levelId: 3, // N3 y superiores
      status: "PUBLISHED",
    },
  });

  await prisma.trainingMaterial.create({
    data: {
      moduleId: modCierre.id,
      name: "Video: Ejemplos de cierre en campo",
      description: "Demostraciones reales de técnicas de cierre",
      type: "VIDEO",
      url: "https://youtube.com/watch?v=example3",
      levelId: 3,
      status: "PUBLISHED",
    },
  });

  const courseAvanzado = await prisma.trainingCourse.upsert({
    where: { id: "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8091" },
    update: {},
    create: {
      id: "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8091",
      categoryId: catVentas.id,
      name: "Ventas Avanzadas",
      description: "Estrategias avanzadas para vendedores experimentados",
      status: "DRAFT",
    },
  });

  const modNegociacion = await prisma.trainingModule.create({
    data: {
      courseId: courseAvanzado.id,
      name: "Negociación",
      description: "Técnicas de negociación para ventas de alto valor",
      sortOrder: 1,
    },
  });

  await prisma.trainingMaterial.create({
    data: {
      moduleId: modNegociacion.id,
      name: "Manual de Negociación Avanzada",
      description: "Estrategias para negociaciones complejas",
      type: "PDF",
      url: "https://example.com/docs/negociacion-avanzada.pdf",
      levelId: 5, // N5 y superiores
      status: "DRAFT",
    },
  });

  // --- Category 3: Empresa ---
  const catEmpresa = await prisma.trainingCategory.upsert({
    where: { id: "f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f809102" },
    update: {},
    create: {
      id: "f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f809102",
      name: "Conocimiento de la Empresa",
      description: "Historia, valores y cultura de Royal Prestige",
    },
  });

  const courseHistoria = await prisma.trainingCourse.upsert({
    where: { id: "a7b8c9d0-e1f2-4a3b-4c5d-6e7f80910213" },
    update: {},
    create: {
      id: "a7b8c9d0-e1f2-4a3b-4c5d-6e7f80910213",
      categoryId: catEmpresa.id,
      name: "Nuestra Empresa",
      description: "Historia, misión y valores de Royal Prestige",
      status: "PUBLISHED",
    },
  });

  const modValores = await prisma.trainingModule.create({
    data: {
      courseId: courseHistoria.id,
      name: "Valores y Cultura",
      description: "Los pilares que guían a Royal Prestige",
      sortOrder: 1,
    },
  });

  await prisma.trainingMaterial.create({
    data: {
      moduleId: modValores.id,
      name: "Presentación de la Empresa",
      description: "Historia y trayectoria de Royal Prestige",
      type: "PDF",
      url: "https://example.com/docs/historia-empresa.pdf",
      levelId: null,
      status: "PUBLISHED",
    },
  });

  await prisma.trainingMaterial.create({
    data: {
      moduleId: modValores.id,
      name: "Video: Mensaje del Fundador",
      description: "El fundador comparte la visión de la empresa",
      type: "VIDEO",
      url: "https://youtube.com/watch?v=example4",
      levelId: null,
      status: "PUBLISHED",
    },
  });

  console.log("Training content created!");

  // =========================================================================
  // Monthly Targets
  // =========================================================================
  console.log("Creating monthly targets...");

  const targetData = [
    { levelId: 1, targetSales: 10 },
    { levelId: 2, targetSales: 15 },
    { levelId: 3, targetSales: 10 },
    { levelId: 4, targetSales: 10 },
    { levelId: 5, targetSales: 10 },
    { levelId: 6, targetSales: 10 },
    { levelId: 7, targetSales: 10 },
  ];

  for (const target of targetData) {
    await prisma.monthlyTarget.upsert({
      where: { levelId: target.levelId },
      update: { targetSales: target.targetSales },
      create: {
        levelId: target.levelId,
        targetSales: target.targetSales,
      },
    });
  }

  console.log("Monthly targets created: N1=10, N2=15, N3-N7=10 per seller");

  console.log("Seed completed successfully!");
  console.log("");
  console.log("Test accounts:");
  console.log("  admin@royalprestige.com / admin123 (ADMIN)");
  console.log("  supervisor@royalprestige.com / supervisor123 (N3 Distribuidor)");
  console.log("  seller@royalprestige.com / seller123 (N1 Vendedor, under supervisor)");
  console.log("  ana@royalprestige.com / seller123 (N1 Vendedor, independent)");
  console.log("");
  console.log("Training content: 3 categories, 4 courses, 6 modules, 12 materials");
  console.log("Monthly targets: N1=10, N2=15, N3-N7=10 per seller");
  console.log("  - Productos y Catálogo: 2 modules, 4 materials (PDF + VIDEO)");
  console.log("  - Técnicas de Venta: 3 modules, 5 materials (PDF + VIDEO + LINK)");
  console.log("  - Conocimiento de la Empresa: 1 module, 2 materials (PDF + VIDEO)");
  console.log("  - Some materials are level-specific, some global");
  console.log("  - 1 course (Ventas Avanzadas) is DRAFT for ADMIN testing");

  await prisma.$disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  });
