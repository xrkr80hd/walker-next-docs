"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface SignaturePadProps {
  onKeep: (dataUrl: string) => void;
  onCancel: () => void;
  initialValue?: string;
  label?: string;
}

export function SignaturePad({ onKeep, onCancel, initialValue, label }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasStrokes, setHasStrokes] = useState(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const getCtx = useCallback(() => canvasRef.current?.getContext("2d") ?? null, []);

  const getPoint = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }, []);

  useEffect(() => {
    const ctx = getCtx();
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (initialValue) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = initialValue;
      setHasStrokes(true);
    }
  }, [getCtx, initialValue]);

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    setDrawing(true);
    lastPoint.current = getPoint(e);
  }

  function moveDraw(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing) return;
    e.preventDefault();
    const ctx = getCtx();
    const pt = getPoint(e);
    if (!ctx || !pt || !lastPoint.current) return;
    ctx.strokeStyle = "#171717";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
    lastPoint.current = pt;
    setHasStrokes(true);
  }

  function endDraw() {
    setDrawing(false);
    lastPoint.current = null;
  }

  function clearCanvas() {
    const ctx = getCtx();
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    setHasStrokes(false);
  }

  function keepSignature() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onKeep(canvas.toDataURL("image/png"));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg border border-[var(--border)] bg-white p-5 shadow-[0_20px_44px_rgba(0,0,0,0.24)]">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
          {label || "Sign Below"}
        </p>
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          className="w-full cursor-crosshair touch-none border border-[var(--border)]"
          style={{ aspectRatio: "3/1" }}
          onMouseDown={startDraw}
          onMouseMove={moveDraw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={moveDraw}
          onTouchEnd={endDraw}
        />
        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-10 border border-[var(--foreground)] bg-white px-4 text-sm font-bold text-[var(--foreground)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={clearCanvas}
            className="min-h-10 border border-[var(--foreground)] bg-white px-4 text-sm font-bold text-[var(--foreground)]"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={keepSignature}
            disabled={!hasStrokes}
            className="min-h-10 border border-[var(--accent)] bg-[var(--accent)] px-4 text-sm font-bold text-white disabled:opacity-40"
          >
            Keep
          </button>
        </div>
      </div>
    </div>
  );
}
