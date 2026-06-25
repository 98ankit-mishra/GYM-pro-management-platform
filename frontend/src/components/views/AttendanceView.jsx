function AttendanceView({
  selectedDate = "",
  rows = [],
  summary = { presentCount: 0, absentCount: 0, activeMembers: 0, rate: "0%" },
  canAttend = false,
  onDateChange = () => {},
  onToggleMember = () => {},
  onMarkAllPresent = () => {},
  onClearDay = () => {},
}) {
  return (
    <section className="view active">
      <div className="split-grid">
        <article className="panel">
          <div className="panel-head">
            <h2>Daily Attendance</h2>
            <input type="date" value={selectedDate} onChange={(event) => onDateChange(event.target.value)} />
          </div>
          <div className="attendance-actions">
            <button className="secondary-btn" type="button" onClick={onMarkAllPresent} disabled={!canAttend}>
              Mark All Active as Present
            </button>
            <button className="secondary-btn" type="button" onClick={onClearDay} disabled={!canAttend}>
              Clear This Day
            </button>
          </div>
          <div className="attendance-list">
            {rows.length ? (
              rows.map((member) => (
                <label key={member.id} className="attendance-row">
                  <span>
                    {member.name} ({member.planName})
                  </span>
                  <input
                    type="checkbox"
                    checked={member.present}
                    onChange={(event) => onToggleMember(member.id, event.target.checked)}
                    disabled={!canAttend}
                  />
                </label>
              ))
            ) : (
              <p className="empty">No active members found. Add or activate members first.</p>
            )}
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h2>Attendance Summary</h2>
          </div>
          <div className="snapshot-list">
            <div className="snapshot-item">
              <span>Selected Day Present</span>
              <strong>{summary.presentCount}</strong>
            </div>
            <div className="snapshot-item">
              <span>Selected Day Absent</span>
              <strong>{summary.absentCount}</strong>
            </div>
            <div className="snapshot-item">
              <span>Active Members</span>
              <strong>{summary.activeMembers}</strong>
            </div>
            <div className="snapshot-item">
              <span>Attendance Rate</span>
              <strong>{summary.rate}</strong>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export default AttendanceView;
