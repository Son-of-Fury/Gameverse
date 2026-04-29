import GameActions from "./games/GameActions.jsx";
import GameForm from "./games/GameForm.jsx";
import { getStatusBadgeClassName } from "./games/gameStatus.js";
import "../../../styles/admin.css";

export default function GamesSection({
    games,
    gamesLoading,
    gameForm,
    gameEditForm,
    editingGameId,
    gameUploading,
    gameEditUploading,
    reviewBusyId,
    t,
    onRefresh,
    onCreateSubmit,
    onCreateFieldChange,
    onCreateImageUpload,
    onStartEdit,
    onEditFieldChange,
    onEditImageUpload,
    onSaveEdit,
    onCancelEdit,
    onDelete,
    onStatusChange,
    onPreviewOpen,
    wasPreviewed
}) {
    return (
        <>
            <section className="admin-card">
                <h2 className="admin-section-title">{t("admin.createGame")}</h2>
                <GameForm
                    form={gameForm}
                    t={t}
                    isUploading={gameUploading}
                    submitLabel={t("admin.gameCreateButton")}
                    flowHint={t("admin.reviewFlowHint")}
                    onSubmit={onCreateSubmit}
                    onFieldChange={onCreateFieldChange}
                    onImageUpload={onCreateImageUpload}
                />
            </section>

            <section className="admin-card">
                <div className="admin-section-header">
                    <h2 className="admin-section-title">{t("admin.gameCreatedList")}</h2>
                    <button onClick={onRefresh} className="admin-button-secondary">{t("admin.refresh")}</button>
                </div>

                {gamesLoading ? (
                    <div className="admin-hint">{t("admin.loadingUsers")}</div>
                ) : (
                    <div className="admin-grid admin-single-column">
                        {games.map((game) => (
                            <div key={game.id} className="admin-item-card">
                                <div className="admin-row-between">
                                    <div className="admin-row-start">
                                        <img src={game.imageUrl} alt={game.title} className="admin-game-thumbnail" />
                                        <div className="admin-stack-tight admin-game-summary">
                                            <div className="admin-row-wrap">
                                                <div className="admin-title-strong">{game.title}</div>
                                                <span className={getStatusBadgeClassName(game.reviewStatus)}>{t(`admin.status.${game.reviewStatus}`)}</span>
                                            </div>
                                            <div className="admin-row-wrap">
                                                <div className="home-card-badge home-card-badge-default">👍 {game.likeCount || 0}</div>
                                                <div className="home-card-badge home-card-badge-default">👎 {game.dislikeCount || 0}</div>
                                            </div>
                                            <div className="admin-description">{game.description || "-"}</div>
                                            <div className="admin-text-muted">{t("admin.sourceType")}: {game.sourceType}</div>
                                            <div className="admin-text-muted">/{game.slug}</div>
                                        </div>
                                    </div>
                                    <GameActions
                                        game={game}
                                        reviewBusyId={reviewBusyId}
                                        t={t}
                                        wasPreviewed={wasPreviewed}
                                        onStartEdit={onStartEdit}
                                        onStatusChange={onStatusChange}
                                        onPreviewOpen={onPreviewOpen}
                                        onDelete={onDelete}
                                    />
                                </div>

                                {editingGameId === game.id ? (
                                    <div className="admin-edit-block">
                                        <div className="admin-edit-title">{t("admin.editGameTitle")}</div>
                                        <GameForm
                                            form={gameEditForm}
                                            t={t}
                                            isUploading={gameEditUploading}
                                            submitLabel={t("admin.saveGameChanges")}
                                            flowHint={t("admin.editFlowHint")}
                                            onSubmit={() => onSaveEdit(game.id)}
                                            onFieldChange={onEditFieldChange}
                                            onImageUpload={onEditImageUpload}
                                            secondaryAction={{ label: t("admin.cancel"), onClick: onCancelEdit }}
                                        />
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}
