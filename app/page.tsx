"use client";
// ここからRelayStoryMockup.tsx
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
  },
  {
    id: 2,
    user: "yuto_kawaii",
    imageUrl: "/story2.jpg",
    liked: false,
  },
  {
    id: 3,
    user: "misa_123",
    imageUrl: "/story3.jpg",
    liked: false,
  },
];

const dummyFollowers = [
  "sakura_chan",
  "kenta_92",
  "miki_love",
  "johnny_rocket",
  "aya_777",
];

export default function RelayStoryMockup() {
  const [page, setPage] = useState("home");
  const [hasPostingRight, setHasPostingRight] = useState(false);
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
    if (touchStartX.current === null) return;
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
    canvas.getContext("2d").drawImage(video, 0, 0);
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
    <div
      className="p-4 max-w-sm mx-auto space-y-6 bg-gradient-to-b from-white to-gray-100 min-h-screen"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" onClick={() => setPage("home")} className="text-base">
          🏠 ホーム
        </Button>
        <h1 className="text-xl font-bold text-gray-800">RelayStory</h1>
        <Button variant="ghost" onClick={() => setPage("profile")} className="text-base">
          👤 プロフィール
        </Button>
      </div>

      {hasPostingRight && batonTimer > 0 && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-indigo-600 font-medium"
        >
          ⏳ 投稿権保持中：{formatTime(batonTimer)}
        </motion.p>
      )}

      {showPassOn && (
        <Card className="text-center bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-indigo-600">🚀 バトンを渡そう！</h2>
            <p className="text-sm text-gray-600">誰にバトンを渡す？</p>
            <select
              value={selectedFollower}
              onChange={(e) => setSelectedFollower(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">選択してください</option>
              {dummyFollowers.map((follower) => (
                <option key={follower} value={follower}>
                  @{follower}
                </option>
              ))}
            </select>
            <Button onClick={handlePassOn} className="w-full" disabled={!selectedFollower}>
              🎯 バトンを渡す
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {stories.map((story) => (
          <Card key={story.id} className="bg-white/80 backdrop-blur-lg rounded-xl shadow">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500 mb-2 font-medium">@{story.user} のストーリー</p>
              <div className="w-full h-60 relative rounded-xl overflow-hidden mb-4">
                <Image
                  src={story.imageUrl}
                  alt="story image"
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <Button
                variant={story.liked ? "default" : "outline"}
                onClick={() => toggleLike(story.id)}
                className="w-full font-semibold"
              >
                {story.liked ? "💖 いいね済み" : "🤍 いいねする"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
