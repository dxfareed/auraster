
export interface NeynarProfile {
  pfp_url: string;
  username: string;
  display_name: string;
}

export interface StatDetails {
  score: number;
  tier: string;
  percentage: number;
}

export interface StatSheet {
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

export interface ApiResponse {
  stat_sheet: StatSheet;
  profile_data: NeynarProfile;
}
