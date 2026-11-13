import { PixelLoader } from '@/components/brand/PixelLoader';

export default function Loading() {
  return (
    <div className="flex min-h-[70dvh] items-center justify-center pt-24">
      <PixelLoader />
    </div>
  );
}
