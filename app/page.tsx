// ここからRelayStoryMockup.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

const dummyStories = [
  {
    id: 1,
    user: "haruka_01",
    imageUrl: "/story1.jpg",
    liked: false,
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    comments: ["最高！", "いい感じ"],
    tag: "🔥人気"
  },
  {
    id: 2,
    user: "yuto_kawaii",
    imageUrl: "/story2.jpg",
    liked: false,
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    comments: [],
    tag: ""
  },
  {
    id: 3,
    user: "misa_123",
    imageUrl: "/story3.jpg",
    liked: false,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    comments: ["素敵！"],
    tag: ""
  }
];

const dummyFollowers = [
  "sakura_chan",
  "kenta_92",
  "miki_love",
  "johnny_rocket",
  "aya_777"
];

const dummyStats = {
  batons: 3,
  followers: 128,
  following: 87
};

export default function RelayStoryMockup() {
  const [page, setPage] = useState("home");
  const [hasPostingRight, setHasPostingRight] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [stories, setStories] = useState(() => [...dummyStories]);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showPassOn, setShowPassOn] = useState(false);
  const [selectedFollower, setSelectedFollower] = useState("");
  const [batonTimer, setBatonTimer] = useState(0);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const touchStartX = useRef(0);

  useEffect(() => {
    let timer;
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

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const toggleLike = (id) => {
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

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches?.[0]?.clientX ?? 0;
  };

  const handleTouchEnd = (e) => {
    const deltaX = (e.changedTouches?.[0]?.clientX ?? 0) - touchStartX.current;
    if (deltaX > 100) {
      setPage("profile");
    } else if (deltaX < -100) {
      setPage("home");
    }
    touchStartX.current = 0;
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCapturedImage(reader.result);
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
    const stream = video.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const handleSubmitPost = () => {
    const newStory = {
      id: stories.length + 1,
      user: "you_123",
      imageUrl: capturedImage,
      liked: false,
      timestamp: new Date().toISOString(),
      comments: [],
      tag: ""
    };
    setStories([newStory, ...stories]);
    setHasPostingRight(false);
    setCapturedImage(null);
    setShowPassOn(true);
    setPage("home");
  };

  return (
    <div className="min-h-screen bg-[#f7f6f3] px-4 py-6 space-y-6" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <nav className="flex justify-between items-center mb-6 px-1 relative">
        <button onClick={() => setPage("home")} className="text-base font-semibold">🏠 ホーム</button>
        <span className="text-xl font-bold tracking-wide">RelayStory</span>
        <div className="flex items-center space-x-2">
          <button onClick={() => setPage("profile")} className="text-base font-semibold">👤 プロフィール</button>
          {hasPostingRight && page === "home" && (
            <Button
              onClick={() => setPage("post")}
              className="text-sm bg-blue-600 text-white rounded-full px-4 py-1 shadow"
            >
              ＋投稿
            </Button>
          )}
        </div>
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
            <div key={story.id} className="rounded-2xl shadow-md overflow-hidden bg-white">
              <CardContent className="p-3">
                <p className="text-sm font-medium">@{story.user}</p>
                <p className="text-xs text-gray-500">{story.timestamp}</p>
                <div className="relative w-full aspect-[9/16] rounded-xl overflow-hidden">
                  <img src={story.imageUrl} className="absolute inset-0 w-full h-full object-cover" />
                </div>
                <div className="pt-3 flex items-center space-x-2">
                  <motion.button whileTap={{ scale: 1.4 }} transition={{ type: "spring", stiffness: 400, damping: 10 }} onClick={() => toggleLike(story.id)} className="text-xl">
                    {story.liked ? "❤️" : "🤍"}
                  </motion.button>
                  <span className="text-sm text-gray-600">{story.liked ? 1 : 0} いいね</span>
                </div>
              </CardContent>
            </div>
          ))}
        </div>
      )}
      {page === "post" && (
        <div className="flex flex-col items-center space-y-4">
          <video ref={videoRef} autoPlay playsInline className="w-full aspect-[9/16] bg-black rounded-xl" />
          <div className="flex space-x-2">
            <Button onClick={startCamera}>カメラ起動</Button>
            <Button onClick={captureFromCamera}>撮影</Button>
            <Button onClick={() => fileInputRef.current?.click()}>画像選択</Button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          </div>
          {capturedImage && <img src={capturedImage} alt="preview" className="w-full aspect-[9/16] rounded-xl" />}
          <Button onClick={handleSubmitPost} disabled={!capturedImage} className="bg-green-600 text-white w-full py-2 rounded-xl">
            投稿する
          </Button>
        </div>
      )}
      {page === "profile" && (
        <div className="bg-white p-4 rounded-xl shadow space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm">所持バトン数: {dummyStats.batons}</p>
            <p className="text-sm">フォロワー: {dummyStats.followers}</p>
            <p className="text-sm">フォロー中: {dummyStats.following}</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {stories.map((story) => (
              <div key={story.id} className="w-full aspect-[9/16] bg-gray-200 rounded-md overflow-hidden">
                <img src={story.imageUrl} alt="投稿" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
