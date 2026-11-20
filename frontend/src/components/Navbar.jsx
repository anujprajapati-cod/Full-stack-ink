import React, { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { PenSquare, Bookmark, Sparkles, LogIn, UserPlus } from "lucide-react";

function Navbar() {
  const location = useLocation();
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem("user") || "null"));
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          <Link
            to="/"
            className="group flex items-center gap-2 text-2xl font-black tracking-tight"
          >
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles size={18} />
            </div>
            <span className="bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent font-extrabold">
              Ink.
            </span>
          </Link>

          
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive("/")
                  ? "bg-blue-50 text-blue-600 shadow-2xs"
                  : "text-slate-600 hover:text-blue-600 hover:bg-slate-100/80"
              }`}
            >
              Home
            </Link>

            <Link
              to="/blogs"
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive("/blogs")
                  ? "bg-blue-50 text-blue-600 shadow-2xs"
                  : "text-slate-600 hover:text-blue-600 hover:bg-slate-100/80"
              }`}
            >
              <PenSquare size={16} />
              <span>Write</span>
            </Link>

            {user?.token ? (
              <>
                <Link
                  to="/saved"
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive("/saved")
                      ? "bg-blue-50 text-blue-600 shadow-2xs"
                      : "text-slate-600 hover:text-blue-600 hover:bg-slate-100/80"
                  }`}
                >
                  <Bookmark size={16} />
                  <span>Saved</span>
                </Link>

                <Link
                  to="/profile"
                  title="View Profile"
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 font-bold text-white text-xs shadow-sm ring-2 ring-transparent hover:ring-blue-400 transition-all hover:scale-105"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    user.name?.charAt(0).toUpperCase()
                  )}
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100/80 transition-all duration-200"
                >
                  <LogIn size={15} />
                  <span>Sign In</span>
                </Link>

                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <UserPlus size={15} />
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Outlet */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}

export default Navbar;
