import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, getActionError } from "../lib/api.js";
import { useI18n } from "../i18n/I18nContext.jsx";
import "../styles/AdminGamePreview.css";
import "../styles/admin.css";

// admin preview
export default function AdminGamePreview() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { t } = useI18n();
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState("");

    // preview load
    useEffect(() => {
        let active = true;

        api.adminPreviewGame(slug)
            .then(data => {
                if (!active) return;
                setPreview(data);
                setError("");
            })
            .catch(requestError => {
                if (!active) return;
                setError(getActionError(requestError, t, "adminLoad"));
            });

        return () => {
            active = false;
        };
    }, [slug, t]);

    if (error) {
        return <div className="admin-preview-error">{error}</div>;
    }

    if (!preview?.game) {
        return <div className="admin-preview-loading">{t("app.loading")}</div>;
    }

    const game = preview.game;
    const iframeProps = game.sourceType === "INLINE_HTML"
        ? { srcDoc: preview.inlineHtml || "" }
        : { src: game.embedUrl };

    return (
        <div className="admin-preview-page">
            {/* preview layout */}
            <div className="admin-preview-inner">
                <div className="admin-preview-header">
                    <div>
                        <div className="admin-preview-eyebrow">{t("admin.previewMode")}</div>
                        <h1 className="admin-preview-title">{game.title}</h1>
                    </div>
                    <div className="admin-preview-actions">
                        <button type="button" onClick={() => navigate("/admin")} className="admin-button-secondary">
                            {t("admin.backToGames")}
                        </button>
                    </div>
                </div>

                <div className="admin-preview-layout">
                    <aside className="admin-preview-side">
                        <img src={game.imageUrl} alt={game.title} className="admin-preview-cover" />
                        <div>
                            <h2 className="admin-preview-section-title">{t("admin.previewDescription")}</h2>
                            <p className="admin-preview-text">{game.description || "-"}</p>
                        </div>
                        <div>
                            <h2 className="admin-preview-section-title">{t("admin.previewTutorial")}</h2>
                            <div className="admin-preview-text admin-preview-text-pre">{game.tutorial || "-"}</div>
                        </div>
                    </aside>

                    <section className="admin-preview-play">
                        <iframe title={game.title} {...iframeProps} className="admin-preview-iframe" />
                    </section>
                </div>
            </div>
        </div>
    );
}
