import { Component } from "react";
import { Link } from "react-router-dom";
import { withRouter } from "../../../hoc/withRouter.jsx";
import { I18nContext } from "../../../i18n/context.js";
import { api, getActionError } from "../../../lib/api.js";
import "../../../styles/ForgotPassword.css";

class ForgotPassword extends Component {
    static contextType = I18nContext;

    constructor(props) {
        super(props);
        this.state = {
            email: "",
            resetToken: "",
            newPassword: "",
            msg: "",
            issuedResetToken: "",
            requestDone: false
        };
    }

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleRequestToken = async (event) => {
        event.preventDefault();
        const { t } = this.context;
        const { email } = this.state;

        this.setState({ msg: "" });

        try {
            const response = await api.requestPasswordReset({ email });
            this.setState({
                requestDone: true,
                issuedResetToken: response.resetToken || "",
                msg: response.message || t("forgotPassword.requestSuccess")
            });
        } catch (error) {
            this.setState({ msg: t("forgotPassword.errorPrefix") + getActionError(error, t, "requestPasswordReset") });
        }
    };

    handleReset = async (event) => {
        event.preventDefault();
        const { t } = this.context;
        const { navigate } = this.props;
        const { email, resetToken, newPassword } = this.state;

        this.setState({ msg: "" });

        try {
            await api.resetPassword({ email, resetToken, newPassword });
            this.setState({ msg: t("forgotPassword.success") });
            setTimeout(() => navigate("/login"), 3000);
        } catch (error) {
            this.setState({ msg: t("forgotPassword.errorPrefix") + getActionError(error, t, "resetPassword") });
        }
    };

    render() {
        const { t } = this.context;
        const { email, resetToken, newPassword, msg, issuedResetToken, requestDone } = this.state;
        const isSuccess = msg === t("forgotPassword.success");

        return (
            <div className="forgot-page">
                <form onSubmit={requestDone ? this.handleReset : this.handleRequestToken} className="forgot-form">
                    <h2 className="forgot-title">{t("forgotPassword.title")}</h2>
                    {msg ? <div className={`forgot-message ${isSuccess ? "forgot-message-success" : "forgot-message-error"}`}>{msg}</div> : null}
                    <div className="forgot-field">
                        <label className="forgot-label">{t("forgotPassword.email")}</label>
                        <input className="forgot-input" name="email" value={email} onChange={this.handleChange} placeholder={t("forgotPassword.emailPlaceholder")} required />
                    </div>
                    {requestDone ? (
                        <>
                            <div className="forgot-field">
                                <label className="forgot-label">{t("forgotPassword.resetToken")}</label>
                                <input className="forgot-input" name="resetToken" value={resetToken} onChange={this.handleChange} placeholder={t("forgotPassword.resetTokenPlaceholder")} required />
                            </div>
                            <div className="forgot-field">
                                <label className="forgot-label">{t("forgotPassword.newPassword")}</label>
                                <input className="forgot-input" name="newPassword" value={newPassword} onChange={this.handleChange} placeholder={t("forgotPassword.newPasswordPlaceholder")} type="password" required />
                            </div>
                            {issuedResetToken ? <div className="forgot-token-box">{t("forgotPassword.tokenHint")} {issuedResetToken}</div> : null}
                        </>
                    ) : null}
                    <button className="forgot-submit">{requestDone ? t("forgotPassword.submit") : t("forgotPassword.requestToken")}</button>
                    <div className="forgot-back">
                        <Link to="/login" className="forgot-link">{t("forgotPassword.backToLogin")}</Link>
                    </div>
                </form>
            </div>
        );
    }
}

const RoutedForgotPassword = withRouter(ForgotPassword);

export default RoutedForgotPassword;
