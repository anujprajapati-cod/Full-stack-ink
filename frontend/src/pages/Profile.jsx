import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Bookmark, Camera, FileText, Mail, Save, LogOut } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../utils/api";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const savedUser = JSON.parse(localStorage.getItem("user") || "null");
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [name, setName] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function handleLogout() {
    localStorage.removeItem("user");
    toast.success("You’ve signed out.");
    navigate("/signin");
  }

  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      setLoadError("");
      try {
        const response = await axios.get(`${API_BASE_URL}/profile`, {
          headers: { Authorization: `Bearer ${savedUser.token}` },
        });
        setProfile(response.data.user);
        setName(response.data.user.name);
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 404) {
          localStorage.removeItem("user");
          toast.error("Your account was not found. Please sign in again.");
          navigate("/signin", { replace: true });
        } else {
          const message = error.response?.data?.message || "We couldn’t load your profile. Please try again.";
          setLoadError(message);
          toast.error(message);
        }
      } finally {
        setIsLoading(false);
      }
    }
    if (savedUser?.token) fetchProfile();
  }, [savedUser?.token, navigate]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview("");
      return undefined;
    }
    const previewUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [avatarFile]);

        async function handleSubmit(event) {
          event.preventDefault();
          try {
            setIsSaving(true);
            const formData = new FormData();
            formData.append("name", name);
            if (avatarFile) formData.append("avatar", avatarFile);
            const response = await axios.patch(`${API_BASE_URL}/profile`, formData, {
              headers: { Authorization: `Bearer ${savedUser.token}` },
            });
            setProfile((currentProfile) => ({ ...currentProfile, ...response.data.user }));
            setAvatarFile(null);
            localStorage.setItem("user", JSON.stringify({ ...savedUser, ...response.data.user, token: savedUser.token }));
            toast.success("Your profile has been updated.");
          } catch (error) {
            toast.error(error.response?.data?.message || "We couldn’t save your changes. Please try again.");
          } finally {
            setIsSaving(false);
          }
        }

  if (!savedUser?.token) return <Navigate to="/signin" />;
  if (isLoading) return <p className="profile-loading">Loading your profile…</p>;
  if (!profile) {
    return (
      <div className="profile-loading">
        <p>{loadError || "Could not load your profile."}</p>
        <button type="button" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    );
  }

  const avatar = avatarPreview || profile.avatar || "";
  const initial = profile.name?.charAt(0).toUpperCase();
  const publishedBlogs = profile.blogs?.filter((blog) => !blog.draft) || [];

  return (
    <main className="profile-page">
      <div className="profile-shell">
        <section className="profile-card">
          <div className="profile-cover" />
          <div className="profile-content">
            <div className="profile-summary">
              <div className="profile-avatar-wrap">
                <div className="profile-avatar">
                  {avatar ? <img src={avatar} alt={profile.name} /> : initial}
                </div>
                <label htmlFor="avatar" className="profile-camera" title="Change display picture">
                  <Camera size={18} />
                </label>
              </div>

              <div className="profile-identity">
                <span>YOUR PROFILE</span>
                <h1>{profile.name}</h1>
                <p><Mail size={16} /> {profile.email}</p>
              </div>

              <div className="profile-stat">
                <FileText size={22} />
                <div><strong>{publishedBlogs.length}</strong><small>Stories published</small></div>
              </div>

              <Link to="/saved" className="profile-stat" style={{ textDecoration: 'none', color: 'inherit' }} title="View saved blogs">
                <Bookmark size={22} />
                <div><strong>{(profile.savedBlogs || []).filter(Boolean).length}</strong><small>Stories saved</small></div>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="profile-logout-btn"
                title="Sign out of your account"
              >
                <LogOut size={18} />
                <span>Sign out</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="profile-input-group">
                <label htmlFor="profile-name">Your name</label>
                <input
                  id="profile-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="How should we address you?"
                  required
                />
                <p>{avatarFile ? `New photo selected: ${avatarFile.name}` : "Choose the camera icon to add or change your photo."}</p>
              </div>
              <div className="profile-form-actions">
                <button type="submit" disabled={isSaving} className="profile-save">
                  <Save size={18} /> {isSaving ? "Saving…" : "Save changes"}
                </button>
                <button type="button" onClick={handleLogout} className="profile-logout-btn-secondary">
                  <LogOut size={18} /> Sign out
                </button>
              </div>
              <input id="avatar" type="file" accept="image/*" onChange={(event) => setAvatarFile(event.target.files?.[0] || null)} hidden />
            </form>
          </div>
        </section>

        <section className="profile-blogs">
          <div className="profile-section-title">
            <div><span>FROM YOUR DESK</span><h2>Your stories</h2></div>
            <Link to="/blogs">Write a story <b>→</b></Link>
          </div>

          {publishedBlogs.length === 0 ? (
            <div className="profile-empty"><FileText size={34} /><h3>Your first story is waiting</h3><p>Got an idea to share? Start writing and it’ll show up here.</p><Link to="/blogs">Write your first story</Link></div>
          ) : (
            <div className="profile-blog-grid">
              {publishedBlogs.map((blog) => (
                <Link key={blog._id} to={`/blogs/${blog.blogId}`} className="profile-blog-card">
                  {blog.imageurl ? <img src={blog.imageurl} alt={blog.title} /> : <div className="profile-blog-placeholder"><FileText size={30} /></div>}
                  <div><h3>{blog.title}</h3><p>{blog.description}</p><span>Read story →</span></div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Profile;
