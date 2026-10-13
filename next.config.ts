import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return ["/home-media-v2/:path*", "/project-media-v1/:path*", "/zhong-lanyard-card-v2.glb"].map(source => ({
      source,
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    }));
  },
};

export default nextConfig;
