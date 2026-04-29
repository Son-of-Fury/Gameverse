import { Link } from "react-router-dom";

export default function GameActions({ game, reviewBusyId, t, wasPreviewed, onStartEdit, onStatusChange, onPreviewOpen, onDelete }) {
    return (
        <div className="admin-actions">
            {renderPrimaryAction()}
            <button type="button" onClick={() => onDelete(game.id)} className="admin-button-danger">{t("admin.gameDelete")}</button>
        </div>
    );

    function renderPrimaryAction() {
        if (game.reviewStatus === "NEEDS_CHANGES") {
            return <button type="button" onClick={() => onStartEdit(game.id)} className="admin-button-secondary">{t("admin.editGame")}</button>;
        }

        if (game.reviewStatus === "PUBLISHED") {
            return (
                <>
                    <Link to={`/admin/game-preview/${game.slug}`} className="admin-link-secondary" onClick={() => onPreviewOpen(game.slug)}>{t("admin.openGame")}</Link>
                    <button type="button" onClick={() => onStatusChange(game.id, "WITHDRAWN")} className="admin-button-warning" disabled={reviewBusyId === game.id}>{t("admin.withdrawGame")}</button>
                    <button type="button" onClick={() => onStartEdit(game.id)} className="admin-button-secondary">{t("admin.editGame")}</button>
                </>
            );
        }

        if (game.reviewStatus === "WITHDRAWN") {
            return <button type="button" onClick={() => onStartEdit(game.id)} className="admin-button-secondary">{t("admin.editGame")}</button>;
        }

        if (wasPreviewed(game.slug)) {
            return (
                <>
                    <button type="button" onClick={() => onStatusChange(game.id, "PUBLISHED")} className="admin-button-primary" disabled={reviewBusyId === game.id}>{t("admin.approveGame")}</button>
                    <button type="button" onClick={() => onStatusChange(game.id, "NEEDS_CHANGES")} className="admin-button-warning" disabled={reviewBusyId === game.id}>{t("admin.requestChanges")}</button>
                </>
            );
        }

        return <Link to={`/admin/game-preview/${game.slug}`} className="admin-link-secondary" onClick={() => onPreviewOpen(game.slug)}>{t("admin.previewGame")}</Link>;
    }
}
