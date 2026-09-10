import { AnimatedBackground } from './AnimatedBackground';

// Backward-compatible wrapper around AnimatedBackground
export function BlobBackground({ opacity = 0.5 }) {
  return <AnimatedBackground variant="blobs" opacity={opacity} />;
}

export default BlobBackground;
