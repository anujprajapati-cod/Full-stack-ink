import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../utils/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setIsLoading(true);
      const { data } = await axios.post(`${API_BASE_URL}/forgot-password`, { email }, { timeout: 25000 });
      setSubmitted(true);
      toast.success(data.message);
    } catch (error) {
      toast.error(
        error.code === "ECONNABORTED"
          ? "Email server took too long to respond. Please try again."
          : error.response?.data?.message || "Could not send reset link"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-slate-900">Forgot password?</h1>
        <p className="mt-2 text-sm text-slate-600">Enter your account email and we’ll send you a reset link.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input type="email" required autoComplete="email" placeholder="name@example.com" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
          <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
            {isLoading ? "Sending..." : "Send reset link"}
          </button>
        </form>
        {submitted && <p className="mt-4 text-sm text-slate-600">If the account exists, a reset link will arrive shortly. Check spam too.</p>}
        <Link to="/signin" className="mt-6 inline-block text-sm font-semibold text-blue-600">Back to sign in</Link>
      </section>
    </main>
  );
}
