import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
} from "lucide-react";
import { API_BASE_URL } from "../utils/api";

function Authform({ type }) {
  const navigate = useNavigate();

  const [userdata, setUserdata] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleAuthForm(e) {
    e.preventDefault();

    if (type === "signup" && !userdata.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!userdata.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!userdata.password) {
      toast.error("Password is required");
      return;
    }

    try {
      setIsLoading(true);

      const res = await axios.post(
        `${API_BASE_URL}/${type}`,
        userdata
      );

      if (type === "signup") {
        toast.success(
          res.data.message || "Check your email to verify your account",
          { duration: 6000 }
        );
        return;
      }

      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success(res.data.message || "Signed in successfully!");

      navigate("/");
    } catch (error) {
      console.error("Authentication error:", error);

      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Authentication failed"
      );
    } finally {
      setIsLoading(false);
    }
  }

  const isSignIn = type === "signin";

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 bg-white/95 backdrop-blur-md w-full max-w-md p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-200/80">
        
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-4 group"
          >
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Sparkles size={20} />
            </div>

            <span className="text-2xl font-black bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Ink.
            </span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isSignIn ? "Welcome Back" : "Join Ink."}
          </h1>

          <p className="text-slate-500 text-sm mt-1.5">
            {isSignIn
              ? "Enter your details to sign in to your account."
              : "Create an account to start writing and saving stories."}
          </p>
        </div>

        
        <form onSubmit={handleAuthForm} className="space-y-4">
          
          {!isSignIn && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={userdata.name}
                  onChange={(e) =>
                    setUserdata((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required={!isSignIn}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition font-medium"
                />
              </div>
            </div>
          )}

         
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="email"
                placeholder="name@example.com"
                value={userdata.email}
                onChange={(e) =>
                  setUserdata((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition font-medium"
              />
            </div>
          </div>

          
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={userdata.password}
                onChange={(e) =>
                  setUserdata((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                required
                className="w-full pl-10 pr-10 py-3 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition font-medium"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          
          {isSignIn && (
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm font-semibold text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSignIn ? <LogIn size={16} /> : <UserPlus size={16} />}

              <span>
                {isLoading
                  ? "Processing..."
                  : isSignIn
                  ? "Sign In to Account"
                  : "Create Account"}
              </span>
            </button>
          </div>
        </form>


       
        <div className="text-center mt-6 pt-6 border-t border-slate-100">
          <p className="text-slate-600 text-sm">
            {isSignIn
              ? "Don't have an account yet? "
              : "Already have an account? "}

            <Link
              to={isSignIn ? "/signup" : "/signin"}
              className="text-blue-600 font-bold hover:text-blue-800 hover:underline transition"
            >
              {isSignIn ? "Sign Up" : "Sign In"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Authform;
