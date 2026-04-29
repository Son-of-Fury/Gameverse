import { getStoredLanguage } from "../storage/languageStorage.js";
import { getToken } from "../storage/tokenStorage.js";

export async function request(path, { method = "GET", body, auth = false } = {}) {
    const headers = {
        "Content-Type": "application/json",
        "Accept-Language": getStoredLanguage()
    };

    if (auth) {
        const token = getToken();
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
    }

    const response = await fetch(path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
        throw await buildRequestError(response);
    }

    return parseResponse(response);
}

async function buildRequestError(response) {
    const text = await response.text().catch(() => "");
    let errorData;

    try {
        errorData = JSON.parse(text);
    } catch {
        errorData = { error: text };
    }

    const error = new Error(errorData.error || `Error: ${response.status}`);
    error.status = response.status;
    error.response = { data: errorData };
    return error;
}

async function parseResponse(response) {
    const contentType = response.headers.get("content-type") || "";
    return contentType.includes("application/json") ? response.json() : response.text();
}
