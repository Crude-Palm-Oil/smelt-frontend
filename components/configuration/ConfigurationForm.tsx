"use client";

import { useState, useEffect } from "react";
import { Settings, ShieldCheck } from "lucide-react";

type ConfigTab = "domain" | "policies";

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
    <div className="rounded-xl border border-white/10 bg-[#0a0a0d]/80 backdrop-blur-sm">
      <div className="px-6 pt-6">
        <div className="flex items-center gap-3">
          {icon && <div className="text-emerald-400">{icon}</div>}
          <h3 className="text-lg tracking-[0.14em] text-zinc-200">{title}</h3>
        </div>
        {subtitle && (
          <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>
        )}
      </div>
      <div className="px-6 pb-6 pt-5">{children}</div>
    </div>
  );
}

export default function ConfigurationForm() {
  const [activeTab, setActiveTab] = useState<ConfigTab>("domain");

  const [domain, setDomain] = useState("");
  const [policies, setPolicies] = useState<string[]>([]);
  const [certs, setCerts] = useState<string[]>([]);

  const [loadingConfig, setLoadingConfig] = useState(false);

  const policyOptions = [
    "Expiration Check",
    "Issuer Validation",
    "Signature Algorithm",
  ];

  const toggle = (
    item: string,
    list: string[],
    setList: (val: string[]) => void
  ) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  // ✅ LOAD CONFIG
  const loadConfig = async (domain: string) => {
    if (!domain) return;

    try {
      setLoadingConfig(true);

      const res = await fetch(`http://localhost:8000/config/${domain}`);
      const data = await res.json();

      if (data.status === "found") {
        setPolicies(data.data.policies || []);
        setCerts(data.data.certs || []);
      } else {
        setPolicies([]);
        setCerts([]);
      }
    } catch (err) {
      console.error("Load config failed:", err);
    } finally {
      setLoadingConfig(false);
    }
  };

  // ✅ AUTO LOAD WITH DEBOUNCE
  useEffect(() => {
    if (!domain) return;

    const timeout = setTimeout(() => {
      loadConfig(domain);
    }, 500);

    return () => clearTimeout(timeout);
  }, [domain]);

  // ✅ SAVE CONFIG
  const handleSave = async () => {
    try {
      const res = await fetch("http://localhost:8000/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain, policies, certs }),
      });

      const data = await res.json();
      console.log(data);

      alert("Configuration saved");
    } catch (err) {
      console.error(err);
      alert("Failed to save config");
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100">
      <div className="px-8 py-10">
        <div className="mx-auto max-w-[1200px]">

          {/* Header */}
          <div className="mb-8">
            <p className="text-xl tracking-[0.2em] text-zinc-200">
              CONFIGURATION
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Configure TLS policies validation rules
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-8 flex border-b border-white/8">
            <TabButton
              active={activeTab === "domain"}
              label="DOMAIN"
              onClick={() => setActiveTab("domain")}
            />
            <TabButton
              active={activeTab === "policies"}
              label="POLICIES"
              onClick={() => setActiveTab("policies")}
            />
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 gap-6">

            {/* DOMAIN */}
            {activeTab === "domain" && (
              <Card
                title="Target Domain"
                icon={<Settings className="h-5 w-5" />}
              >
                <input
                  type="text"
                  placeholder="example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full rounded-md border border-white/10 bg-black px-4 py-3 text-sm text-zinc-200 outline-none focus:border-emerald-400/50"
                />

                {loadingConfig && (
                  <p className="mt-2 text-xs text-zinc-500">
                    Loading existing config...
                  </p>
                )}
              </Card>
            )}

            {/* POLICIES */}
            {activeTab === "policies" && (
              <Card
                title="Policy Selection"
                subtitle="Select compliance checks to apply"
                icon={<ShieldCheck className="h-5 w-5" />}
              >
                <div className="grid grid-cols-2 gap-3">
                  {policyOptions.map((p) => (
                    <label
                      key={p}
                      className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 cursor-pointer hover:bg-white/5"
                    >
                      <input
                        type="checkbox"
                        checked={policies.includes(p)}
                        onChange={() => toggle(p, policies, setPolicies)}
                      />
                      <span className="text-sm text-zinc-300">{p}</span>
                    </label>
                  ))}
                </div>
              </Card>
            )}

            {/* SAVE BUTTON */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={!domain}
                className="rounded-md bg-emerald-400 px-6 py-3 text-sm font-medium text-black hover:bg-emerald-300 disabled:opacity-50"
              >
                Save Configuration
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}