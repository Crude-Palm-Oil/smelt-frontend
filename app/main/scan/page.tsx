"use client";

import { useMemo, useState } from "react";
import { Globe, Upload, Search, Plus, Server } from "lucide-react";
import { uploadAndScanCertificates, scanTargets } from "@/lib/server/scans";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_SCAN_URL;

type ScanTab = "domain-ip" | "dns-records" | "upload-certificate";

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
          ? "border-emerald-400 text-emerald-300"
          : "border-transparent text-zinc-500 hover:text-zinc-300"
      }`}
    >
      {label}
    </button>
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
          {icon ? <div className="text-emerald-400">{icon}</div> : null}
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

  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [targetsInput, setTargetsInput] = useState("");

  const [showSuccess, setShowSuccess] = useState(false);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert("Please upload at least 1 certificate");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("certificates", file);
    });

    try {

      const data = await uploadAndScanCertificates(formData);

      if (data?.error) {
        alert(data.message);
        return;
      }

      setResult(data);
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const parseTargets = () => {
    const lines = targetsInput
      .split(/[\n,]+/)
      .map((l) => l.trim())
      .filter(Boolean);

    const targets: any[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      const [host, portStr] = line.split(":");

      if (!host) {
        errors.push(`Line ${index + 1}: empty host`);
        return;
      }

      const port = portStr ? Number(portStr) : 443;

      if (isNaN(port) || port <= 0 || port > 65535) {
        errors.push(`Line ${index + 1}: invalid port`);
        return;
      }

      const isIPv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(host);

      if (isIPv4) {
        targets.push({ ip_address: host, port });
      } else {
        targets.push({ hostname: host, port });
      }
    });

    return { targets, errors };
  };

  const handleTargetScan = async () => {
    const { targets, errors } = parseTargets();

    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    if (targets.length === 0) {
      alert("No valid targets");
      return;
    }

    setLoading(true);

    try {
      const data = await scanTargets({
        type: "target",
        targets,
      });

      if (data?.error) {
        alert(data.message);
        return;
      }

      setResult(data);
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Scan failed");
    } finally {
      setLoading(false);
    }
  };

  const tabTitle = useMemo(() => {
    if (activeTab === "domain-ip") return "Scan by Domain or IP Address";
    if (activeTab === "dns-records") return "Scan from DNS Zone File";
    return "Upload Certificate Files";
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100">
      {/* <div className="border-b border-white/8 bg-[#0a0a0d] px-8 py-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-[0.08em] text-zinc-100">
            Scan
          </h1>

          
        </div>
      </div> */}

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
                        value={targetsInput}
                        onChange={(e) => setTargetsInput(e.target.value)}
                        placeholder="example.com:443\n192.168.1.1:443"
                        className="w-full resize-none rounded-md border border-white/10 bg-black px-4 py-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-emerald-400/50"
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
                        className="w-full rounded-md border border-white/10 bg-black px-4 py-3 text-sm text-zinc-200 outline-none focus:border-emerald-400/50"
                      />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={handleTargetScan}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-md bg-emerald-400 px-5 py-3 text-sm font-medium text-black transition hover:bg-emerald-300 disabled:opacity-50"
                      >
                        <Search className="h-4 w-4" />
                        {loading ? "Scanning..." : "Start Scan"}
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
                        className="w-full rounded-md border border-white/10 bg-black px-4 py-3 text-sm text-zinc-200 outline-none focus:border-emerald-400/50"
                      />
                    </div>

                    <button className="inline-flex items-center gap-2 rounded-md bg-emerald-400 px-5 py-3 text-sm font-medium text-black transition hover:bg-emerald-300">
                      <Search className="h-4 w-4" />
                      Parse &amp; Scan
                    </button>
                  </div>
                )}

                {activeTab === "upload-certificate" && (
                  <div className="space-y-6">
                    <div className="rounded-lg border border-dashed border-white/10 bg-[#0b0b0e] px-6 py-12 text-center transition hover:border-emerald-400/30">
                      <input
                        type="file"
                        multiple
                        accept=".pem,.crt,.cer,.der,.p7b"
                        onChange={handleFileChange}
                        className="hidden"
                        id="fileUpload"
                      />

                      <label htmlFor="fileUpload" className="cursor-pointer">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.02]">
                          <Upload className="h-6 w-6 text-zinc-400" />
                        </div>

                        <p className="mt-5 text-lg text-zinc-300">
                          Click to upload certificates
                        </p>

                        <p className="mt-2 text-sm text-zinc-500">
                          Supports .pem, .crt, .cer, .der, .p7b
                        </p>
                      </label>
                    </div>

                    {files.length > 0 && (
                      <div className="rounded-lg border border-white/10 bg-black/40">
                        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-zinc-200">
                              Selected Certificates
                            </p>
                            <p className="text-xs text-zinc-500">
                              {files.length} files selected
                            </p>
                          </div>

                          <button
                            onClick={() => setFiles([])}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            Clear All
                          </button>
                        </div>

                        <div className="max-h-[300px] overflow-y-auto">
                          {files.map((f, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between border-b border-white/5 px-4 py-3"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm text-zinc-300">
                                  {f.name}
                                </p>

                                <p className="text-xs text-zinc-600">
                                  {(f.size / 1024).toFixed(2)} KB
                                </p>
                              </div>

                              <button
                                onClick={() => removeFile(i)}
                                className="ml-4 text-xs text-red-400 hover:text-red-300"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="sticky bottom-0 z-10 flex items-center justify-between rounded-xl border border-white/10 bg-[#0a0a0d]/95 p-4 backdrop-blur">
                      <div>
                        <p className="text-sm text-zinc-300">
                          Ready to analyse
                        </p>

                        <p className="text-xs text-zinc-500">
                          {files.length} certificate files queued
                        </p>
                      </div>

                      <button
                        onClick={handleUpload}
                        disabled={loading || files.length === 0}
                        className="inline-flex items-center gap-2 rounded-md bg-emerald-400 px-5 py-3 text-sm font-medium text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Search className="h-4 w-4" />

                        {loading ? "Processing..." : "Analyse Certificates"}
                      </button>
                    </div>
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
