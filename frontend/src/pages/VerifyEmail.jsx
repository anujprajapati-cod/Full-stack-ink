import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../utils/api";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    let active = true;

    axios.get(`${API_BASE_URL}/verify-email/${encodeURIComponent(token || "")}`)
      .then(({ data }) => {
        if (!active) return;
        localStorage.setItem("user", JSON.stringify(data.user));
        setMessage(data.message || "Email verified successfully");
        toast.success("Email verified. You are now signed in.");
        window.setTimeout(() => navigate("/", { replace: true }), 1000);
      })
      .catch((error) => {
        if (active) setMessage(error.response?.data?.message || "Email verification failed");
      });

    return () => { active = false; };
  }, [navigate, token]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <section className="max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900">Email verification</h1>
        <p className="mt-3 text-slate-600">{message}</p>
        <Link className="mt-6 inline-block font-semibold text-blue-600" to="/">Go to home</Link>
      </section>
    </main>
  );
}
