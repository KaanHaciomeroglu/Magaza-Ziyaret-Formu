import { useState, useRef, useEffect, useCallback } from 'react';

const SIZE = 280; // canvas output size

export function ImageCropModal({ open, src, onConfirm, onCancel }) {
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);
  const imgRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, SIZE, SIZE);

    // Clip circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
    ctx.clip();

    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx.drawImage(img, SIZE / 2 - w / 2 + offset.x, SIZE / 2 - h / 2 + offset.y, w, h);
    ctx.restore();

    // Circle border
    ctx.strokeStyle = 'rgba(251,83,115,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 1, 0, Math.PI * 2);
    ctx.stroke();
  }, [scale, offset]);

  useEffect(() => {
    if (!src || !open) return;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      // Auto-fit
      const fitScale = Math.min(1, Math.max(SIZE / img.naturalWidth, SIZE / img.naturalHeight));
      setScale(fitScale);
      setOffset({ x: 0, y: 0 });
    };
    img.src = src;
  }, [src, open]);

  useEffect(() => { draw(); }, [draw]);

  const onMouseDown = (e) => {
    setDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };
  const onMouseMove = (e) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };
  const onMouseUp = () => setDragging(false);

  const onTouchStart = (e) => {
    const t = e.touches[0];
    setDragging(true);
    dragStart.current = { x: t.clientX - offset.x, y: t.clientY - offset.y };
  };
  const onTouchMove = (e) => {
    if (!dragging) return;
    const t = e.touches[0];
    setOffset({ x: t.clientX - dragStart.current.x, y: t.clientY - dragStart.current.y });
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onConfirm(canvas.toDataURL('image/jpeg', 0.85));
  };

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(25,28,30,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: 'white', borderRadius: '1.5rem', padding: 24,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        width: '100%', maxWidth: 360,
      }}>
        <p style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 18, color: 'var(--color-on-surface)', alignSelf: 'flex-start' }}>
          Fotoğrafı Ayarla
        </p>
        <p style={{ fontSize: 12, color: 'var(--color-muted)', alignSelf: 'flex-start', marginTop: -8 }}>
          Sürükleyerek konumlandırın, kaydırıcı ile yakınlaştırın.
        </p>

        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          style={{ borderRadius: '50%', cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none', maxWidth: '100%' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onMouseUp}
        />

        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>🔍</span>
          <input
            type="range" min={0.1} max={1} step={0.01}
            value={scale}
            onChange={e => setScale(Number(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--color-primary)' }}
          />
          <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>{Math.round(scale * 100)}%</span>
        </div>

        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '10px', borderRadius: '0.75rem', border: '1px solid rgba(225,190,192,0.4)',
            background: 'transparent', color: 'var(--color-on-surface)', fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}>İptal</button>
          <button onClick={handleConfirm} style={{
            flex: 1, padding: '10px', borderRadius: '0.75rem', border: 'none',
            background: 'var(--color-primary)', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}>Kaydet</button>
        </div>
      </div>
    </div>
  );
}
