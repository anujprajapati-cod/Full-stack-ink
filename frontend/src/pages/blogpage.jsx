import axios from 'axios';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api';
import {
  Bookmark,
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  Clock,
  ArrowLeft,
  Edit3,
  Trash2,
  AlertTriangle,
  AlertCircle,
  Send,
  User,
  X,
} from "lucide-react";

function Blogpage() {
    const { blogId } = useParams();
    const [blogs, setblogdata] = useState({});
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [commentError, setCommentError] = useState('');
    const [isCommentsLoading, setIsCommentsLoading] = useState(true);
    const [isCommenting, setIsCommenting] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingBlog, setIsLoadingBlog] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const [savedBlogIds, setSavedBlogIds] = useState(() =>
        (user?.savedBlogs || []).map((savedBlog) => String(savedBlog?._id || savedBlog))
    );

    async function fetchblogsbyid() {
        try {
            setIsLoadingBlog(true);
            let res = await axios.get(
                `${API_BASE_URL}/blogs/${blogId}`,
                user?.token ? { headers: { Authorization: `Bearer ${user.token}` } } : undefined
            );

            setblogdata(res.data.blog);
            fetchComments(res.data.blog._id);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to load blog');
        } finally {
            setIsLoadingBlog(false);
        }
    }

    async function fetchComments(id) {
        try {
            setIsCommentsLoading(true);
            const response = await axios.get(
                `${API_BASE_URL}/blogs/${id}/comments`,
                user?.token ? { headers: { Authorization: `Bearer ${user.token}` } } : undefined
            );
            setComments(response.data.comments || []);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to load comments');
        } finally {
            setIsCommentsLoading(false);
        }
    }

    useEffect(() => {
        fetchblogsbyid();
    }, [blogId]);

    async function handleLike() {
        if (!user?.token) {
            toast.error('Signin before liking');
            navigate('/signin');
            return;
        }

        try {
            setIsLiking(true);
            const response = await axios.patch(
                `${API_BASE_URL}/blogs/like/${blogs._id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                }
            );
            setblogdata(response.data.blog);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to update like');
        } finally {
            setIsLiking(false);
        }
    }

    async function handleDeleteBlog() {
        if (!user?.token) {
            toast.error('Signin before deletion');
            navigate('/signin');
            return;
        }

        try {
            setIsDeleting(true);
            const idToDelete = blogs._id || blogId;
            await axios.delete(
                `${API_BASE_URL}/blogs/${idToDelete}`,
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                }
            );
            toast.success('Blog deleted succesfully!');
            setShowDeleteModal(false);
            navigate('/');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Unable to delete blog');
        } finally {
            setIsDeleting(false);
        }
    }

    async function handleCommentSubmit(event) {
        event.preventDefault();

        if (!user?.token) {
            toast.error('Signin before commenting');
            navigate('/signin');
            return;
        }

        if (!commentText.trim()) {
            setCommentError('Enter Your comment');
            toast.error('Write your comment');
            return;
        }

        setCommentError('');

        try {
            setIsCommenting(true);
            const response = await axios.post(
                `${API_BASE_URL}/blogs/${blogs._id}`,
                { content: commentText.trim() },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                }
            );

            setComments((currentComments) => [...currentComments, response.data.comment]);
            setCommentText('');
            toast.success('Comment added successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'unable to add comment');
        } finally {
            setIsCommenting(false);
        }
    }

    async function handleSaveBlog() {
        if (!user?.token) {
            toast.error('Signin before saving this blog');
            navigate('/signin');
            return;
        }

        try {
            setIsSaving(true);
            const response = await axios.patch(
                `${API_BASE_URL}/blogs/save/${blogs._id}`,
                {},
                { headers: { Authorization: `Bearer ${user.token}` } }
            );

            const updatedSavedBlogs = response.data.savedBlogs;
            setSavedBlogIds(updatedSavedBlogs.map((savedBlog) => String(savedBlog?._id || savedBlog)));
            localStorage.setItem(
                'user',
                JSON.stringify({ ...user, savedBlogs: updatedSavedBlogs })
            );
            toast.success(response.data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to save blog');
        } finally {
            setIsSaving(false);
        }
    }

    function handleShare() {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Blog link copy ho gaya!");
        } else {
            toast("Link: " + window.location.href);
        }
    }

    const isLiked = blogs.likes?.some((like) => String(like) === user?._id);
    const isSaved = savedBlogIds.includes(String(blogs._id));
    const blogCreatorId = String(blogs.creator?._id || blogs.creator || '');
    const currentUserId = String(user?._id || user?.id || '');
    const isBlogOwner = Boolean(user?.token && currentUserId && blogCreatorId && blogCreatorId === currentUserId);

    const authorName = blogs.creator?.name || "Unknown Author";
    const authorInitials = authorName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const formattedDate = blogs.createdAt
        ? new Date(blogs.createdAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        })
        : "";

    const readingTime = blogs.description
        ? `${Math.max(1, Math.ceil(blogs.description.trim().split(/\s+/).length / 180))} min read`
        : "1 min read";

    if (isLoadingBlog) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
                <div className="w-full max-w-4xl bg-white rounded-3xl p-8 md:p-12 shadow-sm animate-pulse space-y-6">
                    <div className="h-6 bg-gray-200 rounded w-28" />
                    <div className="h-10 bg-gray-200 rounded-xl w-3/4" />
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full" />
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-32" />
                            <div className="h-3 bg-gray-200 rounded w-20" />
                        </div>
                    </div>
                    <div className="w-full h-80 bg-gray-200 rounded-2xl" />
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-full" />
                        <div className="h-4 bg-gray-200 rounded w-5/6" />
                        <div className="h-4 bg-gray-200 rounded w-4/6" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-slate-50 via-gray-50 to-slate-100 py-10 px-4 sm:px-6">
            <article className="max-w-4xl mx-auto">
               
                <div className="mb-6 flex items-center justify-between">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600 transition"
                    >
                        <ArrowLeft size={16} />
                        Back to all blogs
                    </Link>

                    {isBlogOwner && (
                        <div className="flex items-center gap-2.5">
                            <Link
                                to={`/blogs/${blogId}/edit`}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-2 text-sm font-semibold text-white shadow-xs transition hover:shadow cursor-pointer"
                            >
                                <Edit3 size={15} />
                                Edit Blog
                            </Link>
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(true)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3.5 py-2 text-sm font-semibold shadow-xs transition cursor-pointer"
                            >
                                <Trash2 size={15} />
                                Delete Blog
                            </button>
                        </div>
                    )}
                </div>

                
                <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
                    <div className="p-6 sm:p-10 md:p-12">
                      
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
                            {blogs.title}
                        </h1>

                        
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-gray-100">
                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                                    {authorInitials}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-base">
                                        {authorName}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} /> {formattedDate}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} /> {readingTime}
                                        </span>
                                    </div>
                                </div>
                            </div>

                           
                            <div className="flex items-center gap-2.5">
                                <button
                                    type="button"
                                    onClick={handleLike}
                                    disabled={isLiking}
                                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer border ${
                                        isLiked
                                            ? "bg-rose-50 text-rose-600 border-rose-200"
                                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                                    }`}
                                    aria-label={isLiked ? "Unlike blog" : "Like blog"}
                                >
                                    <Heart
                                        size={15}
                                        className={isLiked ? "fill-rose-500 text-rose-500" : ""}
                                    />
                                    <span>{blogs.likes?.length || 0}</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSaveBlog}
                                    disabled={isSaving}
                                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer border ${
                                        isSaved
                                            ? "bg-blue-50 text-blue-600 border-blue-200"
                                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                                    }`}
                                    aria-label={isSaved ? "Remove saved blog" : "Save blog"}
                                >
                                    <Bookmark
                                        size={15}
                                        className={isSaved ? "fill-blue-600 text-blue-600" : ""}
                                    />
                                    <span>{isSaved ? "Saved" : "Save"}</span>
                                </button>

                                <button
                                    onClick={handleShare}
                                    className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                                    title="Share blog"
                                >
                                    <Share2 size={16} />
                                </button>
                            </div>
                        </div>

                        
                        {blogs.imageurl && (
                            <div className="w-full max-h-115 overflow-hidden rounded-2xl mb-8 shadow-xs border border-gray-100 bg-slate-100">
                                <img
                                    src={blogs.imageurl}
                                    alt={blogs.title}
                                    className="w-full h-full object-cover max-h-115"
                                />
                            </div>
                        )}

                        
                        <div className="text-gray-800 text-lg leading-relaxed whitespace-pre-line tracking-normal">
                            {blogs.description}
                        </div>

                        
                        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleLike}
                                    disabled={isLiking}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                                        isLiked
                                            ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    <Heart
                                        size={18}
                                        className={isLiked ? "fill-rose-500 text-rose-500" : ""}
                                    />
                                    <span>{isLiked ? "Liked" : "Like"} ({blogs.likes?.length || 0})</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSaveBlog}
                                    disabled={isSaving}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                                        isSaved
                                            ? "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    <Bookmark
                                        size={18}
                                        className={isSaved ? "fill-blue-600 text-blue-600" : ""}
                                    />
                                    <span>{isSaved ? "Saved" : "Save Blog"}</span>
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                {isBlogOwner && (
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteModal(true)}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition cursor-pointer"
                                    >
                                        <Trash2 size={16} />
                                        Delete Blog
                                    </button>
                                )}

                                <button
                                    onClick={handleShare}
                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 transition cursor-pointer"
                                >
                                    <Share2 size={16} />
                                    Share
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                
                <section className="mt-10 bg-white rounded-3xl border border-gray-200/80 shadow-sm p-6 sm:p-10">
                    <h2 className="mb-6 text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <MessageCircle size={22} className="text-blue-600" />
                        Comments
                        <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-3 py-1 rounded-full border border-gray-200">
                            {comments.length}
                        </span>
                    </h2>

                    
                    {user?.token ? (
                        <form onSubmit={handleCommentSubmit} className="mb-8">
                            {commentError && (
                                <div className="mb-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-in fade-in duration-150">
                                    <AlertCircle size={17} className="shrink-0 text-rose-500" />
                                    <span>{commentError}</span>
                                </div>
                            )}

                            <div className="border border-gray-300 rounded-2xl p-4 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all bg-gray-50/50">
                                <textarea
                                    id="comment"
                                    value={commentText}
                                    onChange={(event) => {
                                        setCommentText(event.target.value);
                                        if (commentError) setCommentError('');
                                    }}
                                    placeholder="Enter your comment here"
                                    rows="3"
                                    maxLength="1000"
                                    className="w-full bg-transparent resize-none outline-none text-gray-800 placeholder-gray-400 text-base"
                                />
                                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                    <span className="text-xs text-gray-500">
                                        Posting as <span className="font-semibold text-gray-700">{user.name || "User"}</span>
                                    </span>
                                    <button
                                        type="submit"
                                        disabled={isCommenting}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-xs"
                                    >
                                        <Send size={14} />
                                        {isCommenting ? 'Posting...' : 'Post Comment'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-6 mb-8 text-center">
                            <p className="text-gray-700 font-medium mb-3">
                                Comment karne ke liye pehle sign in karein.
                            </p>
                            <Link
                                to="/signin"
                                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
                            >
                                Sign In
                            </Link>
                        </div>
                    )}

                    
                    {isCommentsLoading ? (
                        <p className="text-gray-500 text-sm text-center py-6">Comments load ho rahe hain...</p>
                    ) : comments.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <MessageCircle size={36} className="mx-auto mb-2 text-gray-300" />
                            <p className="font-medium text-gray-600">No comments</p>
                            <p className="text-xs text-gray-400 mt-1">Enter your first comment</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {comments.map((comment) => {
                                const cAuthor = comment.author?.name || "Anonymous";
                                const cInitials = cAuthor
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2);

                                return (
                                    <article
                                        key={comment._id}
                                        className="flex gap-3.5 p-4 rounded-2xl bg-gray-50/80 border border-gray-100"
                                    >
                                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                                            {cInitials}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <p className="font-bold text-gray-800 text-sm">
                                                    {cAuthor}
                                                </p>
                                                <time className="text-xs text-gray-400">
                                                    {new Date(comment.createdAt).toLocaleDateString()}
                                                </time>
                                            </div>
                                            <p className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                                                {comment.content}
                                            </p>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </article>

            
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 transform transition-all animate-in zoom-in-95 duration-200">
                        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
                            <Trash2 size={28} />
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                            Delete This Blog?
                        </h3>

                        <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
                            Do you want to delete this <span className="font-semibold text-gray-800">"{blogs.title}"</span>  permanently.
                        </p>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteBlog}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 text-white font-semibold text-sm hover:bg-rose-700 shadow-md shadow-rose-600/20 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        <span>Yes, Delete</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Blogpage;
