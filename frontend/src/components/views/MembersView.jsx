function MembersView({
  members,
  plans,
  trainers,
  filters,
  onFilterChange,
  onSubmit,
  onAction,
  onEdit,
  onDelete,
  canManage,
  canAttend,
  editingMember,
  onCancelEdit,
  formKey,
}) {
  return (
    <section className="view active members-view">
      <div className="split-grid members-layout">
        <article className="panel">
          <div className="panel-head">
            <h2>Member Directory</h2>
          </div>
          <div className="toolbar members-toolbar">
            <input
              type="search"
              placeholder="Search by name, phone, or email"
              value={filters.search}
              onChange={(event) => onFilterChange({ search: event.target.value })}
            />
            <select value={filters.status} onChange={(event) => onFilterChange({ status: event.target.value })}>
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Frozen">Frozen</option>
              <option value="Expired">Expired</option>
              <option value="ExpiringSoon">Expiring Soon (7 Days)</option>
              <option value="PlanExpired">Plan Expired</option>
            </select>
          </div>
          <div className="table-wrap members-table-wrap">
            <table className="members-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Plan</th>
                  <th>Trainer</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Expiry</th>
                  <th>Plan Alert</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {members.length ? (
                  members.map((member) => (
                    <tr key={member.id} className={member.rowClass}>
                      <td>
                        <div className="member-name-wrap">
                          <span className="member-name-text">{member.name}</span>
                          {member.planAlertType === "expired" ? (
                            <span className="name-alert-dot alarm-pulse" title="Plan expired">
                              !
                            </span>
                          ) : null}
                          {member.planAlertType === "due" ? (
                            <span className="name-alert-dot" title="Plan expiring soon">
                              !
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td>
                        <div className="member-contact">
                          <span>{member.phone}</span>
                          <small>{member.email || "-"}</small>
                        </div>
                      </td>
                      <td>
                        <span className="member-meta">{member.planName}</span>
                      </td>
                      <td>
                        <span className="member-meta">{member.trainerName}</span>
                      </td>
                      <td>
                        <span className={member.statusClass}>{member.status}</span>
                      </td>
                      <td>
                        <span className="member-date">{member.joinDate}</span>
                      </td>
                      <td>
                        <span className="member-date">{member.expiryDate}</span>
                      </td>
                      <td>
                        <span className={member.planAlertClass}>{member.planAlertLabel}</span>
                      </td>
                      <td>
                        <div className="member-actions">
                          {canAttend ? (
                            <button
                              className="mini-btn"
                              type="button"
                              onClick={() => onAction("checkin", member.id)}
                            >
                              Check-In
                            </button>
                          ) : null}
                          {canManage ? (
                            <button
                              className="mini-btn"
                              type="button"
                              onClick={() => onAction("toggle-status", member.id)}
                            >
                              {member.nextAction}
                            </button>
                          ) : null}
                          {canManage && member.showRenew ? (
                            <button
                              className="mini-btn renew"
                              type="button"
                              onClick={() => onAction("renew-plan", member.id)}
                            >
                              Renew
                            </button>
                          ) : null}
                          {canManage ? (
                            <button className="mini-btn" type="button" onClick={() => onEdit(member.id)}>
                              Edit
                            </button>
                          ) : null}
                          {canManage ? (
                            <button className="mini-btn" type="button" onClick={() => onDelete(member.id)}>
                              Delete
                            </button>
                          ) : null}
                          {!canManage && !canAttend ? <span className="member-action-placeholder">-</span> : null}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="empty">
                      No members match this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h2>{editingMember ? "Edit Member" : "Add New Member"}</h2>
            {editingMember ? (
              <button className="secondary-btn" type="button" onClick={onCancelEdit}>
                Cancel
              </button>
            ) : null}
          </div>
          {canManage ? (
            <form key={formKey} className="form-grid" onSubmit={onSubmit}>
              <label>
                Full Name
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Member full name"
                  defaultValue={editingMember?.name || ""}
                />
              </label>
              <label>
                Phone
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="Phone number"
                  defaultValue={editingMember?.phone || ""}
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  defaultValue={editingMember?.email || ""}
                />
              </label>
              <label>
                Plan
                <select name="planId" required defaultValue={editingMember?.planId || plans[0]?.id || ""}>
                  {plans.length ? (
                    plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name}
                      </option>
                    ))
                  ) : (
                    <option value="">No plans available</option>
                  )}
                </select>
              </label>
              <label>
                Trainer
                <select name="trainerId" defaultValue={editingMember?.trainerId || ""}>
                  <option value="">No Trainer</option>
                  {trainers.map((trainer) => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Join Date
                <input type="date" name="joinDate" defaultValue={editingMember?.joinDate || filters.today} />
              </label>
              <label>
                Status
                <select name="status" defaultValue={editingMember?.status || "Active"}>
                  <option value="Active">Active</option>
                  <option value="Frozen">Frozen</option>
                  <option value="Expired">Expired</option>
                </select>
              </label>
              <button type="submit" className="primary-btn full-width" disabled={!plans.length}>
                {editingMember ? "Update Member" : "Create Member"}
              </button>
            </form>
          ) : (
            <p className="empty">Only owner and receptionist accounts can create members.</p>
          )}
        </article>
      </div>
    </section>
  );
}

export default MembersView;
