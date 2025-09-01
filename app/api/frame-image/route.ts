import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username') || 'dxfareed';
    
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002';
    const response = await fetch(`${apiUrl}/rate-user`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    const userData = await response.json();
    const { stat_sheet, profile_data } = userData;

    function calculateTier(score: number): string {
      if (score >= 190) return "S";
      if (score >= 170) return "A";
      if (score >= 140) return "B";
      if (score >= 100) return "C";
      if (score >= 60) return "D";
      if (score >= 0) return "F";
      return "F";
    }

    const tier = calculateTier(stat_sheet.total_score);

    // Generate SVG image
    const svg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#000000;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  
  <!-- Border -->
  <rect x="10" y="10" width="1180" height="610" fill="none" stroke="#ff4d4d" stroke-width="6" rx="20"/>
  
  <!-- Header -->
  <text x="600" y="120" font-family="Arial, sans-serif" font-size="48" font-weight="900" fill="#ff4d4d" text-anchor="middle">AURASTER</text>
  
  <!-- Username -->
  <text x="600" y="180" font-family="Arial, sans-serif" font-size="36" fill="#ffffff" text-anchor="middle">@${profile_data.username}</text>
  
  <!-- Tier -->
  <text x="600" y="280" font-family="Arial, sans-serif" font-size="120" font-weight="900" fill="#ff4d4d" text-anchor="middle">${tier}</text>
  
  <!-- Stats Container -->
  <g transform="translate(600, 380)">
    <!-- Aura Points -->
    <text x="-200" y="0" font-family="Arial, sans-serif" font-size="18" fill="#a0a0a0" text-anchor="middle">AURA POINTS</text>
    <text x="-200" y="35" font-family="Arial, sans-serif" font-size="32" font-weight="900" fill="#ffffff" text-anchor="middle">${stat_sheet.aura_points}</text>
    
    <!-- Rank -->
    <text x="200" y="0" font-family="Arial, sans-serif" font-size="18" fill="#a0a0a0" text-anchor="middle">RANK</text>
    <text x="200" y="35" font-family="Arial, sans-serif" font-size="32" font-weight="900" fill="#ffffff" text-anchor="middle">#${stat_sheet.rank}</text>
  </g>
  
  <!-- Footer -->
  <text x="600" y="520" font-family="Arial, sans-serif" font-size="24" fill="#a0a0a0" text-anchor="middle">Check your own farcaster aura</text>
</svg>`;

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    });

  } catch (error) {
    console.error('Frame image generation error:', error);
    
    // Return a fallback image
    const fallbackSvg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#000000"/>
  <text x="600" y="315" font-family="Arial, sans-serif" font-size="36" fill="#ffffff" text-anchor="middle">Auraster - Check Your Aura</text>
</svg>`;
    
    return new NextResponse(fallbackSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
      },
    });
  }
} 