function PlansView({ plans, onSubmit, canManage, editingPlan, onEdit, onDelete, onCancelEdit, formKey }) {
  return (
    <section className="view active">
      <div className="split-grid">
        <article className="panel">
          <div className="panel-head">
            <h2>Membership Plans</h2>
          </div>
          <div className="card-grid">
            {plans.length ? (
              plans.map((plan) => (
                <article key={plan.id} className="info-card">
                  <h3>{plan.name}</h3>
                  <p>{plan.durationMonths} month(s)</p>
                  <strong>{plan.price}</strong>
                  <p>{plan.features || "No extra features listed."}</p>
                  <p>
                    <strong>{plan.memberCount}</strong> member(s) on this plan
                  </p>
                  {canManage ? (
                    <div className="card-actions">
                      <button className="mini-btn" type="button" onClick={() => onEdit(plan.id)}>
                        Edit
                      </button>
                      <button className="mini-btn" type="button" onClick={() => onDelete(plan.id)}>
                        Delete
                      </button>
                    </div>
                  ) : null}
                </article>
              ))
            ) : (
              <p className="empty">No plans available.</p>
            )}
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h2>{editingPlan ? "Edit Plan" : "Add Plan"}</h2>
            {editingPlan ? (
              <button className="secondary-btn" type="button" onClick={onCancelEdit}>
                Cancel
              </button>
            ) : null}
          </div>
          {canManage ? (
            <form key={formKey} className="form-grid" onSubmit={onSubmit}>
              <label>
                Plan Name
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Gold Monthly"
                  defaultValue={editingPlan?.name || ""}
                />
              </label>
              <label>
                Duration (months)
                <input
                  type="number"
                  name="durationMonths"
                  min="1"
                  required
                  placeholder="1"
                  defaultValue={editingPlan?.durationMonths || ""}
                />
              </label>
              <label>
                Price (INR)
                <input
                  type="number"
                  name="price"
                  min="0"
                  required
                  placeholder="49"
                  defaultValue={editingPlan?.rawPrice ?? editingPlan?.price ?? ""}
                />
              </label>
              <label>
                Features
                <textarea
                  name="features"
                  rows="3"
                  placeholder="Gym access, 2 PT sessions, etc"
                  defaultValue={editingPlan?.features || ""}
                ></textarea>
              </label>
              <button type="submit" className="primary-btn full-width">
                {editingPlan ? "Update Plan" : "Add Plan"}
              </button>
            </form>
          ) : (
            <p className="empty">Only owner and receptionist accounts can create plans.</p>
          )}
        </article>
      </div>
    </section>
  );
}

export default PlansView;
