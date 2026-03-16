import "../../styles/admin.css";

// users section
export default function UsersSection({
    users,
    loading,
    locale,
    t,
    createForm,
    editForm,
    editingUserId,
    onCreateSubmit,
    onCreateFieldChange,
    onRefresh,
    onStartEdit,
    onEditFieldChange,
    onSaveEdit,
    onCancelEdit,
    onDelete
}) {
    return (
        <>
            {/* create user */}
            <section className="admin-card">
                <h2 className="admin-section-title">{t("admin.createUser")}</h2>
                <form onSubmit={onCreateSubmit} className="admin-grid">
                    <input className="admin-input" name="username" value={createForm.username} onChange={onCreateFieldChange} placeholder={t("admin.usernamePlaceholder")} required />
                    <input className="admin-input" name="email" value={createForm.email} onChange={onCreateFieldChange} placeholder={t("admin.emailPlaceholder")} type="email" required />
                    <input className="admin-input" name="password" value={createForm.password} onChange={onCreateFieldChange} placeholder={t("admin.passwordPlaceholder")} type="password" required />
                    <input className="admin-input" name="profileImage" value={createForm.profileImage} onChange={onCreateFieldChange} placeholder={t("admin.profileImagePlaceholder")} />
                    <button type="submit" className="admin-button-primary">{t("admin.createUserButton")}</button>
                </form>
            </section>

            {/* user list */}
            <section className="admin-card">
                <div className="admin-section-header">
                    <h2 className="admin-section-title">{t("admin.users")}</h2>
                    <button onClick={onRefresh} className="admin-button-secondary">{t("admin.refresh")}</button>
                </div>

                {loading ? (
                    <div className="admin-hint">{t("admin.loadingUsers")}</div>
                ) : (
                    <div className="admin-grid admin-single-column">
                        {users.map(user => (
                            <div key={user.id} className="admin-item-card">
                                <div className="admin-row-between">
                                    <div className="admin-stack-tight">
                                        <div className="admin-title-strong">{user.username}</div>
                                        <div className="admin-text">{user.email}</div>
                                        <div className="admin-text-small-muted">{t("admin.created")}: {user.createdAt ? new Date(user.createdAt).toLocaleString(locale) : "-"}</div>
                                    </div>
                                    <div className="admin-button-row">
                                        <button type="button" onClick={() => onStartEdit(user)} className="admin-button-secondary">{t("admin.edit")}</button>
                                        <button type="button" onClick={() => onDelete(user.id)} className="admin-button-danger">{t("admin.delete")}</button>
                                    </div>
                                </div>

                                {editingUserId === user.id ? (
                                    <div className="admin-grid admin-margin-top-16">
                                        <input className="admin-input" name="username" value={editForm.username} onChange={onEditFieldChange} placeholder={t("admin.usernamePlaceholder")} />
                                        <input className="admin-input" name="email" value={editForm.email} onChange={onEditFieldChange} placeholder={t("admin.emailPlaceholder")} type="email" />
                                        <input className="admin-input" name="profileImage" value={editForm.profileImage} onChange={onEditFieldChange} placeholder={t("admin.profileImagePlaceholder")} />
                                        <div className="admin-button-row">
                                            <button type="button" onClick={() => onSaveEdit(user.id)} className="admin-button-primary">{t("admin.saveChanges")}</button>
                                            <button type="button" onClick={onCancelEdit} className="admin-button-secondary">{t("admin.cancel")}</button>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}
