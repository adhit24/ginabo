import { BOSModuleNav } from "@/components/admin/command-center/BOSModuleNav";
import ExecutiveDashboardPage from "./executive/page";

export default function AdminOverviewPage() {
  return (
    <>
      <BOSModuleNav />
      <ExecutiveDashboardPage />
    </>
  );
}
