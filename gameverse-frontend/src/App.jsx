import { Component } from "react";
import AppHeader from "./app/AppHeader.jsx";
import AppRoutes from "./app/AppRoutes.jsx";
import { buildAuthenticatedUser, loadCurrentUserSession } from "./app/authSession.js";
import ConsentBar from "./features/shared/components/ConsentBar.jsx";
import { I18nContext } from "./i18n/context.js";
import { getToken, setToken } from "./lib/api.js";
import "./styles/App.css";

export default class App extends Component {
    static contextType = I18nContext;

    constructor(props) {
        super(props);
        this.state = {
            token: getToken(),
            currentUser: null,
            authLoading: true
        };
    }

    componentDidMount() {
        this.loadCurrentUser();
    }

    componentDidUpdate(previousProps, previousState) {
        if (previousState.token !== this.state.token) {
            this.loadCurrentUser();
        }
    }

    loadCurrentUser = async () => {
        this.setState({ authLoading: true });
        this.setState(await loadCurrentUserSession(this.state.token));
    };

    handleAuthenticated = (authResponse) => {
        setToken(authResponse.token);
        this.setState({
            token: authResponse.token,
            currentUser: buildAuthenticatedUser(authResponse),
            authLoading: false
        });
    };

    handleUserChange = (user) => {
        this.setState((current) => ({
            currentUser: { ...(current.currentUser || {}), ...user }
        }));
    };

    handleLogout = () => {
        setToken(null);
        this.setState({
            token: null,
            currentUser: null,
            authLoading: false
        });
    };

    render() {
        const { t } = this.context;
        const { token, currentUser, authLoading } = this.state;
        const isAdmin = currentUser?.role === "ADMIN";
        const avatar = currentUser?.profileImage?.trim();
        const displayName = (currentUser?.username || currentUser?.email || "").trim();
        const initials = (currentUser?.username || currentUser?.email || "P").trim().charAt(0).toUpperCase();

        if (authLoading) {
            return <div className="app-loading">{t("app.loading")}</div>;
        }

        return (
            <div className="app-shell">
                <AppHeader isAdmin={isAdmin} token={token} avatar={avatar} initials={initials} displayName={displayName} t={t} onLogout={this.handleLogout} />

                <main className="app-main">
                    <AppRoutes
                        isAdmin={isAdmin}
                        token={token}
                        currentUser={currentUser}
                        onAuthenticated={this.handleAuthenticated}
                        onUserChange={this.handleUserChange}
                        onLogout={this.handleLogout}
                    />
                </main>

                <ConsentBar />
            </div>
        );
    }
}
