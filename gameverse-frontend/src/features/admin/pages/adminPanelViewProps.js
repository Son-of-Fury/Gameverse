export function buildUserSectionProps(component, t, locale) {
    const { users, loading, createForm, editForm, editingUserId } = component.state;

    return {
        users,
        loading,
        locale,
        t,
        createForm,
        editForm,
        editingUserId,
        onCreateSubmit: component.handleCreateUser,
        onCreateFieldChange: (event) => component.updateNamedFormField("createForm", event),
        onRefresh: component.loadUsers,
        onStartEdit: component.startEditUser,
        onEditFieldChange: (event) => component.updateNamedFormField("editForm", event),
        onSaveEdit: component.handleUpdateUser,
        onCancelEdit: component.cancelEditUser,
        onDelete: component.handleDeleteUser
    };
}

export function buildGameSectionProps(component, t) {
    const {
        games,
        gamesLoading,
        gameForm,
        gameEditForm,
        editingGameId,
        gameUploading,
        gameEditUploading,
        reviewBusyId
    } = component.state;

    return {
        games,
        gamesLoading,
        gameForm,
        gameEditForm,
        editingGameId,
        gameUploading,
        gameEditUploading,
        reviewBusyId,
        t,
        onRefresh: component.loadGames,
        onCreateSubmit: component.handleCreateGame,
        onCreateFieldChange: (event) => component.updateNamedFormField("gameForm", event),
        onCreateImageUpload: (event) => component.uploadGameImage(event, "gameUploading", "gameForm"),
        onStartEdit: component.startEditGame,
        onEditFieldChange: (event) => component.updateNamedFormField("gameEditForm", event),
        onEditImageUpload: (event) => component.uploadGameImage(event, "gameEditUploading", "gameEditForm"),
        onSaveEdit: component.handleUpdateGame,
        onCancelEdit: component.cancelEditGame,
        onDelete: component.handleDeleteGame,
        onStatusChange: component.handleGameStatus,
        onPreviewOpen: component.markGamePreviewed,
        wasPreviewed: component.wasPreviewed
    };
}
