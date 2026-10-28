"use client";

import { useState, type CSSProperties } from "react";
import Image from "../../components/ProjectImage";
import styles from "./stussy-apparel.module.css";

const mediaRoot = "/project-media-v1/aigc/stussy-city-waves/apparel-v1";
const colors = [
  { id: "white", name: "白色", hex: "#ffffff" },
  { id: "purple", name: "紫色", hex: "#8341c9" },
  { id: "blue", name: "蓝色", hex: "#0057a5" },
] as const;
type ColorId = (typeof colors)[number]["id"];

// Isolate the purple ink so its color can change independently of the fabric.
const inkMatrices = {
  white: "0 -0.397059 1.397059 0 0  0 -0.397059 1.397059 0 0  0 -0.397059 1.397059 0 0  0 0 0 1 0",
  blue: "1 0.963235 -0.963235 0 0  0 0.838235 0.161765 0 0  0 0.264706 0.735294 0 0  0 0 0 1 0",
};

export default function StussyApparel() {
  const [color, setColor] = useState<ColorId>("purple");
  const selectedColor = colors.find((option) => option.id === color)!;

  return (
    <section
      id="stussy-apparel"
      className={styles.section}
      aria-label="Stüssy 城市浪潮，第 7 页：服装印花与城市图案配色"
    >
      <svg className={styles.filterDefinitions} width="0" height="0" aria-hidden="true" focusable="false">
        <defs>
          {Object.entries(inkMatrices).map(([id, matrix]) => (
            <filter key={id} id={"stussy-ink-" + id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
              <feColorMatrix
                in="SourceGraphic"
                type="matrix"
                values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  4 -4 0 0 -0.12"
                result="purpleMask"
              />
              <feComponentTransfer in="purpleMask" result="inkMask">
                <feFuncA type="linear" slope="2" />
              </feComponentTransfer>
              <feColorMatrix in="SourceGraphic" type="matrix" values={matrix} result="recolored" />
              <feComposite in="recolored" in2="inkMask" operator="in" result="coloredInk" />
              {id === "white" && (
                <feComponentTransfer in="SourceGraphic" result="blackFabric">
                  {/* Retain the photograph's folds and lighting on the black fabric. */}
                  <feFuncR type="gamma" amplitude="0.24" exponent="2" offset="0" />
                  <feFuncG type="gamma" amplitude="0.24" exponent="2" offset="0" />
                  <feFuncB type="gamma" amplitude="0.24" exponent="2" offset="0" />
                </feComponentTransfer>
              )}
              <feComposite in={id === "white" ? "blackFabric" : "SourceGraphic"} in2="inkMask" operator="out" result="fabric" />
              <feComposite in="coloredInk" in2="fabric" operator="arithmetic" k2="1" k3="1" />
            </filter>
          ))}
        </defs>
      </svg>

      <div className={styles.sheet}>
        <div className={styles.stage}>
          <figure id="stussy-shirt" className={styles.garment} data-color={color}>
            <Image
              className={styles.shirt}
              src={mediaRoot + "/shanghai-shirt.webp"}
              alt={(color === "white" ? "黑色" : "白色") + " Stüssy T 恤，" + selectedColor.name + "上海城市印花"}
              style={{ filter: color === "purple" ? "none" : "url(#stussy-ink-" + color + ")" }}
              width={1086}
              height={1448}
              sizes="(max-width: 700px) 40vw, 35vw"
              draggable={false}
            />
          </figure>

          <div className={styles.swatches} role="group" aria-label="选择衣服印花与城市图案颜色">
            {colors.map((option) => (
              <button
                key={option.id}
                type="button"
                className={styles.swatch}
                style={{ "--swatch-color": option.hex } as CSSProperties}
                aria-label={option.name + "印花与城市图案"}
                aria-pressed={color === option.id}
                aria-controls="stussy-shirt stussy-city-graphics"
                title={option.name}
                onClick={() => setColor(option.id)}
              >
                <span aria-hidden="true" />
              </button>
            ))}
          </div>

          <div id="stussy-city-graphics" className={styles.cityGraphics}>
            {colors.map((option) => (
              <Image
                key={option.id}
                className={styles.citySheet}
                data-selected={color === option.id}
                src={mediaRoot + "/cities-" + option.id + ".webp"}
                alt={color === option.id ? option.name + "城市图案：上海、香港、杭州、北京、台北、成都" : ""}
                aria-hidden={color !== option.id}
                width={1280}
                height={1440}
                sizes="(max-width: 700px) 46vw, 50vw"
                draggable={false}
              />
            ))}
          </div>
        </div>
      </div>
      <span className={styles.srOnly} role="status">
        {color === "white" ? "黑色 T 恤，白色印花与城市图案" : "白色 T 恤，" + selectedColor.name + "印花与城市图案"}
      </span>
    </section>
  );
}
