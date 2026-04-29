import { JsonCard, TranslationCard } from "./GameFormFields.jsx";

export default function GameForm({ form, t, isUploading, submitLabel, flowHint, onSubmit, onFieldChange, onImageUpload, secondaryAction }) {
    function handleSubmit(event) {
        event.preventDefault();
        onSubmit(event);
    }

    return (
        <form onSubmit={handleSubmit} className="admin-grid admin-single-column">
            <div className="admin-grid">
                <input className="admin-input" name="titleHu" value={form.titleHu} onChange={onFieldChange} placeholder={t("admin.gameTitleHuPlaceholder")} />
                <input className="admin-input" name="titleEn" value={form.titleEn} onChange={onFieldChange} placeholder={t("admin.gameTitleEnPlaceholder")} />
                <input
                    className="admin-input"
                    name="slug"
                    value={form.slug}
                    readOnly
                    placeholder={t("admin.gameSlugPlaceholder")}
                    aria-label={t("admin.gameSlug")}
                />
            </div>
            <div className="admin-hint">{t("admin.gameSlugAutoHint")}</div>

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
