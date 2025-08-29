"use client";

import { useEffect, useState } from "react";
import {
    useMiniKit,
    useAddFrame,
    useOpenUrl,
} from "@coinbase/onchainkit/minikit";
import './profile-card.css';

interface NeynarProfile {
  pfp_url: string;
  username: string;
  display_name: string;
}

interface StatDetails {
  score: number;
  tier: string;
  percentage: number;
}

interface StatSheet {
  total_score: number;
  overall_aura: string;
  stats: {
    name: StatDetails;
    bio: StatDetails;
    follow_ratio: StatDetails;
    algo_pull: StatDetails;
  };
  rank: string;
  aura_points: number;
  raw_breakdown: { [key: string]: number };
}

interface ApiResponse {
  stat_sheet: StatSheet;
  profile_data: NeynarProfile;
}

function StatBar({ name, percentage, tier }: { name: string, percentage: number, tier: string }) {
  const tierClass = tier.toLowerCase();
  return (
    <div className="stat-row">
      <div className="stat-header">
        <span className="stat-name">{name}</span>
        <span className={`stat-tier ${tierClass}`}>{tier}</span>
      </div>
      <div className="stat-bar-container">
        <div className="stat-bar-progress" style={{ width: `${Math.min(percentage, 100)}%` }}>
          <span className="stat-percentage">{percentage}%</span>
        </div>
      </div>
    </div>
  );
}

function ScoreModal({ breakdown, onClose }: { breakdown?: { [key: string]: number }, onClose: () => void }) {
  const iconMap: { [key: string]: string } = { username: "👤", pfp: "🖼️", pro_status: "⭐", bio: "✍️", location: "📍", banner: "🌇", follow_ratio: "📊", verified_accounts: "✅", power_badge: "⚡", neynar_score: "🤖" };

  if (!breakdown) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Full Aura Report</h3>
            <button className="close-button" onClick={onClose}>X</button>
          </div>
          <div className="modal-body">
            <p>Detailed breakdown not available for this user.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Full Aura Report</h3>
          <button className="close-button" onClick={onClose}>
            <img src="/x.png"width={40} height={50} alt="Close"/>
          </button>
        </div>
        <div className="modal-body">
          {Object.entries(breakdown).map(([key, value]) => (
            <div className="report-row" key={key}>
              <span className="report-icon">{iconMap[key]}</span>
              <span className="report-label">{key.replace('_', ' ')}</span>
              <div className="report-dots"></div>
              <span className="report-score">{Number(value).toFixed(1)} / 20</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProfileCard({ usernameToRate }: { usernameToRate: string }) {
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { context } = useMiniKit();

  console.log("user as :", context?.user.fid);

  useEffect(() => {
    const fetchScore = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const profile_rate_url = process.env.NEXT_PUBLIC_RATE_PROFILE || 'http://localhost:3002/rate-user';
        const response = await fetch(profile_rate_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: usernameToRate }),
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data: ApiResponse = await response.json();
        console.log("Fetched API Data:", data);
        setApiData(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch rating.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchScore();
  }, [usernameToRate]);

  if (isLoading) { return <div>Loading...</div>; }
  if (error) { return <div>Error: {error}</div>; }
  if (!apiData) { return <div>No data available.</div>; }

  const { stat_sheet, profile_data } = apiData;
  console.log(apiData.profile_data);

  if (!profile_data) { return <div>Profile data not available.</div>; }
  //@ts-ignore
  const userBannerUrl = profile_data.profile?.banner?.url;
  //@ts-ignore
  const isProUser = profile_data.power_badge !== false;

  const bannerToShow = userBannerUrl 
    ? userBannerUrl 
    : isProUser 
      ? "/uhm-pro.jpg" 
      : "/go-pro.png";
  return (
    <>
    <div className="card-wrapper">
        <img src="/info-banner.png" alt="text" className="header-logo-image"/>
        <div className="total-grade-sticker">
          <span>A</span> TOTAL
        </div>
          
        <div className="auralized-card">
          <div className="card-header">
           <img src={bannerToShow} alt="Banner" className="banner-image"/>
            <div className="header-stickers"></div>
            <div className="header-stickers"></div>
          </div>

          <div className="card-body">
            <div className="analysis-header">
              aura analysis for
              <img src={profile_data.pfp_url} alt="PFP" className="inline-pfp" />            
              @{profile_data.username}
            </div>

            <div className="summary-stats">
              <div className="stat-box rank-box">RANK {stat_sheet.rank}</div>
              <div className="stat-box points-box">{stat_sheet.aura_points} AURA POINTS</div>
            </div>

            <div className="detailed-stats">
              <StatBar name="name" percentage={stat_sheet.stats.name.percentage} tier={stat_sheet.stats.name.tier} />
              <StatBar name="bio" percentage={stat_sheet.stats.bio.percentage} tier={stat_sheet.stats.bio.tier} />
              <StatBar name="follow ratio" percentage={stat_sheet.stats.follow_ratio.percentage} tier={stat_sheet.stats.follow_ratio.tier} />
              <StatBar name="algo pull" percentage={stat_sheet.stats.algo_pull.percentage} tier={stat_sheet.stats.algo_pull.tier} />
            </div>

            <div className="footer">
              overall you have <div className="stat-box overall-aura-box">{stat_sheet.overall_aura}</div>
              <button className="details-button" onClick={() => setIsModalOpen(true)}>
                View Full Report
              </button>
              <p className="version-text">auraster version 1.0</p>
            </div>
          </div>
        </div>
      </div>
      
      {isModalOpen && (
        <ScoreModal 
          breakdown={stat_sheet.raw_breakdown} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
}