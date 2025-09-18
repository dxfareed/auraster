"use client";

import { useEffect, useState } from "react";
import './Leaderboard.css';
import { API_URLS } from "@/lib/api-config";
import { ScoreModal } from './profile-card/ScoreModal';

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
  fid: number;
  raw_breakdown: { [key: string]: number };
}

export function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<LeaderboardEntry | null>(null);

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
        const top10Data = data.slice(0, 100);
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

  const handleUserClick = (user: LeaderboardEntry) => {
    setSelectedUser(user);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  if (isLoading) {
    return (
      <div className="leaderboard-widget">
        <div className="widget-header">
          <span className="blink-text">■</span> LEGENDS
        </div>
        <div className="leaderboard-list">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading legends...</div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) return <div className="leaderboard-widget"><p>Error: {error}</p></div>;

  return (
    <>
      <div className="leaderboard-widget">
        <div className="widget-header">
          <strong>LEGENDS</strong>
        </div>
        <ol className="leaderboard-list">
          {leaderboardData.map(user => (
            <li 
              key={user.rank} 
              className="leaderboard-row clickable-row"
              onClick={() => handleUserClick(user)}
            >
              <span className="rank">{user.rank}</span>
              <ProfilePicture 
                src={user.pfp_url} 
                alt={user.username} 
                username={user.username}
                onLoad={() => {}}
              />
              <div className="user-info">
                <div className="name-container">
                  <span className="display-name">{user.display_name}</span>
                  {user.rank === 1 && (
                    <span className="mr-farcaster-badge">Mr Farcaster</span>
                  )}
                </div>
                <span className="username">@{user.username}</span>
              </div>
              <span className="score">{Math.round(user.total_score)}</span>
            </li>
          ))}
        </ol>
      </div>

      {selectedUser && (
        <ScoreModal 
          breakdown={selectedUser.raw_breakdown} 
          onClose={handleCloseModal} 
        />
      )}
    </>
  );
}