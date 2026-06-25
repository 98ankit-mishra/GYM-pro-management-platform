function AppDialog({
  open,
  title,
  description,
  confirmLabel = "Save",
  cancelLabel = "Cancel",
  tone = "default",
  onClose,
  onSubmit,
  children,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog-card" onClick={(event) => event.stopPropagation()}>
        <div className="dialog-head">
          <div>
            <h3>{title}</h3>
            {description ? <p>{description}</p> : null}
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close dialog">
            X
          </button>
        </div>

        <form onSubmit={onSubmit} className="dialog-body">
          {children}
          <div className="dialog-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>
              {cancelLabel}
            </button>
            <button type="submit" className={tone === "danger" ? "danger-btn" : "primary-btn"}>
              {confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AppDialog;
