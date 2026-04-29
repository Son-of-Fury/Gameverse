import { Component } from "react";
import { Link } from "react-router-dom";
import { withRouter } from "../../../hoc/withRouter.jsx";
import { I18nContext } from "../../../i18n/context.js";
import { api, getActionError, setToken } from "../../../lib/api.js";
import "../../../styles/Auth.css";

class Register extends Component {
    static contextType = I18nContext;

    constructor(props) {
        super(props);
        this.state = {
            username: "",
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
        const { username, email, password } = this.state;

        this.setState({ msg: "" });

        try {
            const response = await api.register({ username, email, password });
            setToken(response.token);
            onAuthenticated?.(response);
            navigate("/");
        } catch (error) {
            this.setState({ msg: getActionError(error, t, "register") });
        }
    };

    render() {
        const { t } = this.context;
        const { username, email, password, msg } = this.state;

        return (
            <div className="auth-page">
                <form onSubmit={this.handleSubmit} className="auth-card">
                    <h2 className="auth-title">{t("register.title")}</h2>
                    {msg && <div className="auth-error">{msg}</div>}
                    <div className="auth-field">
                        <label className="auth-label">{t("register.username")}</label>
                        <input className="auth-input" name="username" value={username} onChange={this.handleChange} placeholder={t("register.usernamePlaceholder")} required />
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">{t("register.email")}</label>
                        <input className="auth-input" name="email" value={email} onChange={this.handleChange} placeholder="example@email.com" type="email" required />
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">{t("register.password")}</label>
                        <input className="auth-input" name="password" value={password} onChange={this.handleChange} placeholder={t("register.passwordPlaceholder")} type="password" required />
                    </div>
                    <button className="auth-submit">{t("register.submit")}</button>
                    <p className="auth-footer">
                        {t("register.haveAccount")} <Link to="/login" className="auth-footer-link">{t("register.login")}</Link>
                    </p>
                </form>
            </div>
        );
    }
}

const RoutedRegister = withRouter(Register);

export default RoutedRegister;
