"use client";

import { useMemo, useState } from "react";
import {
  Globe,
  Upload,
  Search,
  Plus,
  ChevronRight,
  Bell,
  Server,
} from "lucide-react";

type ScanTab = "domain-ip" | "dns-records" | "upload-certificate";

type RecentScan = {
  id: number;
  name: string;
  type: "domain" | "dns" | "upload";
  time: string;
};

const recentScans: RecentScan[] = [
  { id: 1, name: "api.example.com", type: "domain", time: "2 hours ago" },
  { id: 2, name: "zone-export.db", type: "dns", time: "yesterday" },
  { id: 3, name: "wildcard.pem", type: "upload", time: "3 days ago" },
];

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative border-b px-6 pb-3 pt-2 text-sm tracking-[0.18em] uppercase transition ${
        active
          ? "border-cyan-400 text-cyan-300"
          : "border-transparent text-zinc-500 hover:text-zinc-300"
      }`}
    >
      {label}
    </button>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/8 py-5">
      <span className="text-[15px] text-zinc-300">{label}</span>
      <button
        type="button"
        onClick={onChange}
        className={`relative h-6 w-11 rounded-full border transition ${
          checked
            ? "border-cyan-400/70 bg-cyan-400/10"
            : "border-white/15 bg-white/5"
        }`}
      >
        <span
          className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full transition ${
            checked ? "left-6 bg-cyan-400" : "left-1 bg-zinc-500"
          }`}
        />
      </button>
    </div>
  );
}

function Card({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0a0a0d]/80 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-sm">
      <div className="px-6 pt-6">
        <div className="flex items-center gap-3">
          {icon ? <div className="text-cyan-400">{icon}</div> : null}
          <h3 className="text-lg tracking-[0.14em] text-zinc-200">{title}</h3>
        </div>
        {subtitle ? (
          <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>
        ) : null}
      </div>
      <div className="px-6 pb-6 pt-5">{children}</div>
    </div>
  );
}

export default function ScanPage() {
  const [activeTab, setActiveTab] = useState<ScanTab>("domain-ip");
  const [checkChain, setCheckChain] = useState(true);
  const [validateCtLogs, setValidateCtLogs] = useState(true);
  const [checkOcspStapling, setCheckOcspStapling] = useState(false);
  const [enforcePolicyOverrides, setEnforcePolicyOverrides] = useState(false);

  const tabTitle = useMemo(() => {
    if (activeTab === "domain-ip") return "Scan by Domain or IP Address";
    if (activeTab === "dns-records") return "Scan from DNS Zone File";
    return "Upload Certificate Files";
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100">
      <div className="border-b border-white/8 bg-[#0a0a0d] px-8 py-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-[0.08em] text-zinc-100">
            Scan
          </h1>

          
        </div>
      </div>

      <div className="px-8 py-10">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-8">
            <p className="text-xl tracking-[0.2em] text-zinc-200">NEW SCAN</p>
            <p className="mt-2 text-sm text-zinc-500">
              Submit certificates for compliance analysis
            </p>
          </div>

          <div className="mb-8 flex border-b border-white/8">
            <TabButton
              active={activeTab === "domain-ip"}
              label="DOMAIN / IP"
              onClick={() => setActiveTab("domain-ip")}
            />
            <TabButton
              active={activeTab === "dns-records"}
              label="DNS RECORDS"
              onClick={() => setActiveTab("dns-records")}
            />
            <TabButton
              active={activeTab === "upload-certificate"}
              label="UPLOAD CERTIFICATE"
              onClick={() => setActiveTab("upload-certificate")}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div>
              <Card
                title={tabTitle}
                icon={
                  activeTab === "domain-ip" ? (
                    <Globe className="h-5 w-5" />
                  ) : activeTab === "dns-records" ? (
                    <Server className="h-5 w-5" />
                  ) : (
                    <Upload className="h-5 w-5" />
                  )
                }
              >
                {activeTab === "domain-ip" && (
                  <div className="space-y-6">
                    <div>
                      <label className="mb-3 block text-xs uppercase tracking-[0.2em] text-zinc-500">
                        Targets
                      </label>
                      <textarea
                        rows={4}
                        placeholder="example.com, 192.168.1.1 (one per line)"
                        className="w-full resize-none rounded-md border border-white/10 bg-black px-4 py-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-cyan-400/50"
                      />
                      <p className="mt-3 text-sm leading-6 text-zinc-500">
                        Enter domains or IP addresses separated by commas or
                        newlines. The system will connect to each target on port
                        443 and extract the TLS certificate chain.
                      </p>
                    </div>

                    <div>
                      <label className="mb-3 block text-xs uppercase tracking-[0.2em] text-zinc-500">
                        Port (optional)
                      </label>
                      <input
                        type="text"
                        defaultValue="443"
                        className="w-full rounded-md border border-white/10 bg-black px-4 py-3 text-sm text-zinc-200 outline-none focus:border-cyan-400/50"
                      />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button className="inline-flex items-center gap-2 rounded-md bg-cyan-400 px-5 py-3 text-sm font-medium text-black transition hover:bg-cyan-300">
                        <Search className="h-4 w-4" />
                        Start Scan
                      </button>

                      <button className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-transparent px-5 py-3 text-sm text-zinc-300 transition hover:border-white/20 hover:bg-white/5">
                        <Plus className="h-4 w-4" />
                        Bulk Import (.csv)
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "dns-records" && (
                  <div className="space-y-6">
                    <div className="rounded-lg border border-dashed border-white/10 bg-[#0b0b0e] px-6 py-16 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.02]">
                        <Upload className="h-6 w-6 text-zinc-400" />
                      </div>
                      <p className="mt-5 text-lg text-zinc-300">
                        Drop DNS zone file here or click to browse
                      </p>
                      <p className="mt-2 text-sm text-zinc-500">
                        Supports BIND zone files (.zone, .db, .txt)
                      </p>
                    </div>

                    <div>
                      <label className="mb-3 block text-xs uppercase tracking-[0.2em] text-zinc-500">
                        Filter Record Types
                      </label>
                      <input
                        type="text"
                        defaultValue="A, AAAA, CNAME"
                        className="w-full rounded-md border border-white/10 bg-black px-4 py-3 text-sm text-zinc-200 outline-none focus:border-cyan-400/50"
                      />
                    </div>

                    <button className="inline-flex items-center gap-2 rounded-md bg-cyan-400 px-5 py-3 text-sm font-medium text-black transition hover:bg-cyan-300">
                      <Search className="h-4 w-4" />
                      Parse &amp; Scan
                    </button>
                  </div>
                )}

                {activeTab === "upload-certificate" && (
                  <div className="space-y-6">
                    <div className="rounded-lg border border-dashed border-white/10 bg-[#0b0b0e] px-6 py-16 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.02]">
                        <Upload className="h-6 w-6 text-zinc-400" />
                      </div>
                      <p className="mt-5 text-lg text-zinc-300">
                        Drop certificate files here or click to browse
                      </p>
                      <p className="mt-2 text-sm text-zinc-500">
                        Supports .pem, .crt, .cer, .der, .p7b
                      </p>
                    </div>

                    <button className="inline-flex items-center gap-2 rounded-md bg-cyan-400 px-5 py-3 text-sm font-medium text-black transition hover:bg-cyan-300">
                      <Search className="h-4 w-4" />
                      Analyse Certificates
                    </button>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}