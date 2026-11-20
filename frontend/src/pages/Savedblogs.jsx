import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Bookmark,
  BookmarkCheck,
  Trash2,
  Search,
  Share2,
  Clock,
  Calendar,
  ArrowRight,
  BookOpen,
  Sparkles,
  X,
  Compass,
} from "lucide-react";
import { API_BASE_URL } from "../utils/api";

function Savedblogs() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [savedBlogs, setSavedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  async function fetchSavedBlogs() {
    try {
      const response = await axios.get(`${API_BASE_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const blogs = (response.data.user?.savedBlogs || []).filter(Boolean);
      setSavedBlogs(blogs);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load saved blogs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.token) {
      fetchSavedBlogs();
    }
  }, [user?.token]);


  async function handleRemoveSaved(blogId, event) {
    event.preventDefault();
    event.stopPropagation();

    try {
      const response = await axios.patch(
        `${API_BASE_URL}/blogs/save/${blogId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

  
      setSavedBlogs((prev) => prev.filter((blog) => blog._id !== blogId));

     
      const updatedUser = {
        ...user,
        savedBlogs: response.data.savedBlogs || [],
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Bookmark se hata diya gaya");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to unsave blog");
    }
  }

  
  function handleShareBlog(blog, event) {
    event.preventDefault();
    event.stopPropagation();
    const blogUrl = `${window.location.origin}/blogs/${blog.blogId || blog._id}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(blogUrl);
      toast.success("Link copied!");
    } else {
      toast("Link: " + blogUrl);
    }
  }


  function getReadingTime(text) {
    if (!text) return "1 min read";
    const words = text.trim().split(/\s+/).length;
    return `${Math.max(1, Math.ceil(words / 180))} min read`;
  }


  const filteredBlogs = useMemo(() => {
    if (!searchQuery.trim()) return savedBlogs;
    const q = searchQuery.toLowerCase();
    return savedBlogs.filter((blog) => {
      const titleMatch = blog.title?.toLowerCase().includes(q);
      const descMatch = blog.description?.toLowerCase().includes(q);
      const authorMatch = blog.creator?.name?.toLowerCase().includes(q);
      return titleMatch || descMatch || authorMatch;
    });
  }, [savedBlogs, searchQuery]);


  if (!user?.token) {
    return <Navigate to="/signin" />;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-gray-50 to-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="relative overflow-hidden bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-10 mb-10 shadow-sm">
          
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 mb-3 shadow-2xs">
                <Sparkles size={14} className="text-blue-600 animate-pulse" />
                <span>Personal Library</span>
              </div>

             
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                Saved Articles
                <span className="text-sm font-semibold bg-gray-100 text-gray-700 px-3 py-1 rounded-full border border-gray-200">
                  {savedBlogs.length}
                </span>
              </h1>
              <p className="text-gray-500 text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
                Aapke bookmarks aur pasandeeda stories ek jagah par. Jab chahein wapas padhein.
              </p>
            </div>

           
            <div className="flex items-center gap-3 self-start md:self-auto">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition duration-200"
              >
                <Compass size={16} />
                Explore More
              </Link>
            </div>
          </div>

          
          {savedBlogs.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-96">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Title, keyword ya author se search karein..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 bg-gray-50/80 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="text-xs text-gray-500 self-end sm:self-auto font-medium">
                Showing <span className="text-gray-900 font-semibold">{filteredBlogs.length}</span> of{" "}
                <span className="text-gray-900 font-semibold">{savedBlogs.length}</span> saved articles
              </div>
            </div>
          )}
        </div>

       
        {loading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm animate-pulse space-y-4"
              >
                <div className="w-full h-48 bg-gray-200 rounded-2xl" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : savedBlogs.length === 0 ? (
        
          <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center max-w-lg mx-auto shadow-sm my-8">
            <div className="w-20 h-20 bg-linear-to-tr from-blue-100 to-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <BookmarkCheck size={38} className="text-blue-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Aapka reading list khali hai
            </h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Jab aap koi interesting blog padhein, to uspar <strong>Save</strong> button par click karein. Wo yahan automatically save ho jayega.
            </p>

            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <Compass size={18} />
              Explore Articles
            </Link>
          </div>
        ) : filteredBlogs.length === 0 ? (
         
          <div className="bg-white rounded-3xl border border-gray-200/80 p-10 text-center max-w-md mx-auto shadow-sm my-8">
            <Search size={36} className="text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              Koi result nahi mila
            </h3>
            <p className="text-gray-500 text-sm mb-5">
              "{searchQuery}" ke sath koi saved blog match nahi hua.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              Search clear karein
            </button>
          </div>
        ) : (
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
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

              return (
                <article
                  key={blog._id}
                  className="group bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-2xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                  
                    <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                      {blog.imageurl ? (
                        <img
                          src={blog.imageurl}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-linear-to-tr from-slate-100 to-blue-50">
                          <BookOpen size={40} className="text-gray-300 mb-2" />
                          <span className="text-xs font-medium text-gray-400">Article</span>
                        </div>
                      )}

                    
                      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                        <Clock size={12} />
                        <span>{readTime}</span>
                      </div>

                     
                      <button
                        onClick={(e) => handleRemoveSaved(blog._id, e)}
                        title="Saved se hatayein"
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-rose-50 text-gray-600 hover:text-rose-600 backdrop-blur-md flex items-center justify-center shadow-md transition duration-200 cursor-pointer group/btn"
                      >
                        <Trash2 size={16} className="group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>

                    
                    <div className="p-6">
                    
                      <div className="flex items-center gap-2.5 mb-3.5">
                        <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                          {authorInitials}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-800 line-clamp-1">
                            {authorName}
                          </span>
                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <Calendar size={11} /> {formattedDate}
                          </span>
                        </div>
                      </div>

                     
                      <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-2.5">
                        <Link to={`/blogs/${blog.blogId || blog._id}`}>
                          {blog.title}
                        </Link>
                      </h2>

                     
                      <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                        {blog.description}
                      </p>
                    </div>
                  </div>

                  
                  <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                    <Link
                      to={`/blogs/${blog.blogId || blog._id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 transition group/link"
                    >
                      <span>Read Story</span>
                      <ArrowRight
                        size={15}
                        className="group-hover/link:translate-x-1 transition-transform"
                      />
                    </Link>

                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleShareBlog(blog, e)}
                        title="Link copy karein"
                        className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-white hover:shadow-2xs transition cursor-pointer"
                      >
                        <Share2 size={16} />
                      </button>

                      <button
                        onClick={(e) => handleRemoveSaved(blog._id, e)}
                        title="Remove bookmark"
                        className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <BookmarkCheck size={16} className="text-blue-600 hover:text-rose-600" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Savedblogs;
