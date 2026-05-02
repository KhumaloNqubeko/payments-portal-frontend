import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "./api/client";
import { useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { validateCustomerRegistration, validatePayment } from "./pages/helpers";

const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60";
const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60";
const ghostButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-slate-300/15 bg-slate-900/40 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800/60 disabled:cursor-not-allowed disabled:opacity-60";
const cardClass =
  "rounded-[28px] border border-white/10 bg-white/8 p-6 shadow-[0_18px_80px_rgba(2,6,23,0.32)] backdrop-blur-xl";
const panelClass =
  "rounded-[28px] border border-white/10 bg-slate-950/45 p-5 shadow-[0_18px_60px_rgba(2,6,23,0.28)] backdrop-blur-xl";

function Shell({ title, subtitle, children, actions }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="relative overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 px-6 py-8 shadow-[0_30px_120px_rgba(2,6,23,0.45)] sm:px-8 lg:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.24),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.2),transparent_32%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300/80">
              Back Office
            </p>
            <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              {subtitle}
            </p>
          </div>
          {actions ? <div className="relative flex flex-wrap gap-3">{actions}</div> : null}
        </div>
      </header>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function AppNav() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/");
    } finally {
      setIsLoggingOut(false);
    }
  }

  const linkClass = ({ isActive }) =>
    [
      "rounded-full px-4 py-2 text-sm font-medium transition",
      isActive ? "bg-white text-slate-950 shadow-lg" : "text-slate-300 hover:bg-white/10 hover:text-white"
    ].join(" ");

  return (
    <nav className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/75 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-lg font-black text-slate-950 shadow-lg shadow-emerald-500/30">
            IP
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/70">Secure Banking</p>
            <p className="text-sm font-semibold text-white">International Payments Portal</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <NavLink to="/" className={linkClass}>Home</NavLink>
          {!auth.token && <NavLink to="/register" className={linkClass}>Register</NavLink>}
          {!auth.token && <NavLink to="/login" className={linkClass}>Customer Login</NavLink>}
          {!auth.token && <NavLink to="/employee/login" className={linkClass}>Employee Login</NavLink>}
          {auth.role === "CUSTOMER" && <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>}
          {auth.role === "CUSTOMER" && <NavLink to="/transactions" className={linkClass}>Transactions</NavLink>}
          {auth.role === "EMPLOYEE" && <NavLink to="/employee/dashboard" className={linkClass}>Employee Dashboard</NavLink>}
          {auth.token && (
            <button type="button" className={ghostButtonClass} onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? <LoadingLabel label="Logging out" dark /> : "Logout"}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

function LandingPage() {
  return (
    <Shell
      title="Secure international payments."
      subtitle="Payments made simple, secure, and transparent for customers, with robust verification tools for employees to ensure compliance and prevent fraud."
      actions={
        <>
          <NavLink className={primaryButtonClass} to="/register">Open Customer Portal</NavLink>
          <NavLink className={secondaryButtonClass} to="/employee/login">Employee Access</NavLink>
        </>
      }
    >
    </Shell>
  );
}

function RegistrationPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    southAfricanIdNumber: "",
    accountNumber: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const clientErrors = validateCustomerRegistration(form);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) {
      return;
    }
    setIsSubmitting(true);
    try {
      await login("/auth/register", form);
      navigate("/dashboard");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
      setForm((current) => ({ ...current, password: "" }));
    }
  }

  return (
    <Shell
      title="Create a protected customer profile"
    >
      <div  className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <FormCard title="Customer registration" message={message}>
          <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
            <Field label="Full name" value={form.fullName} error={errors.fullName} onChange={(value) => setForm({ ...form, fullName: value })} />
            <Field label="Username" value={form.username} error={errors.username} autoComplete="username" onChange={(value) => setForm({ ...form, username: value })} />
            <Field label="Email" type="email" value={form.email} error={errors.email} autoComplete="email" onChange={(value) => setForm({ ...form, email: value })} />
            <Field label="South African ID number" value={form.southAfricanIdNumber} error={errors.southAfricanIdNumber} onChange={(value) => setForm({ ...form, southAfricanIdNumber: value })} />
            <Field label="Account number" value={form.accountNumber} error={errors.accountNumber} onChange={(value) => setForm({ ...form, accountNumber: value })} />
            <div className="md:col-span-2">
              <Field label="Strong password" type="password" value={form.password} error={errors.password} autoComplete="new-password" onChange={(value) => setForm({ ...form, password: value })} />
            </div>
            <div className="md:col-span-2 pt-2">
              <button className={primaryButtonClass} type="submit" disabled={isSubmitting}>
                {isSubmitting ? <LoadingLabel label="Registering" /> : "Register securely"}
              </button>
            </div>
          </form>
        </FormCard>
      </div>
    </Shell>
  );
}

