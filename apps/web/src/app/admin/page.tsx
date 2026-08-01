import { CommandCenterDashboard } from "@/components/admin/command-center/CommandCenterDashboard";
import { BOSModuleNav } from "@/components/admin/command-center/BOSModuleNav";

export default function AdminOverviewPage() {
  return (
    <>
      <BOSModuleNav />
      <CommandCenterDashboard />
    </>
  );
}
