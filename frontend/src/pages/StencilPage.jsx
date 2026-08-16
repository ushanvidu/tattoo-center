import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import Reveal from '../components/shared/Reveal';
import Icons from '../components/shared/Icons';

/* ── Sample line-art generator ── */
function drawSample(type, size = 420) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const x = c.getContext('2d');
  x.fillStyle = '#f4f1ea'; x.fillRect(0, 0, size, size);
  x.strokeStyle = '#15110d'; x.lineCap = 'round'; x.lineJoin = 'round';
  const cx = size / 2, cy = size / 2;
  if (type === 'rose') {
    x.lineWidth = size * 0.012;
    for (let k = 0; k < 6; k++) {
      const a = k * Math.PI / 3;
      x.beginPath();
      for (let t = 0; t <= 1; t += 0.04) {
        const r = size * 0.34 * Math.sin(t * Math.PI);
        const ang = a + (t - 0.5) * 1.1;
        const px = cx + Math.cos(ang) * r, py = cy + Math.sin(ang) * r;
        t === 0 ? x.moveTo(px, py) : x.lineTo(px, py);
      }
      x.stroke();
    }
    for (let r = size * 0.06; r < size * 0.2; r += size * 0.05) { x.beginPath(); x.arc(cx, cy, r, 0, 7); x.stroke(); }
    x.lineWidth = size * 0.018; x.beginPath(); x.moveTo(cx, cy + size * 0.18); x.quadraticCurveTo(cx + size * 0.12, cy + size * 0.34, cx, cy + size * 0.46); x.stroke();
  } else if (type === 'geo') {
    x.lineWidth = size * 0.01;
    for (let k = 0; k < 3; k++) {
      const r = size * (0.12 + k * 0.1); x.beginPath();
      for (let i = 0; i <= 6; i++) { const a = i * Math.PI / 3 + k * 0.4; i === 0 ? x.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
      x.stroke();
    }
    x.beginPath();
    x.moveTo(cx, cy - size * 0.32); x.lineTo(cx, cy + size * 0.32);
    x.moveTo(cx - size * 0.28, cy - size * 0.16); x.lineTo(cx + size * 0.28, cy + size * 0.16);
    x.moveTo(cx - size * 0.28, cy + size * 0.16); x.lineTo(cx + size * 0.28, cy - size * 0.16);
    x.stroke();
    x.lineWidth = size * 0.02; x.beginPath(); x.arc(cx, cy, size * 0.06, 0, 7); x.stroke();
  } else {
    x.fillStyle = '#15110d'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = `700 ${size * 0.32}px 'Oswald', sans-serif`;
    x.fillText('INK', cx, cy - size * 0.04);
    x.lineWidth = size * 0.012; x.strokeStyle = '#15110d';
    x.beginPath(); x.moveTo(cx - size * 0.3, cy + size * 0.16); x.bezierCurveTo(cx - size * 0.1, cy + size * 0.26, cx + size * 0.1, cy + size * 0.06, cx + size * 0.3, cy + size * 0.16); x.stroke();
    x.beginPath(); x.arc(cx - size * 0.34, cy - size * 0.2, size * 0.03, 0, 7); x.stroke();
    x.beginPath(); x.arc(cx + size * 0.34, cy - size * 0.2, size * 0.03, 0, 7); x.stroke();
  }
  return c;
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

const SKIN = { arm: '#c89a7e', forearm: '#cda386', back: '#bb8c70', leg: '#c69779' };

// Cut-out reference photos (transparent background, cropped tight to the limb).
// Any body part without a photo falls back to the illustrated shape below.
const BODY_IMG_SRC = {
  arm:     '/stencil-body/arm.png',
  forearm: '/stencil-body/forearm.png',
  back:    '/stencil-body/back.png',
  leg:     '/stencil-body/leg.png',
};

// Where the design sits on each body part, and how wide it is at 100% size.
// Both are normalised against the drawn limb, so placement holds at any
// preview size. `span` is the design's width as a fraction of the limb's width.
const BODY_PLACEMENT = {
  arm:     { anchor: [0.62, 0.58], span: 0.30 },
  forearm: { anchor: [0.60, 0.50], span: 0.28 },
  back:    { anchor: [0.50, 0.66], span: 0.46 },
  leg:     { anchor: [0.30, 0.24], span: 0.40 },
};

// The placement stage is a fixed 4:3 canvas so the limb always renders at a
// sensible size — previously it inherited the uploaded design's dimensions,
// which left the body tiny and the design covering the entire frame.
const STAGE_W = 900, STAGE_H = 675;

function SampleThumb({ type }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const src = drawSample(type, 120);
    c.width = 120; c.height = 120;
    c.getContext('2d').drawImage(src, 0, 0);
  }, [type]);
  return <canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

