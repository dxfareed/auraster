"use client";

import { useEffect, useState } from "react";
import './Leaderboard.css';
import { API_URLS } from "@/lib/api-config";

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
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(API_URLS.LEADERBOARD, {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const responseText = await response.text();
        const data = JSON.parse(responseText);
        setLeaderboardData(data.slice(0, 10)); // Limit to top 10
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
          <span className="blink-text">■</span> TOP 10 AURAS
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
            <img src={user.pfp_url} alt={user.username} className="pfp" />
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