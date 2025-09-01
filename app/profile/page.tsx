"use client";

import { Leaderboard } from '../components/Leaderboard';
import { ProfileCard } from '../components/profile-card/profile-ui';
import { useMiniKit } from "@coinbase/onchainkit/minikit";


export default function ProfilePage() {

  const { context } = useMiniKit();

  return (
    <div className="w-full max-w-md mx-auto px-4 py-3">
        <ProfileCard usernameToRate={context?.user.username || "tophb"}/>
       {/*  <ProfileCard usernameToRate="dxfareed"/> */}
        <Leaderboard/>
    </div>
  );
}


// #f62525

// #8a63d2