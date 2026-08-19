"use client";

import React, { useState } from "react";

const ARPU = 45000;
const POOL = 0.65;

function fmt(n: number): string {
  if (n >= 1e9) {
    return "Rp " + (n / 1e9).toLocaleString("id-ID", { maximumFractionDigits: 2 }) + " M";
  }
  if (n >= 1e6) {
    return "Rp " + (n / 1e6).toLocaleString("id-ID", { maximumFractionDigits: 1 }) + " jt";
  }
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

function full(n: number): string {
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

export function RoyaltiCalculator() {
  const [subs, setSubs] = useState(100000);
  const [share, setShare] = useState(8);
  const [tier, setTier] = useState(0.5);

  const sh = share / 100;
  const gross = subs * ARPU;
  const pool = gross * POOL;
  const porsi = pool * sh;
  const royalty = porsi * tier;

  return (
    <div className="calc">
      <div className="calc-grid">
        <div className="calc-in">
          <div className="cinp">
            <div className="cinp-top">
              <label htmlFor="subs-slider">Total pelanggan berbayar BUKOO</label>
              <span className="val">{subs.toLocaleString("id-ID")}</span>
            </div>
            <input
              id="subs-slider"
              type="range"
              min={20000}
              max={1000000}
              step={10000}
              value={subs}
              onChange={(e) => setSubs(Number(e.target.value))}
            />
          </div>

          <div className="cinp">
            <div className="cinp-top">
              <label htmlFor="share-slider">Porsi pembacaan katalog Anda</label>
              <span className="val">{share}%</span>
            </div>
            <input
              id="share-slider"
              type="range"
              min={1}
              max={30}
              step={1}
              value={share}
              onChange={(e) => setShare(Number(e.target.value))}
            />
          </div>

          <div className="cinp">
            <div className="cinp-top">
              <label>Tier bagi hasil Anda</label>
              <span className="val">{Math.round(tier * 100)}%</span>
            </div>
            <div className="tbtns">
              <button
                type="button"
                className={`tbtn ${tier === 0.5 ? "on" : ""}`}
                onClick={() => setTier(0.5)}
              >
                50%
              </button>
              <button
                type="button"
                className={`tbtn ${tier === 0.55 ? "on" : ""}`}
                onClick={() => setTier(0.55)}
              >
                55%
              </button>
              <button
                type="button"
                className={`tbtn ${tier === 0.65 ? "on" : ""}`}
                onClick={() => setTier(0.65)}
              >
                65%
              </button>
            </div>
          </div>
        </div>

        <div className="calc-out">
          <div className="cout-l">Ilustrasi royalti / bulan</div>
          <div className="cout-big">{fmt(royalty)}</div>
          <div className="cout-sub">{full(royalty * 12)} per tahun (ilustrasi)</div>

          <div className="cbd">
            <div className="cbd-r">
              <span>Gross revenue platform</span>
              <span>{fmt(gross)} /bln</span>
            </div>
            <div className="cbd-r">
              <span>Revenue pool (65%)</span>
              <span>{fmt(pool)} /bln</span>
            </div>
            <div className="cbd-r">
              <span>Porsi katalog Anda</span>
              <span>{fmt(porsi)} /bln</span>
            </div>
            <div className="cbd-r tot">
              <span>&times; Tier &rarr; Royalti</span>
              <span>{fmt(royalty)} /bln</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
