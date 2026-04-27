/**
 * Demonstrates the bulk-purchase → service → sale flow:
 *   1. Buy 100 machines from a vendor (linked to owner + company)
 *   2. Two machines need service before deployment
 *      - Machine A: labor only
 *      - Machine B: labor + one drive belt pulled from stock
 *   3. Both serviced machines are sold — profit is computed per machine
 *      and rolled up across the whole purchase order
 *
 * Safe to run on top of the existing seed — does not duplicate that data.
 */
import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: ".env.local", override: true });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  // --- Resolve existing records ---
  const vendor = await prisma.vendor.findFirstOrThrow({
    where: { name: "Alliance Laundry Systems" },
  });
  const company = await prisma.company.findFirstOrThrow({
    where: { name: "Greenpoint Properties LLC" },
  });
  const owner = await prisma.owner.findFirstOrThrow({
    where: { name: "David Rosenberg" },
  });
  const user = await prisma.user.findFirstOrThrow({
    where: { email: "laurenfener@gmail.com" },
  });
  const driveBelt = await prisma.part.findFirstOrThrow({
    where: { sku: "SQ-BELT-25" },
  });

  console.log("✓ Resolved existing vendor, company, owner, user, part");

  // --- Warehouse building (inventory holding for undeployed machines) ---
  const warehouse = await prisma.building.create({
    data: {
      name: "LaundryOS Warehouse",
      address: "500 Flushing Ave",
      city: "Brooklyn",
      state: "NY",
      zip: "11205",
      notes: "Internal — machines not yet deployed to a property",
    },
  });
  console.log(`✓ Warehouse building: ${warehouse.id}`);

  // --- Stock the drive belt (15 units on hand before service) ---
  await prisma.part.update({
    where: { id: driveBelt.id },
    data: { stockQty: 15 },
  });
  console.log("✓ Drive belt stock set to 15");

  // --- Purchase Order ---
  //     100× Speed Queen SC9MD2 washers @ $950 each
  //     Purchased from Alliance Laundry Systems by Greenpoint / David Rosenberg
  const po = await prisma.purchaseOrder.create({
    data: {
      vendorId: vendor.id,
      companyId: company.id,
      ownerId: owner.id,
      orderDate: new Date("2026-02-01"),
      unitCost: 950,
      quantity: 100,
      notes: "Bulk acquisition — 100× Speed Queen SC9MD2 for resale/deployment across portfolio",
    },
  });
  console.log(`✓ Purchase order created: ${po.id}`);

  // --- Machine A: will need labor-only service ---
  const machineA = await prisma.machine.create({
    data: {
      buildingId: warehouse.id,
      purchaseOrderId: po.id,
      vendorId: vendor.id,
      companyId: company.id,
      serialNumber: "SN-BATCH-0001",
      make: "Speed Queen",
      model: "SC9MD2",
      type: "Washer",
      status: "ACTIVE",
      purchasePrice: 950,
      capacity: 9,
      capacityUnit: "kg",
      voltage: "208V",
      fuelType: "Electric",
      condition: "New",
      installDate: new Date("2026-02-01"),
    },
  });

  // --- Machine B: will need service + drive belt from stock ---
  const machineB = await prisma.machine.create({
    data: {
      buildingId: warehouse.id,
      purchaseOrderId: po.id,
      vendorId: vendor.id,
      companyId: company.id,
      serialNumber: "SN-BATCH-0002",
      make: "Speed Queen",
      model: "SC9MD2",
      type: "Washer",
      status: "ACTIVE",
      purchasePrice: 950,
      capacity: 9,
      capacityUnit: "kg",
      voltage: "208V",
      fuelType: "Electric",
      condition: "New",
      installDate: new Date("2026-02-01"),
    },
  });

  // --- Remaining 98 machines (createMany — no service needed) ---
  await prisma.machine.createMany({
    data: Array.from({ length: 98 }, (_, i) => ({
      buildingId: warehouse.id,
      purchaseOrderId: po.id,
      vendorId: vendor.id,
      companyId: company.id,
      serialNumber: `SN-BATCH-${String(i + 3).padStart(4, "0")}`,
      make: "Speed Queen",
      model: "SC9MD2",
      type: "Washer",
      status: "ACTIVE",
      purchasePrice: 950,
      capacity: 9,
      capacityUnit: "kg",
      voltage: "208V",
      fuelType: "Electric",
      condition: "New",
      installDate: new Date("2026-02-01"),
    })),
  });
  console.log("✓ 100 machines created and linked to purchase order");

  // --- Service: Machine A — labor only ---
  //     Cosmetic dent on lid; lid panel replaced by hand, no parts needed
  const srA = await prisma.serviceRecord.create({
    data: {
      machineId: machineA.id,
      technicianId: user.id,
      serviceDate: new Date("2026-02-10"),
      serviceType: "REPAIR",
      status: "COMPLETED",
      description: "Pre-sale inspection: cosmetic lid dent, panel re-seated. No parts required.",
      laborHours: 1,
      laborCost: 80,
      invoiceNumber: "INV-2026-BATCH-001",
    },
  });

  // --- Service: Machine B — labor + drive belt from stock ---
  //     Belt installed loose from factory; replaced from warehouse stock
  const srB = await prisma.serviceRecord.create({
    data: {
      machineId: machineB.id,
      technicianId: user.id,
      serviceDate: new Date("2026-02-11"),
      serviceType: "REPAIR",
      status: "COMPLETED",
      description: "Pre-sale inspection: drive belt shipped loose/misaligned. Replaced from stock. Machine tested — passes all cycles.",
      laborHours: 1.5,
      laborCost: 120,
      invoiceNumber: "INV-2026-BATCH-002",
      parts: {
        create: [
          {
            partId: driveBelt.id,
            quantity: 1,
            unitCostAtTime: driveBelt.unitCost,
          },
        ],
      },
    },
  });
  console.log("✓ Service records created");

  // --- Decrement drive belt stock (1 used on machine B) ---
  await prisma.part.update({
    where: { id: driveBelt.id },
    data: { stockQty: { decrement: 1 } },
  });
  const updatedBelt = await prisma.part.findUniqueOrThrow({ where: { id: driveBelt.id } });
  console.log(`✓ Drive belt stock decremented → ${updatedBelt.stockQty} remaining`);

  // --- Sell Machine A ---
  //     Bought @ $950, serviced for $80 labor → total cost $1,030
  //     Sold @ $1,400 → profit $370
  await prisma.machine.update({
    where: { id: machineA.id },
    data: {
      salePrice: 1400,
      soldAt: new Date("2026-03-01"),
      status: "SOLD",
    },
  });

  // --- Sell Machine B ---
  //     Bought @ $950, serviced for $120 labor + $28.50 belt → total cost $1,098.50
  //     Sold @ $1,350 → profit $251.50
  await prisma.machine.update({
    where: { id: machineB.id },
    data: {
      salePrice: 1350,
      soldAt: new Date("2026-03-01"),
      status: "SOLD",
    },
  });
  console.log("✓ Machines A and B marked as sold");

  // --- Activities ---
  await prisma.activity.createMany({
    data: [
      {
        type: "PURCHASE_ORDER_CREATED",
        body: `Purchase order created: 100× Speed Queen SC9MD2 from Alliance Laundry Systems @ $950/unit`,
        userId: user.id,
      },
      {
        type: "SERVICE",
        body: "Pre-sale repair on SN-BATCH-0001 — lid panel re-seated. No parts used.",
        userId: user.id,
        machineId: machineA.id,
        serviceRecordId: srA.id,
      },
      {
        type: "SERVICE",
        body: "Pre-sale repair on SN-BATCH-0002 — drive belt replaced from stock (1 unit, $28.50).",
        userId: user.id,
        machineId: machineB.id,
        serviceRecordId: srB.id,
      },
      {
        type: "NOTE",
        body: "SN-BATCH-0001 sold for $1,400. Profit after purchase + service: $370.",
        userId: user.id,
        machineId: machineA.id,
      },
      {
        type: "NOTE",
        body: "SN-BATCH-0002 sold for $1,350. Profit after purchase + service: $251.50.",
        userId: user.id,
        machineId: machineB.id,
      },
    ],
  });
  console.log("✓ Activities logged");

  // --- Print P&L summary ---
  const machineACost = 950 + 80;
  const machineBCost = 950 + 120 + driveBelt.unitCost;
  const profitA = 1400 - machineACost;
  const profitB = 1350 - machineBCost;
  const batchInvested = 100 * 950;
  const batchServiceCost = 80 + 120 + driveBelt.unitCost;
  const batchRevenue = 1400 + 1350;

  console.log("\n--- Purchase Order P&L Summary ---");
  console.log(`  Purchase order:   ${po.id}`);
  console.log(`  Machines bought:  100 @ $950 = $${batchInvested.toLocaleString()}`);
  console.log(`  Service costs:    $${batchServiceCost.toFixed(2)} (across 2 machines)`);
  console.log(`  Revenue (sold 2): $${batchRevenue.toLocaleString()}`);
  console.log(`  Profit (sold 2):  $${(profitA + profitB).toFixed(2)}`);
  console.log(`    Machine A (SN-BATCH-0001): bought $950 + service $80 = cost $${machineACost} → sold $1,400 → profit $${profitA}`);
  console.log(`    Machine B (SN-BATCH-0002): bought $950 + service $${(120 + driveBelt.unitCost).toFixed(2)} = cost $${machineBCost.toFixed(2)} → sold $1,350 → profit $${profitB.toFixed(2)}`);
  console.log(`  Remaining 98 machines: in inventory @ $950 each`);
  console.log(`\n  GET /api/purchase-orders/${po.id} to see live financials`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
