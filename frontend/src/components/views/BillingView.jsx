function BillingView({ stats, payments, members, onSubmit, canManage, today }) {
  return (
    <section className="view active">
      <div className="split-grid">
        <article className="panel">
          <div className="panel-head">
            <h2>Payment Ledger</h2>
          </div>
          <div className="snapshot-list billing-snapshot">
            <div className="snapshot-item">
              <span>Total Outstanding Dues</span>
              <strong>{stats.outstandingTotal}</strong>
            </div>
            <div className="snapshot-item">
              <span>Collected This Month</span>
              <strong>{stats.collectedMonth}</strong>
            </div>
            <div className="snapshot-item">
              <span>Pending Members</span>
              <strong>{stats.pendingMembers}</strong>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Member</th>
                  <th>Amount</th>
                  <th>Mode</th>
                  <th>Reference</th>
                  <th>Recorded By</th>
                </tr>
              </thead>
              <tbody>
                {payments.length ? (
                  payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.date}</td>
                      <td>{payment.memberName}</td>
                      <td>{payment.amount}</td>
                      <td>{payment.mode}</td>
                      <td>{payment.reference}</td>
                      <td>{payment.recordedBy}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty">
                      No payments recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h2>Record Payment</h2>
          </div>
          {canManage ? (
            <form className="form-grid" onSubmit={onSubmit}>
              <label>
                Member
                <select name="memberId" required defaultValue={members[0]?.id || ""}>
                  {members.length ? (
                    members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.label}
                      </option>
                    ))
                  ) : (
                    <option value="">No members available</option>
                  )}
                </select>
              </label>
              <label>
                Amount (INR)
                <input type="number" name="amount" min="1" required placeholder="2500" />
              </label>
              <label>
                Payment Mode
                <select name="mode" defaultValue="UPI">
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </label>
              <label>
                Payment Date
                <input type="date" name="date" defaultValue={today} />
              </label>
              <label>
                Reference / UTR
                <input type="text" name="reference" placeholder="Transaction reference" />
              </label>
              <label>
                Notes
                <textarea name="note" rows="2" placeholder="Optional payment notes"></textarea>
              </label>
              <label className="checkbox-line">
                <input type="checkbox" name="autoRenew" defaultChecked />
                Auto renew plan if due is fully paid
              </label>
              <button type="submit" className="primary-btn full-width" disabled={!members.length}>
                Save Payment
              </button>
            </form>
          ) : (
            <p className="empty">Only owner and receptionist accounts can record payments.</p>
          )}
        </article>
      </div>
    </section>
  );
}

export default BillingView;
