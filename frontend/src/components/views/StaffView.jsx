function StaffView({ users, canManage, onSubmit, onToggleUser, onResetPassword }) {
  return (
    <section className="view active">
      <div className="split-grid">
        <article className="panel">
          <div className="panel-head">
            <h2>Staff Accounts</h2>
            <span className="pill">
              {users.length} account{users.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length ? (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name || "-"}</td>
                      <td>{user.username}</td>
                      <td>{user.roleLabel}</td>
                      <td>
                        <span className={user.statusClass}>{user.statusLabel}</span>
                      </td>
                      <td>
                        {user.locked ? (
                          "-"
                        ) : (
                          <>
                            <button
                              className={user.isActive ? "mini-btn" : "mini-btn renew"}
                              type="button"
                              onClick={() => onToggleUser(user.id, user.isActive)}
                            >
                              {user.isActive ? "Deactivate" : "Activate"}
                            </button>
                            <button className="mini-btn" type="button" onClick={() => onResetPassword(user.id)}>
                              Reset Password
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : null}
              </tbody>
            </table>
          </div>
          {!users.length ? <p className="empty">No staff accounts yet.</p> : null}
        </article>

        <article className="panel">
          <div className="panel-head">
            <h2>Add Staff</h2>
          </div>
          {canManage ? (
            <form className="form-grid" onSubmit={onSubmit}>
              <label>
                Role
                <select name="role" required defaultValue="receptionist">
                  <option value="receptionist">Receptionist</option>
                  <option value="trainer">Trainer</option>
                </select>
              </label>
              <label>
                Full Name
                <input type="text" name="name" required placeholder="Staff full name" />
              </label>
              <label>
                Username
                <input type="text" name="username" required placeholder="Unique username" />
              </label>
              <label>
                Password
                <input type="password" name="password" required placeholder="Set a password (min 8 chars)" />
              </label>
              <button type="submit" className="primary-btn full-width">
                Create Staff Account
              </button>
            </form>
          ) : (
            <p className="empty">Only the gym owner can manage staff accounts.</p>
          )}
        </article>
      </div>
    </section>
  );
}

export default StaffView;
