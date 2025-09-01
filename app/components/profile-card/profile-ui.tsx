"use client";

import { useEffect, useState } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import './style.css';
import { ApiResponse } from "./types";
import { StatBar } from "./StatBar";
import { ScoreModal } from "./ScoreModal";
import { API_URLS } from "@/lib/api-config";

// Function to calculate tier based on score
function calculateTier(score: number): string {
  if (score >= 190) return "S";
  if (score >= 170) return "A";
  if (score >= 140) return "B";
  if (score >= 100) return "C";
  if (score >= 60) return "D";
  if (score >= 0) return "F";
  return "F"; // Default fallback
}

export function ProfileCard({ usernameToRate, onProfileLoad }: { usernameToRate: string, onProfileLoad?: () => void }) {
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { context } = useMiniKit();

  const handleShare = () => {
    console.log("clicked");
  };

  console.log("user as :", context?.user.fid);

  useEffect(() => {
    const fetchScore = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(API_URLS.RATE_USER, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: usernameToRate }),
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data: ApiResponse = await response.json();
        console.log("Fetched API Data:", data);
        setApiData(data);
        if (onProfileLoad) {
          onProfileLoad();
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch rating.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchScore();
  }, [usernameToRate, onProfileLoad]);

  const [loadingText, setLoadingText] = useState("Checking name...");

  useEffect(() => {
    if (isLoading) {
      const loadingTexts = [
        "Checking name...", 
        "Analyzing bio...", 
        "Checking pfp...",
        "Analyzing location...",
        "Checking banner...",
        "Verifying pro status...",
        "Calculating neynar score...",
        "Analyzing follow ratio...",
        "Checking verified accounts...",
        "Calculating algo pull..."
      ];
      let currentIndex = 0;
      const interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % loadingTexts.length;
        setLoadingText(loadingTexts[currentIndex]);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="card-wrapper">
        <div className="auralized-card loading-container">
          <img src="/auraster-logo.png" alt="Loading..." className="dvd-logo" />
          <div className="loading-text">{loadingText}</div>
        </div>
      </div>
    );
  }
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
          <span>{calculateTier(stat_sheet.total_score)}</span> TOTAL
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
              <div className="stat-box points-box"><span className="stat-total-points">{stat_sheet.total_score}</span> AURA POINTS</div>
            </div>

            <div className="detailed-stats">
              <StatBar name="name" percentage={stat_sheet.stats.name.percentage} tier={stat_sheet.stats.name.tier} />
              <StatBar name="bio" percentage={stat_sheet.stats.bio.percentage} tier={stat_sheet.stats.bio.tier} />
              <StatBar name="follow ratio" percentage={stat_sheet.stats.follow_ratio.percentage} tier={stat_sheet.stats.follow_ratio.tier} />
              <StatBar name="algo pull" percentage={stat_sheet.stats.algo_pull.percentage} tier={stat_sheet.stats.algo_pull.tier} />
            </div>

            <div className="footer">
              <div className="overall-line">
                overall you have <div className="stat-box overall-aura-box">{stat_sheet.overall_aura}</div>
              </div>
              <div className="button-line">
                <button className="details-button" onClick={() => setIsModalOpen(true)}>
                  view full report
                </button>
                <button className="share-button" onClick={() => handleShare()}>
                  share
                </button>
              </div>
              <div className="version-section">
                <p className="version-text">
                  auraster by 
                  <img src="https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/8fbbe5e2-0c53-48b8-c5f1-4a791b76ce00/rectcrop3" alt="PFP" className="version-pfp" />
                  <a href="https://farcaster.xyz" target="_blank" rel="noopener noreferrer" className="author-link">dxfareed</a>
                </p>
              </div>
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
