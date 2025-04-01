// ここからRelayStoryMockup.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const dummyStories = [
  {
    id: 1,
    user: "haruka_01",
    imageUrl: "/story1.jpg",
    liked: false,
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3時間前
  },
  {
    id: 2,
    user: "yuto_kawaii",
    imageUrl: "/story2.jpg",
    liked: false,
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6時間前
  },
  {
    id: 3,
    user: "misa_123",
    imageUrl: "/story3.jpg",
    liked: false,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1日前
  },
];

const dummyFollowers = [
  "sakura_chan",
  "kenta_92",
  "miki_love",
  "johnny_rocket",
  "aya_777",
];

type Story = {
  id: number;
  user: string;
  imageUrl: string;
  liked: boolean;
  timestamp: string;
};

function timeAgo(timestamp: string): string {
  const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (diff < 60) return `${diff}秒前に投稿`;
  if (diff < 3600) return `${Math.floor(diff / 60)}分前に投稿`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}時間前に投稿`;
  return `${Math.floor(diff / 86400)}日前に投稿`;
}

export default function RelayStoryMockup() {
  const [page, setPage] = useState("home");
  const [hasPostingRight, setHasPostingRight] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [stories, setStories] = useState<Story[]>(() => [...dummyStories]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showPassOn, setShowPassOn] = useState(false);
  const [selectedFollower, setSelectedFollower] = useState("");
  const [batonTimer, setBatonTimer] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const touchStartX = useRef(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (hasPostingRight && batonTimer === 0) {
      setBatonTimer(24 * 60 * 60);
    }
    if (batonTimer > 0) {
      timer = setInterval(() => {
        setBatonTimer((prev) => {
          if (prev <= 1) {
            setHasPostingRight(false);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [hasPostingRight, batonTimer]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const toggleLike = (id: number) => {
    setStories((prev) =>
      prev.map((story) =>
        story.id === id ? { ...story, liked: !story.liked } : story
      )
    );
  };

  const acceptPostingRight = () => {
    setHasPostingRight(true);
    setShowNotification(false);
    setPage("post");
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches?.[0]?.clientX ?? 0;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = (e.changedTouches?.[0]?.clientX ?? 0) - touchStartX.current;
    if (deltaX > 100) {
      setPage("profile");
    } else if (deltaX < -100) {
      setPage("home");
    }
    touchStartX.current = 0;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCapturedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  };

  const captureFromCamera = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL("image/png");
    setCapturedImage(imageData);
    const stream = video.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const handleSubmitPost = () => {
    const newStory: Story = {
      id: stories.length + 1,
      user: "you_123",
      imageUrl: capturedImage as string,
      liked: false,
      timestamp: new Date().toISOString(),
    };
    setStories([newStory, ...stories]);
    setHasPostingRight(false);
    setCapturedImage(null);
    setShowPassOn(true);
    setPage("home");
  };

  const handlePassOn = () => {
    const target = selectedFollower || dummyFollowers[Math.floor(Math.random() * dummyFollowers.length)];
    alert(`バトンを @${target} に渡しました！🎉`);
    setSelectedFollower("");
    setShowPassOn(false);
    setTimeout(() => {
      setHasPostingRight(true);
      setShowNotification(true);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#f7f6f3] px-4 py-6" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <nav className="flex justify-between items-center mb-6 px-1">
        <button onClick={() => setPage("home")} className="text-base font-semibold">🏠 ホーム</button>
        <span className="text-xl font-bold tracking-wide">RelayStory</span>
        <button onClick={() => setPage("profile")} className="text-base font-semibold">👤 プロフィール</button>
      </nav>

      {showNotification && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded text-center shadow">
          バトンが届きました！受け取りますか？
          <Button className="ml-2" onClick={acceptPostingRight}>受け取る</Button>
        </motion.div>
      )}

      {hasPostingRight && (
        <p className="mb-4 text-center text-xs text-gray-500">
          投稿可能時間：{formatTime(batonTimer)}
        </p>
      )}

      {page === "home" && (
        <div className="space-y-6">
          {stories.map((story) => (
            <motion.div key={story.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <Card className="rounded-2xl shadow-md overflow-hidden bg-white">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">@{story.user}</p>
                      <p className="text-xs text-gray-500">{timeAgo(story.timestamp)}</p>
                    </div>
                  </div>
                  {story.imageUrl && (
                    <div className="relative w-full aspect-[9/16] rounded-xl overflow-hidden">
                      <img src={story.imageUrl} alt="Story" className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="pt-3">
                    <Button variant="ghost" onClick={() => toggleLike(story.id)}>
                      {story.liked ? "❤️ いいね済み" : "🤍 いいねする"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
