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
    profile: { bio: { text: string } };
    follower_count: number;
    following_count: number;
}
interface ScoreDetails {
    score: number;
    max_score: number;
    breakdown: { [key: string]: number };
    pfp_classification: string;
}
interface ApiResponse {
    score_details: ScoreDetails;
    profile_data: NeynarProfile;
}

const iconMap: { [key: string]: string } = { username: "👤", pfp: "🖼️", pro_status: "⭐", bio: "✍️", location: "📍", banner: "🌇", follow_ratio: "📊", verified_accounts: "✅", power_badge: "⚡", neynar_score: "🤖" };

export function ProfileCard({ usernameToRate }: { usernameToRate: string }) {
    const [apiData, setApiData] = useState<ApiResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { context } = useMiniKit();

    console.log("user as :", context?.user.fid);

    useEffect(() => {
        const fetchScore = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const profile_rate_url = process.env.NEXT_PUBLIC_RATE_PROFILE ||'';
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

    if (isLoading) { return <div>Loading...</div> }
    if (error) { return <div>Error: {error}</div> }
    if (!apiData) { return <div>No data.</div> }

    const { score_details, profile_data } = apiData;
    const { score, breakdown, max_score, pfp_classification } = score_details;

    if (!profile_data) { return <div>Profile data not available. Score: {score}</div> }

    return (
        <div className="y2k-container">
            <div className="frame-wing left-wing">
                <div className="diagnostics-widget">
                    <div className="widget-header"><span className="blink-text">■</span> System Diagnostics</div>
                    <div className="diagnostics-grid">
                        {Object.entries(breakdown).map(([key, value]) => (
                            <div className="stat-item" key={key}>
                                <span className="stat-icon">{iconMap[key]}</span>
                                <span className="stat-label">{key.replace('_', ' ')}</span>
                                <span className="stat-value">{Number(value).toFixed(1)} / 20</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="profile-card-main">
                <div className="card-background-stickers">
                        <div className="sticker-bg sticker-1"></div>
                        <div className="sticker-bg sticker-2"></div>
                        <div className="sticker-bg sticker-3"></div>
                        <div className="sticker-bg sticker-4"></div>
                </div>
                
                <div className="sticker online-status"><span className="online-dot"></span>Online!</div>
                <div className="card-header">
                    <img src={profile_data.pfp_url} alt="Profile" className="profile-picture" />
                    <h2 className="profile-name">{profile_data.display_name}</h2>
                    <p className="profile-username">@{profile_data.username}</p>
                </div>
                <div className="profile-bio-box"><p>{profile_data.profile.bio.text}</p></div>
                <div className="profile-stats">
                    <p><span>{profile_data.following_count}</span> Following</p>
                    <p><span>{profile_data.follower_count}</span> Friends</p>
                </div>
                <div className="aura-score-widget">
                    <h3 className="aura-title">✨ AURA SCORE ✨</h3>
                    <div className="score-display">
                        <span className="current-score">{score}</span>
                        <span className="max-score">/ {max_score}</span>
                    </div>
                    <progress className="score-progress" value={score} max={max_score}></progress>
                </div>
                <div className="pfp-analysis">
                    <p>PFP Analysis: <span className="pfp-class">{pfp_classification}</span></p>
                </div>
            </div>

            <div className="frame-wing right-wing">
                    <div className="sticker word-art">RAD!</div>
                    <div className="sticker pixel-heart"></div>
                    <div className="now-playing-widget">
                        <div className="widget-header">Now Playing...</div>
                        <div className="song-info"><span className="marquee">♪ ♫ Daft Punk - One More Time ♫ ♪</span></div>
                    </div>
            </div>
        </div>
    );
}
