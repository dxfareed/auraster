import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { untrustedData } = body;
    
    const username = untrustedData?.username || 'dxfareed';
    const appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    
    return NextResponse.redirect(new URL(`${appUrl}/profile?username=${username}`));
  } catch (error) {
    console.error('Frame API error:', error);
    const appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    return NextResponse.redirect(new URL(`${appUrl}/profile`));
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username') || 'dxfareed';
    
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002';
    const response = await fetch(`${apiUrl}/rate-user`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
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
    const appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

    const frameHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Auraster - ${profile_data.username}'s Aura</title>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${appUrl}/api/frame-image?username=${username}" />
    <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
    <meta property="fc:frame:button:1" content="Check your own farcaster aura" />
    <meta property="fc:frame:post_url" content="${appUrl}/api/frame" />
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Courier New', monospace;
            background: #000;
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .frame-container {
            width: 1200px;
            height: 630px;
            background: linear-gradient(135deg, #000 0%, #1a1a1a 100%);
            border: 3px solid #ff4d4d;
            border-radius: 16px;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 40px;
            box-sizing: border-box;
        }
        .header {
            font-size: 48px;
            font-weight: 900;
            color: #ff4d4d;
            margin-bottom: 20px;
            text-align: center;
        }
        .username {
            font-size: 36px;
            color: #fff;
            margin-bottom: 30px;
            text-align: center;
        }
        .stats {
            display: flex;
            gap: 40px;
            margin-bottom: 30px;
        }
        .stat {
            text-align: center;
        }
        .stat-label {
            font-size: 18px;
            color: #a0a0a0;
            margin-bottom: 8px;
        }
        .stat-value {
            font-size: 32px;
            font-weight: 900;
            color: #fff;
        }
        .tier {
            font-size: 72px;
            font-weight: 900;
            color: #ff4d4d;
            margin-bottom: 20px;
        }
        .footer {
            font-size: 24px;
            color: #a0a0a0;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="frame-container">
        <div class="header">AURASTER</div>
        <div class="username">@${profile_data.username}</div>
        <div class="tier">${tier}</div>
        <div class="stats">
            <div class="stat">
                <div class="stat-label">AURA POINTS</div>
                <div class="stat-value">${stat_sheet.aura_points}</div>
            </div>
            <div class="stat">
                <div class="stat-label">RANK</div>
                <div class="stat-value">#${stat_sheet.rank}</div>
            </div>
        </div>
        <div class="footer">Check your own farcaster aura</div>
    </div>
</body>
</html>`;

    return new NextResponse(frameHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Frame generation error:', error);
    return new NextResponse('Error generating frame', { status: 500 });
  }
} 