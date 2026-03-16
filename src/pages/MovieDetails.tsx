import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ArrowLeft, Star, Clock } from "lucide-react";
import { Movie, tmdb } from "@/lib/tmdb";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import gsap from "gsap";

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [inWishlist, setInWishlist] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      fetchMovie();
      if (user) {
        checkWishlist();
      }
    }
  }, [id, user]);

  useEffect(() => {
    if (movie && heroRef.current && contentRef.current) {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: "power2.out" }
      );
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: "power2.out" }
      );
    }
  }, [movie]);

  const fetchMovie = async () => {
    setLoading(true);
    const data = await tmdb.getMovieDetails(Number(id));
    setMovie(data);
    setLoading(false);
  };

  const checkWishlist = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("wishlist")
      .select("id")
      .eq("user_id", user.id)
      .eq("movie_id", Number(id))
      .maybeSingle();

    if (!error && data) {
      setInWishlist(true);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      toast.error("Please login to add to wishlist");
      navigate("/auth");
      return;
    }

    setAddingToWishlist(true);

    if (inWishlist) {
      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", user.id)
        .eq("movie_id", Number(id));

      if (error) {
        toast.error("Failed to remove from wishlist");
      } else {
        setInWishlist(false);
        toast.success("Removed from wishlist");
      }
    } else {
      const { error } = await supabase.from("wishlist").insert({
        user_id: user.id,
        movie_id: movie!.id,
        movie_title: movie!.title,
        movie_poster: movie!.poster_path,
        movie_overview: movie!.overview,
        movie_rating: movie!.vote_average,
      });

      if (error) {
        toast.error("Failed to add to wishlist");
      } else {
        setInWishlist(true);
        toast.success("Added to wishlist");
      }
    }

    setAddingToWishlist(false);
  };

  if (loading || !movie) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex items-center justify-center h-screen">
          <div className="animate-pulse text-2xl text-primary">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <div
          ref={heroRef}
          className="relative h-[60vh] overflow-hidden"
          style={{
            backgroundImage: `url(${tmdb.getImageUrl(movie.backdrop_path, "original")})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/30 to-transparent" />
        </div>

        <div ref={contentRef} className="container mx-auto px-4 -mt-32 relative z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="grid md:grid-cols-[300px,1fr] gap-8">
            <img
              src={tmdb.getImageUrl(movie.poster_path)}
              alt={movie.title}
              className="rounded-lg shadow-2xl cinema-glow w-full"
            />

            <div className="space-y-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{movie.title}</h1>
                <div className="flex flex-wrap gap-4 items-center">
                  <Badge variant="secondary" className="flex items-center gap-1 text-base px-3 py-1">
                    <Star className="w-4 h-4 fill-cinema-gold text-cinema-gold" />
                    <span>{movie.vote_average?.toFixed(1)}</span>
                  </Badge>
                  {movie.runtime && (
                    <Badge variant="outline" className="flex items-center gap-1 text-base px-3 py-1">
                      <Clock className="w-4 h-4" />
                      <span>{movie.runtime} min</span>
                    </Badge>
                  )}
                  <span className="text-muted-foreground">
                    {movie.release_date?.split("-")[0]}
                  </span>
                </div>
              </div>

              {movie.genres && (
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <Badge key={genre.id} variant="secondary">
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              )}

              <Button
                size="lg"
                onClick={toggleWishlist}
                disabled={addingToWishlist}
                className="gap-2"
              >
                <Heart className={`w-5 h-5 ${inWishlist ? "fill-current" : ""}`} />
                {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
              </Button>

              <div>
                <h2 className="text-2xl font-bold mb-3">Overview</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">{movie.overview}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
