import { BuildingForm } from "@/components/BuildingForm";

export default function NewBuildingPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Add Building</h2>
      <BuildingForm />
    </div>
  );
}
