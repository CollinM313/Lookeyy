"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TourRequestModal } from "@/components/tour-request-modal";
import { Play } from "lucide-react";

export type FeaturedVideo = {
  youtubeId: string;
  title: string;
  address: string;
  city: string;
  state: string;
  description: string;
};

export function VideoTourSection({ videos }: { videos: FeaturedVideo[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const video = videos[activeIndex];

  function handleSwitch(i: number) {
    setActiveIndex(i);
    setPlaying(false);
  }

  return (
    <section className="bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-center">
          {/* Video */}
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-black shadow-2xl">
            {playing ? (
              <iframe
                src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                className="h-full w-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title={video.title}
              />
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                  alt={video.title}
                  className="h-full w-full object-cover opacity-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button
                  onClick={() => setPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center"
                  aria-label="Play tour video"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/95 shadow-2xl transition-transform hover:scale-110">
                    <Play className="h-8 w-8 translate-x-0.5 text-zinc-900" fill="currentColor" />
                  </div>
                </button>
                <div className="absolute bottom-4 left-4 text-sm font-medium text-white/80">
                  {video.city}, {video.state}
                </div>
              </>
            )}
          </div>

          {/* CTA Panel */}
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                Featured Home Tour
              </span>
              <h1 className="mt-2 text-3xl font-bold leading-tight lg:text-4xl">
                {video.title}
              </h1>
              <p className="mt-3 text-zinc-400 leading-relaxed">{video.description}</p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                className="w-full"
                onClick={() => setModalOpen(true)}
              >
                Request a Live Tour
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white"
                onClick={() => setModalOpen(true)}
              >
                Get a Recorded Tour
              </Button>
            </div>

            <p className="text-xs text-zinc-500">
              Free for 7 days &middot; Then $12.99/month &middot; Cancel anytime
            </p>

            {/* Thumbnail switcher (shows when multiple videos) */}
            {videos.length > 1 && (
              <div className="flex gap-2 pt-2">
                {videos.map((v, i) => (
                  <button
                    key={v.youtubeId}
                    onClick={() => handleSwitch(i)}
                    className={`relative h-16 w-24 overflow-hidden rounded-lg border-2 transition-all ${
                      i === activeIndex ? "border-primary" : "border-white/20 opacity-60 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`}
                      alt={v.title}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <TourRequestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        propertyAddress={`${video.address}, ${video.city}, ${video.state}`}
      />
    </section>
  );
}
