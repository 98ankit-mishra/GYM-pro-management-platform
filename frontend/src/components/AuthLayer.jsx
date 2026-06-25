function AuthLayer({
  mode,
  setupRequired,
  onModeChange,
  onLogin,
  onSignup,
}) {
  return (
    <div className="auth-layer">
      {mode === "login" ? (
        <form className="auth-card" onSubmit={onLogin}>
          <h2>Gym Pro Login</h2>
          <p>Sign in to access secure gym records.</p>
          <label>
            Username
            <input type="text" name="username" required placeholder="Enter username" />
          </label>
          <label>
            Password
            <input type="password" name="password" required placeholder="Enter password" />
          </label>
          <button type="submit" className="primary-btn full-width">
            Login
          </button>
          {setupRequired ? (
            <button type="button" className="secondary-btn full-width" onClick={() => onModeChange("signup")}>
              Create owner account
            </button>
          ) : null}
          <small>
            {setupRequired
              ? "First time? Create the owner account to get started."
              : "Owner signup is only available when no users exist yet."}
          </small>
        </form>
      ) : (
        <form className="auth-card" onSubmit={onSignup}>
          <h2>Create Owner Account</h2>
          <p>This will create the first admin account for this gym.</p>
          <label>
            Owner Name
            <input type="text" name="name" placeholder="Gym Owner" />
          </label>
          <label>
            Username
            <input type="text" name="username" required placeholder="Choose a username" />
          </label>
          <label>
            Password
            <input type="password" name="password" required placeholder="Create a password" />
          </label>
          <button type="submit" className="primary-btn full-width">
            Create Account
          </button>
          {!setupRequired ? (
            <button type="button" className="secondary-btn full-width" onClick={() => onModeChange("login")}>
              Back to login
            </button>
          ) : null}
          <small>After creating the account, you will be logged in automatically.</small>
        </form>
      )}
    </div>
  );
}

export default AuthLayer;
