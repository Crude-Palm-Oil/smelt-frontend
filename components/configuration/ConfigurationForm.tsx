"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Settings,
  ShieldCheck,
  KeyRound,
  ListChecks,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Pencil,
  Plus,
  ArrowLeft,
} from "lucide-react";
import {
  deleteConfiguration,
  listConfigurations,
  saveConfiguration,
  updateConfiguration,
  type SavedConfiguration,
} from "@/lib/server/config";

type PageView = "list" | "form";

type CipherSuite = {
  name: string;
  version: "TLS 1.3" | "TLS 1.2";
  tags: string[];
};

const policyOptions = [
  "Expiration Check",
  "Issuer Validation",
  "TLS Version Check",
  "Cipher Suite Check",
  "Lint Exclusion",
];

const commonLintExamples = [
  "w_ext_subject_key_identifier_not_recommended_subscriber",
  "w_subject_common_name_included"
];

const availableCipherSuites: CipherSuite[] = [
  { name: "TLS_AES_128_GCM_SHA256", version: "TLS 1.3", tags: ["TLS 1.3", "AES", "GCM"] },
  { name: "TLS_AES_256_GCM_SHA384", version: "TLS 1.3", tags: ["TLS 1.3", "AES", "GCM"] },
  { name: "TLS_CHACHA20_POLY1305_SHA256", version: "TLS 1.3", tags: ["TLS 1.3", "CHACHA20"] },
  { name: "TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA", version: "TLS 1.2", tags: ["TLS 1.2", "ECDSA", "AES", "CBC"] },
  { name: "TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA", version: "TLS 1.2", tags: ["TLS 1.2", "ECDSA", "AES", "CBC"] },
  { name: "TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA", version: "TLS 1.2", tags: ["TLS 1.2", "RSA", "AES", "CBC"] },
  { name: "TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA", version: "TLS 1.2", tags: ["TLS 1.2", "RSA", "AES", "CBC"] },
  { name: "TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256", version: "TLS 1.2", tags: ["TLS 1.2", "ECDSA", "AES", "GCM"] },
  { name: "TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384", version: "TLS 1.2", tags: ["TLS 1.2", "ECDSA", "AES", "GCM"] },
  { name: "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256", version: "TLS 1.2", tags: ["TLS 1.2", "RSA", "AES", "GCM"] },
  { name: "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384", version: "TLS 1.2", tags: ["TLS 1.2", "RSA", "AES", "GCM"] },
  { name: "TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256", version: "TLS 1.2", tags: ["TLS 1.2", "RSA", "CHACHA20"] },
  { name: "TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256", version: "TLS 1.2", tags: ["TLS 1.2", "ECDSA", "CHACHA20"] },
];

const cipherGroups = ["All", "TLS 1.3", "TLS 1.2", "AES", "CHACHA20", "GCM", "CBC", "ECDSA", "RSA"];

