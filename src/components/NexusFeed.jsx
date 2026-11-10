import { useState, useEffect } from "react";
import { MessageSquare, Heart, Share2, Sparkles, User, Plus, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase, unwrap } from "../supabase";
import "./Generator.css";

const NexusFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const { currentUser } = useAuth();

  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        const rows = unwrap(await supabase.from("community_posts").select()
          .order("created_at", { ascending: false }).limit(20));
        if (active) setPosts(rows);
      } catch {
        if (active) setError("Could not load community posts.");
      } finally {
        if (active) setLoading(false);
      }
    }
    refresh();
    const channel = supabase.channel("community-posts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "community_posts" }, refresh)
      .subscribe(status => { if (status === "SUBSCRIBED") refresh(); });
    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const handlePost = async () => {
    if (!currentUser || !newPost.trim()) return;
    setPosting(true);
    setError("");
    try {
      const post = unwrap(await supabase.from("community_posts").insert({
        content: newPost.trim(),
        user_name: currentUser.displayName || "Athlete",
        user_photo: currentUser.photoURL || ""
      }).select().single());
      setPosts(previous => [post, ...previous.filter(item => item.id !== post.id)].slice(0, 20));
      setNewPost("");
    } catch (err) {
      console.error("Error posting to Nexus:", err);
      setError("Could not publish your post. Try again.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="generator-container">
      <div className="generator-header">
        <Sparkles color="#00d9ff" size={32} className="generator-icon" />
        <div>
          <h2>Community Feed</h2>
          <p className="generator-subtitle">Share wins, PRs, and progress with the community.</p>
        </div>
      </div>
      {error && <p role="alert">{error}</p>}

      <div className="bg-[#0A0907] border border-white/5 rounded-[2.5rem] p-6 mb-8 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
           <MessageSquare size={100} className="text-primary" />
        </div>
        <div className="flex gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
             {currentUser?.photoURL ? (
               <img src={currentUser.photoURL} alt="User" className="w-full h-full rounded-2xl object-cover" />
             ) : (
               <User className="w-6 h-6 text-primary" />
             )}
          </div>
          <div className="flex-1 space-y-4">
            <textarea
              placeholder="Post a win, a PR, or a strategy shift..."
              value={newPost}
	              maxLength={2000}
              onChange={(e) => setNewPost(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-4 min-h-[100px] focus:outline-none focus:border-primary/20 transition-all text-sm font-medium text-white placeholder:text-muted-foreground/30 resize-none"
            />
            <div className="flex justify-end">
              <button 
                onClick={handlePost}
                disabled={posting || !newPost.trim()}
                className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-30"
              >
                {posting ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                Post Update
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-[#0A0907] border border-white/5 rounded-[2rem] p-6 hover:border-white/10 transition-all shadow-lg group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20 overflow-hidden">
                    {post.user_photo ? <img src={post.user_photo} alt="" /> : <User size={20} className="text-primary" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm tracking-tight">{post.user_name}</h4>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="bg-primary/5 px-3 py-1 rounded-full border border-primary/10 text-[9px] font-black text-primary uppercase tracking-widest">
                  Update
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-6 border-l-2 border-primary/20 pl-4">
                "{post.content}"
              </p>
              <div className="flex gap-6 pt-4 border-t border-white/5">
                <button className="flex items-center gap-2 text-[10px] font-black text-muted-foreground hover:text-red-400 transition-colors uppercase tracking-widest">
                  <Heart size={14} />
                  {post.likes || 0}
                </button>
                <button className="flex items-center gap-2 text-[10px] font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">
                  <Share2 size={14} />
                  Share
                </button>
              </div>
            </div>
          ))}

          {posts.length === 0 && (
            <div className="p-20 text-center bg-white/[0.01] rounded-[3rem] border border-dashed border-white/10">
               <Sparkles size={40} className="text-primary/20 mx-auto mb-4" />
               <p className="text-muted-foreground font-medium">No posts yet. Be the first to share something.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NexusFeed;
