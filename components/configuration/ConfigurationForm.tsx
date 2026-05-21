"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Settings,
  ShieldCheck,
  KeyRound,
  ListChecks,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { saveConfiguration } from "@/lib/server/config";

type CipherSuite = {
  name: string;
  version: "TLS 1.3" | "TLS 1.2";
  tags: string[];
};

const availableCipherSuites: CipherSuite[] = [
  {
    name: "TLS_AES_128_GCM_SHA256",
    version: "TLS 1.3",
    tags: ["TLS 1.3", "AES", "GCM"],
  },
  {
    name: "TLS_AES_256_GCM_SHA384",
    version: "TLS 1.3",
    tags: ["TLS 1.3", "AES", "GCM"],
  },
  {
    name: "TLS_CHACHA20_POLY1305_SHA256",
    version: "TLS 1.3",
    tags: ["TLS 1.3", "CHACHA20"],
  },
  {
    name: "TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA",
    version: "TLS 1.2",
    tags: ["TLS 1.2", "ECDSA", "AES", "CBC"],
  },
  {
    name: "TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA",
    version: "TLS 1.2",
    tags: ["TLS 1.2", "ECDSA", "AES", "CBC"],
  },
  {
    name: "TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA",
    version: "TLS 1.2",
    tags: ["TLS 1.2", "RSA", "AES", "CBC"],
  },
  {
    name: "TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA",
    version: "TLS 1.2",
    tags: ["TLS 1.2", "RSA", "AES", "CBC"],
  },
  {
    name: "TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256",
    version: "TLS 1.2",
    tags: ["TLS 1.2", "ECDSA", "AES", "GCM"],
  },
  {
    name: "TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384",
    version: "TLS 1.2",
    tags: ["TLS 1.2", "ECDSA", "AES", "GCM"],
  },
  {
    name: "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
    version: "TLS 1.2",
    tags: ["TLS 1.2", "RSA", "AES", "GCM"],
  },
  {
    name: "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384",
    version: "TLS 1.2",
    tags: ["TLS 1.2", "RSA", "AES", "GCM"],
  },
  {
    name: "TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256",
    version: "TLS 1.2",
    tags: ["TLS 1.2", "RSA", "CHACHA20"],
  },
  {
    name: "TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256",
    version: "TLS 1.2",
    tags: ["TLS 1.2", "ECDSA", "CHACHA20"],
  },
];

const cipherGroups = [
  "All",
  "TLS 1.3",
  "TLS 1.2",
  "AES",
  "CHACHA20",
  "GCM",
  "CBC",
  "ECDSA",
  "RSA",
];

function Card({
  title,
  subtitle,
  icon,
  children,
  bodyClassName,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  bodyClassName?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40">
      <div className="border-b border-zinc-800 px-6 py-3">
        <div className="flex items-center gap-3">
          {icon ? <span className="text-emerald-400">{icon}</span> : null}
          <h2 className="text-base font-mono font-semibold uppercase tracking-[0.18em] text-zinc-100">
            {title}
          </h2>
        </div>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>
        ) : null}
      </div>
      <div className={bodyClassName ?? "px-6 py-4"}>{children}</div>
    </div>
  );
}

function SaveBar({
  onSave,
  helperText,
}: {
  onSave: () => void;
  helperText: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 px-6 py-3">
      <p className="min-w-0 truncate font-mono text-xs text-zinc-400">
        {helperText}
      </p>
      <button
        type="button"
        onClick={onSave}
        className="inline-flex shrink-0 items-center gap-2 rounded-md bg-emerald-400 px-5 py-2 text-sm font-mono font-medium text-black transition hover:bg-emerald-300"
      >
        Save Configuration
      </button>
    </div>
  );
}

type ToastState = {
  variant: "success" | "error";
  title: string;
  message: string;
} | null;

