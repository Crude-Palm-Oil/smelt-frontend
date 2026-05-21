"use client";

import { useMemo, useState } from "react";
import { Settings, ShieldCheck } from "lucide-react";
import { saveConfiguration } from "@/lib/server/config";

type ConfigTab = "domain" | "policies";

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
  const [activeTab, setActiveTab] =
    useState<ConfigTab>("domain");

  const [domain, setDomain] = useState("");
  const [expiryWarningDays, setExpiryWarningDays] =
    useState(30);

  const [issuer, setIssuer] = useState("");
  const [allowTLS12, setAllowTLS12] = useState(true);

  const [cipherSuites, setCipherSuites] = useState<
    string[]
  >([]);

  const [cipherSearch, setCipherSearch] =
    useState("");

  const [cipherGroup, setCipherGroup] =
    useState("All");

  const filteredCipherSuites = useMemo(() => {
    return availableCipherSuites.filter((cipher) => {
      if (!allowTLS12 && cipher.version === "TLS 1.2") {
        return false;
      }

      const matchesSearch = cipher.name
        .toLowerCase()
        .includes(cipherSearch.toLowerCase());

      const matchesGroup =
        cipherGroup === "All" ||
        cipher.tags.includes(cipherGroup);

      return matchesSearch && matchesGroup;
    });
  }, [cipherSearch, cipherGroup, allowTLS12]);

  const toggleCipherSuite = (cipher: string) => {
    if (cipherSuites.includes(cipher)) {
      setCipherSuites(
        cipherSuites.filter((item) => item !== cipher)
      );
    } else {
      setCipherSuites([...cipherSuites, cipher]);
    }
  };

  const clearCipherSuites = () => {
    setCipherSuites([]);
  };

  const selectFilteredCipherSuites = () => {
    const names = filteredCipherSuites.map(
      (cipher) => cipher.name
    );

    setCipherSuites(
      Array.from(new Set([...cipherSuites, ...names]))
    );
  };

  const handleTLS12Toggle = (checked: boolean) => {
    setAllowTLS12(checked);

    if (!checked) {
      setCipherSuites((prev) =>
        prev.filter((cipherName) => {
          const cipher = availableCipherSuites.find(
            (item) => item.name === cipherName
          );

          return cipher?.version !== "TLS 1.2";
        })
      );

      if (cipherGroup === "TLS 1.2") {
        setCipherGroup("All");
      }
    }
  };

