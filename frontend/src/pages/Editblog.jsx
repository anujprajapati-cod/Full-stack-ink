import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Navigate, useNavigate, useParams, Link } from "react-router-dom";
import {
  Edit3,
  ArrowLeft,
  UploadCloud,
  X,
  Sparkles,
  Save,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { API_BASE_URL } from "../utils/api";
import { compressImage } from "../utils/compressImage";

function Editblog() {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [blog, setBlog] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({
    title: false,
    description: false,
  });

  
  useEffect(() => {
    async function fetchBlog() {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/blogs/${blogId}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setBlog(response.data.blog);
      } catch (error) {
        toast.error("Blog not found");
        navigate("/");
      }
    }

    fetchBlog();
  }, [blogId, navigate]);

  useEffect(() => {
    if (!newImage) {
      setNewImagePreview("");
      return undefined;
    }
    const objectUrl = URL.createObjectURL(newImage);
    setNewImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [newImage]);

  function handleChange(event) {
    setBlog({
      ...blog,
      [event.target.name]: event.target.value,
    });
  }

  function handleImageChange(event) {
    setNewImage(event.target.files?.[0] || null);
  }

  async function handleUpdate(event) {
    event.preventDefault();

    const errors = [];
    const newFieldErrors = { title: false, description: false };

    if (!blog?.title?.trim()) {
      errors.push("Add title");
      newFieldErrors.title = true;
    }
    if (!blog?.description?.trim()) {
      errors.push("Add content and description.");
      newFieldErrors.description = true;
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      setFieldErrors(newFieldErrors);
      setShowValidationModal(true);
      return;
    }

    setFieldErrors({ title: false, description: false });

    try {
      setIsUpdating(true);
      const formData = new FormData();
      formData.append("title", blog.title.trim());
      formData.append("description", blog.description.trim());
      if (newImage) formData.append("image", await compressImage(newImage));

      await axios.patch(
        `${API_BASE_URL}/blogs/${blog._id}`,
        formData,
        {
          timeout: 30000,
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      toast.success("Blog updated successfully");
      navigate(`/blogs/${blogId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update blog");
    } finally {
      setIsUpdating(false);
    }
  }

  if (!user?.token) return <Navigate to="/signin" />;

  if (!blog) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <p className="text-slate-500 font-medium">Loading blog...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-gray-50 to-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
       
        <div className="mb-6">
          <Link
            to={`/blogs/${blogId}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition"
          >
            <ArrowLeft size={16} />
            Back to article
          </Link>
        </div>

       
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10 md:p-12">
        
          <div className="text-center max-w-lg mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/70 mb-3 shadow-2xs">
              <Sparkles size={14} className="text-blue-600" />
              <span>Story Editor</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Edit Story
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              Update your story details, content, or cover photo.
            </p>
          </div>

          <form onSubmit={handleUpdate} noValidate className="space-y-6">
          
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-slate-800">
                  Title <span className="text-rose-500">*</span>
                </label>
                {fieldErrors.title && (
                  <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle size={13} />
                    Title likhna zaroori hai
                  </span>
                )}
              </div>
              <input
                name="title"
                value={blog.title}
                onChange={(e) => {
                  handleChange(e);
                  if (fieldErrors.title) {
                    setFieldErrors((prev) => ({ ...prev, title: false }));
                  }
                }}
                className={`w-full border rounded-2xl px-4 py-3.5 text-slate-800 text-base font-medium placeholder-slate-400 outline-none transition ${
                  fieldErrors.title
                    ? "border-rose-400 bg-rose-50/40 ring-2 ring-rose-200"
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                }`}
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
                    Description likhna zaroori hai
                  </span>
                )}
              </div>
              <textarea
                name="description"
                value={blog.description}
                onChange={(e) => {
                  handleChange(e);
                  if (fieldErrors.description) {
                    setFieldErrors((prev) => ({ ...prev, description: false }));
                  }
                }}
                rows="8"
                className={`w-full border rounded-2xl px-4 py-3.5 text-slate-800 text-base leading-relaxed placeholder-slate-400 outline-none resize-none transition ${
                  fieldErrors.description
                    ? "border-rose-400 bg-rose-50/40 ring-2 ring-rose-200"
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
            </div>

           
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                Cover Image
              </label>

              
              {newImagePreview || blog.imageurl ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 max-h-72 mb-4 group">
                  <img
                    src={newImagePreview || blog.imageurl}
                    alt={blog.title}
                    className="w-full h-72 object-cover"
                  />
                  {newImagePreview && (
                    <button
                      type="button"
                      onClick={() => setNewImage(null)}
                      className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-xs transition cursor-pointer"
                      title="Cancel new image"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ) : null}

              <label
                htmlFor="edit-blog-image"
                className="flex items-center justify-center gap-2 p-4 border border-dashed border-slate-300 hover:border-blue-500 rounded-2xl bg-slate-50/60 hover:bg-blue-50/30 transition-all cursor-pointer text-slate-700 font-semibold text-sm"
              >
                <UploadCloud size={18} className="text-blue-600" />
                <span>{newImage ? "Change selected image" : "Upload replacement image (optional)"}</span>
                <input
                  type="file"
                  id="edit-blog-image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {newImage && (
                <p className="text-xs text-blue-600 font-medium mt-1.5 px-1">
                  New file selected: {newImage.name}
                </p>
              )}
            </div>

           
            <div className="pt-4 flex items-center justify-end gap-3">
              <Link
                to={`/blogs/${blogId}`}
                className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-sm transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isUpdating}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
              >
                <Save size={16} />
                <span>{isUpdating ? "Updating..." : "Save Changes"}</span>
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
              Changes save karne se pehle kripya neeche diye gaye fields ko complete karein:
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
              Theek Hai, Main Bharta Hu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Editblog;