function LoginPage({ employee = false }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ usernameOrAccountNumber: "", password: "" });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await login(employee ? "/employee/auth/login" : "/auth/login", form);
      navigate(employee ? "/employee/dashboard" : "/dashboard");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
      setForm((current) => ({ ...current, password: "" }));
    }
  }

  return (
    <Shell
      title={employee ? "Employee verification workspace" : "Customer sign in"}
      subtitle={employee
        ? "Unauthorized access is blocked and employees only receive data relevant to their operational tasks."
        : "Use your username or account number to access your international payments dashboard."}
    >
      <div  className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <FormCard title={employee ? "Employee login" : "Customer login"} message={message}>
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <Field label="Username or account number" value={form.usernameOrAccountNumber} autoComplete="username" onChange={(value) => setForm({ ...form, usernameOrAccountNumber: value })} />
            <Field label="Password" type="password" value={form.password} autoComplete="current-password" onChange={(value) => setForm({ ...form, password: value })} />
            <div className="pt-2">
              <button className={primaryButtonClass} type="submit" disabled={isSubmitting}>
                {isSubmitting ? <LoadingLabel label="Signing in" /> : employee ? "Enter employee portal" : "Sign in"}
              </button>
            </div>
          </form>
        </FormCard>
      </div>
    </Shell>
  );
}

