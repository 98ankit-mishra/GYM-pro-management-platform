function ReportsView({
  overview,
  bars,
  reminders,
  canManage,
  providerStatus,
  onGenerateWhatsApp,
  onGenerateSms,
  onMarkReminderSent,
  onSendReminder,
  onExportMembers,
  onExportPayments,
  onExportExpiry,
}) {
  return (
    <section className="view active">
      <div className="dashboard-grid reports-grid">
        <article className="panel">
          <div className="panel-head">
            <h2>Monthly Overview</h2>
          </div>
          <div className="snapshot-list">
            <div className="snapshot-item">
              <span>Expected Revenue</span>
              <strong>{overview.revenue}</strong>
            </div>
            <div className="snapshot-item">
              <span>Avg Daily Attendance</span>
              <strong>{overview.dailyAttendance}</strong>
            </div>
            <div className="snapshot-item">
              <span>Current Active Plans</span>
              <strong>{overview.activePlans}</strong>
            </div>
            <div className="snapshot-item">
              <span>Total Trainers</span>
              <strong>{overview.trainerCount}</strong>
            </div>
            <div className="snapshot-item">
              <span>Outstanding Dues</span>
              <strong>{overview.outstandingDues}</strong>
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h2>Weekly Attendance Trend</h2>
          </div>
          <div className="bar-chart">
            {bars.map((bar) => (
              <div key={bar.key} className="bar-wrap">
                <div className="bar" style={{ height: `${Math.max(bar.percent, 4)}%` }}></div>
                <span className="bar-label">{bar.label}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h2>Reminder Draft Workflow</h2>
          </div>
          <p className="empty">These actions create reminder drafts inside the app. They do not send WhatsApp or SMS automatically.</p>
          {providerStatus ? (
            <div className="provider-status">
              <span>SMS: {providerStatus.SMS?.provider || "unknown"} ({providerStatus.SMS?.mode || "unknown"})</span>
              <span>WhatsApp: {providerStatus.WhatsApp?.provider || "unknown"} ({providerStatus.WhatsApp?.mode || "unknown"})</span>
            </div>
          ) : null}
          <div className="reminder-actions">
            <button className="secondary-btn" type="button" onClick={onGenerateWhatsApp} disabled={!canManage}>
              Create WhatsApp Drafts
            </button>
            <button className="secondary-btn" type="button" onClick={onGenerateSms} disabled={!canManage}>
              Create SMS Drafts
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Channel</th>
                  <th>Status</th>
                  <th>Message</th>
                  <th>Delivery Log</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reminders.length ? (
                  reminders.map((reminder) => (
                    <tr key={reminder.id}>
                      <td>{reminder.memberName}</td>
                      <td>{reminder.channel}</td>
                      <td>
                        <span className={reminder.statusClass}>{reminder.status}</span>
                      </td>
                      <td>{reminder.message}</td>
                      <td>
                        <div className="reminder-log">
                          <span>{reminder.provider || "Not sent yet"}</span>
                          <small>{reminder.externalId || "No external id"}</small>
                          <small>{reminder.sentAt ? `At: ${reminder.sentAt}` : "At: -"}</small>
                          <small>{reminder.sentBy ? `By: ${reminder.sentBy}` : "By: -"}</small>
                        </div>
                      </td>
                      <td>
                        {reminder.canMarkSent ? (
                          <div className="member-actions">
                            <button className="mini-btn" type="button" onClick={() => onSendReminder(reminder.id)}>
                              Send Now
                            </button>
                            <button className="mini-btn" type="button" onClick={() => onMarkReminderSent(reminder.id)}>
                              Mark Sent
                            </button>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty">
                      No reminders generated yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h2>Exports</h2>
          </div>
          <div className="export-actions">
            <button className="secondary-btn" type="button" onClick={onExportMembers} disabled={!canManage}>
              Export Members CSV
            </button>
            <button className="secondary-btn" type="button" onClick={onExportPayments} disabled={!canManage}>
              Export Payments CSV
            </button>
            <button className="secondary-btn" type="button" onClick={onExportExpiry} disabled={!canManage}>
              Export Expiry Alerts CSV
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}

export default ReportsView;
