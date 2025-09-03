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
  
  // Load fonts
  await Promise.all([
    loadFont('Bangers', '/fonts/bangers.ttf'),
    loadFont('VT323', '/fonts/vt323.ttf')
  ]);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  const width = 800;
  const height = 1000; // Increased height for better spacing
  canvas.width = width;
  canvas.height = height;

  // Background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  const { stat_sheet, profile_data } = apiData;
  
  if (!stat_sheet || !profile_data) {
    console.error('Missing required data:', { stat_sheet, profile_data });
    throw new Error('Missing required data for image generation');
  }

  // Card border with enhanced styling
  const cardX = 20;
  const cardY = 20;
  const cardWidth = width - 40;
  const cardHeight = height - 40;
  
  // Enhanced shadow effect
  ctx.shadowColor = 'rgba(255, 77, 77, 0.8)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  ctx.strokeStyle = '#ff4d4d';
  ctx.lineWidth = 4;
  ctx.strokeRect(cardX, cardY, cardWidth, cardHeight);
  
  // Reset shadow for other elements
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Banner - using 3:1 ratio like Twitter
  const bannerHeight = Math.round(cardWidth / 3); // 3:1 aspect ratio
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
    const gradient = ctx.createLinearGradient(cardX, cardY, cardX, cardY + bannerHeight);
    gradient.addColorStop(0, isProUser ? '#8a63d2' : '#333333');
    gradient.addColorStop(1, isProUser ? '#ff4d4d' : '#666666');
    ctx.fillStyle = gradient;
    ctx.fillRect(cardX, cardY, cardWidth, bannerHeight);
  }
  
  ctx.strokeStyle = '#ff4d4d';
  ctx.lineWidth = 2;
  ctx.strokeRect(cardX, cardY, cardWidth, bannerHeight);

  // Header logo - positioned at top left
  ctx.save();
  ctx.translate(cardX + 20, cardY + 20);
  ctx.rotate(-5 * Math.PI / 180);

  // Shadow for "AURASTER"
  ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;

  // "AURASTER" text - top left positioning
  ctx.font = '60px Bangers'; // Slightly smaller for top left
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.strokeText('AURASTER', 0, 0);
  ctx.fillStyle = '#ff4d4d';
  ctx.fillText('AURASTER', 0, 0);

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // "THE AURA DOCTOR" subtitle - commented out
  // ctx.fillStyle = '#000000';
  // ctx.font = '16px "Courier New", monospace';
  // ctx.fillText('THE AURA DOCTOR', 0, 70);

  ctx.restore();

  // Total grade sticker - pushed by 20px
  const gradeSize = 100;
  const gradeX = cardX + cardWidth - 60; // Pushed 20px to the left
  const gradeY = cardY + Math.round(bannerHeight / 1.1);
  
  ctx.save();
  ctx.translate(gradeX, gradeY);
  ctx.rotate(10 * Math.PI / 180);
  
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, gradeSize / 2, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.stroke();
  
  ctx.fillStyle = 'red';
  ctx.font = '50px Bangers';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(calculateTier(stat_sheet.total_score), 0, 5);
  
  ctx.fillStyle = '#000000';
  ctx.font = '18px VT323';
  ctx.fillText('TOTAL', 0, 35);
  ctx.restore();

  // Card body - better spacing with increased height
  const bodyX = cardX + 30;
  const bodyY = cardY + bannerHeight + 40; // More space after banner

  // Analysis header
  ctx.fillStyle = '#ffffff';
  ctx.font = '22px monospace';
  ctx.textAlign = 'center';
  
  const pfpUrl = profile_data.pfp_url;
  const pfpSize = 32;
  const text = `aura analysis for @${profile_data.username}`;
  const textWidth = ctx.measureText(text).width;
  const textX = (width / 2);

  try {
    const pfpImg = await loadImage(pfpUrl);
    const pfpX = textX - (textWidth / 2) - pfpSize - 10;
    
    // Draw round PFP using clipping
    ctx.save();
    ctx.beginPath();
    ctx.arc(pfpX + pfpSize / 2, bodyY + pfpSize / 2, pfpSize / 2, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(pfpImg, pfpX, bodyY, pfpSize, pfpSize);
    ctx.restore();
  } catch (error) {
    console.warn("Failed to load PFP, continuing without it:", error);
  }
  
  ctx.fillText(text, textX, bodyY + pfpSize / 2 + 5);

    // Summary stats with enhanced styling
  const statsY = bodyY + 60;
  const statBoxWidth = (cardWidth - 80) / 2;
  const statBoxHeight = 50;
  
  // Rank box with gradient and shadow
  const rankGradient = ctx.createLinearGradient(bodyX, statsY, bodyX, statsY + statBoxHeight);
  rankGradient.addColorStop(0, '#ff4d4d');
  rankGradient.addColorStop(1, '#e63939');
  
  ctx.fillStyle = rankGradient;
  ctx.fillRect(bodyX, statsY, statBoxWidth, statBoxHeight);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(bodyX, statsY, statBoxWidth, statBoxHeight);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px VT323';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`RANK ${stat_sheet.rank || 'N/A'}`, bodyX + statBoxWidth / 2, statsY + statBoxHeight / 2);

  // Points box with gradient and shadow
  const pointsX = bodyX + statBoxWidth + 20;
  const pointsGradient = ctx.createLinearGradient(pointsX, statsY, pointsX, statsY + statBoxHeight);
  pointsGradient.addColorStop(0, '#8a63d2');
  pointsGradient.addColorStop(1, '#7a53c2');
  
  ctx.fillStyle = pointsGradient;
  ctx.fillRect(pointsX, statsY, statBoxWidth, statBoxHeight);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(pointsX, statsY, statBoxWidth, statBoxHeight);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px VT323';
  ctx.textAlign = 'center';
  ctx.fillText(`${stat_sheet.total_score || 0} AURA PTS`, pointsX + statBoxWidth / 2, statsY + statBoxHeight / 2);

  // Detailed stats - better spacing with increased height
  const detailedStatsY = statsY + statBoxHeight + 50; // More space after summary stats
  const statHeight = 70; // Taller stat rows
  const statGap = 25; // More gap between stats
  
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
    ctx.font = '20px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(stat.name, bodyX, y);
    
    // Stat bar with enhanced styling
    const barY = y + 30;
    const barWidth = cardWidth - 60;
    const barHeight = 30;
    
    // Stat tier - positioned exactly at end of progress bar
    ctx.font = 'bold 24px VT323';
    const tierText = stat.tier;
    const tierTextWidth = ctx.measureText(tierText).width;
    const tierBoxPadding = 30; // Padding for breathing room
    const tierBoxWidth = Math.max(tierTextWidth + tierBoxPadding, 100);
    const tierBoxHeight = 35;
    const tierX = bodyX + barWidth - tierBoxWidth; // Align with end of progress bar
    
    ctx.fillStyle = '#ff4d4d';
    ctx.fillRect(tierX, y - 5, tierBoxWidth, tierBoxHeight);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(tierX, y - 5, tierBoxWidth, tierBoxHeight);
    
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tierText, tierX + tierBoxWidth / 2, y - 5 + tierBoxHeight / 2);
    
    // Background bar with subtle gradient
    const barBgGradient = ctx.createLinearGradient(bodyX, barY, bodyX, barY + barHeight);
    barBgGradient.addColorStop(0, '#2a2a2a');
    barBgGradient.addColorStop(1, '#1a1a1a');
    
    ctx.fillStyle = barBgGradient;
    ctx.fillRect(bodyX, barY, barWidth, barHeight);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(bodyX, barY, barWidth, barHeight);
    
    // Progress bar with gradient
    const progressWidth = (barWidth * stat.percentage) / 100;
    const progressGradient = ctx.createLinearGradient(bodyX, barY, bodyX, barY + barHeight);
    progressGradient.addColorStop(0, '#ffffff');
    progressGradient.addColorStop(1, '#f0f0f0');
    
    ctx.fillStyle = progressGradient;
    ctx.fillRect(bodyX, barY, progressWidth, barHeight);
    
    // Percentage text with better styling
    ctx.fillStyle = '#ad95d8';
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${stat.percentage}%`, bodyX + barWidth - 10, barY + barHeight / 2);
  });

  // Overall aura - on same line
  const overallY = detailedStatsY + (statHeight + statGap) * 4 - 10;
  
  // Text and box on same line
  ctx.fillStyle = '#ffffff';
  ctx.font = '22px monospace';
  ctx.textAlign = 'right';
  ctx.fillText('overall you have', width / 2 - 20, overallY + 35);
  
  // Calculate dynamic width for overall aura box - bigger and more visible
  ctx.font = 'bold 32px VT323'; // Larger font
  const overallText = stat_sheet.overall_aura || 'N/A';
  const overallTextWidth = ctx.measureText(overallText).width;
  const overallBoxPadding = 60; // More padding for bigger box
  const overallBoxWidth = Math.max(overallTextWidth + overallBoxPadding, 270); // Increased minimum width
  const overallBoxHeight = 60; // Taller box
  
  // Enhanced overall aura box with gradient and shadow
  const overallBoxX = width / 2 + 20;
  const overallBoxY = overallY + 10;
  
  // Add subtle shadow effect
  ctx.shadowColor = 'rgba(255, 77, 77, 0.5)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 5;
  
  // Create gradient for the box
  const overallGradient = ctx.createLinearGradient(overallBoxX, overallBoxY, overallBoxX, overallBoxY + overallBoxHeight);
  overallGradient.addColorStop(0, '#ff4d4d');
  overallGradient.addColorStop(1, '#e63939');
  
  ctx.fillStyle = overallGradient;
  ctx.fillRect(overallBoxX, overallBoxY, overallBoxWidth, overallBoxHeight);
  
  // Reset shadow for border
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3; // Thicker border
  ctx.strokeRect(overallBoxX, overallBoxY, overallBoxWidth, overallBoxHeight);
  
  // Text with better positioning
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(overallText, overallBoxX + overallBoxWidth / 2, overallBoxY + overallBoxHeight / 2);

  // Footer with enhanced styling and positioning
  const footerY = height - 60; // Perfect spacing from bottom
  ctx.fillStyle = '#ffffff'; // Brighter white for better visibility
  ctx.font = 'bold 20px monospace'; // Larger, bold font
  ctx.textAlign = 'center';
  
  const footerText = "auraster by dxfareed";
  const footerTextWidth = ctx.measureText(footerText).width;
  const footerTextX = (width / 2) + 15;

  try {
    const author_url_pfp = "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/8fbbe5e2-0c53-48b8-c5f1-4a791b76ce00/rectcrop3";
    const authorPfp = await loadImage(author_url_pfp);
    const authorPfpSize = 28; // Slightly larger PFP
    const authorPfpX = footerTextX - (footerTextWidth / 2) - authorPfpSize - 12; // Better spacing
    
    // Draw round PFP using clipping with subtle border
    ctx.save();
    ctx.beginPath();
    ctx.arc(authorPfpX + authorPfpSize / 2, footerY - 20 + authorPfpSize / 2, authorPfpSize / 2, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(authorPfp, authorPfpX, footerY - 20, authorPfpSize, authorPfpSize);
    ctx.restore();
    
    // Add subtle white border around PFP
    ctx.save();
    ctx.beginPath();
    ctx.arc(authorPfpX + authorPfpSize / 2, footerY - 20 + authorPfpSize / 2, authorPfpSize / 2 + 1, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  } catch(error) {
    console.warn("Failed to load author PFP, continuing without it:", error);
  }

  // Draw footer text
  ctx.fillText(footerText, footerTextX, footerY);

  try {
    return canvas.toDataURL('image/png', 0.95);
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
    fallbackCtx.font = 'bold 36px Arial, sans-serif';
    fallbackCtx.textAlign = 'center';
    fallbackCtx.fillText(`Auraster - @${profile_data.username}`, width / 2, height / 2 - 60);
    
    fallbackCtx.fillStyle = '#ff4d4d';
    fallbackCtx.font = 'bold 72px Arial, sans-serif';
    fallbackCtx.fillText(calculateTier(stat_sheet.total_score || 0), width / 2, height / 2);
    
    fallbackCtx.fillStyle = '#ffffff';
    fallbackCtx.font = '24px Arial, sans-serif';
    fallbackCtx.fillText(`Score: ${stat_sheet.total_score || 0} | Rank: ${stat_sheet.rank || 'N/A'}`, width / 2, height / 2 + 60);
    
    fallbackCtx.fillStyle = '#a0a0a0';
    fallbackCtx.font = '20px Arial, sans-serif';
    fallbackCtx.fillText('Check your aura at Auraster!', width / 2, height / 2 + 120);
    
    return fallbackCanvas.toDataURL('image/png', 0.9);
  }
} 