function CustomerDashboard() {
  const { auth, refreshMe } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    senderFullName: "",
    beneficiaryBankName: "",
    country: "",
    paymentReference: "",
    amount: "",
    currency: "USD",
    provider: "SWIFT",
    beneficiaryName: "",
    beneficiaryAccountNumber: "",
    swiftCode: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  useEffect(() => {
    refreshMe()
      .then((user) => {
        if (user?.fullName) {
          setForm((current) => ({
            ...current,
            senderFullName: current.senderFullName || user.fullName
          }));
        }
      })
      .catch(() => null);
    apiFetch("/payments/my-transactions", { token: auth.token })
      .then(setTransactions)
      .catch((error) => setMessage(error.message));
  }, [auth.token, refreshMe]);

  async function submitPayment(event) {
    event.preventDefault();
    const clientErrors = validatePayment(form);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) {
      return;
    }
    setIsSubmittingPayment(true);
    try {
      const created = await apiFetch("/payments", {
        method: "POST",
        token: auth.token,
        body: { ...form, amount: Number(form.amount) }
      });
      setTransactions((current) => [created, ...current]);
      setForm({
        senderFullName: auth.user?.fullName || form.senderFullName,
        beneficiaryBankName: "",
        country: "",
        paymentReference: "",
        amount: "",
        currency: "USD",
        provider: "SWIFT",
        beneficiaryName: "",
        beneficiaryAccountNumber: "",
        swiftCode: ""
      });
      setMessage("Payment captured and stored with pending verification status.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSubmittingPayment(false);
    }
  }

  return (
    <Shell
      title="Customer payments dashboard"
      subtitle="Capture a new international payment and track every status change from pending verification through final disposition."
      actions={<StatusPill label={auth.user?.maskedAccountNumber || "Account loading"} tone="neutral" />}
    >
      <div  className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <FormCard title="New international payment" message={message}>
          <form className="grid gap-5 md:grid-cols-2" onSubmit={submitPayment}>
            <Field label="Sender full name" value={form.senderFullName} error={errors.senderFullName} onChange={(value) => setForm({ ...form, senderFullName: value })} />
            <Field label="Beneficiary full name" value={form.beneficiaryName} error={errors.beneficiaryName} onChange={(value) => setForm({ ...form, beneficiaryName: value })} />
            <Field label="Beneficiary bank name" value={form.beneficiaryBankName} error={errors.beneficiaryBankName} onChange={(value) => setForm({ ...form, beneficiaryBankName: value })} />
            <Field label="Country" value={form.country} error={errors.country} onChange={(value) => setForm({ ...form, country: value })} />
            <Field label="Amount" type="number" value={form.amount} error={errors.amount} onChange={(value) => setForm({ ...form, amount: value })} />
            <SelectField label="Currency" value={form.currency} options={["ZAR", "USD", "EUR", "GBP"]} onChange={(value) => setForm({ ...form, currency: value })} />
            <SelectField label="Provider" value={form.provider} options={["SWIFT"]} onChange={(value) => setForm({ ...form, provider: value })} />
            <div className="md:col-span-2">
              <Field label="Beneficiary account / IBAN" value={form.beneficiaryAccountNumber} error={errors.beneficiaryAccountNumber} onChange={(value) => setForm({ ...form, beneficiaryAccountNumber: value.toUpperCase() })} />
            </div>
            <div className="md:col-span-2">
              <Field label="SWIFT / BIC code" value={form.swiftCode} error={errors.swiftCode} onChange={(value) => setForm({ ...form, swiftCode: value.toUpperCase() })} />
            </div>
            <div className="md:col-span-2">
              <Field label="Payment reference" value={form.paymentReference} error={errors.paymentReference} onChange={(value) => setForm({ ...form, paymentReference: value })} />
            </div>
            <div className="md:col-span-2 pt-2">
              <button className={primaryButtonClass} type="submit" disabled={isSubmittingPayment}>
                {isSubmittingPayment ? <LoadingLabel label="Processing payment" /> : "Pay now"}
              </button>
            </div>
          </form>
        </FormCard>
        <br />
        <section className={`${panelClass} min-w-0`}>
          <SectionHeader
            title="Transaction history"
            text="Only transactions belonging to the authenticated customer are displayed here."
          />
          <TransactionTable items={transactions} employeeView={false} />
        </section>
      </div>
    </Shell>
  );
}

function CustomerHistoryPage() {
  const { auth } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    apiFetch("/payments/my-transactions", { token: auth.token })
      .then(setTransactions)
      .catch((error) => setMessage(error.message));
  }, [auth.token]);

  return (
    <Shell
      title="Customer transaction history"
      subtitle="Only the authenticated customer's transactions are shown in this view."
    >
      <section className={panelClass}>
        <SectionHeader title="My transactions" text={message || "Statuses reflect the latest backend state."} />
        <TransactionTable items={transactions} employeeView={false} />
      </section>
    </Shell>
  );
}

function NewPaymentPage() {
  return <CustomerDashboard />;
}

