export function applyDateFilter(rows, filterDate) {
    if (!filterDate) {
        return rows;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    return rows.filter((row) => {
        const rowDate = new Date(row.createdAt);
        rowDate.setHours(0, 0, 0, 0);
        if (filterDate === "today") return rowDate.getTime() === today.getTime();
        if (filterDate === "yesterday") return rowDate.getTime() === yesterday.getTime();
        const selectedDate = new Date(`${filterDate}T00:00:00`);
        if (Number.isNaN(selectedDate.getTime())) {
            return true;
        }
        return rowDate.getTime() === selectedDate.getTime();
    });
}

export function sortRowsByScore(rows, sortOrder) {
    return [...rows].sort((left, right) => sortOrder === "desc" ? right.score - left.score : left.score - right.score);
}
