function normalizeServerMessage(error) {
    const message = error?.response?.data?.error || error?.message || "";
    const normalized = String(message).trim();

    if (!normalized) return "";
    if (/^error:\s*\d+/i.test(normalized)) return "";
    if (/^\d{3}\s+[a-z]/i.test(normalized)) return "";
    if (/internal server error/i.test(normalized)) return "";

    return normalized;
}

function buildFallbackByAction(t) {
    return {
        login: t("errors.login.generic"),
        register: t("errors.register.generic"),
        requestPasswordReset: t("errors.reset.requestFailed"),
        resetPassword: t("errors.reset.generic"),
        like: t("errors.rating.like"),
        dislike: t("errors.rating.dislike"),
        submitScore: t("errors.score.save"),
        profileLoad: t("errors.profile.load"),
        profileSave: t("errors.profile.save"),
        profileUpload: t("errors.profile.upload"),
        profileDelete: t("errors.profile.delete"),
        adminLoad: t("errors.admin.load"),
        adminCreateUser: t("errors.admin.userCreate"),
        adminUpdateUser: t("errors.admin.userUpdate"),
        adminDeleteUser: t("errors.admin.userDelete"),
        adminCreateGame: t("errors.admin.gameCreate"),
        adminUpdateGame: t("errors.admin.gameUpdate"),
        adminUpdateGameStatus: t("errors.admin.gameStatusUpdate"),
        adminDeleteGame: t("errors.admin.gameDelete"),
        adminUploadGameImage: t("errors.admin.gameImageUpload")
    };
}

function buildStatusHandlers(t, serverMessage) {
    const adminDenied = () => t("errors.admin.notAllowed");
    const authLoginRequired = () => t("errors.auth.loginRequired");
    const authForbidden = () => t("errors.auth.forbidden");
    const notFound = () => serverMessage || t("errors.common.notFound");
    const withServerFallback = (key) => serverMessage || t(key);

    return {
        400: {
            login: () => t("errors.login.invalidCredentials"),
            register: () => withServerFallback("errors.register.invalidData"),
            requestPasswordReset: () => withServerFallback("errors.reset.requestFailed"),
            resetPassword: () => withServerFallback("errors.reset.invalidToken"),
            profileSave: () => withServerFallback("errors.profile.save"),
            profileUpload: () => withServerFallback("errors.profile.upload"),
            adminCreateGame: () => withServerFallback("errors.admin.gameCreate"),
            adminUpdateGame: () => withServerFallback("errors.admin.gameUpdate"),
            adminCreateUser: () => withServerFallback("errors.admin.userCreate")
        },
        401: {
            login: () => t("errors.login.invalidCredentials"),
            like: () => t("errors.rating.loginRequired"),
            dislike: () => t("errors.rating.loginRequired"),
            submitScore: () => t("errors.score.loginRequired"),
            profileLoad: () => t("errors.auth.sessionExpired"),
            profileSave: () => t("errors.auth.sessionExpired"),
            profileUpload: () => t("errors.auth.sessionExpired"),
            profileDelete: () => t("errors.auth.sessionExpired"),
            __admin__: adminDenied,
            __default__: authLoginRequired
        },
        403: {
            __admin__: adminDenied,
            __default__: authForbidden
        },
        404: {
            requestPasswordReset: () => t("errors.reset.requestFailed"),
            __default__: notFound
        },
        409: {
            register: () => t("errors.register.conflict"),
            adminCreateUser: () => t("errors.admin.userConflict"),
            adminCreateGame: () => t("errors.admin.gameConflict")
        }
    };
}

function resolveStatusError(statusHandlers, status, action) {
    const handlers = statusHandlers[status];
    if (!handlers) return "";
    if (action && handlers[action]) return handlers[action]();
    if (action?.startsWith("admin") && handlers.__admin__) return handlers.__admin__();
    if (handlers.__default__) return handlers.__default__();
    return "";
}

export function getActionError(error, t, action) {
    const status = error?.status || error?.response?.status;
    const serverMessage = normalizeServerMessage(error);
    const statusError = resolveStatusError(buildStatusHandlers(t, serverMessage), status, action);

    if (statusError) return statusError;
    if (serverMessage) return serverMessage;

    const fallbackByAction = buildFallbackByAction(t);
    return fallbackByAction[action] || t("errors.common.generic");
}
