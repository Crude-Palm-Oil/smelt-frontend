import Button from "@/components/ui/buttons/Button";
import { Download } from "lucide-react";

export default function TopBar() {
  return (
    <div className="flex items-center justify-between border-b border-zinc-800 px-8 py-6">
      <h1 className="text-xl font-semibold text-zinc-100">Results</h1>

      <div className="flex items-center gap-3">
        <Button>
          <div className="flex items-center gap-2">
            <Download size={16} />
            <span>Export PDF</span>
          </div>
        </Button>
        <Button>
          <div className="flex items-center gap-2">
            <Download size={16} />
            <span>Export PDF</span>
          </div>
        </Button>
      </div>
    </div>
  );
}
