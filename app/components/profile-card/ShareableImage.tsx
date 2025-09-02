import { ApiResponse } from "./types";

async function loadFont(fontFamily: string, url: string) {
  try {
  const font = new FontFace(fontFamily, `url(${url})`);
  await font.load();
  (document.fonts as unknown as FontFaceSet).add(font);
  } catch (error) {
    console.warn(`Failed to load font ${fontFamily}:`, error);
    // Continue without the custom font
  }
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Add crossOrigin to prevent tainted canvas
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function calculateTier(score: number): string {
  if (score >= 190) return "S";
  if (score >= 170) return "A";
  if (score >= 140) return "B";
  if (score >= 100) return "C";
  if (score >= 60) return "D";
  if (score >= 0) return "F";
  return "F";
}

export async function generateShareableImage(apiData: ApiResponse): Promise<string> {
  console.log('Generating shareable image with data:', apiData);
  console.log('Stat sheet:', apiData.stat_sheet);
  
  // Check if fonts are already loaded, if not load them
  if (!document.fonts.check('12px Bangers')) {
    try {
      await loadFont('Bangers', '/fonts/bangers.ttf');
    } catch (error) {
      console.warn('Bangers font loading failed, using fallback:', error);
    }
  }
  
  if (!document.fonts.check('12px VT323')) {
    try {
      await loadFont('VT323', '/fonts/vt323.ttf');
    } catch (error) {
      console.warn('VT323 font loading failed, using fallback:', error);
    }
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  const width = 540; 
  const height = 960;
  canvas.width = width;
  canvas.height = height;

  // Background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  const { stat_sheet, profile_data } = apiData;
  
  // Validate data structure
  if (!stat_sheet || !profile_data) {
    console.error('Missing required data:', { stat_sheet, profile_data });
    throw new Error('Missing required data for image generation');
  }

  // Card border
  const cardX = 20;
  const cardY = 20;
  const cardWidth = width - 40;
  const cardHeight = height - 40;
  
  ctx.strokeStyle = '#ff4d4d';
  ctx.lineWidth = 4;
  ctx.strokeRect(cardX, cardY, cardWidth, cardHeight);
  
  ctx.shadowColor = 'rgba(255, 77, 77, 0.7)';
  ctx.shadowBlur = 10;
  ctx.strokeRect(cardX, cardY, cardWidth, cardHeight);
  ctx.shadowBlur = 0;

  // Banner
  const bannerHeight = 150;
  //@ts-expect-error - profile_data structure may vary
  const userBannerUrl = profile_data.profile?.banner?.url;
  //@ts-expect-error - power_badge property may not exist
  const isProUser = profile_data.power_badge !== false;
  const bannerSrc = userBannerUrl || (isProUser ? "/uhm-pro.jpg" : "/go-pro.png");
  
  try {
    const bannerImg = await loadImage(bannerSrc);
    ctx.drawImage(bannerImg, cardX, cardY, cardWidth, bannerHeight);
  } catch (error) {
    console.warn('Failed to load banner image, using gradient fallback:', error);
    // Fallback gradient
    const gradient = ctx.createLinearGradient(cardX, cardY, cardX, cardY + bannerHeight);
    if (isProUser) {
      gradient.addColorStop(0, '#8a63d2');
      gradient.addColorStop(1, '#ff4d4d');
    } else {
      gradient.addColorStop(0, '#333333');
      gradient.addColorStop(1, '#666666');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(cardX, cardY, cardWidth, bannerHeight);
  }
  
  ctx.strokeStyle = '#ff4d4d';
  ctx.lineWidth = 2;
  ctx.strokeRect(cardX, cardY, cardWidth, bannerHeight);

  // Header logo
  try {
    const logoImg = await loadImage('/info-banner.png');
    ctx.save();
    ctx.translate(cardX + 50, cardY + 30);
    ctx.rotate(-5 * Math.PI / 180);
    ctx.drawImage(logoImg, 0, 0, 150, 50);
    ctx.restore();
  } catch (error) {
    console.warn("Failed to load logo, using text fallback:", error);
    ctx.save();
    ctx.translate(cardX + 50, cardY + 30);
    ctx.rotate(-5 * Math.PI / 180);
    ctx.fillStyle = '#ff4d4d';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.fillText('AURASTER', 0, 20);
    ctx.restore();
  }

  // Total grade sticker
  const gradeSize = 80;
  const gradeX = cardX + cardWidth - 50;
  const gradeY = cardY + 40;
  
  ctx.save();
  ctx.translate(gradeX, gradeY);
  ctx.rotate(10 * Math.PI / 180);
  
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, gradeSize / 2, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.stroke();
  
  ctx.fillStyle = 'red';
  ctx.font = '40px Bangers';
  ctx.textAlign = 'center';
  ctx.fillText(calculateTier(stat_sheet.total_score), 0, 15);
  
  ctx.fillStyle = '#000000';
  ctx.font = '14px VT323';
  ctx.fillText('TOTAL', 0, 35);
  ctx.restore();

  // Card body - adjust positioning to ensure content is visible
  const bodyX = cardX + 20;
  const bodyY = cardY + bannerHeight + 40; // Increased spacing

  // Analysis header
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px monospace';
  ctx.textAlign = 'center';
  
  const pfpUrl = profile_data.pfp_url;
  const pfpSize = 28;
  const textY = bodyY + 15;
  const text = `aura analysis for @${profile_data.username}`;
  const textWidth = ctx.measureText(text).width;
  const textX = (width / 2) + (pfpSize / 2) + 5;

  try {
    const pfpImg = await loadImage(pfpUrl);
    const pfpX = textX - (textWidth / 2) - pfpSize - 10;
    ctx.save(); // Save context before clipping
    ctx.beginPath();
    ctx.arc(pfpX + pfpSize / 2, textY - pfpSize / 2 + 2, pfpSize / 2, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(pfpImg, pfpX, textY - pfpSize, pfpSize, pfpSize);
    ctx.restore(); // Restore context after clipping
  } catch (error) {
    console.warn("Failed to load PFP, continuing without it:", error);
  }
  
  ctx.fillText(text, textX, textY);

  // Add background to card body to ensure visibility
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.fillRect(bodyX, bodyY, cardWidth - 40, cardHeight - bannerHeight - 40);

  // Test text rendering
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px Arial';
  ctx.fillText('Test: Text should be visible', bodyX, bodyY + 50);

  // Summary stats - adjust positioning
  const statsY = bodyY + 80; // Increased spacing
  
  // Rank box
  ctx.fillStyle = '#ff4d4d';
  ctx.fillRect(bodyX, statsY, 220, 40);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(bodyX, statsY, 220, 40);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`RANK ${stat_sheet.rank || 'N/A'}`, bodyX + 110, statsY + 28);

  // Points box
  ctx.fillStyle = '#8a63d2';
  ctx.fillRect(bodyX + 240, statsY, 220, 40);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(bodyX + 240, statsY, 220, 40);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${stat_sheet.total_score || 0} AURA POINTS`, bodyX + 350, statsY + 28);

  // Detailed stats - adjust positioning and spacing
  const detailedStatsY = statsY + 100; // Increased spacing
  const statHeight = 40; // Reduced height
  const statGap = 15; // Reduced gap
  
  const stats = [
    { name: 'name', percentage: stat_sheet.stats?.name?.percentage || 0, tier: stat_sheet.stats?.name?.tier || 'F' },
    { name: 'bio', percentage: stat_sheet.stats?.bio?.percentage || 0, tier: stat_sheet.stats?.bio?.tier || 'F' },
    { name: 'follow ratio', percentage: stat_sheet.stats?.follow_ratio?.percentage || 0, tier: stat_sheet.stats?.follow_ratio?.tier || 'F' },
    { name: 'algo pull', percentage: stat_sheet.stats?.algo_pull?.percentage || 0, tier: stat_sheet.stats?.algo_pull?.tier || 'F' }
  ];

  stats.forEach((stat, index) => {
    const y = detailedStatsY + (statHeight + statGap) * index;
    
    // Stat name
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(stat.name, bodyX, y);
    
    // Stat tier
    ctx.fillStyle = '#ff4d4d';
    ctx.fillRect(bodyX + cardWidth - 120, y - 15, 60, 30);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(bodyX + cardWidth - 120, y - 15, 60, 30);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(stat.tier, bodyX + cardWidth - 90, y + 8);
    
    // Stat bar
    const barY = y + 15;
    const barWidth = cardWidth - 80;
    ctx.fillStyle = '#333333';
    ctx.fillRect(bodyX, barY, barWidth, 25);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(bodyX, barY, barWidth, 25);
    
    const progressWidth = (barWidth * stat.percentage) / 100;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bodyX, barY, progressWidth, 25);
    
    ctx.fillStyle = '#ad95d8';
    ctx.font = '13px "Courier New", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${stat.percentage}%`, bodyX + barWidth - 10, barY + 18);
  });

  // Overall aura - adjust positioning
  const overallY = detailedStatsY + (statHeight + statGap) * 4 + 40;
  ctx.fillStyle = '#ffffff';
  ctx.font = '18px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('overall you have', width / 2, overallY);
  
  ctx.fillStyle = '#ff4d4d';
  ctx.fillRect(width / 2 - 100, overallY + 15, 200, 40);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(width / 2 - 100, overallY + 15, 200, 40);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(stat_sheet.overall_aura || 'N/A', width / 2, overallY + 43);

  // Footer - adjust positioning
  const footerY = height - 80;
  ctx.fillStyle = '#a0a0a0';
  ctx.font = '14px monospace';
  ctx.textAlign = 'center';
  
  const footerText = "auraster by dxfareed";
  const footerTextWidth = ctx.measureText(footerText).width;
  const footerTextX = (width / 2) + 15;

  try {
    const author_url_pfp = "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/8fbbe5e2-0c53-48b8-c5f1-4a791b76ce00/rectcrop3";
    const authorPfp = await loadImage(author_url_pfp);
    const authorPfpSize = 20;
    const authorPfpX = footerTextX - (footerTextWidth / 2) - authorPfpSize - 5;
    ctx.drawImage(authorPfp, authorPfpX, footerY - 15, authorPfpSize, authorPfpSize);
  } catch(error) {
    console.warn("Failed to load author PFP, continuing without it:", error);
  }

  ctx.fillText(footerText, footerTextX, footerY);

  try {
  return canvas.toDataURL('image/png', 0.9);
  } catch (error) {
    console.warn('Canvas export failed, trying without external images:', error);
    
    // Fallback: simpler version without external images
    const fallbackCanvas = document.createElement('canvas');
    const fallbackCtx = fallbackCanvas.getContext('2d');
    
    if (!fallbackCtx) {
      throw new Error('Could not get canvas context for fallback');
    }
    
    fallbackCanvas.width = width;
    fallbackCanvas.height = height;
    
    // Background
    fallbackCtx.fillStyle = '#000000';
    fallbackCtx.fillRect(0, 0, width, height);
    
    // Card border
    fallbackCtx.strokeStyle = '#ff4d4d';
    fallbackCtx.lineWidth = 4;
    fallbackCtx.strokeRect(cardX, cardY, cardWidth, cardHeight);
    
    // Simple text content with stats
    fallbackCtx.fillStyle = '#ffffff';
    fallbackCtx.font = 'bold 24px Arial, sans-serif';
    fallbackCtx.textAlign = 'center';
    fallbackCtx.fillText(`Auraster - @${profile_data.username}`, width / 2, height / 2 - 40);
    
    fallbackCtx.fillStyle = '#ff4d4d';
    fallbackCtx.font = 'bold 48px Arial, sans-serif';
    fallbackCtx.fillText(calculateTier(stat_sheet.total_score || 0), width / 2, height / 2);
    
    fallbackCtx.fillStyle = '#ffffff';
    fallbackCtx.font = '16px Arial, sans-serif';
    fallbackCtx.fillText(`Score: ${stat_sheet.total_score || 0} | Rank: ${stat_sheet.rank || 'N/A'}`, width / 2, height / 2 + 40);
    
    fallbackCtx.fillStyle = '#a0a0a0';
    fallbackCtx.font = '14px Arial, sans-serif';
    fallbackCtx.fillText('Check your aura at Auraster!', width / 2, height / 2 + 80);
    
    return fallbackCanvas.toDataURL('image/png', 0.9);
  }
} 