function EmployeeDashboard() {
  const { auth } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState("");
  const [activeAction, setActiveAction] = useState(null);

  async function loadTransactions() {
    try {
      const data = await apiFetch("/employee/transactions", { token: auth.token });
      setTransactions(data);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  async function transition(id, action) {
    setActiveAction({ id, action });
    setMessage(action === "submit-swift" ? "Submitting payment to SWIFT..." : "Updating transaction...");
    try {
      await apiFetch(`/employee/transactions/${id}/${action}`, { method: "PATCH", token: auth.token });
      await loadTransactions();
      setMessage(action === "submit-swift" ? "Payment submitted to SWIFT and transaction list refreshed." : "Transaction updated and data refreshed.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setActiveAction(null);
    }
  }

  const totals = useMemo(
    () =>
      transactions.reduce((accumulator, transaction) => {
        accumulator[transaction.status] = (accumulator[transaction.status] || 0) + 1;
        return accumulator;
      }, {}),
    [transactions]
  );

  return (
    <Shell
      title="Employee verification dashboard"
      subtitle="Review beneficiary details, confirm SWIFT format, and move eligible payments through the operational workflow."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { status: "PENDING_VERIFICATION", accent: "from-amber-400/25 to-amber-200/5" },
          { status: "VERIFIED", accent: "from-emerald-400/25 to-emerald-200/5" },
          { status: "SUBMITTED_TO_SWIFT", accent: "from-sky-400/25 to-sky-200/5" },
          { status: "REJECTED", accent: "from-rose-400/25 to-rose-200/5" }
        ].map(({ status, accent }) => (
          <article
            key={status}
            className={`rounded-[28px] border border-white/10 bg-gradient-to-br ${accent} p-5 shadow-[0_18px_60px_rgba(2,6,23,0.28)] backdrop-blur-xl`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              {status.replaceAll("_", " ")}
            </p>
            <strong className="mt-4 block text-4xl font-semibold text-white">{totals[status] || 0}</strong>
          </article>
        ))}
      </section>
      <section className={`${panelClass} mt-4`}>
        <SectionHeader
          title="Transaction review queue"
          text={message || "Employees never receive hidden fields such as password hashes or national ID values."}
        />
        <TransactionTable items={transactions} employeeView onAction={transition} activeAction={activeAction} />
      </section>
    </Shell>
  );
}

function EmployeeReviewPage() {
  return <EmployeeDashboard />;
}

function UnauthorizedPage() {
  return (
    <Shell
      title="You are not authorized for this page"
      subtitle="The portal blocked access because the signed-in role does not match the requested workspace."
    >
      <div className={panelClass}>
        <p className="max-w-2xl text-sm leading-7 text-slate-300">
          Return to the correct portal and sign in with an account that has the required privileges for that route.
        </p>
      </div>
    </Shell>
  );
}

function FeatureCard({ title, body }) {
  return (
    <article className="min-h-[260px] rounded-[24px] border border-white/10 bg-slate-950/50 p-6 md:min-h-[300px]">
      <div className="mb-5 h-14 w-14 rounded-2xl bg-white/10" />
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="mt-4 text-base leading-8 text-slate-300">{body}</p>
    </article>
  );
}

function InfoRail({ title, items }) {
  return (
    <aside className={`${cardClass} flex flex-col justify-between`}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/80">Design Refresh</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">{title}</h2>
      </div>
      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            {item}
          </div>
        ))}
      </div>
    </aside>
  );
}

function SectionHeader({ title, text }) {
  return (
    <div className="mb-4 flex flex-col gap-1">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="text-sm leading-7 text-slate-400">{text}</p>
    </div>
  );
}

function FormCard({ title, message, children }) {
  return (
    <section className={cardClass}>
      <SectionHeader
        title={title}
        text={message || "Validation errors are shown inline and all fields must be completed to submit."}
      />
      {children}
    </section>
  );
}

