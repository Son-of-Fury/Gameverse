import { api, getActionError, getToken, setToken } from "../../../lib/api.js";

export function createProfileState() {
    return {
        form: {
            username: "",
            email: "",
            password: "",
            profileImage: ""
        },
        loading: true,
        saving: false,
        deleting: false,
        uploading: false,
        message: "",
        error: "",
        uploadInfo: null
    };
}

export async function loadProfileData(component) {
    const { navigate, onUserChange } = component.props;
    const { t } = component.context;

    if (!getToken()) {
        navigate("/login");
        return;
    }

    component.setState({ loading: true, error: "" });

    try {
        const user = await api.me();
        component.setState({
            form: {
                username: user.username || "",
                email: user.email || "",
                password: "",
                profileImage: user.profileImage || ""
            },
            uploadInfo: null,
            loading: false
        });
        onUserChange?.(user);
    } catch (error) {
        component.setState({
            error: getActionError(error, t, "profileLoad"),
            loading: false
        });

        if (error.status === 401) {
            setToken(null);
            navigate("/login");
        }
    }
}

export async function saveProfileData(component) {
    const { navigate, onUserChange } = component.props;
    const { t } = component.context;
    const { form } = component.state;

    component.setState({
        saving: true,
        message: "",
        error: ""
    });

    try {
        const response = await api.updateMe(form);
        component.setState((current) => ({
            form: {
                ...current.form,
                username: response.username || current.form.username,
                email: response.email || current.form.email,
                profileImage: response.profileImage || "",
                password: ""
            },
            message: response.message || t("profile.saveSuccess"),
            saving: false
        }));
        onUserChange?.({
            username: response.username || form.username,
            email: response.email || form.email,
            profileImage: response.profileImage || form.profileImage
        });
    } catch (error) {
        component.setState({
            error: getActionError(error, t, "profileSave"),
            saving: false
        });

        if (error.status === 401) {
            setToken(null);
            navigate("/login");
        }
    }
}

export async function deleteProfileData(component) {
    const { navigate, onLogout } = component.props;
    const { t } = component.context;

    component.setState({
        deleting: true,
        message: "",
        error: ""
    });

    try {
        await api.deleteMe();
        setToken(null);
        onLogout?.();
        navigate("/");
    } catch (error) {
        component.setState({
            error: getActionError(error, t, "profileDelete"),
            deleting: false
        });

        if (error.status === 401) {
            setToken(null);
            navigate("/login");
        }
    }
}

export async function uploadProfileFile(component, file, input) {
    const { navigate, onUserChange } = component.props;
    const { t } = component.context;

    if (!file) {
        return;
    }

    component.setState({
        uploading: true,
        message: "",
        error: ""
    });

    try {
        const response = await api.uploadProfileImage(file);
        component.setState((current) => ({
            form: {
                ...current.form,
                profileImage: response.profileImage || current.form.profileImage
            },
            uploadInfo: {
                originalFileName: response.originalFileName,
                storedFileName: response.storedFileName,
                sizeMb: response.sizeMb,
                uploadedAt: response.uploadedAt
            },
            message: response.message || t("profile.uploadSuccess"),
            uploading: false
        }));
        onUserChange?.({ profileImage: response.profileImage || "" });
    } catch (error) {
        component.setState({
            error: getActionError(error, t, "profileUpload"),
            uploading: false
        });

        if (error.status === 401) {
            setToken(null);
            navigate("/login");
        }
    } finally {
        input.value = "";
    }
}
