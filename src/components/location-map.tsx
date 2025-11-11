"use client";

import React from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';

interface LocationMapProps {
  lat: number;
  lng: number;
}

export function LocationMap({ lat, lng }: LocationMapProps) {
  const position = { lat, lng };

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="rounded-lg border bg-muted p-4 text-center text-muted-foreground">
        Google Maps API key is not configured.
      </div>
    );
  }

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <div style={{ height: '200px', width: '100%' }} className="rounded-lg overflow-hidden border">
        <Map
          defaultCenter={position}
          defaultZoom={14}
          mapId="e7f33c3a96b3a45c"
          gestureHandling={'greedy'}
          disableDefaultUI={true}
        >
          <AdvancedMarker position={position} />
        </Map>
      </div>
    </APIProvider>
  );
}