function Field({ label, type = "text", value, error, autoComplete, onChange }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <input
        className={[
          "h-14 rounded-2xl border bg-slate-950/60 px-4 text-white outline-none transition",
          error ? "border-rose-400/70 focus:border-rose-400" : "border-white/12 focus:border-emerald-400/80"
        ].join(" ")}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <small className="text-sm text-rose-300">{error}</small> : null}
    </label>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <select
        className="h-14 rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none transition focus:border-emerald-400/80"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-slate-950">
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatusPill({ label, tone }) {
  const toneMap = {
    warning: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    danger: "border-rose-400/20 bg-rose-400/10 text-rose-200",
    info: "border-sky-400/20 bg-sky-400/10 text-sky-200",
    neutral: "border-white/12 bg-white/8 text-slate-300"
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${toneMap[tone || "neutral"]}`}>
      {label}
    </span>
  );
}

function TransactionTable({ items, employeeView, onAction, activeAction }) {
  if (items.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-white/12 bg-white/4 px-5 py-12 text-center text-sm text-slate-400">
        No transactions available yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[920px] w-full border-separate border-spacing-y-2">
        <thead>
          <tr className="text-left text-xs uppercase tracking-[0.18em] text-slate-500">
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Beneficiary</th>
            <th className="px-4 py-3">Masked Account</th>
            <th className="px-4 py-3">SWIFT</th>
            <th className="px-4 py-3">Reference</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Verified By</th>
            {employeeView && <th className="px-4 py-3">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="rounded-[22px] bg-white/5 text-sm text-slate-200 shadow-[0_12px_30px_rgba(2,6,23,0.15)]">
              <td className="rounded-l-[22px] px-4 py-4 font-semibold text-white">{item.id}</td>
              <td className="px-4 py-4">{item.customerName || "Current customer"}</td>
              <td className="px-4 py-4">{item.currency} {Number(item.amount).toFixed(2)}</td>
              <td className="px-4 py-4">{item.beneficiaryName}</td>
              <td className="px-4 py-4">{item.maskedBeneficiaryAccountNumber}</td>
              <td className="px-4 py-4">{item.swiftCode}</td>
              <td className="px-4 py-4">{item.paymentReference}</td>
              <td className="px-4 py-4">
                <StatusPill label={item.status.replaceAll("_", " ")} tone={toneForStatus(item.status)} />
              </td>
              <td className="px-4 py-4">{item.verifiedByName || "Not assigned"}</td>
              {employeeView && (
                <td className="rounded-r-[22px] px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    {item.status === "PENDING_VERIFICATION" && (
                      <>
                        <button
                          className={secondaryButtonClass}
                          disabled={Boolean(activeAction)}
                          onClick={() => onAction(item.id, "verify")}
                        >
                          {activeAction?.id === item.id && activeAction?.action === "verify" ? <LoadingLabel label="Verifying" /> : "Verify"}
                        </button>
                        <button
                          className={ghostButtonClass}
                          disabled={Boolean(activeAction)}
                          onClick={() => onAction(item.id, "reject")}
                        >
                          {activeAction?.id === item.id && activeAction?.action === "reject" ? <LoadingLabel label="Rejecting" dark /> : "Reject"}
                        </button>
                      </>
                    )}
                    {item.status === "VERIFIED" && (
                      <button
                        className={primaryButtonClass}
                        disabled={Boolean(activeAction)}
                        onClick={() => onAction(item.id, "submit-swift")}
                      >
                        {activeAction?.id === item.id && activeAction?.action === "submit-swift" ? <LoadingLabel label="Submitting" /> : "Submit to SWIFT"}
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LoadingLabel({ label, dark = false }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-4 w-4 animate-spin rounded-full border-2 ${dark ? "border-slate-200 border-r-transparent" : "border-current border-r-transparent"}`} />
      {label}
    </span>
  );
}

function toneForStatus(status) {
  switch (status) {
    case "VERIFIED":
      return "success";
    case "SUBMITTED_TO_SWIFT":
      return "info";
    case "REJECTED":
      return "danger";
    default:
      return "warning";
  }
}

export default function App() {
  return (
    <div className="min-h-screen">
      <AppNav />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/employee/login" element={<LoginPage employee />} />
        <Route path="/dashboard" element={<ProtectedRoute role="CUSTOMER"><CustomerDashboard /></ProtectedRoute>} />
        <Route path="/payments/new" element={<ProtectedRoute role="CUSTOMER"><NewPaymentPage /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute role="CUSTOMER"><CustomerHistoryPage /></ProtectedRoute>} />
        <Route path="/employee/dashboard" element={<ProtectedRoute role="EMPLOYEE"><EmployeeDashboard /></ProtectedRoute>} />
        <Route path="/employee/review" element={<ProtectedRoute role="EMPLOYEE"><EmployeeReviewPage /></ProtectedRoute>} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Routes>
    </div>
  );
}
