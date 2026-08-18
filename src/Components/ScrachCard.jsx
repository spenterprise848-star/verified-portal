import React, { useRef, useEffect, useState } from "react";
import confetti from "canvas-confetti";

const ScratchCard = ({
  coverImage,
  revealThreshold = 55,
  brushSize = 28,
  onComplete,
  children,
}) => {
  const width = 310;
  const height = 300;

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // 🎨 Setup canvas (HD support)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const ratio = window.devicePixelRatio || 1;

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.scale(ratio, ratio);

    ctxRef.current = ctx;

    if (coverImage) {
      const img = new Image();
      img.src = coverImage;
      img.onload = () => {
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(img, 0, 0, width, height);
      };
    } else {
      ctx.fillStyle = "#C0C0C0";
      ctx.fillRect(0, 0, width, height);
    }
  }, [coverImage]);

  // 📍 Get cursor position
  const getXY = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();

    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // ✏️ Scratch
  const scratch = (x, y) => {
    const ctx = ctxRef.current;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();

    checkReveal();
  };

  // 📊 Check reveal %
  const checkReveal = () => {
    if (isComplete) return;

    const ctx = ctxRef.current;

    const pixels = ctx.getImageData(0, 0, width, height).data;

    let transparent = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++;
    }

    const percent = (transparent / (pixels.length / 4)) * 100;

    if (percent > revealThreshold) {
      setIsComplete(true);
      ctx.clearRect(0, 0, width, height);

      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });

      onComplete && onComplete(percent);
    }
  };

  const handleMove = (e) => {
    if (!isDrawing || isComplete) return;
    const { x, y } = getXY(e);
    scratch(x, y);
  };

  return (
    <div
      className="relative  overflow-hidden shadow-lg select-none"
      style={{ width: 310, height: 300 }}
    >
      {/* 🎁 Hidden reward */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-2xl font-bold">
        {children}
      </div>

      {/* 🪙 Scratch layer */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0"
        onMouseDown={() => setIsDrawing(true)}
        onMouseUp={() => setIsDrawing(false)}
        onMouseLeave={() => setIsDrawing(false)}
        onMouseMove={handleMove}
        onTouchStart={() => setIsDrawing(true)}
        onTouchEnd={() => setIsDrawing(false)}
        onTouchMove={handleMove}
      />
    </div>
  );
};

export default ScratchCard;
