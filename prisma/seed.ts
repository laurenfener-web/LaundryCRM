import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: ".env.local", override: true });
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  // --- User ---
  const hashed = await bcrypt.hash("staging123", 12);
  const user = await prisma.user.upsert({
    where: { email: "laurenfener@gmail.com" },
    update: {},
    create: {
      email: "laurenfener@gmail.com",
      name: "Lauren Fener",
      password: hashed,
      role: "ADMIN",
    },
  });
  console.log(`✓ User: ${user.email}`);

  // --- Vendors ---
  const vendorA = await prisma.vendor.create({
    data: {
      name: "Alliance Laundry Systems",
      category: "OEM",
      contactName: "Mike Torres",
      phone: "212-555-0101",
      email: "mtorres@alliancelaundry.example.com",
      address: "101 Industrial Blvd",
      city: "Ripon",
      state: "WI",
      zip: "54971",
    },
  });
  const vendorB = await prisma.vendor.create({
    data: {
      name: "NY Parts Direct",
      category: "Parts Supplier",
      contactName: "Sandra Kim",
      phone: "718-555-0204",
      email: "sandra@nypartsdirect.example.com",
      address: "44 Commerce St",
      city: "Brooklyn",
      state: "NY",
      zip: "11201",
    },
  });
  console.log("✓ Vendors");

  // --- Companies ---
  const companyA = await prisma.company.create({
    data: {
      name: "Greenpoint Properties LLC",
      industry: "Real Estate",
      type: "LLC",
      phone: "718-555-0310",
      email: "info@greenpointprop.example.com",
      address: "88 Franklin St",
      city: "Brooklyn",
      state: "NY",
      zip: "11222",
    },
  });
  const companyB = await prisma.company.create({
    data: {
      name: "Bronx Metro Realty",
      industry: "Real Estate",
      type: "Corp",
      phone: "718-555-0422",
      email: "contact@bronxmetro.example.com",
      address: "1200 Grand Concourse",
      city: "Bronx",
      state: "NY",
      zip: "10456",
    },
  });
  console.log("✓ Companies");

  // --- Owners ---
  await prisma.owner.create({
    data: {
      name: "David Rosenberg",
      title: "Managing Partner",
      email: "drosenberg@greenpointprop.example.com",
      phone: "718-555-0311",
      companyId: companyA.id,
    },
  });
  await prisma.owner.create({
    data: {
      name: "Carmen Diaz",
      title: "Property Manager",
      email: "cdiaz@bronxmetro.example.com",
      phone: "718-555-0423",
      companyId: companyB.id,
    },
  });
  console.log("✓ Owners");

  // --- Buildings ---
  const b1 = await prisma.building.create({
    data: {
      name: "88 Franklin",
      address: "88 Franklin St",
      city: "Brooklyn",
      state: "NY",
      zip: "11222",
      ownerName: "David Rosenberg",
      ownerEmail: "drosenberg@greenpointprop.example.com",
      ownerPhone: "718-555-0311",
      notes: "12-unit walk-up, coin-op laundry in basement",
    },
  });
  const b2 = await prisma.building.create({
    data: {
      name: "204 Meserole",
      address: "204 Meserole Ave",
      city: "Brooklyn",
      state: "NY",
      zip: "11222",
      ownerName: "David Rosenberg",
      ownerEmail: "drosenberg@greenpointprop.example.com",
      ownerPhone: "718-555-0311",
      notes: "20-unit, machines upgraded 2022",
    },
  });
  const b3 = await prisma.building.create({
    data: {
      name: "1200 Grand Concourse",
      address: "1200 Grand Concourse",
      city: "Bronx",
      state: "NY",
      zip: "10456",
      ownerName: "Carmen Diaz",
      ownerEmail: "cdiaz@bronxmetro.example.com",
      ownerPhone: "718-555-0423",
      notes: "48-unit elevator building, shared laundry room floor 1",
    },
  });
  const b4 = await prisma.building.create({
    data: {
      name: "510 W 110th",
      address: "510 W 110th St",
      city: "New York",
      state: "NY",
      zip: "10025",
      ownerName: "Ari Goldstein",
      ownerEmail: "ari@510prop.example.com",
      ownerPhone: "212-555-0599",
      notes: "Columbia-area, 30 units",
    },
  });
  console.log("✓ Buildings");

  // --- Machines ---
  const now = new Date();
  const m1 = await prisma.machine.create({
    data: {
      buildingId: b1.id,
      vendorId: vendorA.id,
      companyId: companyA.id,
      serialNumber: "SN-AL-00191",
      make: "Speed Queen",
      model: "SC25MD2",
      type: "Washer",
      status: "ACTIVE",
      capacity: 25,
      capacityUnit: "lbs",
      voltage: "208V",
      fuelType: "Electric",
      condition: "Good",
      installDate: new Date("2021-03-15"),
      purchasePrice: 1850,
      currentValue: 1100,
      nextServiceDue: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      locationDetail: "Basement laundry room, left unit",
    },
  });
  const m2 = await prisma.machine.create({
    data: {
      buildingId: b1.id,
      vendorId: vendorA.id,
      companyId: companyA.id,
      serialNumber: "SN-AL-00192",
      make: "Speed Queen",
      model: "SC25MD2",
      type: "Dryer",
      status: "NEEDS_SERVICE",
      capacity: 25,
      capacityUnit: "lbs",
      voltage: "208V",
      fuelType: "Electric",
      condition: "Fair",
      installDate: new Date("2021-03-15"),
      purchasePrice: 1650,
      currentValue: 800,
      locationDetail: "Basement laundry room, right unit",
      notes: "Drum belt squeaking — needs inspection",
    },
  });
  const m3 = await prisma.machine.create({
    data: {
      buildingId: b2.id,
      vendorId: vendorA.id,
      make: "Maytag",
      model: "MHN33PDCWW",
      type: "Washer",
      status: "ACTIVE",
      capacity: 27,
      capacityUnit: "lbs",
      voltage: "240V",
      fuelType: "Electric",
      condition: "Excellent",
      installDate: new Date("2022-06-01"),
      purchasePrice: 2200,
      currentValue: 1700,
      nextServiceDue: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
      locationDetail: "Basement, unit A",
    },
  });
  const m4 = await prisma.machine.create({
    data: {
      buildingId: b2.id,
      vendorId: vendorA.id,
      make: "Maytag",
      model: "MDE28PDCZW",
      type: "Dryer",
      status: "ACTIVE",
      capacity: 27,
      capacityUnit: "lbs",
      voltage: "240V",
      fuelType: "Electric",
      condition: "Excellent",
      installDate: new Date("2022-06-01"),
      purchasePrice: 2000,
      currentValue: 1500,
      nextServiceDue: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
      locationDetail: "Basement, unit B",
    },
  });
  const m5 = await prisma.machine.create({
    data: {
      buildingId: b3.id,
      vendorId: vendorB.id,
      companyId: companyB.id,
      serialNumber: "SN-BM-00441",
      make: "Electrolux",
      model: "EWF1147CSA",
      type: "Washer",
      status: "ACTIVE",
      capacity: 35,
      capacityUnit: "lbs",
      voltage: "208V",
      fuelType: "Electric",
      condition: "Good",
      installDate: new Date("2020-08-10"),
      purchasePrice: 2800,
      currentValue: 1400,
      nextServiceDue: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      locationDetail: "1st floor laundry room",
    },
  });
  const m6 = await prisma.machine.create({
    data: {
      buildingId: b3.id,
      vendorId: vendorB.id,
      companyId: companyB.id,
      serialNumber: "SN-BM-00442",
      make: "Electrolux",
      model: "EDE617",
      type: "Dryer",
      status: "ACTIVE",
      capacity: 35,
      capacityUnit: "lbs",
      voltage: "208V",
      fuelType: "Electric",
      condition: "Good",
      installDate: new Date("2020-08-10"),
      purchasePrice: 2600,
      currentValue: 1300,
      locationDetail: "1st floor laundry room",
    },
  });
  const m7 = await prisma.machine.create({
    data: {
      buildingId: b4.id,
      make: "LG",
      model: "WM3900HBA",
      type: "Washer",
      status: "RETIRED",
      capacity: 27,
      capacityUnit: "lbs",
      voltage: "120V",
      fuelType: "Electric",
      condition: "Poor",
      installDate: new Date("2016-01-20"),
      purchasePrice: 1400,
      currentValue: 0,
      isPartsSource: true,
      locationDetail: "Basement",
      notes: "Acquired from laundromat — being harvested for parts. Drive motor still available.",
    },
  });

  // Cheap laundromat machine — fully profitable from parts
  const m8 = await prisma.machine.create({
    data: {
      buildingId: b1.id,
      make: "Kenmore",
      model: "29002",
      type: "Washer",
      status: "RETIRED",
      capacity: 24,
      capacityUnit: "lbs",
      voltage: "120V",
      fuelType: "Electric",
      condition: "Fair",
      installDate: new Date("2015-06-01"),
      purchasePrice: 150,
      currentValue: 0,
      isPartsSource: true,
      locationDetail: "Basement — decommissioned",
      notes: "Acquired from laundromat closure for $150. Parts sales have exceeded cost.",
    },
  });
  console.log("✓ Machines");

  // --- Parts ---
  const part1 = await prisma.part.create({
    data: {
      sku: "SQ-BELT-25",
      name: "Drive Belt 25lb",
      description: "Replacement drive belt for Speed Queen 25lb dryers",
      category: "Belts",
      unitCost: 28.5,
      supplier: "Alliance Laundry Systems",
    },
  });
  const part2 = await prisma.part.create({
    data: {
      sku: "GEN-PUMP-DRAIN",
      name: "Drain Pump Assembly",
      description: "Universal drain pump assembly, fits most front-loaders",
      category: "Pumps",
      unitCost: 64.0,
      supplier: "NY Parts Direct",
    },
  });
  const part3 = await prisma.part.create({
    data: {
      sku: "GEN-DOOR-SEAL",
      name: "Front Load Door Seal",
      description: "Door gasket / bellow seal for front-load washers",
      category: "Seals",
      unitCost: 42.0,
      supplier: "NY Parts Direct",
    },
  });
  console.log("✓ Parts");

  // --- Machine Parts (harvested from parts-source machines) ---
  await prisma.machinePart.deleteMany({ where: { machineId: { in: [m7.id, m8.id] } } });

  // m7 — LG WM3900HBA (partly harvested, not yet profitable — drive motor still to sell)
  await prisma.machinePart.createMany({
    data: [
      { machineId: m7.id, name: "Control Board", category: "Control Board", condition: "Good", quantity: 1, salePrice: 180, soldAt: new Date("2026-02-01") },
      { machineId: m7.id, name: "Drain Pump Assembly", category: "Pump", condition: "Fair", quantity: 1, salePrice: 65, soldAt: new Date("2026-02-15") },
      { machineId: m7.id, name: "Door Boot Gasket", category: "Door Seal", condition: "Good", quantity: 1, salePrice: 45, soldAt: new Date("2026-03-01") },
      { machineId: m7.id, name: "Drum Bearing Kit", category: "Bearing", condition: "Fair", quantity: 1, salePrice: 35, soldAt: new Date("2026-03-20") },
      { machineId: m7.id, name: "Drive Motor", category: "Motor", condition: "Good", quantity: 1, salePrice: null, soldAt: null, description: "Listed — asking $120" },
    ],
  });

  // m8 — Kenmore 29002 (fully harvested, profitable — parts > $150 purchase cost)
  await prisma.machinePart.createMany({
    data: [
      { machineId: m8.id, name: "Transmission Assembly", category: "Motor", condition: "Good", quantity: 1, salePrice: 85, soldAt: new Date("2026-01-10") },
      { machineId: m8.id, name: "Water Inlet Valve", category: "Valve", condition: "Good", quantity: 1, salePrice: 45, soldAt: new Date("2026-01-15") },
      { machineId: m8.id, name: "Lid Switch Assembly", category: "Control Board", condition: "Good", quantity: 1, salePrice: 38, soldAt: new Date("2026-02-01") },
      { machineId: m8.id, name: "Agitator", category: "Drum", condition: "Fair", quantity: 1, salePrice: 30, soldAt: new Date("2026-02-20") },
    ],
  });
  console.log("✓ Machine Parts");

  // --- Service Records ---
  const sr1 = await prisma.serviceRecord.create({
    data: {
      machineId: m1.id,
      technicianId: user.id,
      serviceDate: new Date("2025-11-10"),
      serviceType: "PREVENTIVE",
      status: "COMPLETED",
      description: "Annual PM — cleaned lint trap, inspected belts, lubricated bearings. Machine running well.",
      laborHours: 1.5,
      laborCost: 120,
      invoiceNumber: "INV-2025-0041",
      invoiceStatus: "PAID",
      invoicePaidAt: new Date("2025-11-12"),
      parts: { create: [] },
    },
  });
  const sr2 = await prisma.serviceRecord.create({
    data: {
      machineId: m2.id,
      technicianId: user.id,
      serviceDate: new Date("2026-01-22"),
      serviceType: "REPAIR",
      status: "COMPLETED",
      description: "Replaced worn drive belt. Drum noise resolved post-repair.",
      laborHours: 2,
      laborCost: 160,
      invoiceNumber: "INV-2026-0008",
      invoiceStatus: "PAID",
      invoicePaidAt: new Date("2026-01-24"),
      parts: {
        create: [{ partId: part1.id, quantity: 1, unitCostAtTime: 28.5 }],
      },
    },
  });
  const sr3 = await prisma.serviceRecord.create({
    data: {
      machineId: m5.id,
      technicianId: user.id,
      serviceDate: new Date("2026-03-05"),
      serviceType: "REPAIR",
      status: "COMPLETED",
      description: "Drain pump failure — standing water after cycle. Replaced pump assembly and tested three full cycles.",
      laborHours: 2.5,
      laborCost: 200,
      invoiceNumber: "INV-2026-0019",
      invoiceStatus: "PAID",
      invoicePaidAt: new Date("2026-03-10"),
      parts: {
        create: [{ partId: part2.id, quantity: 1, unitCostAtTime: 64.0 }],
      },
    },
  });
  const sr4 = await prisma.serviceRecord.create({
    data: {
      machineId: m3.id,
      technicianId: user.id,
      serviceDate: new Date("2026-04-10"),
      serviceType: "PREVENTIVE",
      status: "COMPLETED",
      description: "Semi-annual PM — descaling, door seal inspection, control board check. No issues found.",
      laborHours: 1,
      laborCost: 80,
      invoiceNumber: "INV-2026-0031",
      invoiceStatus: "UNPAID",
    },
  });
  console.log("✓ Service Records");

  // --- Deals ---
  await prisma.deal.deleteMany({ where: { assignedToId: user.id } });

  // Closed/won deals — revenue demo data for laurenfener@gmail.com
  await prisma.deal.create({
    data: {
      buildingId: b2.id,
      assignedToId: user.id,
      title: "204 Meserole — Full Machine Upgrade (4 units)",
      stage: "CLOSED_WON",
      value: 12000,
      closeDate: new Date("2026-02-14"),
      probability: 100,
      notes: "Replaced 2 aging washers and 2 dryers. All units installed and tested. Paid in full.",
      lineItems: {
        create: [
          { description: "Speed Queen SC25MD2 Washer", quantity: 2, unitPrice: 2400, machineType: "Washer" },
          { description: "Speed Queen SDG25MD2 Dryer", quantity: 2, unitPrice: 2200, machineType: "Dryer" },
          { description: "Installation & haul-away (4 units)", quantity: 1, unitPrice: 2800 },
        ],
      },
    },
  });
  await prisma.deal.create({
    data: {
      buildingId: b1.id,
      assignedToId: user.id,
      title: "88 Franklin — Annual Service Contract 2025",
      stage: "CLOSED_WON",
      value: 2300,
      closeDate: new Date("2025-09-01"),
      probability: 100,
      notes: "Full-year service contract signed. Includes 4 quarterly PM visits and priority emergency dispatch.",
      lineItems: {
        create: [
          { description: "Quarterly PM visits", quantity: 4, unitPrice: 450 },
          { description: "Priority emergency dispatch (annual)", quantity: 1, unitPrice: 500 },
        ],
      },
    },
  });
  await prisma.deal.create({
    data: {
      buildingId: b3.id,
      assignedToId: user.id,
      title: "1200 Grand Concourse — Door Seal + PM",
      stage: "CLOSED_WON",
      value: 530,
      closeDate: new Date("2025-12-10"),
      probability: 100,
      notes: "Front-load door seal replacement and semi-annual PM. Completed same day.",
      lineItems: {
        create: [
          { description: "Front Load Door Seal (parts + labor)", quantity: 1, unitPrice: 180 },
          { description: "Semi-annual PM visit", quantity: 1, unitPrice: 350 },
        ],
      },
    },
  });
  await prisma.deal.create({
    data: {
      buildingId: b1.id,
      assignedToId: user.id,
      title: "88 Franklin — Emergency Dryer Repair",
      stage: "CLOSED_WON",
      value: 350,
      closeDate: new Date("2026-01-22"),
      probability: 100,
      notes: "Belt replacement, paid on site.",
      lineItems: {
        create: [
          { description: "Service call fee", quantity: 1, unitPrice: 80 },
          { description: "Drive belt replacement (parts + labor)", quantity: 1, unitPrice: 270 },
        ],
      },
    },
  });

  // Open pipeline deals
  await prisma.deal.create({
    data: {
      buildingId: b4.id,
      assignedToId: user.id,
      title: "510 W 110th — Machine Replacement (2x)",
      stage: "PROPOSAL_SENT",
      value: 5800,
      closeDate: new Date("2026-06-01"),
      probability: 60,
      notes: "Owner wants to replace retired LG washer + aging dryer. Quoting Speed Queen pair.",
      lineItems: {
        create: [
          { description: "Speed Queen SC25MD2 Washer", quantity: 1, unitPrice: 2200, machineType: "Washer" },
          { description: "Speed Queen SDG25MD2 Dryer", quantity: 1, unitPrice: 2100, machineType: "Dryer" },
          { description: "Installation & haul-away", quantity: 1, unitPrice: 1500 },
        ],
      },
    },
  });
  await prisma.deal.create({
    data: {
      buildingId: b3.id,
      assignedToId: user.id,
      title: "1200 Grand Concourse — Service Contract Renewal",
      stage: "NEGOTIATION",
      value: 3600,
      closeDate: new Date("2026-05-15"),
      probability: 80,
      notes: "Annual service contract up for renewal. Carmen wants quarterly PM visits included.",
      lineItems: {
        create: [
          { description: "Quarterly PM visits (4x)", quantity: 4, unitPrice: 600 },
          { description: "Priority emergency dispatch", quantity: 1, unitPrice: 600 },
        ],
      },
    },
  });
  await prisma.deal.create({
    data: {
      assignedToId: user.id,
      title: "New Prospect — 88 Bergen St Flatbush",
      stage: "PROSPECTING",
      value: 4200,
      probability: 20,
      notes: "Cold outreach — 24-unit building, machines ~8 years old. Follow up after site visit.",
    },
  });
  console.log("✓ Deals");

  // --- Activities ---
  await prisma.activity.createMany({
    data: [
      {
        type: "NOTE",
        body: "Called Carmen re: service contract renewal. She's ready to sign pending pricing confirmation.",
        userId: user.id,
        buildingId: b3.id,
        dealId: null,
      },
      {
        type: "SERVICE",
        body: "Completed annual PM on washer SN-AL-00191. No issues found.",
        userId: user.id,
        buildingId: b1.id,
        machineId: m1.id,
        serviceRecordId: sr1.id,
      },
      {
        type: "SERVICE",
        body: "Replaced drive belt on dryer SN-AL-00192. Machine back in service.",
        userId: user.id,
        buildingId: b1.id,
        machineId: m2.id,
        serviceRecordId: sr2.id,
      },
      {
        type: "NOTE",
        body: "Site visit scheduled at 510 W 110th for machine replacement quote. Ari confirmed Friday AM.",
        userId: user.id,
        buildingId: b4.id,
      },
    ],
  });
  console.log("✓ Activities");

  console.log("\nSeed complete.");
  console.log("  Login: laurenfener@gmail.com / staging123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
