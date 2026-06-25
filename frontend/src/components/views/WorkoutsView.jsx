function WorkoutsView({
  workouts,
  canManage,
  showComposer,
  onToggleComposer,
  onSubmit,
  editingWorkout,
  onEdit,
  onDelete,
  onCancelEdit,
  formKey,
}) {
  return (
    <section className="view active">
      <article className="workouts-shell">
        <header className="workouts-head">
          <div>
            <h2>WORKOUT PLANS</h2>
            <p>Create and manage workout programs</p>
          </div>
          <button className="danger-btn" type="button" onClick={onToggleComposer} disabled={!canManage}>
            + ADD PLAN
          </button>
        </header>

        {showComposer && canManage ? (
          <form key={formKey} className="workout-form" autoComplete="off" onSubmit={onSubmit}>
            <label>
              Plan Name
              <input
                type="text"
                name="name"
                required
                placeholder="Strength Builder"
                defaultValue={editingWorkout?.name || ""}
              />
            </label>
            <label>
              Level
              <select name="level" defaultValue={editingWorkout?.level || "Beginner"}>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </label>
            <label>
              Days / Week
              <input
                type="number"
                name="daysPerWeek"
                min="1"
                max="7"
                required
                placeholder="4"
                defaultValue={editingWorkout?.daysPerWeek || ""}
              />
            </label>
            <label className="wide">
              Focus
              <textarea
                name="focus"
                rows="3"
                placeholder="Write a short focus summary"
                defaultValue={editingWorkout?.focus || ""}
              ></textarea>
            </label>
            <div className="section-actions wide">
              {editingWorkout ? (
                <button type="button" className="secondary-btn" onClick={onCancelEdit}>
                  Cancel
                </button>
              ) : null}
              <button type="submit" className="danger-btn">
                {editingWorkout ? "Update Plan" : "Save Plan"}
              </button>
            </div>
          </form>
        ) : null}

        <div className="workout-list">
          {workouts.length ? (
            workouts.map((plan) => (
              <article key={plan.id} className="workout-card">
                <h3>{plan.name}</h3>
                <p>Level: {plan.level}</p>
                <p>Days/Week: {plan.daysPerWeek}</p>
                <p>{plan.focus || "No focus notes."}</p>
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
            <div className="workout-empty">No workout plans found</div>
          )}
        </div>
      </article>
    </section>
  );
}

export default WorkoutsView;
