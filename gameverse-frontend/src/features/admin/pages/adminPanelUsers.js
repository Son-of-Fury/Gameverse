import { api, getActionError } from "../../../lib/api.js";
import { EMPTY_USER_FORM, resetAdminFeedback } from "./adminPanelState.js";

export async function createAdminUser(component, event) {
    event.preventDefault();
    const { t } = component.context;
    const { createForm } = component.state;
    resetAdminFeedback(component);

    try {
        const response = await api.adminCreateUser(createForm);
        component.setState({
            message: response.message || t("admin.createSuccess"),
            createForm: { ...EMPTY_USER_FORM }
        });
        await component.loadUsers();
    } catch (error) {
        component.setState({ error: getActionError(error, t, "adminCreateUser") });
    }
}

export function startAdminUserEdit(component, user) {
    component.setState({
        editingUserId: user.id,
        editForm: {
            username: user.username || "",
            email: user.email || "",
            profileImage: user.profileImage || ""
        }
    });
    resetAdminFeedback(component);
}

export async function updateAdminUser(component, userId) {
    const { t } = component.context;
    const { editForm } = component.state;
    resetAdminFeedback(component);

    try {
        const response = await api.adminUpdateUser(userId, editForm);
        component.setState({
            message: response.message || t("admin.updateSuccess"),
            editingUserId: null
        });
        await component.loadUsers();
    } catch (error) {
        component.setState({ error: getActionError(error, t, "adminUpdateUser") });
    }
}

export async function deleteAdminUser(component, userId) {
    const { t } = component.context;
    resetAdminFeedback(component);

    try {
        const response = await api.adminDeleteUser(userId);
        component.setState((current) => ({
            message: response.message || t("admin.deleteSuccess"),
            editingUserId: current.editingUserId === userId ? null : current.editingUserId
        }));
        await component.loadUsers();
    } catch (error) {
        component.setState({ error: getActionError(error, t, "adminDeleteUser") });
    }
}
