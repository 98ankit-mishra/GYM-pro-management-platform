function DashboardView({ metrics, recentMembers }) {
  return (
    <section className="view active">
      <div className="metrics-grid">
        <article className="metric-card">
          <p>Total Members</p>
          <h3>{metrics.totalMembers}</h3>
        </article>
        <article className="metric-card">
          <p>Active Members</p>
          <h3>{metrics.activeMembers}</h3>
        </article>
        <article className="metric-card">
          <p>Today Attendance</p>
          <h3>{metrics.todayAttendance}</h3>
        </article>
        <article className="metric-card">
          <p>Monthly Revenue</p>
          <h3>{metrics.monthlyRevenue}</h3>
        </article>
      </div>

      <div className="dashboard-grid">
        <article className="panel">
          <div className="panel-head">
            <h2>Recent Members</h2>
            <span className="pill">{recentMembers.length} records</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentMembers.length ? (
                  recentMembers.map((member) => (
                    <tr key={member.id}>
                      <td>{member.name}</td>
                      <td>{member.planName}</td>
                      <td>
                        <span className={member.statusClass}>{member.status}</span>
                      </td>
                      <td>{member.joinedAt}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="empty">
                      No members added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h2>Today Snapshot</h2>
          </div>
          <div className="snapshot-list">
            <div className="snapshot-item">
              <span>Present Now</span>
              <strong>{metrics.snapshotPresent}</strong>
            </div>
            <div className="snapshot-item">
              <span>Absent Today</span>
              <strong>{metrics.snapshotAbsent}</strong>
            </div>
            <div className="snapshot-item">
              <span>Active Trainers</span>
              <strong>{metrics.snapshotTrainers}</strong>
            </div>
            <div className="snapshot-item">
              <span>Avg Attendance Rate</span>
              <strong>{metrics.snapshotRate}</strong>
            </div>
            <div className="snapshot-item">
              <span>Plan Alerts</span>
              <strong>{metrics.snapshotPlanAlerts}</strong>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export default DashboardView;
