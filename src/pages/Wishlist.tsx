import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { MovieCard } from "@/components/MovieCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Movie } from "@/lib/tmdb";
import { Heart } from "lucide-react";
import gsap from "gsap";

const Wishlist = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchWishlist();
  }, [user, navigate]);

  useEffect(() => {
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
  }, []);

  const fetchWishlist = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("wishlist")
      .select("*")
      .eq("user_id", user.id)
      .order("added_at", { ascending: false });

    if (!error && data) {
      const movieData: Movie[] = data.map((item) => ({
        id: item.movie_id,
        title: item.movie_title,
        overview: item.movie_overview || "",
        poster_path: item.movie_poster,
        backdrop_path: null,
        vote_average: item.movie_rating || 0,
        release_date: "",
      }));
      setMovies(movieData);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div ref={titleRef} className="mb-12 text-center">
          <div className="flex justify-center mb-4">
            <Heart className="w-12 h-12 text-primary fill-primary cinema-glow" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Your <span className="text-gradient-cinema">Wishlist</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Movies you want to watch
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-xl text-primary">Loading your wishlist...</div>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground mb-4">Your wishlist is empty</p>
            <p className="text-muted-foreground">Start adding movies you want to watch!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {movies.map((movie, index) => (
              <MovieCard key={movie.id} movie={movie} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
