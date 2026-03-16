import { Link } from "react-router-dom";
import "../../styles/admin.css";

// games section
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
            {/* create game */}
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

            {/* game list */}
            <section className="admin-card">
                <div className="admin-section-header">
                    <h2 className="admin-section-title">{t("admin.gameCreatedList")}</h2>
                    <button onClick={onRefresh} className="admin-button-secondary">{t("admin.refresh")}</button>
                </div>

                {gamesLoading ? (
                    <div className="admin-hint">{t("admin.loadingUsers")}</div>
                ) : (
                    <div className="admin-grid admin-single-column">
                        {games.map(game => (
                            <div key={game.id} className="admin-item-card">
                                <div className="admin-row-between">
                                    <div className="admin-row-start">
                                        <img src={game.imageUrl} alt={game.title} className="admin-game-thumbnail" />
                                        <div className="admin-stack-tight admin-game-summary">
                                            <div className="admin-row-wrap">
                                                <div className="admin-title-strong">{game.title}</div>
                                                <span className={getStatusBadgeClassName(game.reviewStatus)}>{t(`admin.status.${game.reviewStatus}`)}</span>
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

// game actions
function GameActions({ game, reviewBusyId, t, wasPreviewed, onStartEdit, onStatusChange, onPreviewOpen, onDelete }) {
    return (
        <div className="admin-actions">
            {renderPrimaryAction()}
            <button type="button" onClick={() => onDelete(game.id)} className="admin-button-danger">{t("admin.gameDelete")}</button>
        </div>
    );

    // action switch
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

// game form
function GameForm({ form, t, isUploading, submitLabel, flowHint, onSubmit, onFieldChange, onImageUpload, secondaryAction }) {
    // form submit
    function handleSubmit(event) {
        event.preventDefault();
        onSubmit(event);
    }

    return (
        <form onSubmit={handleSubmit} className="admin-grid admin-single-column">
            <div className="admin-grid">
                <input className="admin-input" name="titleHu" value={form.titleHu} onChange={onFieldChange} placeholder={t("admin.gameTitleHuPlaceholder")} />
                <input className="admin-input" name="titleEn" value={form.titleEn} onChange={onFieldChange} placeholder={t("admin.gameTitleEnPlaceholder")} />
                <input className="admin-input" name="slug" value={form.slug} onChange={onFieldChange} placeholder={t("admin.gameSlugPlaceholder")} />
            </div>

            <div className="admin-translation-grid">
                <TranslationCard
                    title={t("admin.hungarianContent")}
                    fields={[
                        { name: "descriptionHu", value: form.descriptionHu, placeholder: t("admin.gameDescriptionHuPlaceholder") },
                        { name: "tutorialHu", value: form.tutorialHu, placeholder: t("admin.gameTutorialHuPlaceholder") }
                    ]}
                    onFieldChange={onFieldChange}
                />
                <TranslationCard
                    title={t("admin.englishContent")}
                    fields={[
                        { name: "descriptionEn", value: form.descriptionEn, placeholder: t("admin.gameDescriptionEnPlaceholder") },
                        { name: "tutorialEn", value: form.tutorialEn, placeholder: t("admin.gameTutorialEnPlaceholder") }
                    ]}
                    onFieldChange={onFieldChange}
                />
            </div>

            <div className="admin-grid">
                <select className="admin-input" name="sourceType" value={form.sourceType} onChange={onFieldChange}>
                    <option value="EMBED_URL">{t("admin.gameSourceEmbed")}</option>
                    <option value="INLINE_HTML">{t("admin.gameSourceHtml")}</option>
                </select>
                <div className="admin-hint-box">{flowHint}</div>
            </div>

            {form.sourceType === "EMBED_URL" ? (
                <>
                    <input className="admin-input" name="externalUrl" value={form.externalUrl} onChange={onFieldChange} placeholder={t("admin.gameExternalUrlPlaceholder")} required />
                    <div className="admin-hint">{t("admin.embedScoreHint")}</div>
                </>
            ) : (
                <>
                    <textarea className="admin-input admin-textarea admin-textarea-mono admin-textarea-xl" name="htmlCode" value={form.htmlCode} onChange={onFieldChange} placeholder={t("admin.gameHtmlCodePlaceholder")} required />
                    <div className="admin-hint">{t("admin.htmlBridgeHint")}</div>
                    <div className="admin-translation-grid">
                        <JsonCard title={t("admin.gameHtmlTranslationsHuTitle")} name="htmlTranslationsHu" value={form.htmlTranslationsHu} placeholder={t("admin.gameHtmlTranslationsHuPlaceholder")} onFieldChange={onFieldChange} />
                        <JsonCard title={t("admin.gameHtmlTranslationsEnTitle")} name="htmlTranslationsEn" value={form.htmlTranslationsEn} placeholder={t("admin.gameHtmlTranslationsEnPlaceholder")} onFieldChange={onFieldChange} />
                    </div>
                    <div className="admin-hint admin-hint-spaced">{t("admin.gameHtmlTranslationsHint")}</div>
                </>
            )}

            <div className="admin-grid">
                <input className="admin-input" name="imageUrl" value={form.imageUrl} onChange={onFieldChange} placeholder={t("admin.gameImageUrlPlaceholder")} />
                <label className="admin-upload-label">
                    <span>{isUploading ? t("admin.imageUploading") : t("admin.uploadImage")}</span>
                    <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={onImageUpload} hidden disabled={isUploading} />
                </label>
            </div>

            <div className="admin-hint">{t("admin.gameImageHint")}</div>

            <div className="admin-button-row">
                <button type="submit" className="admin-button-primary">{submitLabel}</button>
                {secondaryAction ? <button type="button" onClick={secondaryAction.onClick} className="admin-button-secondary">{secondaryAction.label}</button> : null}
            </div>
        </form>
    );
}

// translation card
function TranslationCard({ title, fields, onFieldChange }) {
    return (
        <div className="admin-translation-card">
            <div className="admin-translation-title">{title}</div>
            <div className="admin-grid admin-single-column">
                {fields.map(field => (
                    <textarea key={field.name} className="admin-input admin-textarea" name={field.name} value={field.value} onChange={onFieldChange} placeholder={field.placeholder} />
                ))}
            </div>
        </div>
    );
}

// json card
function JsonCard({ title, name, value, placeholder, onFieldChange }) {
    return (
        <div className="admin-translation-card">
            <div className="admin-translation-title">{title}</div>
            <textarea className="admin-input admin-textarea admin-textarea-mono admin-textarea-tall" name={name} value={value} onChange={onFieldChange} placeholder={placeholder} />
        </div>
    );
}

// status badge
function getStatusBadgeClassName(status) {
    if (status === "WITHDRAWN") return "admin-rank-withdrawn";
    if (status === "EDITED") return "admin-rank-edited";
    if (status === "PUBLISHED") return "admin-rank-published";
    if (status === "NEEDS_CHANGES") return "admin-rank-needs-changes";
    return "admin-rank-pending";
}
