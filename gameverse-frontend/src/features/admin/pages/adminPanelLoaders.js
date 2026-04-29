import { api, getActionError } from "../../../lib/api.js";

export async function loadAdminUsers(component) {
    const { t } = component.context;
    component.setState({ loading: true, error: "" });

    try {
        const users = await api.adminUsers();
        component.setState({ users, loading: false });
    } catch (error) {
        component.setState({ error: getActionError(error, t, "adminLoad"), loading: false });
    }
}

export async function loadAdminGames(component) {
    const { t } = component.context;
    component.setState({ gamesLoading: true });

    try {
        const games = await api.adminGames();
        component.setState({ games, gamesLoading: false });
    } catch (error) {
        component.setState({ error: getActionError(error, t, "adminLoad"), gamesLoading: false });
    }
}
