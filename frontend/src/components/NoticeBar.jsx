function NoticeBar({ notice, onDismiss }) {
  if (!notice) {
    return null;
  }

  return (
    <div className={`notice-bar notice-${notice.type}`}>
      <div>
        <strong>{notice.type === "success" ? "Success" : notice.type === "error" ? "Error" : "Notice"}</strong>
        <p>{notice.message}</p>
      </div>
      <button type="button" className="icon-btn" onClick={onDismiss} aria-label="Dismiss notice">
        X
      </button>
    </div>
  );
}

export default NoticeBar;
