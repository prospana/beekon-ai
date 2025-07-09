"use server";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
const n8nUrl = import.meta.env.VITE_N8N_URL;
const n8nAuthUser = import.meta.env.VITE_BASIC_USER;
const n8nAuthPass = import.meta.env.VITE_BASIC_PASS;

export type HttpResponse = {
  success: boolean;
  messages: string[];
  data: unknown;
};

export function noTrailingSlash(website: string) {
  return website.replace(/\/+$/, "");
}

export async function sendN8nWebhook(
  endpoint: string,
  body: object | undefined = undefined
) {
  const base64Creds = btoa(`${n8nAuthUser}:${n8nAuthPass}`);
  return await httpRequest(
    "POST",
    `${noTrailingSlash(n8nUrl)}/${endpoint}`,
    {
      Authorization: `Basic ${base64Creds}`,
      "Content-Type": "application/json",
    },
    JSON.stringify(body)
  );
}

export async function httpRequest(
  method: Method,
  url: string,
  requestHeaders: object | undefined,
  body: FormData | string | undefined = undefined
): Promise<HttpResponse> {
  let data: HttpResponse | unknown;
  const headers: HeadersInit = new Headers();

  if (requestHeaders) {
    Object.entries(requestHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });
  }

  try {
    const options = {
      method: method,
      headers: headers,
      body: body,
    };

    const response = await fetch(url, options);
    data = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("error", error);

    return {
      success: false,
      messages: [error instanceof Error ? error.message : String(error)],
      data: data,
    };
  }

  return {
    success: true,
    messages: ["success"],
    data: data,
  };
}
