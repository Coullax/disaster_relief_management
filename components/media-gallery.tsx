"use client"

import { ImageIcon, Play } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

interface MediaGalleryProps {
    mediaUrls: string[]
}

export default function MediaGallery({ mediaUrls }: MediaGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0)

    if (!mediaUrls || mediaUrls.length === 0) return null

    const selectedUrl = mediaUrls[selectedIndex]
    const isSelectedVideo = selectedUrl.match(/\.(mp4|webm|ogg|mov)$/i)

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-orange-100 p-2.5">
                    <ImageIcon className="h-5 w-5 text-orange-600" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Media Gallery</h2>
            </div>

            <div className="space-y-4">
                {/* Main image/video */}
                <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-muted">
                    {isSelectedVideo ? (
                        <video
                            src={selectedUrl}
                            controls
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <Image
                            src={selectedUrl}
                            alt={`Listing media ${selectedIndex + 1}`}
                            fill
                            className="object-cover"
                            priority
                        />
                    )}
                </div>

                {/* Thumbnail grid */}
                {mediaUrls.length > 1 && (
                    <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
                        {mediaUrls.map((url, index) => {
                            const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/i)
                            return (
                                <button
                                    key={index}
                                    onClick={() => setSelectedIndex(index)}
                                    className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${selectedIndex === index
                                            ? "border-orange-500 ring-2 ring-orange-500/20"
                                            : "border-border hover:border-orange-500/50"
                                        }`}
                                >
                                    {isVideo ? (
                                        <div className="w-full h-full bg-black/10 flex items-center justify-center">
                                            <Play className="w-6 h-6 text-white/80" />
                                        </div>
                                    ) : (
                                        <Image
                                            src={url}
                                            alt={`Thumbnail ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>
        </section>
    )
}
