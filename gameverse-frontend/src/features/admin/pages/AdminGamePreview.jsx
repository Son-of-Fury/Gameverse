import { Component } from "react";
import { withRouter } from "../../../hoc/withRouter.jsx";
import { I18nContext } from "../../../i18n/context.js";
import { api, getActionError } from "../../../lib/api.js";
import "../../../styles/AdminGamePreview.css";
import "../../../styles/admin.css";

class AdminGamePreview extends Component {
    static contextType = I18nContext;

    constructor(props) {
        super(props);
        this.state = {
            preview: null,
            error: ""
        };
    }

    componentDidMount() {
        this.loadPreview();
    }

    componentDidUpdate(previousProps) {
        if (previousProps.params.slug !== this.props.params.slug) {
            this.loadPreview();
        }
    }

    loadPreview = async () => {
        const { t } = this.context;
        const { slug } = this.props.params;

        try {
            const preview = await api.adminPreviewGame(slug);
            this.setState({ preview, error: "" });
        } catch (error) {
            this.setState({ error: getActionError(error, t, "adminLoad") });
        }
    };

    render() {
        const { t } = this.context;
        const { navigate } = this.props;
        const { preview, error } = this.state;

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
}

const RoutedAdminGamePreview = withRouter(AdminGamePreview);

export default RoutedAdminGamePreview;
