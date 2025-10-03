import React, { useState, useEffect } from 'react';
import { Search, Plus, Check, X, Star, Film, Eye, Clock, Trash2 } from 'lucide-react';

export default function MovieWatchlistApp() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('search');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  // Load watchlist from memory on component mount
  useEffect(() => {
    const saved = window.watchlistData || [];
    setWatchlist(saved);
  }, []);

  // Save watchlist to memory whenever it changes
  useEffect(() => {
    window.watchlistData = watchlist;
  }, [watchlist]);

  const searchMovies = async (e) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?s=${encodeURIComponent(searchTerm)}&apikey=649f085c`
      );
      const data = await response.json();
      
      if (data.Response === 'True') {
        setSearchResults(data.Search);
        setActiveTab('search');
      } else {
        setError(data.Error || 'No movies found');
        setSearchResults([]);
      }
    } catch (err) {
      setError('Failed to fetch movies. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = (movie) => {
    if (!watchlist.find(m => m.imdbID === movie.imdbID)) {
      setWatchlist([...watchlist, { 
        ...movie, 
        watched: false, 
        addedAt: new Date().toISOString(),
        rating: 0,
        review: ''
      }]);
    }
  };

  const removeFromWatchlist = (imdbID) => {
    setWatchlist(watchlist.filter(m => m.imdbID !== imdbID));
  };

  const toggleWatched = (imdbID) => {
    setWatchlist(watchlist.map(m => 
      m.imdbID === imdbID ? { ...m, watched: !m.watched } : m
    ));
  };

  const openReviewModal = (movie) => {
    setSelectedMovie(movie);
    setRating(movie.rating || 0);
    setReview(movie.review || '');
    setShowReviewModal(true);
  };

  const saveReview = () => {
    setWatchlist(watchlist.map(m => 
      m.imdbID === selectedMovie.imdbID 
        ? { ...m, rating, review, watched: true }
        : m
    ));
    setShowReviewModal(false);
    setSelectedMovie(null);
    setRating(0);
    setReview('');
  };

  const isInWatchlist = (imdbID) => {
    return watchlist.some(m => m.imdbID === imdbID);
  };

  const unwatchedCount = watchlist.filter(m => !m.watched).length;
  const watchedCount = watchlist.filter(m => m.watched).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Film className="w-12 h-12 text-yellow-400" />
            <h1 className="text-5xl font-bold text-white">Movie Watchlist</h1>
          </div>
          <p className="text-purple-200 text-lg">Search, track, and review your favorite movies</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <div className="text-3xl font-bold text-white">{watchlist.length}</div>
            <div className="text-purple-200 text-sm">Total Movies</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <div className="text-3xl font-bold text-yellow-400">{unwatchedCount}</div>
            <div className="text-purple-200 text-sm">To Watch</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <div className="text-3xl font-bold text-green-400">{watchedCount}</div>
            <div className="text-purple-200 text-sm">Watched</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <div className="text-3xl font-bold text-blue-400">
              {watchedCount > 0 
                ? (watchlist.filter(m => m.watched && m.rating > 0).reduce((acc, m) => acc + m.rating, 0) / 
                   watchlist.filter(m => m.watched && m.rating > 0).length || 0).toFixed(1)
                : '0.0'}
            </div>
            <div className="text-purple-200 text-sm">Avg Rating</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-6 border border-white/20">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for movies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchMovies(e)}
                className="w-full pl-12 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <button
              onClick={searchMovies}
              disabled={loading}
              className="px-8 py-3 bg-yellow-400 text-purple-900 font-semibold rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {error && (
            <div className="mt-3 text-red-300 text-sm">{error}</div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'search' 
                ? 'bg-yellow-400 text-purple-900' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Search className="w-5 h-5" />
            Search Results
          </button>
          <button
            onClick={() => setActiveTab('unwatched')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'unwatched' 
                ? 'bg-yellow-400 text-purple-900' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Clock className="w-5 h-5" />
            To Watch ({unwatchedCount})
          </button>
          <button
            onClick={() => setActiveTab('watched')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'watched' 
                ? 'bg-yellow-400 text-purple-900' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Eye className="w-5 h-5" />
            Watched ({watchedCount})
          </button>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Search Results */}
          {activeTab === 'search' && searchResults.map(movie => (
            <MovieCard 
              key={movie.imdbID} 
              movie={movie}
              inWatchlist={isInWatchlist(movie.imdbID)}
              onAdd={() => addToWatchlist(movie)}
            />
          ))}

          {/* Unwatched Movies */}
          {activeTab === 'unwatched' && watchlist
            .filter(m => !m.watched)
            .map(movie => (
              <WatchlistCard
                key={movie.imdbID}
                movie={movie}
                onRemove={() => removeFromWatchlist(movie.imdbID)}
                onToggleWatched={() => toggleWatched(movie.imdbID)}
                onReview={() => openReviewModal(movie)}
              />
            ))}

          {/* Watched Movies */}
          {activeTab === 'watched' && watchlist
            .filter(m => m.watched)
            .map(movie => (
              <WatchlistCard
                key={movie.imdbID}
                movie={movie}
                onRemove={() => removeFromWatchlist(movie.imdbID)}
                onToggleWatched={() => toggleWatched(movie.imdbID)}
                onReview={() => openReviewModal(movie)}
              />
            ))}
        </div>

        {/* Empty State */}
        {activeTab === 'search' && searchResults.length === 0 && !loading && !error && (
          <div className="text-center py-16">
            <Search className="w-20 h-20 text-purple-300 mx-auto mb-4" />
            <p className="text-purple-200 text-lg">Search for movies to get started!</p>
          </div>
        )}

        {activeTab === 'unwatched' && unwatchedCount === 0 && (
          <div className="text-center py-16">
            <Clock className="w-20 h-20 text-purple-300 mx-auto mb-4" />
            <p className="text-purple-200 text-lg">No movies in your watchlist yet!</p>
          </div>
        )}

        {activeTab === 'watched' && watchedCount === 0 && (
          <div className="text-center py-16">
            <Eye className="w-20 h-20 text-purple-300 mx-auto mb-4" />
            <p className="text-purple-200 text-lg">You haven't watched any movies yet!</p>
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-purple-800 to-indigo-900 rounded-lg p-6 max-w-md w-full border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4">Rate & Review</h3>
              <p className="text-purple-200 mb-4">{selectedMovie?.Title}</p>
              
              <div className="mb-4">
                <label className="block text-white mb-2 font-semibold">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star 
                        className={`w-10 h-10 ${
                          star <= rating 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-purple-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-white mb-2 font-semibold">Your Review (Optional)</label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="What did you think about this movie?"
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 h-32 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={saveReview}
                  className="flex-1 px-6 py-3 bg-yellow-400 text-purple-900 font-semibold rounded-lg hover:bg-yellow-300 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setSelectedMovie(null);
                    setRating(0);
                    setReview('');
                  }}
                  className="px-6 py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MovieCard({ movie, inWatchlist, onAdd }) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg overflow-hidden border border-white/20 hover:border-yellow-400/50 transition-all">
      <div className="aspect-[2/3] relative">
        {movie.Poster !== 'N/A' ? (
          <img 
            src={movie.Poster} 
            alt={movie.Title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-purple-800/50 flex items-center justify-center">
            <Film className="w-16 h-16 text-purple-300" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-white font-semibold text-lg mb-1 line-clamp-2">{movie.Title}</h3>
        <p className="text-purple-200 text-sm mb-3">{movie.Year}</p>
        <button
          onClick={onAdd}
          disabled={inWatchlist}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
            inWatchlist
              ? 'bg-green-500/20 text-green-300 cursor-not-allowed'
              : 'bg-yellow-400 text-purple-900 hover:bg-yellow-300'
          }`}
        >
          {inWatchlist ? (
            <>
              <Check className="w-5 h-5" />
              In Watchlist
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Add to Watchlist
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function WatchlistCard({ movie, onRemove, onToggleWatched, onReview }) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg overflow-hidden border border-white/20">
      <div className="aspect-[2/3] relative">
        {movie.Poster !== 'N/A' ? (
          <img 
            src={movie.Poster} 
            alt={movie.Title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-purple-800/50 flex items-center justify-center">
            <Film className="w-16 h-16 text-purple-300" />
          </div>
        )}
        {movie.watched && (
          <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <Check className="w-4 h-4" />
            Watched
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-white font-semibold text-lg mb-1 line-clamp-2">{movie.Title}</h3>
        <p className="text-purple-200 text-sm mb-2">{movie.Year}</p>
        
        {movie.watched && movie.rating > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star}
                  className={`w-4 h-4 ${
                    star <= movie.rating 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-purple-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-yellow-400 font-semibold">{movie.rating}/5</span>
          </div>
        )}
        
        {movie.review && (
          <p className="text-purple-200 text-sm mb-3 line-clamp-2 italic">"{movie.review}"</p>
        )}
        
        <div className="flex gap-2">
          <button
            onClick={onToggleWatched}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm font-semibold"
          >
            {movie.watched ? (
              <>
                <X className="w-4 h-4" />
                Unwatch
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Watched
              </>
            )}
          </button>
          <button
            onClick={onReview}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-300 transition-colors text-sm font-semibold"
          >
            <Star className="w-4 h-4" />
            {movie.rating > 0 ? 'Edit' : 'Rate'}
          </button>
        </div>
        <button
          onClick={onRemove}
          className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-semibold"
        >
          <Trash2 className="w-4 h-4" />
          Remove
        </button>
      </div>
    </div>
  );
}