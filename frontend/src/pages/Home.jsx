import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import {
  Heart,
  Calendar,
  Clock,
  ArrowRight,
  Search,
  Sparkles,
  BookOpen,
  PenSquare,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../utils/api";

function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likingId, setLikingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  async function fetchBlog() {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/blogs`);
      setBlogs(res.data.blog || []);
    } catch (error) {
      console.error(error);
      toast.error("Unable to load blogs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBlog();
  }, []);

  async function handleLike(event, blogId) {
    event.preventDefault();
    event.stopPropagation();

    if (!user?.token) {
      toast.error("Sign in before liking");
      navigate("/signin");
      return;
    }

    try {
      setLikingId(blogId);
      const response = await axios.patch(
        `${API_BASE_URL}/blogs/like/${blogId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setBlogs((currentBlogs) =>
        currentBlogs.map((blog) =>
          blog._id === blogId ? response.data.blog : blog
        )
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update like");
    } finally {
      setLikingId(null);
    }
  }

  function getReadingTime(text) {
    if (!text) return "1 min read";
    const words = text.trim().split(/\s+/).length;
    return `${Math.max(1, Math.ceil(words / 180))} min read`;
  }

  const filteredBlogs = useMemo(() => {
    if (!searchQuery.trim()) return blogs;
    const q = searchQuery.toLowerCase();
    return blogs.filter((blog) => {
      const titleMatch = blog.title?.toLowerCase().includes(q);
      const descMatch = blog.description?.toLowerCase().includes(q);
      const authorMatch = blog.creator?.name?.toLowerCase().includes(q);
      return titleMatch || descMatch || authorMatch;
    });
  }, [blogs, searchQuery]);

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-gray-50 to-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        <section className="relative overflow-hidden bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 mb-10 shadow-sm">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-linear-to-bl from-blue-100/60 to-indigo-100/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-linear-to-tr from-violet-100/50 to-blue-100/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/70 mb-4 shadow-2xs">
                <Sparkles size={14} className="text-blue-600 animate-pulse" />
                <span>Explore Inspiring Ideas</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
                Where good ideas <br className="hidden sm:inline" />
                <span className="bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  find you.
                </span>
              </h1>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Discover thought-provoking articles, tutorials, and insights shared by writers and developers.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                to="/blogs"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                <PenSquare size={16} />
                Start Writing
              </Link>
            </div>
          </div>

          
          <div className="relative z-10 mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Title, content ya author search karein..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Showing <strong className="text-slate-800">{filteredBlogs.length}</strong> stories
            </span>
          </div>
        </section>

        
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm animate-pulse flex flex-col md:flex-row gap-6"
              >
                <div className="flex-1 space-y-4">
                  <div className="h-5 bg-slate-200 rounded w-1/4" />
                  <div className="h-8 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-full" />
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                </div>
                <div className="w-full md:w-80 h-52 bg-slate-200 rounded-2xl shrink-0" />
              </div>
            ))}
          </div>
        ) : filteredBlogs.length === 0 ? (
          
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-md mx-auto shadow-sm my-10">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen size={30} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              {searchQuery ? "Koi story match nahi hui" : "Abhi koi blog nahi hai"}
            </h2>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              {searchQuery
                ? `"${searchQuery}" no result .change Search keyword  .`
                : "publish your first blog !"}
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="text-sm font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Search reset karein
              </button>
            ) : (
              <Link
                to="/blogs"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition shadow-sm"
              >
                <PenSquare size={16} />
                Write First Blog
              </Link>
            )}
          </div>
        ) : (
          
          <div className="space-y-6">
            {filteredBlogs.map((blog) => {
              const authorName = blog.creator?.name || "Author";
              const authorInitials = authorName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              const formattedDate = new Date(blog.createdAt).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric", year: "numeric" }
              );

              const readTime = getReadingTime(blog.description);
              const isLiked = blog.likes?.some(
                (like) => String(like) === user?._id
              );

              return (
                <Link
                  to={`/blogs/${blog.blogId || blog._id}`}
                  key={blog._id}
                  className="block group"
                >
                  <article className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col md:flex-row">
                    
                    <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
                      <div>
                      
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-9 h-9 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                            {authorInitials}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 line-clamp-1">
                              {authorName}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                              <span className="flex items-center gap-1">
                                <Calendar size={11} /> {formattedDate}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock size={11} /> {readTime}
                              </span>
                            </div>
                          </div>
                        </div>

                        
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug tracking-tight mb-3">
                          {blog.title}
                        </h2>

                        
                        <p className="text-slate-600 text-sm sm:text-base leading-relaxed line-clamp-3 mb-6">
                          {blog.description}
                        </p>
                      </div>

                      
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:text-blue-800 transition">
                          Read Story
                          <ArrowRight
                            size={15}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </span>

                        <div className="flex items-center gap-3">
                          
                          <button
                            type="button"
                            onClick={(event) => handleLike(event, blog._id)}
                            disabled={likingId === blog._id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer border ${
                              isLiked
                                ? "bg-rose-50 text-rose-600 border-rose-200"
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                            }`}
                          >
                            <Heart
                              size={14}
                              className={isLiked ? "fill-rose-500 text-rose-500" : ""}
                            />
                            <span>{blog.likes?.length || 0}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    
                    {blog.imageurl ? (
                      <div className="w-full md:w-80 h-56 md:h-auto shrink-0 overflow-hidden bg-slate-100">
                        <img
                          src={blog.imageurl}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="w-full md:w-80 h-56 md:h-auto shrink-0 bg-linear-to-tr from-slate-100 to-blue-50 flex flex-col items-center justify-center text-slate-400">
                        <BookOpen size={36} className="text-slate-300 mb-2" />
                        <span className="text-xs font-medium">Article</span>
                      </div>
                    )}
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