const wildcardDomainRegex = /^\*\.(?=.{1,253}$)([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;

const isValidWildcardDomain = (value: string) => wildcardDomainRegex.test(value.trim());

function TopTab({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b px-6 pb-3 pt-2 font-mono text-sm uppercase tracking-[0.18em] transition ${
        active ? "border-emerald-400 text-emerald-300" : "border-transparent text-zinc-500 hover:text-zinc-300"
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
  bodyClassName,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  bodyClassName?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40">
      <div className="border-b border-zinc-800 px-6 py-3">
        <div className="flex items-center gap-3">
          {icon ? <span className="text-emerald-400">{icon}</span> : null}
          <h2 className="font-mono text-base font-semibold uppercase tracking-[0.18em] text-zinc-100">{title}</h2>
        </div>
        {subtitle ? <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p> : null}
      </div>
      <div className={bodyClassName ?? "px-6 py-4"}>{children}</div>
    </div>
  );
}

type ToastState = {
  variant: "success" | "error";
  title: string;
  message: string;
} | null;

function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
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
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${styles.iconWrap}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`font-mono text-xs font-semibold uppercase tracking-[0.18em] ${styles.title}`}>{toast.title}</p>
          <p className="mt-1 text-sm text-zinc-300">{toast.message}</p>
        </div>
        <button type="button" onClick={onClose} className="shrink-0 text-zinc-500 transition hover:text-zinc-200">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function ConfigurationForm() {
  const [view, setView] = useState<PageView>("list");
  const [savedConfigs, setSavedConfigs] = useState<SavedConfiguration[]>([]);
  const [loadingConfigs, setLoadingConfigs] = useState(false);
  const [editingDomain, setEditingDomain] = useState<string | null>(null);

  const [domain, setDomain] = useState("");
  const [domainError, setDomainError] = useState("");

  const [policies, setPolicies] = useState<string[]>([
    "Expiration Check",
    "Issuer Validation",
    "TLS Version Check",
    "Cipher Suite Check",
    "Lint Exclusion",
  ]);

  const [expiryWarningDays, setExpiryWarningDays] = useState<number | "">(30);
  const [issuer, setIssuer] = useState("");
  const [allowTLS12, setAllowTLS12] = useState(true);

  const [cipherSuites, setCipherSuites] = useState<string[]>([]);
  const [cipherSearch, setCipherSearch] = useState("");
  const [cipherGroup, setCipherGroup] = useState("All");

  const [excludedLintInput, setExcludedLintInput] = useState("");
  const [excludedLints, setExcludedLints] = useState<string[]>([]);

  const [toast, setToast] = useState<ToastState>(null);

  const expirationPolicyEnabled = policies.includes("Expiration Check");
  const issuerPolicyEnabled = policies.includes("Issuer Validation");
  const tlsPolicyEnabled = policies.includes("TLS Version Check");
  const cipherPolicyEnabled = policies.includes("Cipher Suite Check");
  const lintPolicyEnabled = policies.includes("Lint Exclusion");

  useEffect(() => {
    loadSavedConfigurations();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const validateDomain = (value: string) => {
    const cleanValue = value.trim();

    if (!cleanValue) {
      setDomainError("");
      return;
    }

    if (!cleanValue.startsWith("*.")) {
      setDomainError("Wildcard domain must start with *.");
      return;
    }

    if (!isValidWildcardDomain(cleanValue)) {
      setDomainError("Enter a valid wildcard domain, for example *.example.com");
      return;
    }

    setDomainError("");
  };

  const loadSavedConfigurations = async () => {
    try {
      setLoadingConfigs(true);
      const response = await listConfigurations();

      if (!response.success) {
        setToast({
          variant: "error",
          title: "Load Failed",
          message: response.message || "Could not load saved configurations.",
        });
        return;
      }

      setSavedConfigs(response.data || []);
    } catch (err) {
      console.error("LOAD CONFIGS ERROR:", err);
      setToast({ variant: "error", title: "Load Failed", message: "Could not load saved configurations." });
    } finally {
      setLoadingConfigs(false);
    }
  };

  const startCreateConfig = () => {
    setEditingDomain(null);
    setDomain("");
    setDomainError("");
    setPolicies([
      "Expiration Check",
      "Issuer Validation",
      "TLS Version Check",
      "Cipher Suite Check",
      "Lint Exclusion",
    ]);
    setExpiryWarningDays(30);
    setIssuer("");
    setAllowTLS12(true);
    setCipherSuites([]);
    setCipherSearch("");
    setCipherGroup("All");
    setExcludedLintInput("");
    setExcludedLints([]);
    setView("form");
  };

  const applySavedConfigToForm = (config: SavedConfiguration) => {
    const loadedDomain = config.domain || "";

    setEditingDomain(loadedDomain);
    setDomain(loadedDomain);
    validateDomain(loadedDomain);
    setPolicies(config.policies?.length ? config.policies : []);
    setExpiryWarningDays(config.expiry_warning_days ?? 0);
    setIssuer(config.issuer || "");
    setAllowTLS12(config.allow_tls_1_2 ?? true);
    setCipherSuites(config.cipher_suites || []);
    setExcludedLints(config.excluded_lints || []);
    setExcludedLintInput("");
    setView("form");

    setToast({ variant: "success", title: "Edit Mode", message: `Editing configuration for ${loadedDomain}.` });
  };

  const handleDeleteConfig = async (domainToDelete: string) => {
    const confirmed = window.confirm(`Delete configuration for ${domainToDelete}?`);
    if (!confirmed) return;

    try {
      const response = await deleteConfiguration(domainToDelete);

      if (!response.success) {
        setToast({ variant: "error", title: "Delete Failed", message: response.message || "Could not delete configuration." });
        return;
      }

      setToast({ variant: "success", title: "Configuration Deleted", message: `${domainToDelete} has been deleted.` });

      if (editingDomain === domainToDelete) {
        startCreateConfig();
        setView("list");
      }

      await loadSavedConfigurations();
    } catch (err) {
      console.error("DELETE CONFIG ERROR:", err);
      setToast({ variant: "error", title: "Delete Failed", message: "Unknown error." });
    }
  };

  const togglePolicy = (policy: string) => {
    const isCurrentlyEnabled = policies.includes(policy);

    if (isCurrentlyEnabled) {
      setPolicies(policies.filter((item) => item !== policy));

      if (policy === "Expiration Check") {
        setExpiryWarningDays(0);
      }

      if (policy === "Issuer Validation") {
        setIssuer("");
      }

      if (policy === "TLS Version Check") {
        setAllowTLS12(false);

        setCipherSuites((prev) =>
          prev.filter((cipherName) => {
            const cipher = availableCipherSuites.find((item) => item.name === cipherName);
            return cipher?.version !== "TLS 1.2";
          }),
        );

        if (cipherGroup === "TLS 1.2") {
          setCipherGroup("All");
        }
      }

      if (policy === "Cipher Suite Check") {
        setCipherSuites([]);
        setCipherSearch("");
        setCipherGroup("All");
      }

      if (policy === "Lint Exclusion") {
        setExcludedLints([]);
        setExcludedLintInput("");
      }

      return;
    }

    setPolicies([...policies, policy]);
  };

  const addExcludedLint = (lintName?: string) => {
    if (!lintPolicyEnabled) {
      setToast({ variant: "error", title: "Policy Disabled", message: "Enable Lint Exclusion before adding excluded lints." });
      return;
    }

    const cleanName = (lintName ?? excludedLintInput).trim();
    if (!cleanName) return;

    if (excludedLints.includes(cleanName)) {
      setToast({ variant: "error", title: "Duplicate Lint", message: `${cleanName} is already excluded.` });
      return;
    }

    setExcludedLints([...excludedLints, cleanName]);
    setExcludedLintInput("");
  };

  const removeExcludedLint = (lintName: string) => {
    if (!lintPolicyEnabled) return;
    setExcludedLints(excludedLints.filter((item) => item !== lintName));
  };

  const filteredCipherSuites = useMemo(() => {
    if (!cipherPolicyEnabled) return [];

    return availableCipherSuites.filter((cipher) => {
      if (!allowTLS12 && cipher.version === "TLS 1.2") return false;

      const matchesSearch = cipher.name.toLowerCase().includes(cipherSearch.toLowerCase());
      const matchesGroup = cipherGroup === "All" || cipher.tags.includes(cipherGroup);

      return matchesSearch && matchesGroup;
    });
  }, [cipherSearch, cipherGroup, allowTLS12, cipherPolicyEnabled]);

  const toggleCipherSuite = (cipher: string) => {
    if (!cipherPolicyEnabled) {
      setToast({ variant: "error", title: "Policy Disabled", message: "Enable Cipher Suite Check before selecting cipher suites." });
      return;
    }

    if (cipherSuites.includes(cipher)) {
      setCipherSuites(cipherSuites.filter((item) => item !== cipher));
    } else {
      setCipherSuites([...cipherSuites, cipher]);
    }
  };

  const clearCipherSuites = () => {
    if (!cipherPolicyEnabled) return;
    setCipherSuites([]);
  };

  const selectFilteredCipherSuites = () => {
    if (!cipherPolicyEnabled) return;
    const names = filteredCipherSuites.map((cipher) => cipher.name);
    setCipherSuites(Array.from(new Set([...cipherSuites, ...names])));
  };

  const handleTLS12Toggle = (checked: boolean) => {
    if (!tlsPolicyEnabled) {
      setToast({ variant: "error", title: "Policy Disabled", message: "Enable TLS Version Check before changing TLS 1.2." });
      return;
    }

    setAllowTLS12(checked);

    if (!checked) {
      setCipherSuites((prev) =>
        prev.filter((cipherName) => {
          const cipher = availableCipherSuites.find((item) => item.name === cipherName);
          return cipher?.version !== "TLS 1.2";
        }),
      );

      if (cipherGroup === "TLS 1.2") {
        setCipherGroup("All");
      }
    }
  };

  const handleSave = async () => {
    const cleanDomain = domain.trim();

    if (!cleanDomain) {
      setToast({ variant: "error", title: "Domain Required", message: "Enter a target wildcard domain before saving." });
      return;
    }

    if (!isValidWildcardDomain(cleanDomain)) {
      setToast({ variant: "error", title: "Invalid Domain", message: "Domain must be a valid wildcard domain, for example *.example.com." });
      return;
    }

    const payload = {
      domain: cleanDomain,
      policies,
      expiry_warning_days: expirationPolicyEnabled
        ? expiryWarningDays === ""
          ? 0
          : Number(expiryWarningDays)
        : 0,
      issuer: issuerPolicyEnabled ? issuer : "",
      allow_tls_1_2: tlsPolicyEnabled ? allowTLS12 : false,
      cipher_suites: cipherPolicyEnabled ? cipherSuites : [],
      excluded_lints: lintPolicyEnabled ? excludedLints : [],
    };

    console.log("CONFIG PAYLOAD SENT:", payload);

    try {
      const response = editingDomain ? await updateConfiguration(editingDomain, payload) : await saveConfiguration(payload);

      if (!response.success) {
        setToast({
          variant: "error",
          title: editingDomain ? "Update Failed" : "Save Failed",
          message: response.message || "Could not save configuration.",
        });
        return;
      }

      setToast({
        variant: "success",
        title: editingDomain ? "Configuration Updated" : "Configuration Created",
        message: `Policies for ${cleanDomain} are now active.`,
      });

      await loadSavedConfigurations();
      setEditingDomain(null);
      setView("list");
    } catch (err) {
      console.error("SAVE ERROR:", err);
      setToast({ variant: "error", title: "Save Failed", message: "Unknown error" });
    }
  };

  const saveDisabled = !domain || Boolean(domainError);

  return (
    <div className="px-8 py-6">
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mb-6">
          <p className="font-mono text-xl uppercase tracking-[0.2em] text-zinc-200">Configuration</p>
          <p className="mt-2 text-sm text-zinc-500">Manage wildcard domain policies for TLS certificate compliance.</p>
        </div>

        <div className="mb-8 flex border-b border-white/10">
          <TopTab active={view === "list"} label="Domain List" onClick={() => setView("list")} />
          <TopTab active={view === "form"} label={editingDomain ? "Edit Config" : "Create Config"} onClick={startCreateConfig} />
        </div>

        {view === "list" && (
          <div className="space-y-6">
            <Card title="Domain List" subtitle="Existing domains, active policies, and configuration actions" icon={<ListChecks className="h-4 w-4" />}>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-sm text-zinc-200">Saved configurations</p>
                  <p className="mt-1 text-xs text-zinc-500">Click edit to modify a domain policy, or delete to remove it.</p>
                </div>

                <button
                  type="button"
                  onClick={startCreateConfig}
                  className="inline-flex items-center gap-2 rounded-md bg-emerald-400 px-4 py-2 font-mono text-xs font-medium text-black transition hover:bg-emerald-300"
                >
                  <Plus className="h-4 w-4" />
                  Create Configuration
                </button>
              </div>

              {loadingConfigs ? (
                <p className="font-mono text-xs text-zinc-500">Loading saved configurations...</p>
              ) : savedConfigs.length === 0 ? (
                <div className="rounded-lg border border-dashed border-zinc-800 px-5 py-8 text-center">
                  <p className="font-mono text-sm text-zinc-300">No saved configurations found.</p>
                  <p className="mt-2 text-xs text-zinc-500">Create your first wildcard domain policy to start.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedConfigs.map((config) => (
                    <div key={config.key || config.domain} className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-mono text-sm text-emerald-300">{config.domain}</p>

                          <p className="mt-1 font-mono text-xs text-zinc-500">
                            Expiry warning: {config.expiry_warning_days ?? 30} days
                            {config.issuer ? ` · Issuer: ${config.issuer}` : ""}
                            {` · TLS 1.2: ${config.allow_tls_1_2 ? "Allowed" : "Blocked"}`}
                          </p>
                        </div>

                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => applySavedConfigToForm(config)}
                            className="inline-flex items-center gap-2 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 font-mono text-xs text-emerald-300 hover:bg-emerald-400/20"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteConfig(config.domain)}
                            className="inline-flex items-center gap-2 rounded-md border border-red-400/30 bg-red-400/10 px-3 py-1.5 font-mono text-xs text-red-300 hover:bg-red-400/20"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {config.policies?.length ? (
                          config.policies.map((policy) => (
                            <span key={policy} className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 font-mono text-[10px] text-emerald-300">
                              {policy}
                            </span>
                          ))
                        ) : (
                          <span className="font-mono text-xs text-zinc-600">No policies stored</span>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full border border-zinc-700 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400">
                          {config.cipher_suites?.length || 0} ciphers
                        </span>

                        <span className="rounded-full border border-red-400/30 bg-red-400/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-red-300">
                          {config.excluded_lints?.length || 0} excluded lints
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {view === "form" && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
                  {editingDomain ? "Edit Configuration" : "Create Configuration"}
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  {editingDomain ? `Editing policy for ${editingDomain}` : "Create a new wildcard domain policy."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setView("list")}
                className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-4 py-2 font-mono text-xs text-zinc-300 transition hover:border-emerald-400/40 hover:text-emerald-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Domain List
              </button>
            </div>

            <section className="space-y-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.24em] text-emerald-400">Domain</p>
                <p className="mt-1 text-sm text-zinc-500">Set the wildcard domain this configuration applies to.</p>
              </div>

              <Card title="Target Domain" subtitle="Wildcard domains must start with *." icon={<Settings className="h-4 w-4" />}>
                <label htmlFor="domain" className="block text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">Wildcard Domain</label>

                <input
                  id="domain"
                  type="text"
                  placeholder="*.example.com"
                  value={domain}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDomain(value);
                    validateDomain(value);
                  }}
                  className={`mt-2 w-full rounded-md border bg-zinc-900/50 px-4 py-2.5 text-sm font-mono text-zinc-200 outline-none placeholder:text-zinc-600 ${
                    domainError ? "border-red-400/60 focus:border-red-400" : "border-zinc-800 focus:border-emerald-400/50"
                  }`}
                />

                {domainError && <p className="mt-2 text-xs font-mono text-red-400">{domainError}</p>}
                {!domainError && domain && <p className="mt-2 text-xs font-mono text-emerald-400">Valid wildcard domain</p>}
              </Card>
            </section>

            <section className="space-y-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.24em] text-emerald-400">Policies</p>
                <p className="mt-1 text-sm text-zinc-500">Unchecked policies will disable their related inputs.</p>
              </div>

              <Card title="Policy Selection" subtitle="Only selected policies can be configured" icon={<ShieldCheck className="h-4 w-4" />}>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {policyOptions.map((policy) => (
                    <label key={policy} className="flex cursor-pointer items-center gap-3 rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-3 transition hover:border-zinc-700">
                      <input type="checkbox" checked={policies.includes(policy)} onChange={() => togglePolicy(policy)} className="h-4 w-4 shrink-0 accent-emerald-400" />
                      <span className="font-mono text-sm text-zinc-300">{policy}</span>
                    </label>
                  ))}
                </div>
              </Card>

              <Card title="Validation Rules" subtitle="Expiry, issuer, and TLS version settings" icon={<ShieldCheck className="h-4 w-4" />}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="expiryDays" className="block text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">Certificate Expiry Warning Days</label>
                    <input
                      id="expiryDays"
                      type="number"
                      min={0}
                      disabled={!expirationPolicyEnabled}
                      value={expiryWarningDays}
                      onChange={(e) =>
                        setExpiryWarningDays(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      className={`mt-2 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm font-mono text-zinc-200 outline-none focus:border-emerald-400/50 ${
                        !expirationPolicyEnabled ? "cursor-not-allowed opacity-40" : ""
                      }`}
                    />
                  </div>

                  <div>
                    <label htmlFor="issuer" className="block text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">Allowed Issuer</label>
                    <input
                      id="issuer"
                      type="text"
                      disabled={!issuerPolicyEnabled}
                      placeholder="Example: Let's Encrypt"
                      value={issuer}
                      onChange={(e) => setIssuer(e.target.value)}
                      className={`mt-2 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm font-mono text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-emerald-400/50 ${
                        !issuerPolicyEnabled ? "cursor-not-allowed opacity-40" : ""
                      }`}
                    />
                  </div>
                </div>

                <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-3 transition hover:border-zinc-700">
                  <div className="min-w-0">
                    <p className="font-mono text-sm text-zinc-200">Allow TLS 1.2</p>
                    <p className="mt-0.5 text-xs text-zinc-500">Enable TLS Version Check before changing this setting.</p>
                  </div>

                  <input
                    type="checkbox"
                    disabled={!tlsPolicyEnabled}
                    checked={allowTLS12}
                    onChange={(e) => handleTLS12Toggle(e.target.checked)}
                    className="h-4 w-4 shrink-0 accent-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                  />
                </label>
              </Card>

              <Card title="Excluded Lints" subtitle="Enable Lint Exclusion before adding lint names" icon={<X className="h-4 w-4" />}>
                <div className="flex flex-col gap-3 md:flex-row">
                  <input
                    type="text"
                    disabled={!lintPolicyEnabled}
                    placeholder="Example: e_ext_authority_key_identifier_missing"
                    value={excludedLintInput}
                    onChange={(e) => setExcludedLintInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addExcludedLint();
                      }
                    }}
                    className={`w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm font-mono text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-emerald-400/50 ${
                      !lintPolicyEnabled ? "cursor-not-allowed opacity-40" : ""
                    }`}
                  />

                  <button
                    type="button"
                    disabled={!lintPolicyEnabled}
                    onClick={() => addExcludedLint()}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-emerald-400 px-4 py-2 font-mono text-xs font-medium text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                    Add Lint
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {commonLintExamples.map((lint) => (
                    <button
                      key={lint}
                      type="button"
                      disabled={!lintPolicyEnabled}
                      onClick={() => addExcludedLint(lint)}
                      className="rounded-full border border-zinc-700 px-2.5 py-1 font-mono text-[10px] text-zinc-400 transition hover:border-emerald-400/40 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {lint}
                    </button>
                  ))}
                </div>

                <div className="mt-4">
                  {excludedLints.length === 0 ? (
                    <p className="font-mono text-xs text-zinc-600">No lints excluded.</p>
                  ) : (
                    <div className="flex max-h-[120px] flex-wrap gap-2 overflow-y-auto">
                      {excludedLints.map((lint) => (
                        <button
                          key={lint}
                          type="button"
                          disabled={!lintPolicyEnabled}
                          onClick={() => removeExcludedLint(lint)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-red-400/30 bg-red-400/10 px-2.5 py-1 font-mono text-[10px] text-red-300 transition hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {lint}
                          <X className="h-3 w-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              <Card title="Cipher Suites" subtitle="Enable Cipher Suite Check before selecting ciphers" icon={<KeyRound className="h-4 w-4" />} bodyClassName="space-y-4 px-6 py-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px]">
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <input
                      type="text"
                      disabled={!cipherPolicyEnabled}
                      placeholder="Search AES, RSA, GCM..."
                      value={cipherSearch}
                      onChange={(e) => setCipherSearch(e.target.value)}
                      className={`w-full rounded-md border border-zinc-800 bg-zinc-900/50 py-2 pl-9 pr-3 text-sm font-mono text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-emerald-400/50 ${
                        !cipherPolicyEnabled ? "cursor-not-allowed opacity-40" : ""
                      }`}
                    />
                  </div>

                  <select
                    disabled={!cipherPolicyEnabled}
                    value={cipherGroup}
                    onChange={(e) => setCipherGroup(e.target.value)}
                    className={`w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm font-mono text-zinc-200 outline-none focus:border-emerald-400/50 ${
                      !cipherPolicyEnabled ? "cursor-not-allowed opacity-40" : ""
                    }`}
                  >
                    {cipherGroups
                      .filter((group) => allowTLS12 || group !== "TLS 1.2")
                      .map((group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-mono text-xs text-zinc-500">Showing {filteredCipherSuites.length} · Selected {cipherSuites.length}</p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={!cipherPolicyEnabled}
                      onClick={selectFilteredCipherSuites}
                      className="rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 font-mono text-xs text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900/80 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Select shown
                    </button>

                    <button
                      type="button"
                      disabled={!cipherPolicyEnabled}
                      onClick={clearCipherSuites}
                      className="rounded-md border border-red-500/30 bg-red-500/5 px-3 py-1.5 font-mono text-xs text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid max-h-[260px] grid-cols-1 gap-1.5 overflow-y-auto rounded-md border border-zinc-800 bg-zinc-900/30 p-2 md:grid-cols-2">
                  {filteredCipherSuites.length === 0 ? (
                    <p className="col-span-full py-6 text-center font-mono text-xs text-zinc-600">No cipher suites match or policy is disabled</p>
                  ) : (
                    filteredCipherSuites.map((cipher) => {
                      const selected = cipherSuites.includes(cipher.name);

                      return (
                        <label
                          key={cipher.name}
                          className={`flex cursor-pointer items-start gap-2 rounded-md border px-2.5 py-1.5 transition ${
                            selected ? "border-emerald-400/30 bg-emerald-400/5" : "border-zinc-800 bg-transparent hover:border-zinc-700 hover:bg-zinc-900/60"
                          }`}
                        >
                          <input
                            type="checkbox"
                            disabled={!cipherPolicyEnabled}
                            checked={selected}
                            onChange={() => toggleCipherSuite(cipher.name)}
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                          />

                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-mono text-xs text-zinc-200">{cipher.name}</span>
                            <span className="mt-0.5 block truncate font-mono text-[10px] text-zinc-500">{cipher.tags.join(" · ")}</span>
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </Card>
            </section>

            <div className="sticky bottom-4 z-30 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-[#0a0a0d]/95 px-6 py-3 shadow-[0_0_35px_rgba(0,0,0,0.35)] backdrop-blur">
              <p className="min-w-0 truncate font-mono text-xs text-zinc-400">{editingDomain ? `Editing ${editingDomain}` : "Create a new configuration"}</p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className="inline-flex shrink-0 items-center gap-2 rounded-md border border-zinc-700 px-4 py-2 text-sm font-mono text-zinc-300 transition hover:border-emerald-400/40 hover:text-emerald-300"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saveDisabled}
                  className="inline-flex shrink-0 items-center gap-2 rounded-md bg-emerald-400 px-5 py-2 text-sm font-mono font-medium text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {editingDomain ? "Update Configuration" : "Create Configuration"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
