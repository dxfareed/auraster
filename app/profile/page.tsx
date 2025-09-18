"use client";

import { Leaderboard } from '../components/Leaderboard';
import { ProfileCard } from '../components/profile-card/profile-ui';
import { useMiniKit } from "@coinbase/onchainkit/minikit";


export default function ProfilePage() {

  const { context } = useMiniKit();

  return (
    <div className="responsive-container py-2 sm:py-3 safe-area-top safe-area-bottom">
        <ProfileCard usernameToRate={context?.user.username || "dxfareed"}/>
       {/*  <ProfileCard usernameToRate="dxfareed"/> */}
        <Leaderboard/>
    </div>
  );
}


// #f62525

// #8a63d2