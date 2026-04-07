import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /**
   * Dev-only: Segment Explorer wraps layouts in `SegmentViewNode` from next-devtools.
   * That reference can fail RSC serialization ("not in the React Client Manifest"),
   * especially on Windows — a known Next bundler edge case. Disabling removes the
   * dev-only wrappers; production is unaffected.
   */
  experimental: {
    devtoolSegmentExplorer: false,
  },
};

export default nextConfig;