function Toast({
  toast,
  onClose,
}: {
  toast: ToastState;
  onClose: () => void;
}) {
  if (!toast) return null;

  const isSuccess = toast.variant === "success";
  const styles = isSuccess
    ? {
        border: "border-emerald-400/25",
        shadow: "shadow-[0_0_35px_rgba(52,211,153,0.16)]",
        accent: "bg-emerald-400",
        iconWrap: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
        title: "text-emerald-300",
      }
    : {
        border: "border-red-400/25",
        shadow: "shadow-[0_0_35px_rgba(248,113,113,0.16)]",
        accent: "bg-red-400",
        iconWrap: "border-red-400/30 bg-red-400/10 text-red-300",
        title: "text-red-300",
      };

  const Icon = isSuccess ? CheckCircle2 : AlertCircle;

  return (
    <div
      className={`fixed right-6 top-6 z-50 w-[380px] overflow-hidden rounded-xl border ${styles.border} bg-[#0a0a0d]/95 ${styles.shadow} backdrop-blur`}
      role="status"
      aria-live="polite"
    >
      <div className={`h-1 w-full ${styles.accent}`} />
      <div className="flex gap-4 p-5">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${styles.iconWrap}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={`font-mono text-xs font-semibold uppercase tracking-[0.18em] ${styles.title}`}
          >
            {toast.title}
          </p>
          <p className="mt-1 text-sm text-zinc-300">{toast.message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-zinc-500 transition hover:text-zinc-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function ConfigurationForm() {
  const [domain, setDomain] = useState("");
  const [expiryWarningDays, setExpiryWarningDays] = useState(30);

  const [issuer, setIssuer] = useState("");
  const [allowTLS12, setAllowTLS12] = useState(true);

  const [cipherSuites, setCipherSuites] = useState<string[]>([]);
  const [cipherSearch, setCipherSearch] = useState("");
  const [cipherGroup, setCipherGroup] = useState("All");

  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const filteredCipherSuites = useMemo(() => {
    return availableCipherSuites.filter((cipher) => {
      if (!allowTLS12 && cipher.version === "TLS 1.2") {
        return false;
      }

      const matchesSearch = cipher.name
        .toLowerCase()
        .includes(cipherSearch.toLowerCase());

      const matchesGroup =
        cipherGroup === "All" || cipher.tags.includes(cipherGroup);

      return matchesSearch && matchesGroup;
    });
  }, [cipherSearch, cipherGroup, allowTLS12]);

  const toggleCipherSuite = (cipher: string) => {
    if (cipherSuites.includes(cipher)) {
      setCipherSuites(cipherSuites.filter((item) => item !== cipher));
    } else {
      setCipherSuites([...cipherSuites, cipher]);
    }
  };

  const clearCipherSuites = () => {
    setCipherSuites([]);
  };

  const selectFilteredCipherSuites = () => {
    const names = filteredCipherSuites.map((cipher) => cipher.name);
    setCipherSuites(Array.from(new Set([...cipherSuites, ...names])));
  };

  const handleTLS12Toggle = (checked: boolean) => {
    setAllowTLS12(checked);

    if (!checked) {
      setCipherSuites((prev) =>
        prev.filter((cipherName) => {
          const cipher = availableCipherSuites.find(
            (item) => item.name === cipherName,
          );
          return cipher?.version !== "TLS 1.2";
        }),
      );

      if (cipherGroup === "TLS 1.2") {
        setCipherGroup("All");
      }
    }
  };

  const handleSave = async () => {
    if (!domain.trim()) {
      setToast({
        variant: "error",
        title: "Domain Required",
        message: "Enter a target domain before saving.",
      });
      return;
    }

    try {
      const response = await saveConfiguration({
        domain,
        policies: ["Expiration Check", "Issuer Validation"],
        expiry_warning_days: expiryWarningDays,
        issuer,
        allow_tls_1_2: allowTLS12,
        cipher_suites: cipherSuites,
      });

      if (!response.success) {
        setToast({
          variant: "error",
          title: "Save Failed",
          message: response.message || "Could not save configuration.",
        });
        return;
      }

      setToast({
        variant: "success",
        title: "Configuration Saved",
        message: `Policies for ${domain} are now active.`,
      });
    } catch (err) {
      console.error("SAVE ERROR:", err);
      setToast({
        variant: "error",
        title: "Save Failed",
        message: "Unknown error",
      });
    }
  };

  const saveHelper = !domain
    ? "Set a target domain to save"
    : "Configuration ready to save";

  return (
    <div className="px-8 py-6">
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="space-y-4">
          <Card
            title="Target Domain"
            subtitle="The website domain this configuration applies to"
            icon={<Settings className="h-4 w-4" />}
          >
            <label
              htmlFor="domain"
              className="block text-xs font-mono uppercase tracking-[0.2em] text-zinc-500"
            >
              Domain
            </label>
            <input
              id="domain"
              type="text"
              placeholder="example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="mt-2 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm font-mono text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-emerald-400/50"
            />
          </Card>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <div className="flex flex-col gap-4">
              <Card
                title="Validation"
                subtitle="TLS validation rules applied to scanned certificates"
                icon={<ShieldCheck className="h-4 w-4" />}
              >
                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="expiryDays"
                      className="block text-xs font-mono uppercase tracking-[0.2em] text-zinc-500"
                    >
                      Certificate Expiry Warning (Days)
                    </label>
                    <input
                      id="expiryDays"
                      type="number"
                      min={1}
                      value={expiryWarningDays}
                      onChange={(e) =>
                        setExpiryWarningDays(Number(e.target.value))
                      }
                      className="mt-2 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm font-mono text-zinc-200 outline-none focus:border-emerald-400/50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="issuer"
                      className="block text-xs font-mono uppercase tracking-[0.2em] text-zinc-500"
                    >
                      Allowed Issuer
                    </label>
                    <input
                      id="issuer"
                      type="text"
                      placeholder="Example: Let's Encrypt"
                      value={issuer}
                      onChange={(e) => setIssuer(e.target.value)}
                      className="mt-2 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm font-mono text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-emerald-400/50"
                    />
                  </div>

                  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-2 transition hover:border-zinc-700">
                    <div className="min-w-0">
                      <p className="font-mono text-sm text-zinc-200">Allow TLS 1.2</p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        Permit TLS 1.2 cipher suites alongside TLS 1.3
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={allowTLS12}
                      onChange={(e) => handleTLS12Toggle(e.target.checked)}
                      className="h-4 w-4 shrink-0 accent-emerald-400"
                    />
                  </label>
                </div>
              </Card>

              <Card
                title={`Selected Ciphers (${cipherSuites.length})`}
                subtitle="Click a chip to deselect"
                icon={<ListChecks className="h-4 w-4" />}
              >
                {cipherSuites.length === 0 ? (
                  <p className="font-mono text-xs text-zinc-600">
                    No cipher suites selected.
                  </p>
                ) : (
                  <div className="flex max-h-[80px] flex-wrap gap-2 overflow-y-auto">
                    {cipherSuites.map((cipher) => (
                      <button
                        key={cipher}
                        type="button"
                        onClick={() => toggleCipherSuite(cipher)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 font-mono text-[10px] text-emerald-300 transition hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300"
                      >
                        {cipher}
                        <X className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <Card
              title="Cipher Suites"
              subtitle="Select required cipher suites for this domain"
              icon={<KeyRound className="h-4 w-4" />}
              bodyClassName="space-y-3 px-6 py-4"
            >
              <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_140px]">
                <div className="relative">
                  <Search
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
                  />
                  <input
                    type="text"
                    placeholder="Search AES, RSA, GCM..."
                    value={cipherSearch}
                    onChange={(e) => setCipherSearch(e.target.value)}
                    className="w-full rounded-md border border-zinc-800 bg-zinc-900/50 py-2 pl-9 pr-3 text-sm font-mono text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-emerald-400/50"
                  />
                </div>
                <select
                  value={cipherGroup}
                  onChange={(e) => setCipherGroup(e.target.value)}
                  className="w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm font-mono text-zinc-200 outline-none focus:border-emerald-400/50"
                >
                  {cipherGroups
                    .filter(
                      (group) => allowTLS12 || group !== "TLS 1.2",
                    )
                    .map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-xs text-zinc-500">
                  Showing {filteredCipherSuites.length} · Selected{" "}
                  {cipherSuites.length}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectFilteredCipherSuites}
                    className="rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 font-mono text-xs text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900/80"
                  >
                    Select shown
                  </button>
                  <button
                    type="button"
                    onClick={clearCipherSuites}
                    className="rounded-md border border-red-500/30 bg-red-500/5 px-3 py-1.5 font-mono text-xs text-red-400 transition hover:bg-red-500/10"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="grid max-h-[200px] grid-cols-1 gap-1.5 overflow-y-auto rounded-md border border-zinc-800 bg-zinc-900/30 p-2 md:grid-cols-2">
                {filteredCipherSuites.length === 0 ? (
                  <p className="col-span-full py-6 text-center font-mono text-xs text-zinc-600">
                    No cipher suites match
                  </p>
                ) : (
                  filteredCipherSuites.map((cipher) => {
                    const selected = cipherSuites.includes(cipher.name);
                    return (
                      <label
                        key={cipher.name}
                        className={`flex cursor-pointer items-start gap-2 rounded-md border px-2.5 py-1.5 transition ${
                          selected
                            ? "border-emerald-400/30 bg-emerald-400/5"
                            : "border-zinc-800 bg-transparent hover:border-zinc-700 hover:bg-zinc-900/60"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleCipherSuite(cipher.name)}
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-emerald-400"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-mono text-xs text-zinc-200">
                            {cipher.name}
                          </span>
                          <span className="mt-0.5 block truncate font-mono text-[10px] text-zinc-500">
                            {cipher.tags.join(" · ")}
                          </span>
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          <SaveBar onSave={handleSave} helperText={saveHelper} />
        </div>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
