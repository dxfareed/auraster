"use client";

import { useEffect, useState } from "react";
import './Leaderboard.css';
import { API_URLS } from "@/lib/api-config";

const preloadProfilePictures = (data: LeaderboardEntry[]) => {
  data.forEach(user => {
    if (user.pfp_url) {
      const img = new Image();
      img.onload = () => {
      };
      img.onerror = () => {
      };
      img.src = user.pfp_url;
    }
  });
};

const ProfilePicture = ({ src, alt, username, onLoad }: { 
  src: string; 
  alt: string; 
  username: string;
  onLoad: () => void;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad();
  };

  const handleError = () => {
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className="pfp fallback">
        {username.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <>
      {!isLoaded && (
        <div className="pfp skeleton-pfp">
          <div className="skeleton-circle"></div>
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={src} 
        alt={alt} 
        className={`pfp ${isLoaded ? 'loaded' : 'hidden'}`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
    </>
  );
};

interface LeaderboardEntry {
  rank: number;
  username: string;
  display_name: string;
  pfp_url: string;
  total_score: number;
}

export function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(API_URLS.LEADERBOARD);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const responseText = await response.text();
        const data = JSON.parse(responseText);
        const top10Data = data.slice(0, 20);
        console.log(top10Data);
        setLeaderboardData(top10Data);
        
        preloadProfilePictures(top10Data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch leaderboard.";
        console.error('Fetch error:', err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (isLoading) {
    return (
      <div className="leaderboard-widget">
        <div className="widget-header">
          <span className="blink-text">■</span> LEGENDS
        </div>
        <div className="leaderboard-list">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton-row">
              <div className="skeleton rank"></div>
              <div className="skeleton pfp"></div>
              <div className="skeleton-user-info">
                <div className="skeleton name"></div>
                <div className="skeleton username"></div>
              </div>
              <div className="skeleton score"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (error) return <div className="leaderboard-widget"><p>Error: {error}</p></div>;

  return (
    <div className="leaderboard-widget">
      <div className="widget-header">
        <strong>LEGENDS</strong>
      </div>
      <ol className="leaderboard-list">
        {leaderboardData.map(user => (
          <li key={user.rank} className="leaderboard-row">
            <span className="rank">{user.rank}</span>
            <ProfilePicture 
              src={user.pfp_url} 
              alt={user.username} 
              username={user.username}
              onLoad={() => setLoadedImages(prev => new Set(prev).add(user.pfp_url))}
            />
            <div className="user-info">
              <span className="display-name">{user.display_name}</span>
              <span className="username">@{user.username}</span>
            </div>
            <span className="score">{Math.round(user.total_score)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}