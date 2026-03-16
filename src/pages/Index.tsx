import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { SearchBar } from "@/components/SearchBar";
import { MovieCard } from "@/components/MovieCard";
import { Button } from "@/components/ui/button";
import { Movie, tmdb } from "@/lib/tmdb";
import { Sparkles, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import gsap from "gsap";

const Index = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<Movie[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const { user } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const aiSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTrendingMovies();
  }, []);

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      );
    }
  }, []);

  const fetchTrendingMovies = async () => {
    setLoading(true);
    const data = await tmdb.getTrendingMovies();
    setMovies(data);
    setSearchMode(false);
    setLoading(false);
  };

  const handleSearch = async (query: string) => {
    setLoading(true);
    const data = await tmdb.searchMovies(query);
    setMovies(data);
    setSearchMode(true);
    setLoading(false);
  };

  const getAiRecommendations = async () => {
    if (!user) {
      toast.error("Please login to get AI recommendations");
      return;
    }

    setLoadingAi(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-ai-recommendations", {
        body: { movieCount: 5 },
      });

      if (error) throw error;

      if (data?.movieIds) {
        const moviePromises = data.movieIds.map((id: number) => tmdb.getMovieDetails(id));
        const movieDetails = await Promise.all(moviePromises);
        const validMovies = movieDetails.filter((m): m is Movie => m !== null);
        setAiRecommendations(validMovies);

        if (aiSectionRef.current) {
          gsap.fromTo(
            aiSectionRef.current.children,
            { opacity: 0, y: 50 },
            { 
              opacity: 1, 
              y: 0, 
              duration: 0.6,
              stagger: 0.1,
              ease: "power2.out"
            }
          );
        }

        toast.success("AI recommendations generated!");
      }
    } catch (error) {
      console.error("Error getting AI recommendations:", error);
      toast.error("Failed to get AI recommendations");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-16">
        {/* Hero Section */}
        <div ref={heroRef} className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 cinema-gradient opacity-30" />
          <div className="container mx-auto relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 cinema-glow">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">Powered by AI</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Discover Movies with{" "}
                <span className="text-gradient-cinema">AI Intelligence</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
                Get personalized movie recommendations powered by advanced AI technology
              </p>

              <div className="mb-8">
                <SearchBar onSearch={handleSearch} />
              </div>

              {user && (
                <Button
                  size="lg"
                  onClick={getAiRecommendations}
                  disabled={loadingAi}
                  className="gap-2 cinema-glow text-lg px-8 py-6"
                >
                  <Sparkles className="w-5 h-5" />
                  {loadingAi ? "Generating..." : "Get AI Recommendations"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* AI Recommendations Section */}
        {aiRecommendations.length > 0 && (
          <div className="container mx-auto px-4 py-12">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-primary" />
                AI Recommendations for You
              </h2>
              <p className="text-muted-foreground">Personalized picks based on AI analysis</p>
            </div>
            <div ref={aiSectionRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-12">
              {aiRecommendations.map((movie, index) => (
                <MovieCard key={movie.id} movie={movie} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Trending/Search Results */}
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                {searchMode ? (
                  "Search Results"
                ) : (
                  <>
                    <TrendingUp className="w-8 h-8 text-primary" />
                    Trending Now
                  </>
                )}
              </h2>
              <p className="text-muted-foreground">
                {searchMode ? `Found ${movies.length} movies` : "Popular movies this week"}
              </p>
            </div>
            {searchMode && (
              <Button variant="outline" onClick={fetchTrendingMovies}>
                Back to Trending
              </Button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-pulse text-xl text-primary">Loading movies...</div>
            </div>
          ) : movies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">No movies found</p>
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
    </div>
  );
};

export default Index;
