"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Upload, Search, Server, ChevronDown, ChevronRight } from "lucide-react";
import {
  uploadAndScanCertificates,
  scanTargets,
  uploadAndScanDnsZone,
} from "@/lib/server/scans";

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
      className={`relative -mb-px border-b-2 px-5 pb-3 pt-2 text-xs font-mono uppercase tracking-widest transition ${
        active
          ? "border-emerald-400 text-emerald-400"
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
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40">
      <div className="border-b border-zinc-800 px-6 py-5">
        <div className="flex items-center gap-3">
          {icon ? <span className="text-emerald-400">{icon}</span> : null}
          <h2 className="text-base font-mono font-semibold uppercase tracking-[0.18em] text-zinc-100">
            {title}
          </h2>
        </div>
        {subtitle ? (
          <p className="mt-1.5 text-sm text-zinc-500">{subtitle}</p>
        ) : null}
      </div>
      <div className="px-6 py-6">{children}</div>
    </div>
  );
}

export default function ScanPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ScanTab>("domain-ip");
  const [scanName, setScanName] = useState("");

  const [targetsInput, setTargetsInput] = useState("");
  const [dnsFile, setDnsFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [filesExpanded, setFilesExpanded] = useState(false);
  const [fileQuery, setFileQuery] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetLineCount = targetsInput
    .split(/[\n,]+/)
    .map((l) => l.trim())
    .filter(Boolean).length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files));
  };

  const handleDnsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setDnsFile(e.target.files[0]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const parseTargets = () => {
    const lines = targetsInput
      .split(/[\n,]+/)
      .map((l) => l.trim())
      .filter(Boolean);

    const targets: Array<{ ip_address?: string; hostname?: string; port: number }> = [];
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
    setError(null);

    const { targets, errors } = parseTargets();

    if (errors.length > 0) {
      setError(errors.join(" · "));
      return;
    }

    if (targets.length === 0) {
      setError("Enter at least one target.");
      return;
    }

    if (targets.length > 1 && !scanName.trim()) {
      setError("Scan name is required when scanning more than one target.");
      return;
    }

    const fallbackName =
      targets[0]?.hostname || targets[0]?.ip_address || "target-scan";

    setLoading(true);
    try {
      const data = await scanTargets({
        name: scanName.trim() || fallbackName,
        type: "target",
        targets,
      });

      if (data?.error) {
        setError(data.message ?? "Scan failed.");
        return;
      }

      router.push("/main/results?scan=finished");
    } catch (err) {
      console.error(err);
      setError("Scan failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDnsZoneScan = async () => {
    setError(null);

    if (!dnsFile) {
      setError("Upload a DNS zone file.");
      return;
    }

    const formData = new FormData();
    formData.append("name", scanName.trim() || dnsFile.name);
    formData.append("zone_file", dnsFile);

    setLoading(true);
    try {
      const data = await uploadAndScanDnsZone(formData);

      if (data?.error) {
        setError(data.message ?? "DNS zone scan failed.");
        return;
      }

      router.push("/main/results?scan=finished");
    } catch (err) {
      console.error(err);
      setError("DNS zone scan failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    setError(null);

    if (files.length === 0) {
      setError("Upload at least one certificate.");
      return;
    }

    if (files.length > 1 && !scanName.trim()) {
      setError("Scan name is required when uploading more than one certificate.");
      return;
    }

    const formData = new FormData();
    formData.append("name", scanName.trim());
    files.forEach((file) => formData.append("certificates", file));

    setLoading(true);
    try {
      const data = await uploadAndScanCertificates(formData);

      if (data?.error) {
        setError(data.message ?? "Upload failed.");
        return;
      }

      router.push("/main/results?scan=finished");
    } catch (err) {
      console.error(err);
      setError("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const tabConfig = (() => {
    if (activeTab === "domain-ip") {
      return {
        title: "Scan by Domain or IP",
        subtitle: "Connect to live hosts and lint their TLS certificates.",
        icon: <Globe className="h-4 w-4" />,
        queueLabel:
          targetLineCount === 0
            ? "No targets entered"
            : `${targetLineCount} target${targetLineCount === 1 ? "" : "s"} queued`,
        submitLabel: loading ? "Scanning…" : "Start Scan",
        submitDisabled: loading || targetLineCount === 0,
        onSubmit: handleTargetScan,
      };
    }
    if (activeTab === "dns-records") {
      return {
        title: "Scan from DNS Zone File",
        subtitle: "Parse a BIND zone file and lint every A / AAAA / CNAME record.",
        icon: <Server className="h-4 w-4" />,
        queueLabel: dnsFile ? "1 DNS zone file queued" : "No DNS zone file selected",
        submitLabel: loading ? "Scanning…" : "Parse & Scan",
        submitDisabled: loading || !dnsFile,
        onSubmit: handleDnsZoneScan,
      };
    }
    return {
      title: "Upload Certificate Files",
      subtitle: "Lint one or more PEM-encoded certificates.",
      icon: <Upload className="h-4 w-4" />,
      queueLabel:
        files.length === 0
          ? "No certificates selected"
          : `${files.length} certificate file${files.length === 1 ? "" : "s"} queued`,
      submitLabel: loading ? "Processing…" : "Analyse Certificates",
      submitDisabled: loading || files.length === 0,
      onSubmit: handleUpload,
    };
  })();

  return (
    <div className="px-8 py-6">
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900/40 px-6 py-4">
          <label
            htmlFor="scanName"
            className="block text-xs font-mono uppercase tracking-[0.2em] text-zinc-500"
          >
            Scan Name
          </label>
          <input
            id="scanName"
            type="text"
            value={scanName}
            onChange={(e) => setScanName(e.target.value)}
            placeholder="my-tls-audit"
            className="mt-3 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm font-mono text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-emerald-400/50"
          />
          <p className="mt-2 text-xs text-zinc-500">
            Optional for a single target / file. Required when scanning multiple.
          </p>
        </div>

        <div className="mb-4 flex border-b border-zinc-800">
          <TabButton
            active={activeTab === "domain-ip"}
            label="Domain / IP"
            onClick={() => setActiveTab("domain-ip")}
          />
          <TabButton
            active={activeTab === "dns-records"}
            label="DNS Zone"
            onClick={() => setActiveTab("dns-records")}
          />
          <TabButton
            active={activeTab === "upload-certificate"}
            label="Upload Certificates"
            onClick={() => setActiveTab("upload-certificate")}
          />
        </div>

        <div className="space-y-4">
          <Card title={tabConfig.title} subtitle={tabConfig.subtitle} icon={tabConfig.icon}>
            {activeTab === "domain-ip" && (
              <div className="space-y-4">
                <label
                  htmlFor="targetsInput"
                  className="block text-xs font-mono uppercase tracking-[0.2em] text-zinc-500"
                >
                  Targets
                </label>
                <textarea
                  id="targetsInput"
                  rows={4}
                  value={targetsInput}
                  onChange={(e) => setTargetsInput(e.target.value)}
                  placeholder={"example.com:443\n192.168.1.1:443\nmail.example.com"}
                  className="w-full resize-none rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm font-mono text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-emerald-400/50"
                />
                <p className="text-sm text-zinc-500">
                  One target per line or comma-separated. Append{" "}
                  <span className="font-mono text-zinc-400">:port</span> to override the default of 443.
                </p>
              </div>
            )}

            {activeTab === "dns-records" && (
              <div className="space-y-4">
                <input
                  type="file"
                  accept=".zone,.db,.txt"
                  onChange={handleDnsFileChange}
                  className="hidden"
                  id="dnsZoneUpload"
                />
                <label
                  htmlFor="dnsZoneUpload"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-8 text-center transition hover:border-emerald-400/40 hover:bg-zinc-900/50"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/60">
                    <Upload className="h-6 w-6 text-zinc-400" />
                  </span>
                  <span className="mt-5 text-base font-mono text-zinc-200">
                    Click to upload DNS zone file
                  </span>
                  <span className="mt-2 text-sm text-zinc-500">
                    Supports BIND zone files (.zone, .db, .txt)
                  </span>
                </label>

                {dnsFile && (
                  <div className="flex items-center justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm text-zinc-200">{dnsFile.name}</p>
                      <p className="font-mono text-[10px] text-zinc-600">
                        {(dnsFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDnsFile(null)}
                      className="text-xs font-mono text-red-400 transition hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "upload-certificate" && (
              <div className="space-y-4">
                <input
                  type="file"
                  multiple
                  accept=".pem,.crt,.cer,.der,.p7b"
                  onChange={handleFileChange}
                  className="hidden"
                  id="fileUpload"
                />
                <label
                  htmlFor="fileUpload"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-8 text-center transition hover:border-emerald-400/40 hover:bg-zinc-900/50"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/60">
                    <Upload className="h-6 w-6 text-zinc-400" />
                  </span>
                  <span className="mt-5 text-base font-mono text-zinc-200">
                    Click to upload certificates
                  </span>
                  <span className="mt-2 text-sm text-zinc-500">
                    Supports .pem, .crt, .cer, .der, .p7b
                  </span>
                </label>

                {files.length > 0 && (() => {
                  const q = fileQuery.trim().toLowerCase();
                  const matches = q
                    ? files
                        .map((f, i) => ({ file: f, index: i }))
                        .filter(({ file }) => file.name.toLowerCase().includes(q))
                    : files.map((f, i) => ({ file: f, index: i }));

                  return (
                    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/30">
                      <button
                        type="button"
                        onClick={() => setFilesExpanded((v) => !v)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition hover:bg-zinc-900/50"
                        aria-expanded={filesExpanded}
                      >
                        <div className="flex items-center gap-2">
                          {filesExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
                          )}
                          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                            {files.length} file{files.length === 1 ? "" : "s"} selected
                          </p>
                        </div>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFiles([]);
                            setFileQuery("");
                            setFilesExpanded(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              e.stopPropagation();
                              setFiles([]);
                              setFileQuery("");
                              setFilesExpanded(false);
                            }
                          }}
                          className="cursor-pointer text-xs font-mono text-red-400 transition hover:text-red-300"
                        >
                          Clear all
                        </span>
                      </button>

                      {filesExpanded && (
                        <div className="border-t border-zinc-800">
                          <div className="border-b border-zinc-800 px-3 py-2">
                            <div className="relative">
                              <Search
                                size={12}
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600"
                              />
                              <input
                                type="text"
                                value={fileQuery}
                                onChange={(e) => setFileQuery(e.target.value)}
                                placeholder="Search filenames…"
                                className="w-full rounded-md border border-zinc-800 bg-zinc-900/50 py-1.5 pl-7 pr-3 text-xs font-mono text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-emerald-400/50"
                              />
                            </div>
                            {q && (
                              <p className="mt-1.5 font-mono text-[10px] text-zinc-600">
                                {matches.length} of {files.length} match &ldquo;{fileQuery}&rdquo;
                              </p>
                            )}
                          </div>
                          <div className="max-h-[220px] overflow-y-auto">
                            {matches.length === 0 ? (
                              <p className="px-4 py-6 text-center font-mono text-xs text-zinc-600">
                                No filenames match
                              </p>
                            ) : (
                              matches.map(({ file, index }) => (
                                <div
                                  key={`${file.name}-${index}`}
                                  className="flex items-center justify-between border-b border-zinc-800/60 px-4 py-2 last:border-b-0"
                                >
                                  <div className="min-w-0">
                                    <p className="truncate font-mono text-xs text-zinc-200">{file.name}</p>
                                    <p className="font-mono text-[10px] text-zinc-600">
                                      {(file.size / 1024).toFixed(2)} KB
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="ml-4 text-xs font-mono text-red-400 transition hover:text-red-300"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </Card>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
              <p className="font-mono text-xs text-red-400">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 px-6 py-5">
            <div className="min-w-0">
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">
                Ready
              </p>
              <p className="mt-1.5 truncate font-mono text-sm text-zinc-300">
                {tabConfig.queueLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={tabConfig.onSubmit}
              disabled={tabConfig.submitDisabled}
              className="inline-flex shrink-0 items-center gap-2 rounded-md bg-emerald-400 px-6 py-3 text-sm font-mono font-medium text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Search className="h-4 w-4" />
              {tabConfig.submitLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
