function TrainersView({ trainers, canManage, onSubmit, editingTrainer, onEdit, onDelete, onCancelEdit, formKey }) {
  return (
    <section className="view active">
      <div className="split-grid">
        <article className="panel">
          <div className="panel-head">
            <h2>Trainer List</h2>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Specialty</th>
                  <th>Phone</th>
                  <th>Assigned Members</th>
                  {canManage ? <th>Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {trainers.length ? (
                  trainers.map((trainer) => (
                    <tr key={trainer.id}>
                      <td>{trainer.name}</td>
                      <td>{trainer.specialty}</td>
                      <td>{trainer.phone}</td>
                      <td>{trainer.assignedMembers}</td>
                      {canManage ? (
                        <td>
                          <div className="member-actions">
                            <button className="mini-btn" type="button" onClick={() => onEdit(trainer.id)}>
                              Edit
                            </button>
                            <button className="mini-btn" type="button" onClick={() => onDelete(trainer.id)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={canManage ? "5" : "4"} className="empty">
                      No trainers found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h2>{editingTrainer ? "Edit Trainer" : "Add Trainer"}</h2>
            {editingTrainer ? (
              <button className="secondary-btn" type="button" onClick={onCancelEdit}>
                Cancel
              </button>
            ) : null}
          </div>
          {canManage ? (
            <form key={formKey} className="form-grid" onSubmit={onSubmit}>
              <label>
                Trainer Name
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Trainer full name"
                  defaultValue={editingTrainer?.name || ""}
                />
              </label>
              <label>
                Specialty
                <input
                  type="text"
                  name="specialty"
                  required
                  placeholder="Strength, HIIT, Rehab, Yoga"
                  defaultValue={editingTrainer?.specialty || ""}
                />
              </label>
              <label>
                Phone
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="Phone number"
                  defaultValue={editingTrainer?.phone || ""}
                />
              </label>
              <button type="submit" className="primary-btn full-width">
                {editingTrainer ? "Update Trainer" : "Add Trainer"}
              </button>
            </form>
          ) : (
            <p className="empty">Only owner and receptionist accounts can add trainers.</p>
          )}
        </article>
      </div>
    </section>
  );
}

export default TrainersView;
