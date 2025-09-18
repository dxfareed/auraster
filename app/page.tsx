"use client";

import {
  useMiniKit,
  useAddFrame,
  useOpenUrl,
} from "@coinbase/onchainkit/minikit";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "./components/DemoComponents";
import { Icon } from "./components/DemoComponents";
import { Leaderboard } from "./components/Leaderboard";
import { ProfileCard } from "./components/profile-card/profile-ui";
import { Search } from "./components/Search";

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const [isLeaderboardReady, setIsLeaderboardReady] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false);
  const [username, setUsername] = useState(context?.user.username || "to");

  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Add this useEffect to update username when context becomes available
  useEffect(() => {
    if (context?.user?.username) {
      setUsername(context.user.username);
    }
  }, [context?.user?.username]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaderboardReady(true);
      setTimeout(() => {
        setIsPageReady(true);
      }, 800);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  const handleHome = () => {
    setUsername(context?.user.username || "to");
  };

  const saveFrameButton = useMemo(() => {
    
      if (context && !context.client.added) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddFrame}
          className="text-[var(--app-accent)] p-2 sm:p-4"
          icon={<Icon name="plus" size="sm" />}
        >
          <span className="hidden sm:inline">Save Frame</span>
          <span className="sm:hidden">Save</span>
        </Button>
      );
    }

      if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-xs sm:text-sm font-medium text-[#0052FF] animate-fade-out">
          <Icon name="check" size="sm" className="text-[#0052FF]" />
          <span className="hidden sm:inline">Saved</span>
          <span className="sm:hidden">✓</span>
        </div>
      );
    }

    return null;
  }, [context, frameAdded, handleAddFrame]);

  return (
    <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)] safe-area-top safe-area-bottom">
      <div className="responsive-container py-2 sm:py-3">
        <main className="flex-1">
          {!isPageReady && (
            <div className="fixed inset-0 bg-[var(--app-background)] flex flex-col items-center justify-center z-50">
              {/* Logo Splash */}
              <div className={`text-center transition-all duration-1000 ease-out ${isLeaderboardReady ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}`}>
                <img 
                  src="/auraster-logo.png" 
                  alt="Auraster" 
                  className="w-60 h-58 mx-auto mb-6 animate-pulse-slow"
                />
                <p className="text-lg text-[var(--app-foreground-muted)]">
                  the aura doctor
                </p>
              </div>
            </div>
          )}

          {isPageReady && (
            <div className="animate-fade-in-up">
              {/* Save Frame Button */}
              <div className="flex justify-end mb-4">
                {saveFrameButton}
              </div>
              
              <div className="space-y-6">
                {/* Search */}
                <div className="auralized-card p-4">
                  <div className="flex items-center space-x-2">
                    <Search onSearch={setUsername} />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleHome}
                      className="text-[var(--app-accent)] p-2 sm:p-4"
                      icon={<Icon name="home" size="sm" />}
                    >
                      <span className="hidden sm:inline">Home</span>
                    </Button>
                  </div>
                </div>

                {/* Profile Card */}
                <ProfileCard usernameToRate={username} />
                
                {/* Leaderboard */}
                <Leaderboard />
              </div>
            </div>
          )}
        </main>

        <footer className="mt-2 sm:mt-2 pt-3 sm:pt-4 flex justify-center">
        { isLeaderboardReady && <Button
            variant="ghost"
            size="sm"
            className="text-[var(--ock-text-foreground-muted)] text-xs"
            onClick={() => openUrl("https://base.org/builders/minikit")}
          >
            <span className="sm:hidden">goo goo gaga with minikit</span>
          </Button>}
        </footer>
      </div>
    </div>
  );
}