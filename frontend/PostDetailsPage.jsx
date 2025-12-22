import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";

export default function PostDetailsPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [lang, setLang] = useState("hu");
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [votes, setVotes] = useState({ up: 0, down: 0, my: 0 });
  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState("");
  const [replyDrafts, setReplyDrafts] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [token] = useState(localStorage.getItem('token'));
  const [isFollowingGroup, setIsFollowingGroup] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  
  // ADD THIS: Popup state
  const [popup, setPopup] = useState({ show: false, type: "success", message: "" });
  
  // ADD THIS: Function to show popup
  const showPopup = (type, message) => {
    setPopup({ show: true, type, message });
    setTimeout(() => {
      setPopup({ show: false, type, message: "" });
    }, 3000);
  };
  
  // ADD THESE STATES FOR REPORTING
  const [reportLoading, setReportLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState(''); // 'post', 'comment', 'reply'
  const [reportTargetId, setReportTargetId] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reasons] = useState([
    { id: 'spam', label: 'Spam' },
    { id: 'harassment', label: 'Harassment or bullying' },
    { id: 'hate', label: 'Hate speech' },
    { id: 'inappropriate', label: 'Inappropriate content' },
    { id: 'misinformation', label: 'Misinformation' },
    { id: 'other', label: 'Other' }
  ]);

  const t = useMemo(() => {
    const hu = {
      brand: "SzeConnect",
      info: "Információ",
      profile: "Profil",
      logout: "Kijelentkezés",
      comments: "Hozzászólások",
      addComment: "Hozzászólás hozzáadása",
      placeholder: "Írj egy hozzászólást...",
      post: "Küldés",
      like: "Tetszik",
      dislike: "Nem tetszik",
      createPost: "Új bejegyzés",
      newGroup: "Új csoport",
      // ADD THESE TRANSLATIONS
      report: "Jelentés",
      reportPost: "Bejegyzés jelentése",
      reportComment: "Hozzászólás jelentése",
      reportContent: "Tartalom jelentése",
      reportReason: "Jelentés oka",
      cancel: "Mégse",
      submitReport: "Jelentés küldése",
      submitting: "Küldés...",
      selectReason: "Válassz egy okot",
      loginRequiredReport: "Bejelentkezés szükséges a jelentéshez",
      // ADD POPUP TRANSLATIONS
      reportSuccess: "Jelentés sikeresen elküldve!",
      reportError: "Hiba történt a jelentés elküldésekor",
      loginRequiredVote: "Bejelentkezés szükséges a szavazáshoz",
      voteSuccess: "Szavazás sikeres!",
      voteError: "Nem sikerült a szavazás",
      commentSuccess: "Hozzászólás sikeresen elküldve!",
      commentError: "Nem sikerült elküldeni a hozzászólást",
      replySuccess: "Válasz sikeresen elküldve!",
      replyError: "Nem sikerült elküldeni a választ"
    };
    const en = {
      brand: "SzeConnect",
      info: "Information",
      profile: "Profile",
      logout: "Logout",
      comments: "Comments",
      addComment: "Add a comment",
      placeholder: "Write a comment…",
      post: "Post",
      like: "Like",
      dislike: "Dislike",
      createPost: "New Post",
      newGroup: "New Group",
      // ADD THESE TRANSLATIONS
      report: "Report",
      reportPost: "Report Post",
      reportComment: "Report Comment",
      reportContent: "Report Content",
      reportReason: "Report Reason",
      cancel: "Cancel",
      submitReport: "Submit Report",
      submitting: "Submitting...",
      selectReason: "Select a reason",
      loginRequiredReport: "Login required to report",
      // ADD POPUP TRANSLATIONS
      reportSuccess: "Report submitted successfully!",
      reportError: "Error submitting report",
      loginRequiredVote: "Login required to vote",
      voteSuccess: "Vote successful!",
      voteError: "Failed to vote",
      commentSuccess: "Comment posted successfully!",
      commentError: "Failed to post comment",
      replySuccess: "Reply posted successfully!",
      replyError: "Failed to post reply"
    };
    return lang === "hu" ? hu : en;
  }, [lang]);

  // Fetch post and comments from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const postsResponse = await api.listPosts();
        const foundPost = postsResponse.posts.find(p => p.id === parseInt(postId));
        
        if (foundPost) {
          setPost(foundPost);
          
          const likesResponse = await api.getLikes(postId);
          if (likesResponse.success) {
            setVotes(likesResponse.likes);
          }

          if (token) {
            try {
              const followResponse = await api.checkFollowing(foundPost.groupId, token);
              if (followResponse.success) {
                setIsFollowingGroup(followResponse.following);
              }
            } catch (followError) {
              console.error("Failed to check follow status:", followError);
            }
          }
        }

        const commentsResponse = await api.getComments(postId);
        setComments(commentsResponse.comments || []);
        
      } catch (error) {
        console.error("Failed to fetch post data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId, token]);

  // MODIFY THIS: ADD REPORT HANDLER FUNCTION
  const handleReport = async () => {
    if (!token) {
      // CHANGE: Replace alert with popup
      showPopup("error", t.loginRequiredReport);
      return;
    }

    if (!reportReason.trim()) {
      // CHANGE: Replace alert with popup
      showPopup("error", t.selectReason);
      return;
    }

    setReportLoading(true);
    try {
      let response;
      
      if (reportType === 'post') {
        response = await api.reportPost(reportTargetId, reportReason, token);
      } else if (reportType === 'comment' || reportType === 'reply') {
        // Both comments and replies use the same endpoint
        response = await api.reportComment(reportTargetId, reportReason, token);
      }

      if (response.success) {
        // CHANGE: Replace alert with popup
        showPopup("success", response.message);
        
        if (response.banned) {
          console.log(`User has been banned for: ${response.banDuration}`);
        }
        
        // Close modal and reset
        setShowReportModal(false);
        setReportReason('');
        setReportType('');
        setReportTargetId(null);
      }
    } catch (error) {
      console.error("Report error:", error);
      // CHANGE: Replace alert with popup
      showPopup("error", lang === "hu" 
        ? "Hiba történt a jelentés elküldésekor" 
        : "Error submitting report");
    } finally {
      setReportLoading(false);
    }
  };

  // ADD REPORT MODAL COMPONENT
  const ReportModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-[#1F3351] mb-4">
          {t.reportContent}
        </h3>
        
        <p className="text-gray-600 mb-4">
          {t.reportReason}
        </p>
        
        <div className="space-y-2 mb-6">
          {reasons.map((reason) => (
            <label 
              key={reason.id}
              className="flex items-center p-3 rounded-lg border-2 border-gray-200 hover:border-[#6C8EBF] cursor-pointer transition-colors"
            >
              <input
                type="radio"
                name="reportReason"
                value={reason.label}
                checked={reportReason === reason.label}
                onChange={(e) => setReportReason(e.target.value)}
                className="mr-3"
              />
              <span className="text-gray-800">{reason.label}</span>
            </label>
          ))}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowReportModal(false);
              setReportReason('');
              setReportType('');
              setReportTargetId(null);
            }}
            className="flex-1 rounded-xl bg-gray-200 text-gray-700 font-semibold px-4 py-3 hover:bg-gray-300 transition"
            disabled={reportLoading}
          >
            {t.cancel}
          </button>
          
          <button
            onClick={handleReport}
            disabled={!reportReason.trim() || reportLoading}
            className="flex-1 rounded-xl bg-[#6C8EBF] text-white font-semibold px-4 py-3 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {reportLoading ? t.submitting : t.submitReport}
          </button>
        </div>
        
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            {lang === "hu" 
              ? "⚠️ Több jelentés után a felhasználó figyelmeztetést kap. 3 figyelmeztetés után 2 órás kitiltás következik."
              : "⚠️ Multiple reports may result in warnings. After 3 warnings, users receive a 2-hour ban."}
          </p>
        </div>
      </div>
    </div>
  );

  // MODIFY THIS: UPDATE THE EXISTING LIKE FUNCTIONS
  const toggleUp = async () => {
    if (!token) {
      // CHANGE: Replace alert with popup
      showPopup("error", t.loginRequiredVote);
      return;
    }

    try {
      const newVoteType = votes.my === 1 ? 0 : 1;
      const response = await api.likePost(postId, newVoteType, token);
      
      if (response.success) {
        setVotes(response.likes);
        // ADD: Show success popup
        showPopup("success", t.voteSuccess);
      }
    } catch (error) {
      console.error("Failed to update like:", error);
      // CHANGE: Replace alert with popup
      showPopup("error", t.voteError);
    }
  };

  // MODIFY THIS
  const toggleDown = async () => {
    if (!token) {
      // CHANGE: Replace alert with popup
      showPopup("error", t.loginRequiredVote);
      return;
    }

    try {
      const newVoteType = votes.my === -1 ? 0 : -1;
      const response = await api.likePost(postId, newVoteType, token);
      
      if (response.success) {
        setVotes(response.likes);
        // ADD: Show success popup
        showPopup("success", t.voteSuccess);
      }
    } catch (error) {
      console.error("Failed to update dislike:", error);
      // CHANGE: Replace alert with popup
      showPopup("error", t.voteError);
    }
  };

  // MODIFY THIS
  const submitComment = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !post || !token) return;

    try {
      const response = await api.addComment(post.id, { comment: draft.trim() }, token);
      
      if (response.success) {
        setComments(prev => [response.comment, ...prev]);
        setDraft("");
        // ADD: Show success popup
        showPopup("success", t.commentSuccess);
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
      // CHANGE: Replace alert with popup
      showPopup("error", t.commentError);
    }
  };

  // MODIFY THIS
  const submitReply = async (commentId) => {
    const text = replyDrafts[commentId]?.trim();
    if (!text || !token) return;

    try {
      const response = await api.addComment(post.id, { 
        comment: text, 
        parentCommentId: commentId 
      }, token);
      
      if (response.success) {
        setComments(prev =>
          prev.map(comment =>
            comment.id === commentId
              ? { ...comment, replies: [...(comment.replies || []), response.comment] }
              : comment
          )
        );

        setReplyDrafts(prev => ({ ...prev, [commentId]: "" }));
        // ADD: Show success popup
        showPopup("success", t.replySuccess);
      }
    } catch (error) {
      console.error("Failed to submit reply:", error);
      // CHANGE: Replace alert with popup
      showPopup("error", t.replyError);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === "hu" ? "hu-HU" : "en-US", {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <Skeleton />;
  if (!post) return <div className="p-6">{lang === "hu" ? "Bejegyzés nem található" : "Post not found"}</div>;

  return (
    <div className="min-h-screen bg-[#FAFBFD] flex flex-col">
      {/* ADD THE POPUP COMPONENT HERE */}
      {popup.show && (
        <div
          className={`
            fixed top-8 left-1/2 -translate-x-1/2 z-[9999]
            px-6 py-4 rounded-xl shadow-lg border
            text-white font-semibold transition-all duration-300
            ${popup.type === "success" 
              ? "bg-[#2A3F5B] border-[#E1860E]" 
              : "bg-red-600 border-red-300"}
          `}
        >
          {popup.message}
        </div>
      )}

      {/* HEADER (keep as is) */}
      <header className="flex items-center justify-between px-4 sm:px-6 md:px-10 py-4 shadow-md bg-[#6C8EBF] text-white sticky top-0 z-50">
        {/* Logo + Brand */}
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 sm:gap-3 focus:outline-none hover:opacity-90 transition"
          title="Go to Home"
        >
          <LogoShare className="w-8 h-8 sm:w-10 sm:h-10" />
          <span className="text-xl sm:text-2xl font-bold whitespace-nowrap">{t.brand}</span>
        </button>

        {/* Desktop buttons */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => setLang(lang === "hu" ? "en" : "hu")}
            className="rounded-lg px-3 py-1.5 bg-[#E1860E] text-white font-semibold text-sm shadow hover:opacity-90"
          >
            {lang === "hu" ? "EN" : "HU"}
          </button>

          <button
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#1F3351] font-bold text-lg shadow hover:bg-[#f9f9f9]"
            title={t.info}
            onClick={() => navigate("/info")}
          >
            i
          </button>

          <button
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#1F3351] font-bold text-base shadow hover:bg-[#f9f9f9]"
            title={t.profile}
            onClick={() => navigate("/profile")}
          >
            👤
          </button>

          <button
            className="rounded-lg px-3 py-1.5 bg-[#2A3F5B] text-white font-semibold text-sm shadow hover:opacity-90"
            onClick={() => navigate("/login")}
          >
            {t.logout}
          </button>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 rounded-md bg-[#E1860E] text-white text-2xl font-bold flex items-center justify-center shadow hover:opacity-90"
            aria-label="Toggle menu"
          >
            {menuOpen ? "×" : "☰"}
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white text-[#1F3351] shadow-lg overflow-hidden border border-[#1F3351]/10">
              <button
                onClick={() => {
                  setLang(lang === "hu" ? "en" : "hu");
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 font-semibold hover:bg-[#EDF5FA]"
              >
                🌐 {lang === "hu" ? "EN" : "HU"}
              </button>

              <button
                onClick={() => {
                  navigate("/info");
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 font-semibold hover:bg-[#EDF5FA]"
              >
                ℹ️ {t.info}
              </button>

              <button
                onClick={() => {
                  navigate("/profile");
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 font-semibold hover:bg-[#EDF5FA]"
              >
                👤 {t.profile}
              </button>

              <button
                onClick={() => {
                  navigate("/login");
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 font-semibold text-[#E1860E] hover:bg-[#EDF5FA]"
              >
                🚪 {t.logout}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-10 py-10">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Post card */}
          <article className="rounded-2xl border border-[#C9D6E2] bg-[#F4F7FB] shadow-sm overflow-hidden p-6 space-y-4">
            {/* Top row (responsive layout) */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              {/* Left side – avatar + author + title */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 flex-1">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-full bg-white border-2 border-[#1F3351]/40 flex items-center justify-center shrink-0 mx-auto sm:mx-0">
                  <UserIcon className="w-8 h-8" />
                </div>

                {/* Author + info */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 text-[#1F3351] font-semibold">
                    <span className="hover:underline">
                      {post.authorName}
                    </span>
                    <span className="text-[#1F3351]/60 text-sm">{formatDate(post.time)}</span>
                    <span className="text-[#1F3351]/70 text-sm font-medium sm:ml-auto">
                      <button
                        onClick={() => navigate(`/groups/${post.groupId}`)}
                        className="hover:underline"
                      >
                        {post.group}
                      </button>
                    </span>
                  </div>

                  <h1 className="mt-2 text-xl sm:text-2xl font-bold text-[#1F3351]">
                    {post.title}
                  </h1>
                </div>
              </div>

              {/* Like / Dislike row */}
              <div className="flex justify-center sm:justify-end items-center gap-3">
                {/* LIKE button */}
                <button
                  onClick={toggleUp}
                  className={`flex items-center gap-1 px-3 py-2 rounded-full border-2 transition
                    ${votes.my === 1
                      ? "bg-[#1F3351] text-white border-[#1F3351]"
                      : "bg-white text-[#1F3351] border-[#1F3351]/50 hover:bg-[#f7faff]"}`}
                  title={t.like}
                >
                  <ThumbUp
                    className="w-5 h-5"
                    stroke={votes.my === 1 ? "#FFFFFF" : "#1F3351"}
                  />
                  <span className="font-semibold text-sm">{votes.up}</span>
                </button>

                {/* DISLIKE button */}
                <button
                  onClick={toggleDown}
                  className={`flex items-center gap-1 px-3 py-2 rounded-full border-2 transition
                    ${votes.my === -1
                      ? "bg-[#1F3351] text-white border-[#1F3351]"
                      : "bg-white text-[#1F3351] border-[#1F3351]/50 hover:bg-[#f7faff]"}`}
                  title={t.dislike}
                >
                  <ThumbDown
                    className="w-5 h-5"
                    stroke={votes.my === -1 ? "#FFFFFF" : "#1F3351"}
                  />
                  <span className="font-semibold text-sm">{votes.down}</span>
                </button>
                
                {/* UPDATE THIS REPORT POST BUTTON */}
                <button
                  onClick={() => {
                    setReportType('post');
                    setReportTargetId(post.id);
                    setShowReportModal(true);
                  }}
                  className="rounded-lg bg-[#6C8EBF] text-white px-4 py-2 text-sm font-semibold shadow hover:opacity-90"
                >
                  {t.reportPost}
                </button>
              </div>
            </div>

            {/* Post content */}
            <div className="border border-[#C9D6E2] rounded-xl bg-white p-4 text-[#1F3351] leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>

            {/* IMAGE DISPLAY SECTION */}
            {post.images && post.images.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-3 justify-center">
                  {post.images.map((imageUrl, index) => (
                    <div 
                      key={index} 
                      className="relative group"
                    >
                      <img 
                        src={imageUrl} 
                        alt={`Post image ${index + 1}`}
                        className="max-w-full h-auto rounded-lg border border-[#C9D6E2] shadow-sm max-h-96 object-contain cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => window.open(imageUrl, '_blank')}
                        onError={(e) => {
                          console.error("Failed to load image:", imageUrl);
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg pointer-events-none"></div>
                    </div>
                  ))}
                </div>
                <p className="text-center text-sm text-[#1F3351]/60 mt-2">
                  {lang === "hu" 
                    ? `Kattints a képre a nagyításért (${post.images.length} kép)` 
                    : `Click on image to enlarge (${post.images.length} images)`
                  }
                </p>
              </div>
            )}
          </article>

          {/* COMMENTS */}
          <section>
            <h2 className="text-xl font-bold text-[#1F3351] mb-4">
              {t.comments}
            </h2>

            {/* Add comment */}
            <form
              onSubmit={submitComment}
              className="mb-6 bg-white border border-[#C9D6E2] rounded-2xl p-4"
            >
              <label className="block text-[#1F3351] font-semibold mb-2">
                {t.addComment}
              </label>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EDF5FA] border border-[#1F3351]/30 flex items-center justify-center shrink-0">
                  <UserIcon className="w-6 h-6" />
                </div>

                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={t.placeholder}
                  rows={3}
                  className="flex-1 rounded-xl border-2 px-4 py-3 text-base outline-none transition focus:ring-4 bg-[#EDF5FA] text-[#1F3351] resize-none placeholder:text-[#1F3351]/70 border-[#1F3351]/30 focus:border-[#E1860E] focus:ring-[#E1860E]/30"
                  disabled={!token}
                />

                <button
                  type="submit"
                  disabled={!draft.trim() || !token}
                  className="shrink-0 rounded-xl bg-[#E1860E] text-white font-semibold px-6 py-2 shadow hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.post}
                </button>
              </div>
              {!token && (
                <p className="text-sm text-[#1F3351]/60 mt-2">
                  {lang === "hu" ? "Bejelentkezés szükséges a hozzászóláshoz" : "Login required to comment"}
                </p>
              )}
            </form>

            {/* Comment list */}
            <ul className="space-y-4">
              {comments.map((comment) => (
                <li key={comment.id}>
                  <article className="rounded-2xl bg-[#F4F7FB] border border-[#C9D6E2] p-4">
                    <header className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white border border-[#1F3351]/30 flex items-center justify-center">
                          <UserIcon className="w-6 h-6" />
                        </div>

                        <div className="min-w-0">
                          <div className="font-semibold text-[#1F3351]">
                            {comment.userName}
                          </div>
                          <div className="text-xs text-[#1F3351]/60">
                            {formatDate(comment.time)}
                          </div>
                        </div>
                      </div>

                      {/* UPDATE THIS COMMENT REPORT BUTTON */}
                      <button
                        onClick={() => {
                          setReportType('comment');
                          setReportTargetId(comment.id);
                          setShowReportModal(true);
                        }}
                        className="rounded-lg bg-[#6C8EBF] text-white px-4 py-2 text-sm font-semibold shadow hover:opacity-90"
                      >
                        {t.report}
                      </button>
                    </header>

                    <p className="text-[#1F3351]/90 whitespace-pre-wrap">
                      {comment.text}
                    </p>

                    {/* Reply */}
                    <div className="mt-3">
                      <button
                        onClick={() =>
                          setReplyDrafts((prev) => ({
                            ...prev,
                            [comment.id]:
                              prev[comment.id] !== undefined ? undefined : "",
                          }))
                        }
                        className="text-sm font-semibold text-[#1F3351] hover:underline"
                        disabled={!token}
                      >
                        {replyDrafts[comment.id] !== undefined
                          ? lang === "hu"
                            ? "Mégse"
                            : "Cancel"
                          : lang === "hu"
                          ? "Válasz"
                          : "Reply"}
                      </button>

                      {replyDrafts[comment.id] !== undefined && (
                        <div className="mt-3 flex items-start gap-2">
                          <textarea
                            value={replyDrafts[comment.id]}
                            onChange={(e) =>
                              setReplyDrafts((prev) => ({
                                ...prev,
                                [comment.id]: e.target.value,
                              }))
                            }
                            placeholder={
                              lang === "hu"
                                ? "Írj egy választ..."
                                : "Write a reply..."
                            }
                            rows={2}
                            className="flex-1 rounded-xl border-2 px-4 py-2 text-sm outline-none transition focus:ring-4 bg-[#EDF5FA] text-[#1F3351] resize-none placeholder:text-[#1F3351]/70 border-[#1F3351]/30 focus:border-[#E1860E] focus:ring-[#E1860E]/30"
                            disabled={!token}
                          />
                          <button
                            type="button"
                            onClick={() => submitReply(comment.id)}
                            disabled={!replyDrafts[comment.id]?.trim() || !token}
                            className="shrink-0 rounded-xl bg-[#E1860E] text-white font-semibold px-4 py-2 shadow hover:opacity-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {lang === "hu" ? "Küldés" : "Send"}
                          </button>
                        </div>
                      )}

                      {comment.replies?.length > 0 && (
                        <ul className="mt-3 space-y-2 pl-6 border-l-2 border-[#C9D6E2]">
                          {comment.replies.map((reply) => (
                            <li
                              key={reply.id}
                              className="bg-white rounded-xl px-3 py-2"
                            >
                              {/* Reply header - UPDATE THE REPORT BUTTON */}
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="text-sm font-semibold text-[#1F3351]">
                                    {reply.userName}
                                  </div>
                                  <div className="text-xs text-[#1F3351]/60">
                                    {formatDate(reply.time)}
                                  </div>
                                </div>

                                {/* UPDATE THIS REPLY REPORT BUTTON */}
                                <button
                                  onClick={() => {
                                    setReportType('reply');
                                    setReportTargetId(reply.id);
                                    setShowReportModal(true);
                                  }}
                                  className="rounded-lg bg-[#6C8EBF] text-white px-4 py-2 text-sm font-semibold shadow hover:opacity-90"
                                >
                                  {t.report}
                                </button>
                              </div>

                              <p className="text-sm text-[#1F3351]/80 mt-2">
                                {reply.text}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      {/* FLOATING CREATE BUTTON */}
      <div className="fixed bottom-8 right-10 flex flex-col items-end space-y-3">
        {showCreateMenu && (
          <>
            <button
              onClick={() => navigate("/groups/new")}
              className="w-44 flex items-center justify-between rounded-full bg-[#E1860E] text-white px-6 py-2 text-sm font-semibold shadow-lg hover:opacity-95 transition-transform"
            >
              <span>{t.newGroup}</span>
            </button>

            <button
              onClick={() => navigate("/post/new")}
              className="w-44 flex items-center justify-between rounded-full bg-[#E1860E] text-white px-6 py-2 text-sm font-semibold shadow-lg hover:opacity-95 transition-transform"
            >
              <span>{t.createPost}</span>
            </button>
          </>
        )}

        <button
          onClick={() => setShowCreateMenu((prev) => !prev)}
          className="w-14 h-14 rounded-full bg-[#E1860E] text-white shadow-lg hover:opacity-95 transition-transform flex items-center justify-center"
          aria-label="Create"
        >
          {showCreateMenu ? (
            // X icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-7 h-7"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            >
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          ) : (
            // + icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-8 h-8"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          )}
        </button>
      </div>

      {/* ADD THE REPORT MODAL */}
      {showReportModal && <ReportModal />}
    </div>
  );
}

/* --------------- Icons (keep as is) --------------- */

function LogoShare({ className = "" }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      role="img"
      aria-label="SzeConnect logo"
    >
      <circle
        cx="200"
        cy="200"
        r="185"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="30"
      />
      <line
        x1="120"
        y1="206"
        x2="248"
        y2="125"
        stroke="#FFFFFF"
        strokeWidth="26"
        strokeLinecap="round"
      />
      <line
        x1="120"
        y1="206"
        x2="248"
        y2="279"
        stroke="#FFFFFF"
        strokeWidth="26"
        strokeLinecap="round"
      />
      <circle cx="120" cy="206" r="41" fill="#E1860E" stroke="#FFFFFF" strokeWidth="6" />
      <circle cx="248" cy="125" r="41" fill="#E1860E" stroke="#FFFFFF" strokeWidth="6" />
      <circle cx="248" cy="279" r="41" fill="#2A3F5B" stroke="#FFFFFF" strokeWidth="6" />
    </svg>
  );
}

function UserIcon({ className = "", stroke = "#1F3351" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke={stroke}
      strokeWidth="2"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

function ThumbUp({ className = "", stroke = "#1F3351" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke={stroke}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 21h4V9H2v12zM22 9c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32a1 1 0 0 0-.29-.7L13 1 6.59 7.41C6.22 7.78 6 8.3 6 8.83V19c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22L22 11.34V9z" />
    </svg>
  );
}

function ThumbDown({ className = "", stroke = "#1F3351" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke={stroke}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 3h-4v12h4V3zM2 15c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32a1 1 0 0 0 .29.7L11 23l6.41-6.41c.37-.37.59-.89.59-1.42V5c0-1.1-.9-2-2-2H7C6.17 3 5.46 3.5 5.16 4.22L2 12.66V15z" />
    </svg>
  );
}

/* ---------------- Skeleton (keep as is) ---------------- */

function Skeleton() {
  return (
    <div className="min-h-screen bg-[#FAFBFD] animate-pulse">
      <div className="h-16 bg-[#6C8EBF]" />
      <div className="max-w-5xl mx-auto px-10 py-8 space-y-4">
        <div className="h-8 bg-[#E0E6F0] rounded w-32" />
        <div className="h-40 bg-[#E0E6F0] rounded" />
        <div className="h-5 bg-[#F3D9AE] rounded w-40" />
        <div className="h-24 bg-[#E0E6F0] rounded" />
      </div>
    </div>
  );
}
