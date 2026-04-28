"use client";
import { useTransition } from "react";
import { toggleInvoicePaid } from "@/app/(app)/financials/actions";
import { formatCurrency, formatDate } from "@/lib/utils";

type InvoiceRecord = {
  id: string;
  invoiceNumber: string | null;
  serviceDate: Date;
  serviceType: string;
  invoiceStatus: string;
  invoicePaidAt: Date | null;
  invoiceFileUrl: string | null;
  laborCost: number | null;
  machine: {
    make: string;
    model: string;
    type: string;
    building: { name: string };
  };
  parts: Array<{ unitCostAtTime: number; quantity: number }>;
};

export function InvoiceRow({ record }: { record: InvoiceRecord }) {
  const [pending, startTransition] = useTransition();
  const isPaid = record.invoiceStatus === "PAID";
  const partsCost = record.parts.reduce((s, p) => s + p.unitCostAtTime * p.quantity, 0);
  const total = (record.laborCost ?? 0) + partsCost;

  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
      <td className="px-4 py-3">
        <p className="font-mono text-xs font-semibold text-gray-700">{record.invoiceNumber ?? "—"}</p>
        <p className="text-xs text-gray-400 mt-0.5">{formatDate(record.serviceDate)}</p>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-gray-900">{record.machine.make} {record.machine.model}</p>
        <p className="text-xs text-gray-400">{record.machine.building.name}</p>
      </td>
      <td className="px-4 py-3 text-xs text-gray-500 uppercase tracking-wide hidden md:table-cell">
        {record.serviceType.replace(/_/g, " ")}
      </td>
      <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">{formatCurrency(total)}</td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className={`inline-block text-xs px-2 py-1 font-bold uppercase tracking-wide ${
          isPaid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-800"
        }`}>
          {isPaid ? "Paid" : "Unpaid"}
        </span>
        {isPaid && record.invoicePaidAt && (
          <p className="text-xs text-gray-400 mt-0.5">{formatDate(record.invoicePaidAt)}</p>
        )}
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        {record.invoiceFileUrl ? (
          <a href={record.invoiceFileUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline font-medium">View file</a>
        ) : (
          <span className="text-xs text-gray-300">No file</span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={() => startTransition(() => toggleInvoicePaid(record.id, !isPaid))}
          disabled={pending}
          className={`text-xs px-3 py-1.5 font-bold uppercase tracking-wide transition-opacity disabled:opacity-40 ${
            isPaid
              ? "bg-gray-100 hover:bg-gray-200 text-gray-600"
              : "text-[#0d1b2a] hover:opacity-80"
          }`}
          style={!isPaid ? { background: "#f5c518" } : {}}
        >
          {pending ? "…" : isPaid ? "Mark Unpaid" : "Mark Paid"}
        </button>
      </td>
    </tr>
  );
}
