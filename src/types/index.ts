import type {
  Building,
  Machine,
  ServiceRecord,
  ServiceRecordPart,
  Part,
  Deal,
  DealLineItem,
  Activity,
  User,
} from "@/generated/prisma/client";

export type {
  Building,
  Machine,
  ServiceRecord,
  ServiceRecordPart,
  Part,
  Deal,
  DealLineItem,
  Activity,
  User,
};

export type MachineWithBuilding = Machine & { building: Building };

export type ServiceRecordWithDetails = ServiceRecord & {
  machine: Machine & { building: Building };
  technician: User | null;
  parts: (ServiceRecordPart & { part: Part })[];
};

export type DealWithDetails = Deal & {
  building: Building | null;
  assignedTo: User | null;
  lineItems: DealLineItem[];
};

export type BuildingWithMachines = Building & {
  machines: Machine[];
  deals: Deal[];
};

export type MachineFinancials = {
  machineId: string;
  purchasePrice: number;
  totalLaborCost: number;
  totalPartsCost: number;
  totalCost: number;
  serviceCount: number;
};

export const MACHINE_TYPES = ["WASHER", "DRYER", "COMBO", "OTHER"] as const;
export const MACHINE_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "DECOMMISSIONED",
  "FOR_SALE",
] as const;
export const SERVICE_TYPES = [
  "PREVENTIVE_MAINTENANCE",
  "REPAIR",
  "INSPECTION",
  "INSTALLATION",
  "DECOMMISSION",
  "OTHER",
] as const;
export const SERVICE_STATUSES = [
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;
export const DEAL_STAGES = [
  "PROSPECTING",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "CLOSED_WON",
  "CLOSED_LOST",
] as const;
export const ROLES = ["ADMIN", "MANAGER", "TECHNICIAN", "SALES"] as const;

export type MachineType = (typeof MACHINE_TYPES)[number];
export type MachineStatus = (typeof MACHINE_STATUSES)[number];
export type ServiceType = (typeof SERVICE_TYPES)[number];
export type ServiceStatus = (typeof SERVICE_STATUSES)[number];
export type DealStage = (typeof DEAL_STAGES)[number];
