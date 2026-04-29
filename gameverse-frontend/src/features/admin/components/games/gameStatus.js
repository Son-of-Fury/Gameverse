export function getStatusBadgeClassName(status) {
    if (status === "WITHDRAWN") return "admin-rank-withdrawn";
    if (status === "EDITED") return "admin-rank-edited";
    if (status === "PUBLISHED") return "admin-rank-published";
    if (status === "NEEDS_CHANGES") return "admin-rank-needs-changes";
    return "admin-rank-pending";
}