const handleSave = async () => {
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
      alert(response.message);
      return;
    }

    alert("Configuration saved");
  } catch (err) {
    console.error("SAVE ERROR:", err);
    alert("Unknown error");
  }
};

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100">
      <div className="px-8 py-10">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-8">
            <p className="text-xl tracking-[0.2em] text-zinc-200">
              CONFIGURATION
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              Configure TLS certificate policies by
              domain
            </p>
          </div>

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

          <div className="grid grid-cols-1 gap-6">
            {activeTab === "domain" && (
              <Card
                title="Target Domain"
                subtitle="Choose the website domain this configuration applies to"
                icon={<Settings className="h-5 w-5" />}
              >
                <label className="mb-3 block text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Domain
                </label>

                <input
                  type="text"
                  placeholder="example.com"
                  value={domain}
                  onChange={(e) =>
                    setDomain(e.target.value)
                  }
                  className="w-full rounded-md border border-white/10 bg-black px-4 py-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-emerald-400/50"
                />
              </Card>
            )}

            {activeTab === "policies" && (
              <>
                <Card
                  title="TLS Policies"
                  subtitle="Configure TLS validation settings"
                  icon={<ShieldCheck className="h-5 w-5" />}
                >
                  <div className="space-y-6">
                    <div>
                      <label className="mb-3 block text-xs uppercase tracking-[0.2em] text-zinc-500">
                        Certificate Expiry Warning Days
                      </label>

                      <input
                        type="number"
                        min={1}
                        value={expiryWarningDays}
                        onChange={(e) =>
                          setExpiryWarningDays(
                            Number(e.target.value)
                          )
                        }
                        className="w-full rounded-md border border-white/10 bg-black px-4 py-3 text-sm text-zinc-200 outline-none focus:border-emerald-400/50"
                      />
                    </div>

                    <div>
                      <label className="mb-3 block text-xs uppercase tracking-[0.2em] text-zinc-500">
                        Allowed Issuer
                      </label>

                      <input
                        type="text"
                        placeholder="Example: Let's Encrypt"
                        value={issuer}
                        onChange={(e) =>
                          setIssuer(e.target.value)
                        }
                        className="w-full rounded-md border border-white/10 bg-black px-4 py-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-emerald-400/50"
                      />
                    </div>

                    <label className="flex items-center gap-3 rounded-md border border-white/10 px-4 py-3 hover:bg-white/5">
                      <input
                        type="checkbox"
                        checked={allowTLS12}
                        onChange={(e) =>
                          handleTLS12Toggle(
                            e.target.checked
                          )
                        }
                      />

                      <span className="text-sm text-zinc-300">
                        Allow TLS 1.2
                      </span>
                    </label>

                    <div>
                      <div className="mb-4 flex flex-col gap-3 md:flex-row">
                        <div className="flex-1">
                          <label className="mb-3 block text-xs uppercase tracking-[0.2em] text-zinc-500">
                            Search Cipher Suites
                          </label>

                          <input
                            type="text"
                            placeholder="Search AES, RSA, GCM..."
                            value={cipherSearch}
                            onChange={(e) =>
                              setCipherSearch(
                                e.target.value
                              )
                            }
                            className="w-full rounded-md border border-white/10 bg-black px-4 py-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-emerald-400/50"
                          />
                        </div>

                        <div className="md:w-64">
                          <label className="mb-3 block text-xs uppercase tracking-[0.2em] text-zinc-500">
                            Group
                          </label>

                          <select
                            value={cipherGroup}
                            onChange={(e) =>
                              setCipherGroup(
                                e.target.value
                              )
                            }
                            className="w-full rounded-md border border-white/10 bg-black px-4 py-3 text-sm text-zinc-200 outline-none focus:border-emerald-400/50"
                          >
                            {cipherGroups
                              .filter(
                                (group) =>
                                  allowTLS12 ||
                                  group !== "TLS 1.2"
                              )
                              .map((group) => (
                                <option
                                  key={group}
                                  value={group}
                                >
                                  {group}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>

                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-zinc-500">
                          Showing{" "}
                          {
                            filteredCipherSuites.length
                          }{" "}
                          cipher suites. Selected{" "}
                          {cipherSuites.length}.
                        </p>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={
                              selectFilteredCipherSuites
                            }
                            className="rounded-md border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5"
                          >
                            Select shown
                          </button>

                          <button
                            type="button"
                            onClick={clearCipherSuites}
                            className="rounded-md border border-red-500/30 px-3 py-2 text-xs text-red-300 hover:bg-red-500/10"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {filteredCipherSuites.map(
                          (cipher) => (
                            <label
                              key={cipher.name}
                              className="flex items-start gap-3 rounded-md border border-white/10 px-3 py-3 hover:bg-white/5"
                            >
                              <input
                                type="checkbox"
                                checked={cipherSuites.includes(
                                  cipher.name
                                )}
                                onChange={() =>
                                  toggleCipherSuite(
                                    cipher.name
                                  )
                                }
                                className="mt-1"
                              />

                              <span>
                                <span className="block break-all text-sm text-zinc-300">
                                  {cipher.name}
                                </span>

                                <span className="mt-1 block text-xs text-zinc-600">
                                  {cipher.version} ·{" "}
                                  {cipher.tags.join(
                                    " · "
                                  )}
                                </span>
                              </span>
                            </label>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card
                  title="Selected Cipher Suites"
                  subtitle="Cipher suites currently selected"
                >
                  {cipherSuites.length === 0 ? (
                    <p className="text-sm text-zinc-500">
                      No cipher suites selected.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {cipherSuites.map((cipher) => (
                        <button
                          key={cipher}
                          type="button"
                          onClick={() =>
                            toggleCipherSuite(cipher)
                          }
                          className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300 hover:bg-emerald-400/20"
                        >
                          {cipher} ×
                        </button>
                      ))}
                    </div>
                  )}
                </Card>
              </>
            )}

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