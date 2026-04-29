import { Component } from "react";
import { Link } from "react-router-dom";
import { I18nContext } from "../../../i18n/context.js";
import { api, getActionError, setToken } from "../../../lib/api.js";
import { withRouter } from "../../../hoc/withRouter.jsx";
import "../../../styles/Auth.css";

class Login extends Component {
    static contextType = I18nContext;

    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: "",
            msg: ""
        };
    }

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleSubmit = async (event) => {
        event.preventDefault();
        const { t } = this.context;
        const { navigate, onAuthenticated } = this.props;
        const { email, password } = this.state;

        this.setState({ msg: "" });

        try {
            const response = await api.login({ email, password });
            setToken(response.token);
            onAuthenticated?.(response);
            navigate("/");
        } catch (error) {
            this.setState({ msg: getActionError(error, t, "login") });
        }
    };

    render() {
        const { t } = this.context;
        const { email, password, msg } = this.state;

        return (
            <div className="auth-page">
                <form onSubmit={this.handleSubmit} className="auth-card">
                    <h2 className="auth-title">{t("login.title")}</h2>
                    {msg && <div className="auth-error">{msg}</div>}
                    <div className="auth-field">
                        <label className="auth-label">{t("login.email")}</label>
                        <input className="auth-input" name="email" value={email} onChange={this.handleChange} placeholder="example@email.com" type="email" required />
                    </div>
                    <div className="auth-field">
                        <div className="auth-field-header">
                            <label className="auth-label">{t("login.password")}</label>
                            <Link to="/forgot-password" className="auth-helper-link">{t("login.forgotPassword")}</Link>
                        </div>
                        <input className="auth-input" name="password" value={password} onChange={this.handleChange} placeholder="••••••••" type="password" required />
                    </div>
                    <button className="auth-submit">{t("login.submit")}</button>
                    <p className="auth-footer">
                        {t("login.noAccount")} <Link to="/register" className="auth-footer-link">{t("login.register")}</Link>
                    </p>
                </form>
            </div>
        );
    }
}

const RoutedLogin = withRouter(Login);

export default RoutedLogin;
