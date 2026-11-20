import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../utils/api";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);
      const { data } = await axios.post(`${API_BASE_URL}/reset-password/${encodeURIComponent(token || "")}`, { password });
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Password updated. You are signed in.");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not reset password");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-slate-900">Set a new password</h1>
        <p className="mt-2 text-sm text-slate-600">Choose a password with at least 6 characters.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input type="password" required minLength={6} autoComplete="new-password" placeholder="New password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
          <input type="password" required minLength={6} autoComplete="new-password" placeholder="Confirm new password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
          <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
            {isLoading ? "Updating..." : "Update password"}
          </button>
        </form>
        <Link to="/signin" className="mt-6 inline-block text-sm font-semibold text-blue-600">Back to sign in</Link>
      </section>
    </main>
  );
}
