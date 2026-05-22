"use server";

const API_BASE_URL =
  process.env.API_CONFIG_URL ||
  process.env.API_SCAN_URL ||
  process.env.NEXT_PUBLIC_CONFIG_API_URL ||
  process.env.NEXT_PUBLIC_API_SCAN_URL ||
  "http://backend:8000";

export type ConfigurationPayload = {
  domain: string;
  policies: string[];
  expiry_warning_days: number;
  issuer: string;
  allow_tls_1_2: boolean;
  cipher_suites: string[];
  excluded_lints: string[];
};

export type SavedConfiguration = ConfigurationPayload & {
  updated_at?: string;
  key?: string;
  bucket?: string;
  file_path?: string;
};

type ApiResult<T> = {
  success: boolean;
  data: T;
  message?: string;
  status?: string;
};

type ApiErrorItem = {
  type?: string;
  loc?: string[];
  msg?: string;
  input?: unknown;
  ctx?: unknown;
};

type ApiResponseData = {
  success?: boolean;
  status?: string;
  data?: unknown;
  message?: string;
  detail?: string | ApiErrorItem[] | unknown;
};

async function parseResponse(res: Response): Promise<ApiResponseData | string | null> {
  const text = await res.text();

  if (!text) return null;

  try {
    return JSON.parse(text) as ApiResponseData;
  } catch {
    return text;
  }
}

function getErrorMessage(data: ApiResponseData | string | null, fallback: string) {
  if (!data) return fallback;

  if (typeof data === "string") return data;

  if (typeof data.message === "string") return data.message;

  if (typeof data.detail === "string") return data.detail;

  if (Array.isArray(data.detail)) {
    return data.detail
      .map((item: unknown) => {
        if (typeof item === "string") return item;

        if (typeof item === "object" && item !== null) {
          const errorItem = item as ApiErrorItem;

          if (errorItem.msg && errorItem.loc) {
            return `${errorItem.loc.join(".")}: ${errorItem.msg}`;
          }

          if (errorItem.msg) return errorItem.msg;

          return JSON.stringify(errorItem);
        }

        return String(item);
      })
      .join("; ");
  }

  if (data.detail) return JSON.stringify(data.detail);

  return fallback;
}

function encodeDomain(domain: string) {
  return encodeURIComponent(domain).replace(/\*/g, "%2A");
}

export async function saveConfiguration(
  payload: ConfigurationPayload,
): Promise<{
  success: boolean;
  data?: unknown;
  message?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await parseResponse(res);

    if (!res.ok) {
      return {
        success: false,
        message: getErrorMessage(data, "Failed to save configuration"),
      };
    }

    return {
      success:
        typeof data === "object" && data !== null
          ? data.success ?? true
          : true,
      data,
      message:
        typeof data === "object" && data !== null && typeof data.message === "string"
          ? data.message
          : undefined,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateConfiguration(
  oldDomain: string,
  payload: ConfigurationPayload,
): Promise<{
  success: boolean;
  data?: unknown;
  message?: string;
}> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/config/${encodeDomain(oldDomain)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      },
    );

    const data = await parseResponse(res);

    if (!res.ok) {
      return {
        success: false,
        message: getErrorMessage(data, "Failed to update configuration"),
      };
    }

    return {
      success:
        typeof data === "object" && data !== null
          ? data.success ?? true
          : true,
      data,
      message:
        typeof data === "object" && data !== null && typeof data.message === "string"
          ? data.message
          : undefined,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function listConfigurations(): Promise<
  ApiResult<SavedConfiguration[]>
> {
  try {
    const res = await fetch(`${API_BASE_URL}/configs`, {
      method: "GET",
      cache: "no-store",
    });

    const data = await parseResponse(res);

    if (!res.ok) {
      return {
        success: false,
        data: [],
        message: getErrorMessage(data, "Failed to load configurations"),
      };
    }

    if (typeof data !== "object" || data === null) {
      return {
        success: true,
        data: [],
      };
    }

    return {
      success: data.success ?? true,
      status: data.status,
      data: Array.isArray(data.data)
        ? (data.data as SavedConfiguration[])
        : [],
      message: typeof data.message === "string" ? data.message : undefined,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getConfiguration(
  domain: string,
): Promise<ApiResult<SavedConfiguration | null>> {
  try {
    const res = await fetch(`${API_BASE_URL}/config/${encodeDomain(domain)}`, {
      method: "GET",
      cache: "no-store",
    });

    const data = await parseResponse(res);

    if (!res.ok) {
      return {
        success: false,
        data: null,
        message: getErrorMessage(data, "Failed to load configuration"),
      };
    }

    if (typeof data !== "object" || data === null) {
      return {
        success: true,
        data: null,
      };
    }

    return {
      success: data.success ?? true,
      status: data.status,
      data: data.data ? (data.data as SavedConfiguration) : null,
      message: typeof data.message === "string" ? data.message : undefined,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteConfiguration(
  domain: string,
): Promise<{
  success: boolean;
  data?: unknown;
  message?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/config/${encodeDomain(domain)}`, {
      method: "DELETE",
      cache: "no-store",
    });

    const data = await parseResponse(res);

    if (!res.ok) {
      return {
        success: false,
        message: getErrorMessage(data, "Failed to delete configuration"),
      };
    }

    return {
      success:
        typeof data === "object" && data !== null
          ? data.success ?? true
          : true,
      data,
      message:
        typeof data === "object" && data !== null && typeof data.message === "string"
          ? data.message
          : undefined,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}