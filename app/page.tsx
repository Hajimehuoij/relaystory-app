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

type Story = {
  id: number;
  user: string;
  imageUrl: string;
  liked: boolean;
};

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
    <div className="min-h-screen bg-gray-100 p-4" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <nav className="flex justify-between items-center mb-4">
        <button onClick={() => setPage("home")} className="text-lg font-bold">🏠 ホーム</button>
        <span className="text-xl font-bold">RelayStory</span>
        <button onClick={() => setPage("profile")} className="text-lg font-bold">👤 プロフィール</button>
      </nav>

      {showNotification && (
        <div className="mb-4 p-3 bg-yellow-200 rounded text-center">
          バトンが届きました！受け取りますか？
          <Button className="ml-2" onClick={acceptPostingRight}>受け取る</Button>
        </div>
      )}

      {hasPostingRight && (
        <div className="mb-4 text-center text-sm text-gray-600">
          投稿可能時間：{formatTime(batonTimer)}
        </div>
      )}

      {page === "home" && (
        <div className="space-y-4">
          {stories.map((story) => (
            <Card key={story.id}>
              <CardContent className="p-4">
                <p className="text-sm text-gray-700">@{story.user} のストーリー</p>
                {story.imageUrl && (
                  <img src={story.imageUrl} alt="Story image" className="w-full h-auto my-2 rounded" />
                )}
                <Button variant="outline" onClick={() => toggleLike(story.id)}>
                  {story.liked ? "❤️ いいね済み" : "🤍 いいねする"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {page === "post" && (
        <div className="space-y-4 text-center">
          <p className="text-sm text-gray-600">画像を選ぶか、カメラを使って投稿しましょう。</p>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} />
          <Button onClick={startCamera}>カメラ起動</Button>
          <video ref={videoRef} autoPlay playsInline className="mx-auto my-2 w-full max-w-xs rounded" />
          <Button onClick={captureFromCamera}>📸 写真を撮る</Button>
          {capturedImage && (
            <div>
              <img src={capturedImage} alt="Captured" className="w-full h-auto my-2 rounded" />
              <Button onClick={handleSubmitPost}>✅ 投稿する</Button>
            </div>
          )}
        </div>
      )}

      {page === "profile" && (
        <div className="text-center text-gray-600">
          <p>プロフィールページ（仮）</p>
        </div>
      )}

      {showPassOn && (
        <div className="mt-6 p-4 bg-blue-100 rounded text-center">
          <p>誰にバトンを渡しますか？</p>
          <select value={selectedFollower} onChange={(e) => setSelectedFollower(e.target.value)} className="my-2 p-2 rounded">
            <option value="">ランダムに選ぶ</option>
            {dummyFollowers.map((f) => (
              <option key={f} value={f}>@{f}</option>
            ))}
          </select>
          <Button onClick={handlePassOn}>バトンを渡す</Button>
        </div>
      )}
    </div>
  );
}
