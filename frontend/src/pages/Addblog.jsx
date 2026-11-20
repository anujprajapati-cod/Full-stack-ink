import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Navigate, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  PenTool,
  ImagePlus,
  ArrowLeft,
  Sparkles,
  FileText,
  X,
  UploadCloud,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { API_BASE_URL } from "../utils/api";
import { compressImage } from "../utils/compressImage";

function Addblog() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = user?.token;

  const [blogdata, setBlogData] = useState({
    title: "",
    description: "",
    Image: null,
  });
  const [imagePreview, setImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({
    title: false,
    description: false,
    image: false,
  });

  useEffect(() => {
    if (!blogdata.Image) {
      setImagePreview("");
      return undefined;
    }
    const objectUrl = URL.createObjectURL(blogdata.Image);
    setImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blogdata.Image]);

  if (!user?.token) {
    return <Navigate to="/signin" />;
  }

  async function handlePostBlog(e) {
    e.preventDefault();

    const errors = [];
    const newFieldErrors = { title: false, description: false, image: false };

    if (!blogdata.title.trim()) {
      errors.push("Enter your blog first");
      newFieldErrors.title = true;
    }
    if (!blogdata.description.trim()) {
      errors.push("Add your content.");
      newFieldErrors.description = true;
    }
    if (!blogdata.Image) {
      errors.push("Add an image.");
      newFieldErrors.image = true;
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      setFieldErrors(newFieldErrors);
      setShowValidationModal(true);
      return;
    }

    setFieldErrors({ title: false, description: false, image: false });

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("title", blogdata.title.trim());
      formData.append("description", blogdata.description.trim());
      const uploadImage = await compressImage(blogdata.Image);
      formData.append("image", uploadImage);

      const res = await axios.post(
        `${API_BASE_URL}/blogs`,
        formData,
        {
          timeout: 30000,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Blog created successfully!");
      setBlogData({ title: "", description: "", Image: null });
      navigate(`/blogs/${res.data.blog.blogId || res.data.blog._id}`);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-gray-50 to-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </div>

        
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10 md:p-12 relative overflow-hidden">
          
          <div className="text-center max-w-lg mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/70 mb-3 shadow-2xs">
              <Sparkles size={14} className="text-blue-600" />
              <span>Creator Studio</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Create New Story
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              Share your insights, guides, and thoughts with our growing community.
            </p>
          </div>

          <form onSubmit={handlePostBlog} noValidate className="space-y-6">
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-slate-800">
                  Blog Title <span className="text-rose-500">*</span>
                </label>
                {fieldErrors.title && (
                  <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle size={13} />
                    Title likhna zaroori hai
                  </span>
                )}
              </div>
              <input
                type="text"
                placeholder="e.g. Master Modern Web Design with Tailwind CSS"
                value={blogdata.title}
                className={`w-full border rounded-2xl px-4 py-3.5 text-slate-800 text-base font-medium placeholder-slate-400 outline-none transition ${
                  fieldErrors.title
                    ? "border-rose-400 bg-rose-50/40 ring-2 ring-rose-200"
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                }`}
                onChange={(e) => {
                  setBlogData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }));
                  if (fieldErrors.title) {
                    setFieldErrors((prev) => ({ ...prev, title: false }));
                  }
                }}
              />
            </div>

            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-slate-800">
                  Content / Description <span className="text-rose-500">*</span>
                </label>
                {fieldErrors.description && (
                  <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle size={13} />
                    Must write your description
                  </span>
                )}
              </div>
              <textarea
                placeholder="Write your story here... Detail your thoughts, code snippets, or key takeaways."
                rows="8"
                value={blogdata.description}
                className={`w-full border rounded-2xl px-4 py-3.5 text-slate-800 text-base leading-relaxed placeholder-slate-400 outline-none resize-none transition ${
                  fieldErrors.description
                    ? "border-rose-400 bg-rose-50/40 ring-2 ring-rose-200"
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                }`}
                onChange={(e) => {
                  setBlogData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }));
                  if (fieldErrors.description) {
                    setFieldErrors((prev) => ({ ...prev, description: false }));
                  }
                }}
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1.5 px-1">
                <span>Markdown & linebreaks supported</span>
                <span>{blogdata.description.length} characters</span>
              </div>
            </div>

            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-slate-800">
                  Cover Image <span className="text-rose-500">*</span>
                </label>
                {fieldErrors.image && (
                  <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle size={13} />
                    Must add cover photo
                  </span>
                )}
              </div>

              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 max-h-72 group">
                  <img
                    src={imagePreview}
                    alt="Cover preview"
                    className="w-full h-72 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setBlogData((prev) => ({ ...prev, Image: null }))
                    }
                    className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-xs transition cursor-pointer"
                    title="Remove image"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="blog-image"
                  className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-all cursor-pointer group text-center ${
                    fieldErrors.image
                      ? "border-rose-400 bg-rose-50/30 hover:bg-rose-50/50"
                      : "border-slate-300 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/30"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${
                    fieldErrors.image ? "bg-rose-100 text-rose-600" : "bg-blue-50 text-blue-600"
                  }`}>
                    <UploadCloud size={24} />
                  </div>
                  <span className="font-semibold text-slate-800 text-sm">
                    Click to upload cover image
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    PNG, JPG, or JPEG (Recommended 1200x630)
                  </span>
                  <input
                    type="file"
                    id="blog-image"
                    accept=".png,.jpeg,.jpg"
                    className="hidden"
                    onChange={(e) => {
                      setBlogData((prev) => ({
                        ...prev,
                        Image: e.target.files[0] || null,
                      }));
                      if (fieldErrors.image) {
                        setFieldErrors((prev) => ({ ...prev, image: false }));
                      }
                    }}
                  />
                </label>
              )}
            </div>

          
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
              >
                <PenTool size={18} />
                <span>{isSubmitting ? "Publishing Story..." : "Publish Story"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      
      {showValidationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-rose-100 transform transition-all animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <AlertTriangle size={28} />
            </div>

            <h3 className="text-xl font-bold text-slate-900 text-center mb-1">
              Required Fields Missing
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 text-center mb-5 leading-relaxed">
              Add all required field 
            </p>

            <div className="space-y-2.5 mb-6 bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4">
              {validationErrors.map((err, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-rose-700 font-medium">
                  <AlertCircle size={16} className="shrink-0 text-rose-500 mt-0.5" />
                  <span>{err}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowValidationModal(false)}
              className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition shadow-sm cursor-pointer"
            >
              Move backward
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Addblog;
