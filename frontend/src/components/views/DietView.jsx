function DietView({ dietPlans, canManage, onSubmit, editingDiet, onEdit, onDelete, onCancelEdit, formKey }) {
  return (
    <section className="view active">
      <div className="split-grid">
        <article className="panel">
          <div className="panel-head">
            <h2>Diet Plans</h2>
          </div>
          <div className="card-grid">
            {dietPlans.length ? (
              dietPlans.map((plan) => (
                <article key={plan.id} className="info-card">
                  <h3>{plan.name}</h3>
                  <p>Goal: {plan.goal}</p>
                  <p>Calories: {plan.calories} / day</p>
                  <p>{plan.notes || "No notes added."}</p>
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
              <p className="empty">No diet plans added yet.</p>
            )}
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h2>{editingDiet ? "Edit Diet Plan" : "Add Diet Plan"}</h2>
            {editingDiet ? (
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
                  placeholder="Lean Gain Meal Plan"
                  defaultValue={editingDiet?.name || ""}
                />
              </label>
              <label>
                Goal
                <select name="goal" defaultValue={editingDiet?.goal || "Weight Loss"}>
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Muscle Gain">Muscle Gain</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </label>
              <label>
                Calories / Day
                <input
                  type="number"
                  name="calories"
                  min="900"
                  required
                  placeholder="2200"
                  defaultValue={editingDiet?.calories || ""}
                />
              </label>
              <label>
                Notes
                <textarea
                  name="notes"
                  rows="3"
                  placeholder="High protein, moderate carbs, hydration target"
                  defaultValue={editingDiet?.notes || ""}
                ></textarea>
              </label>
              <button type="submit" className="primary-btn full-width">
                {editingDiet ? "Update Diet Plan" : "Add Diet Plan"}
              </button>
            </form>
          ) : (
            <p className="empty">Only owner and receptionist accounts can create diet plans.</p>
          )}
        </article>
      </div>
    </section>
  );
}

export default DietView;
