import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Topbar />
        {children}
      </div>
    </div>
  );
}