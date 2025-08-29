import { Leaderboard } from '../components/Leaderboard';
import { ProfileCard } from '../components/profile-card';

export default function ProfilePage() {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-3">
        <ProfileCard usernameToRate="coconutrinds"/>
        <Leaderboard/>
    </div>
  );
}


// #f62525

// #8a63d2