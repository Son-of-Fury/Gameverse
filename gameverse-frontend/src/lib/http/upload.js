import { getStoredLanguage } from "../storage/languageStorage.js";
import { getToken } from "../storage/tokenStorage.js";

export async function upload(path, formData, { auth = false } = {}) {
    const headers = {
        "Accept-Language": getStoredLanguage()
    };

    if (auth) {
        const token = getToken();
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
    }

    const response = await fetch(path, {
        method: "POST",
        headers,
        body: formData
    });

    if (!response.ok) {
        throw await buildUploadError(response);
    }

    return parseUploadResponse(response);
}

async function buildUploadError(response) {
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

async function parseUploadResponse(response) {
    const contentType = response.headers.get("content-type") || "";
    return contentType.includes("application/json") ? response.json() : response.text();
}
