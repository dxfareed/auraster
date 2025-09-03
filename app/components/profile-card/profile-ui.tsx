"use client";

import { useEffect, useState } from "react";
import { sdk } from '@farcaster/miniapp-sdk';

import './style.css';
import { ApiResponse } from "./types";
import { StatBar } from "./StatBar";
import { ScoreModal } from "./ScoreModal";
import { generateShareableImage } from "./ShareableImage";
import { API_URLS } from "@/lib/api-config";

function calculateTier(score: number): string {
  if (score >= 190) return "S";
  if (score >= 170) return "A";
  if (score >= 140) return "B";
  if (score >= 100) return "C";
  if (score >= 60) return "D";
  if (score >= 0) return "F";
  return "F"; 
}
const preloadImages = (apiData: ApiResponse) => {
  const { profile_data } = apiData;
  
  //@ts-expect-error - profile_data structure may vary
  if (profile_data.profile?.banner?.url) {
    const bannerImg = new Image();
    bannerImg.crossOrigin = 'anonymous';
    //@ts-expect-error - profile_data structure may vary
    bannerImg.src = profile_data.profile.banner.url;
  }
  
  if (profile_data.pfp_url) {
    const pfpImg = new Image();
    pfpImg.crossOrigin = 'anonymous';
    pfpImg.src = profile_data.pfp_url;
  }
  
  const logoImg = new Image();
  logoImg.src = '/info-banner.png';
  
  const authorImg = new Image();
  authorImg.crossOrigin = 'anonymous';
  authorImg.src = "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/8fbbe5e2-0c53-48b8-c5f1-4a791b76ce00/rectcrop3";
  
  console.log('Images preloaded for share functionality');
};

export function ProfileCard({ usernameToRate, onProfileLoad }: { usernameToRate: string, onProfileLoad?: () => void }) {
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  const handleShare = async () => {
    if (!apiData || isSharing) return;

    setIsSharing(true);
    console.log("user clicked share");
    const { profile_data } = apiData;
    const appUrl = window.location.origin;

    try {
        const imageDataUrl = await Promise.race([
        generateShareableImage(apiData),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Image generation timeout')), 10000)
        )
      ]);
      
      const link = document.createElement('a');
      link.download = `auraster-${profile_data.username}.png`;
      link.href = imageDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      try {
        const blob = await fetch(imageDataUrl).then(r => r.blob());
        const clipboardItem = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([clipboardItem]);
        console.log('Image copied to clipboard!');
      } catch (clipboardError) {
        console.log('Clipboard image copy not supported:', clipboardError);
      }

      alert(`✅ Aura analysis image generated and downloaded!\n\n📋 Image also copied to clipboard (if supported)\n\n🎯 You can now paste the image anywhere!`);

      try {
        if (typeof sdk !== 'undefined' && sdk.actions) {
          const castText = `Just analyzed @${profile_data.username}'s Farcaster aura! 🎯\n\n` +
                          `Grade: ${calculateTier(stat_sheet.total_score)}\n` +
                          `Score: ${stat_sheet.total_score} points\n` +
                          `Rank: #${stat_sheet.rank}\n\n` +
                          `Check your own aura at Auraster! 🔮\n` +
                          `${appUrl}`;
          let imageUrl = null;
          try {
            const response = await fetch(imageDataUrl);
            const blob = await response.blob();
            
            const formData = new FormData();
            formData.append('image', blob, `auraster-${profile_data.username}.png`);
          
           const imgbbKey = process.env.NEXT_PUBLIC_IMGBB_KEY;
           const imgbbURL = `https://api.imgbb.com/1/upload?key=${imgbbKey}`;

           console.info(imgbbURL, " imggbURL")
            const uploadResponse = await fetch(imgbbURL, {
              method: 'POST',
              body: formData
            });
            
            if (uploadResponse.ok) {
              const uploadData = await uploadResponse.json();
              imageUrl = uploadData.data.url;
              console.log('Image uploaded successfully:', imageUrl);
            }
          } catch (uploadError) {
            console.log('Image upload failed, sharing without image:', uploadError);
          }

          if (imageUrl) {
            await sdk.actions.composeCast({
              text: castText,
              embeds: [imageUrl, appUrl],
            });
          } else {
            await sdk.actions.composeCast({
              text: castText,
              embeds: [appUrl],
            });
          }

          await sdk.actions.openMiniApp({ url: appUrl });
        }
      } catch (farcasterError) {
        console.log('Farcaster sharing not available:', farcasterError);
      }

    } catch (error) {
      console.error("Error sharing aura analysis:", error);
      
      try {
        const shareText = `Just analyzed @${profile_data.username}'s Farcaster aura! Check your aura at ${appUrl}`;
        await navigator.clipboard.writeText(shareText);
        alert('Share text copied to clipboard!');
      } catch (clipboardError) {
        console.error("Clipboard error:", clipboardError);
        alert('Failed to share. Please try again.');
      }
    } finally {
      setIsSharing(false);
    }
  };


  useEffect(() => {
    const fetchScore = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(API_URLS.RATE_USER, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username: usernameToRate }),
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data: ApiResponse = await response.json();
        console.log("Fetched API Data:", data);
        setApiData(data);
        
        preloadImages(data);
        
        if (onProfileLoad) {
          onProfileLoad();
        }
        
        try {
          if (typeof sdk !== 'undefined' && sdk.actions) {
            await sdk.actions.ready();
            console.log('Farcaster app ready signal sent');
          }
        } catch (readyError) {
          console.warn('Failed to send ready signal:', readyError);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch rating.";
        setError(errorMessage);
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
  
/*   const imageDataUrl = await generateShareableImage(apiData);
  console.log("imageDataUrl", imageDataUrl); */

  if (!profile_data) { return <div>Profile data not available.</div>; }
  //@ts-expect-error - profile_data structure may vary
  const userBannerUrl = profile_data.profile?.banner?.url;
  //@ts-expect-error - power_badge property may not exist
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
                <button 
                  className={`share-button ${isSharing ? 'sharing' : ''}`} 
                  onClick={() => handleShare()}
                  disabled={isSharing}
                >
                  {isSharing ? (
                    <>
                      <span className="loading-spinner"></span>
                      generating...
                    </>
                  ) : (
                    'share'
                  )}
                </button>
              </div>
              <div className="version-section">
                <p className="version-text">
                  auraster by 
                  <img src="https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/8fbbe5e2-0c53-48b8-c5f1-4a791b76ce00/rectcrop3" alt="PFP" className="version-pfp" />
                  {/* <a href="https://farcaster.xyz" target="_blank" rel="noopener noreferrer" className="author-link">dxfareed</a> */}
                  <span className="author-link" onClick={async ()=>{
                   await sdk.actions.viewProfile({ 
                      fid: 849768
                      //dxfareed fid
                    })
                  }}>dxfareed</span>
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