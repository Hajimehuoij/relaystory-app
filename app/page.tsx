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
  },
];

const dummyFollowers = ["sakura_chan", "kenta_92", "miki_love", "johnny_rocket", "aya_777"];
const dummyStats = { batons: 3, followers: 128, following: 87 };

type Story = {
  id: number;
  user: string;
  imageUrl: string;
  liked: boolean;
  timestamp: string;
  comments: string[];
  tag: string;
};

function timeAgo(timestamp: string): string {
  const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (diff < 60) return `${diff}秒前に投稿`;
  if (diff < 3600) return `${Math.floor(diff / 60)}分前に投稿`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}時間前に投稿`;
  return `${Math.floor(diff / 86400)}日前に投稿`;
}

function AnimatedStoryCard({ story, toggleLike }: { story: Story; toggleLike: (id: number) => void }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -50px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, ease: "easeOut" }}
      key={story.id}
    >
      <Card className="rounded-2xl shadow-md overflow-hidden bg-white">
        <CardContent className="p-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-gray-800">@{story.user}</p>
              <p className="text-xs text-gray-500">{timeAgo(story.timestamp)}</p>
            </div>
            {story.tag && (
              <span className="ml-auto text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">
                {story.tag}
              </span>
            )}
          </div>
          {story.imageUrl && (
            <div className="relative w-full aspect-[9/16] rounded-xl overflow-hidden">
              <img src={story.imageUrl} alt="Story" className="absolute inset-0 w-full h-full object-cover" />
            </div>
          )}
          <div className="pt-3 flex items-center space-x-2">
            <motion.button
              whileTap={{ scale: 1.4 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              onClick={() => toggleLike(story.id)}
              className="text-xl"
            >
              {story.liked ? "❤️" : "🤍"}
            </motion.button>
            <span className="text-sm text-gray-600">{story.liked ? 1 : 0} いいね</span>
          </div>
          {story.comments.length > 0 && (
            <div className="mt-2 text-sm text-gray-700">
              {story.comments.slice(0, 2).map((comment, idx) => (
                <p key={idx}>💬 {comment}</p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function RelayStoryMockup() {
  const [page, setPage] = useState("home");
  const [hasPostingRight, setHasPostingRight] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [stories, setStories] = useState<Story[]>(() => [...dummyStories]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [batonTimer, setBatonTimer] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const touchStartX = useRef(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
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

  const toggleLike = (id: number) => {
    setStories((prev) => prev.map((story) => story.id === id ? { ...story, liked: !story.liked } : story));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches?.[0]?.clientX ?? 0;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = (e.changedTouches?.[0]?.clientX ?? 0) - touchStartX.current;
    if (deltaX > 100) setPage("profile");
    else if (deltaX < -100) setPage("home");
    touchStartX.current = 0;
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
    if (stream) stream.getTracks().forEach((track) => track.stop());
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setCapturedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmitPost = () => {
    if (!capturedImage) return;
    const newStory: Story = {
      id: stories.length + 1,
      user: "you_123",
      imageUrl: capturedImage,
      liked: false,
      timestamp: new Date().toISOString(),
      comments: [],
      tag: ""
    };
    setStories([newStory, ...stories]);
    setCapturedImage(null);
    setPage("home");
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-[#f7f6f3] px-4 pt-6 pb-32 space-y-6" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <nav className="flex justify-between items-center mb-6 px-1">
        <button onClick={() => setPage("home")} className="text-base font-semibold">🏠 ホーム</button>
        <span className="text-xl font-bold tracking-wide">RelayStory</span>
        <button onClick={() => setPage("profile")} className="text-base font-semibold">👤 プロフィール</button>
      </nav>

      {hasPostingRight && page === "home" && (
        <Button
          onClick={() => setPage("post")}
          className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white rounded-full shadow-lg px-6 py-3 text-lg"
        >
          ＋投稿
        </Button>
      )}

      {hasPostingRight && (
        <p className="mb-4 text-center text-xs text-gray-500">
          投稿可能時間：{formatTime(batonTimer)}
        </p>
      )}

      {page === "home" && (
        <div className="space-y-6">
          {stories.map((story) => (
            <AnimatedStoryCard key={story.id} story={story} toggleLike={toggleLike} />
          ))}
        </div>
      )}

      {page === "post" && (
        <div className="space-y-4 bg-white p-4 rounded-xl shadow">
          {capturedImage ? (
            <div className="relative w-full aspect-[9/16] bg-gray-100 rounded-xl overflow-hidden">
              <img src={capturedImage} alt="preview" className="w-full h-full object-cover" />
              <Button onClick={() => setCapturedImage(null)} className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">やり直し</Button>
            </div>
          ) : (
            <div className="relative w-full aspect-[9/16] bg-gray-200 rounded-xl flex items-center justify-center">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover rounded-xl" />
              <span className="absolute text-gray-500">カメラプレビュー</span>
            </div>
          )}
          <div className="flex justify-around">
            <Button onClick={startCamera}>📹 カメラON</Button>
            <Button onClick={captureFromCamera} disabled={!videoRef.current}>📷 撮影</Button>
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>📁 選択</Button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
          </div>
          <Button className="w-full bg-blue-600 text-white" onClick={handleSubmitPost} disabled={!capturedImage}>投稿する</Button>
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