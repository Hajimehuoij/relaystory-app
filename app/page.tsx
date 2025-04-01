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
  const touchStartX = useRef<number>(0);

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

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const toggleLike = (id: number): void => {
    setStories((prev) =>
      prev.map((story) =>
        story.id === id ? { ...story, liked: !story.liked } : story
      )
    );
  };

  const acceptPostingRight = (): void => {
    setHasPostingRight(true);
    setShowNotification(false);
    setPage("post");
  };

  const handleTouchStart = (e: React.TouchEvent): void => {
    touchStartX.current = e.touches?.[0]?.clientX ?? 0;
  };

  const handleTouchEnd = (e: React.TouchEvent): void => {
    const deltaX = (e.changedTouches?.[0]?.clientX ?? 0) - touchStartX.current;
    if (deltaX > 100) {
      setPage("profile");
    } else if (deltaX < -100) {
      setPage("home");
    }
    touchStartX.current = 0;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCapturedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async (): Promise<void> => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  };

  const captureFromCamera = (): void => {
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

  const handleSubmitPost = (): void => {
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

  const handlePassOn = (): void => {
    const target = selectedFollower || dummyFollowers[Math.floor(Math.random() * dummyFollowers.length)];
    alert(`バトンを @${target} に渡しました！🎉`);
    setSelectedFollower("");
    setShowPassOn(false);
    setTimeout(() => {
      setHasPostingRight(true);
      setShowNotification(true);
    }, 3000);
  };

  return ( ... JSX は省略 ... );
}
