"use client";

import { useEffect, useState } from "react";
import './Leaderboard.css';

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
        const response = await fetch('http://localhost:3002/leaderboard');
        if (!response.ok) throw new Error("Failed to fetch leaderboard.");
        const data = await response.json();
        setLeaderboardData(data.slice(0, 10)); // Limit to top 20
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (isLoading) return <div className="leaderboard-widget"><p>Loading Leaderboard...</p></div>;
  if (error) return <div className="leaderboard-widget"><p>Error: {error}</p></div>;

  return (
    <div className="leaderboard-widget">
      <div className="widget-header">
        <span className="blink-text">■</span> TOP 10 AURAS
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