export function StencilTool({ compact = false }) {
  const store = useStore();
  const [params, setParams] = useState({ darkness: 62, thickness: 2, mirror: false, size: 100 });
  const [place,  setPlace]  = useState('forearm');
  const [over,   setOver]   = useState(false);
  const [active, setActive] = useState('rose');
  const [imgVersion, setImgVersion] = useState(0);
  const work     = useRef(null);
  const origRef  = useRef(null);
  const stenRef  = useRef(null);
  const bodyRef  = useRef(null);
  const fileRef  = useRef(null);
  const bodyImgs = useRef({});
  const [bodyPhotosReady, setBodyPhotosReady] = useState(0);

  // Try loading real body-part photos once; each one that succeeds triggers a
  // re-render so the preview upgrades from the illustrated fallback automatically.
  useEffect(() => {
    Object.entries(BODY_IMG_SRC).forEach(([key, src]) => {
      const img = new Image();
      img.onload  = () => { bodyImgs.current[key] = img; setBodyPhotosReady(v => v + 1); };
      img.onerror = () => {}; // no photo supplied yet for this body part — fallback stays in use
      img.src = src;
    });
  }, []);

  const ingest = useCallback((srcCanvasOrImg) => {
    const MAX = 560;
    const iw = srcCanvasOrImg.width  || srcCanvasOrImg.naturalWidth;
    const ih = srcCanvasOrImg.height || srcCanvasOrImg.naturalHeight;
    const sc = Math.min(1, MAX / Math.max(iw, ih));
    const w = Math.round(iw * sc), h = Math.round(ih * sc);
    const tmp = document.createElement('canvas'); tmp.width = w; tmp.height = h;
    const tx = tmp.getContext('2d'); tx.drawImage(srcCanvasOrImg, 0, 0, w, h);
    const img = tx.getImageData(0, 0, w, h).data;
    const gray0 = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) gray0[i] = 0.299 * img[i*4] + 0.587 * img[i*4+1] + 0.114 * img[i*4+2];
    // Light 3x3 box blur before edge detection — smooths JPEG/photo noise so the
    // stencil comes out as clean lines instead of a speckled mess.
    const gray = new Float32Array(w * h);
    for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) {
      let sum = 0, n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const ny = y + dy, nx = xx + dx;
        if (ny >= 0 && ny < h && nx >= 0 && nx < w) { sum += gray0[ny*w+nx]; n++; }
      }
      gray[y*w+xx] = sum / n;
    }
    const mag = new Float32Array(w * h); let max = 1;
    for (let y = 1; y < h - 1; y++) for (let xx = 1; xx < w - 1; xx++) {
      const o = y * w + xx;
      const gx = -gray[o-w-1] - 2*gray[o-1] - gray[o+w-1] + gray[o-w+1] + 2*gray[o+1] + gray[o+w+1];
      const gy = -gray[o-w-1] - 2*gray[o-w] - gray[o-w+1] + gray[o+w-1] + 2*gray[o+w] + gray[o+w+1];
      const m = Math.sqrt(gx*gx + gy*gy); mag[o] = m; if (m > max) max = m;
    }
    for (let i = 0; i < mag.length; i++) mag[i] = mag[i] / max * 255;
    work.current = { w, h, mag, orig: tmp };
    setImgVersion(v => v + 1);
  }, []);

  useEffect(() => { ingest(drawSample('rose')); }, [ingest]);

  const buildLines = useCallback(() => {
    const wk = work.current; if (!wk) return null;
    const { w, h, mag } = wk;
    const thr = 150 - params.darkness * 1.15;
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const cx = c.getContext('2d');
    const id = cx.createImageData(w, h); const d = id.data;
    for (let i = 0; i < w * h; i++) {
      if (mag[i] > thr) { const a = Math.min(255, 90 + (mag[i] - thr) * 1.8); d[i*4]=92; d[i*4+1]=46; d[i*4+2]=140; d[i*4+3]=a; }
    }
    cx.putImageData(id, 0, 0);
    return c;
  }, [params.darkness]);

  const renderAll = useCallback(() => {
    const wk = work.current; if (!wk) return;
    const { w, h, orig } = wk;
    const lines = buildLines();
    const r = params.thickness - 1;
    const offsets = []; for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (dx*dx+dy*dy <= r*r) offsets.push([dx, dy]);
    const drawThick = (ctx) => { if (!lines) return; offsets.forEach(([dx,dy]) => ctx.drawImage(lines, dx, dy)); };
    const oc = origRef.current; if (oc) { oc.width=w; oc.height=h; const ox=oc.getContext('2d'); ox.clearRect(0,0,w,h); ox.drawImage(orig,0,0); }
    const sc = stenRef.current; if (sc) {
      sc.width=w; sc.height=h; const sx=sc.getContext('2d');
      sx.fillStyle='#efe9f7'; sx.fillRect(0,0,w,h);
      sx.save(); if (params.mirror) { sx.translate(w,0); sx.scale(-1,1); } drawThick(sx); sx.restore();
    }
    const bc = bodyRef.current; if (bc) {
      bc.width = STAGE_W; bc.height = STAGE_H;
      const bx = bc.getContext('2d');
      bx.clearRect(0, 0, STAGE_W, STAGE_H);
      const photo = bodyImgs.current[place];
      const cfg = BODY_PLACEMENT[place] || { anchor: [0.5, 0.5], span: 0.32 };

      // Where the limb (real photo or illustrated stand-in) lands on the stage.
      let px, py, pw, ph;
      if (photo) {
        const fit = Math.min(STAGE_W / photo.width, STAGE_H / photo.height) * 0.94;
        pw = photo.width * fit; ph = photo.height * fit;
      } else {
        const vertical = place !== 'back';
        ph = STAGE_H * 0.94;
        pw = vertical ? ph * 0.34 : ph * 0.92;
      }
      px = (STAGE_W - pw) / 2; py = (STAGE_H - ph) / 2;

      if (photo) {
        bx.drawImage(photo, px, py, pw, ph);
      } else {
        const sk = SKIN[place] || '#c89a7e';
        bx.save(); bx.beginPath();
        bx.roundRect(px, py, pw, ph, place === 'back' ? 26 : pw * 0.5);
        bx.clip();
        const g = bx.createLinearGradient(px, 0, px + pw, 0);
        g.addColorStop(0, shade(sk, -24)); g.addColorStop(.42, shade(sk, 12)); g.addColorStop(1, shade(sk, -30));
        bx.fillStyle = g; bx.fillRect(px, py, pw, ph);
        bx.restore();
      }

      // Size the design against the limb rather than the canvas, so it reads
      // like a real tattoo instead of covering the whole frame.
      const tw = pw * cfg.span * (params.size / 100);
      const th = tw * (h / w);
      const tx = px + pw * cfg.anchor[0] - tw / 2;
      const ty = py + ph * cfg.anchor[1] - th / 2;

      if (lines) {
        // Build the ink on its own layer so it can be masked to the skin —
        // otherwise a large design floats off the edge of the arm.
        const layer = document.createElement('canvas');
        layer.width = STAGE_W; layer.height = STAGE_H;
        const lx = layer.getContext('2d');
        lx.save();
        if (params.mirror) { lx.translate(tx + tw / 2, 0); lx.scale(-1, 1); lx.translate(-(tx + tw / 2), 0); }
        offsets.forEach(([dx, dy]) => lx.drawImage(lines, tx + dx, ty + dy, tw, th));
        lx.restore();
        lx.globalCompositeOperation = 'destination-in';
        if (photo) {
          lx.drawImage(photo, px, py, pw, ph);
        } else {
          lx.beginPath();
          lx.roundRect(px, py, pw, ph, place === 'back' ? 26 : pw * 0.5);
          lx.fill();
        }
        bx.save();
        bx.globalAlpha = 0.9;
        bx.globalCompositeOperation = 'multiply';
        bx.drawImage(layer, 0, 0);
        bx.restore();
      }
    }
  }, [buildLines, params.thickness, params.mirror, params.size, place, bodyPhotosReady]);

  useEffect(() => { if (imgVersion > 0) renderAll(); }, [imgVersion, params, place, renderAll]);

  const onFile = (file) => {
    if (!file) return;
    const fr = new FileReader();
    fr.onload = () => { const im = new Image(); im.onload = () => ingest(im); im.src = fr.result; };
    fr.readAsDataURL(file);
  };

  const set = (k, v) => setParams(p => ({ ...p, [k]: v }));

  return (
    <div className="sten">
      {/* LEFT: controls */}
      <div className="sten-panel">
        <div
          className={`drop ${over ? 'over' : ''}`}
          onClick={() => fileRef.current.click()}
          onDragOver={e => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={e => { e.preventDefault(); setOver(false); onFile(e.dataTransfer.files[0]); }}
        >
          <div className="ring"><Icons.upload /></div>
          <div style={{ fontFamily: 'var(--f-disp)', fontWeight: 600, textTransform: 'uppercase', fontSize: 15 }}>Drop your design</div>
          <div className="text-dim" style={{ fontSize: 12, marginTop: 4 }}>PNG · JPG · SVG — or click to browse</div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => onFile(e.target.files[0])} />
        </div>

        <div className="text-dim" style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', fontFamily: 'var(--f-mono)', marginTop: 16, marginBottom: 2 }}>Or try a sample</div>
        <div className="samples">
          {['rose','geo','script'].map(t => (
            <div key={t} className={`samp ${active === t ? 'on' : ''}`} onClick={() => { setActive(t); ingest(drawSample(t)); }}>
              <SampleThumb type={t} />
            </div>
          ))}
        </div>

        <div className="ctrl">
          <label>Stencil darkness <b>{params.darkness}%</b></label>
          <input type="range" min="10" max="100" value={params.darkness} onChange={e => set('darkness', +e.target.value)} />
        </div>
        <div className="ctrl">
          <label>Line thickness <b>{params.thickness}px</b></label>
          <input type="range" min="1" max="4" value={params.thickness} onChange={e => set('thickness', +e.target.value)} />
        </div>
        <div className="ctrl">
          <label>Tattoo size on body <b>{params.size}%</b></label>
          <input type="range" min="40" max="200" step="5" value={params.size} onChange={e => set('size', +e.target.value)} />
        </div>
        <div className="toggle">
          <div className="flex ac gap12">
            <Icons.mirror style={{ color: 'var(--acc)' }} />
            <span style={{ fontFamily: 'var(--f-disp)', fontWeight: 600, textTransform: 'uppercase', fontSize: 14 }}>Mirror stencil</span>
          </div>
          <div className={`sw ${params.mirror ? 'on' : ''}`} onClick={() => set('mirror', !params.mirror)} />
        </div>
      </div>

      {/* RIGHT: output */}
      <div>
        <div className="stage-grid" style={{ marginBottom: 16 }}>
          <div className="canvas-card"><span className="cc-label">Original Artwork</span><canvas ref={origRef} /></div>
          <div className="canvas-card"><span className="cc-label" style={{ color: '#7c5cff', borderColor: 'rgba(124,92,255,.4)' }}>Stencil Output</span><canvas ref={stenRef} /></div>
        </div>
        <div className="sten-panel">
          <div className="flex jb ac wrap-flex gap12" style={{ marginBottom: 14 }}>
            <span className="eyebrow no-line">On-body placement preview</span>
            <div className="body-tabs">
              {['arm','forearm','back','leg'].map(b => (
                <button key={b} className={`chip ${place === b ? 'chip-acc' : ''}`} style={{ cursor: 'pointer', textTransform: 'capitalize' }} onClick={() => setPlace(b)}>{b}</button>
              ))}
            </div>
          </div>
          <div className="placement">
            <canvas ref={bodyRef} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          {!compact && (
            <div className="flex gap8 wrap-flex" style={{ marginTop: 16 }}>
              <Link to="/shop/printers" className="btn btn-acc" style={{ flex: '1 1 auto' }}><Icons.printer /> Shop Stencil Printers</Link>
              <button className="btn btn-ghost" onClick={() => store.openBooking()}><Icons.cal /> Book Live Demo</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function StencilSection({ compact = false }) {
  const s = useStore();
  return (
    <section className="section" id="stencil" style={{ position: 'relative' }}>
      <div className="wrap">
        <Reveal className="section-head" style={{ alignItems: 'center', textAlign: 'center' }}>
          <span className="eyebrow">Signature Tool · Live in-browser</span>
          <h2 className="h1">Preview Your Stencil<br />Before You Print</h2>
          <p className="lede" style={{ marginInline: 'auto' }}>Upload any tattoo design and watch it convert to a print-ready stencil in real time — adjust darkness, line weight and mirror, then preview it placed on the body.</p>
        </Reveal>
        <Reveal>
          <StencilTool compact={compact} />
        </Reveal>
      </div>
    </section>
  );
}

export default function StencilPage() {
  const s = useStore();
  return (
    <div style={{ paddingTop: 'var(--nav-h)' }}>
      <StencilSection />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="card card-pad grain" style={{ position: 'relative', textAlign: 'center', padding: 'clamp(34px,5vw,60px)', background: 'radial-gradient(80% 130% at 50% 0%, rgba(0,224,198,.10), var(--card) 60%)' }}>
            <span className="eyebrow no-line" style={{ justifyContent: 'center' }}>Ready to print?</span>
            <h2 className="h1" style={{ margin: '14px 0 14px' }}>Print This Stencil on a Pro Printer</h2>
            <p className="lede" style={{ marginInline: 'auto' }}>Wireless thermal printers that turn your preview into a crisp, smudge-proof transfer in seconds.</p>
            <div className="flex gap12 jc wrap-flex" style={{ marginTop: 24 }}>
              <Link to="/shop/printers" className="btn btn-acc btn-lg"><Icons.printer /> Shop Stencil Printers</Link>
              <button className="btn btn-ghost btn-lg" onClick={() => s.openBooking()}><Icons.cal /> Book a Live Demo</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
