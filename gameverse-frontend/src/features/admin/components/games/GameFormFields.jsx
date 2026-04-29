export function TranslationCard({ title, fields, onFieldChange }) {
    return (
        <div className="admin-translation-card">
            <div className="admin-translation-title">{title}</div>
            <div className="admin-grid admin-single-column">
                {fields.map((field) => (
                    <textarea key={field.name} className="admin-input admin-textarea" name={field.name} value={field.value} onChange={onFieldChange} placeholder={field.placeholder} />
                ))}
            </div>
        </div>
    );
}

export function JsonCard({ title, name, value, placeholder, onFieldChange }) {
    return (
        <div className="admin-translation-card">
            <div className="admin-translation-title">{title}</div>
            <textarea className="admin-input admin-textarea admin-textarea-mono admin-textarea-tall" name={name} value={value} onChange={onFieldChange} placeholder={placeholder} />
        </div>
    );
}
