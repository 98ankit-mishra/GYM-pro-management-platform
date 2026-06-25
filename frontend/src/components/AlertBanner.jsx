function AlertBanner({ alertSummary, onReview }) {
  if (!alertSummary.totalCount) {
    return null;
  }

  return (
    <section className="alert-banner">
      <div>
        <strong>{alertSummary.title}</strong>
        <p>{alertSummary.text}</p>
      </div>
      <button className="secondary-btn" type="button" onClick={onReview}>
        {alertSummary.actionLabel}
      </button>
    </section>
  );
}

export default AlertBanner;
