"use client";

import { useEffect, useRef, useState } from "react";

import maplibregl, { Map, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { fetchCoords } from "@/lib/geocode";
import { getRainviewer } from "@/lib/rainviewer";

import { useDataStore } from "@/stores/useDataStore";

import PlayControls from "@/components/ui/PlayControls";

import Timeline from "./map-timeline";

export function WeatherMap() {
	const meeting = useDataStore((state) => state.state?.SessionInfo?.Meeting);

	const [loading, setLoading] = useState<boolean>(true);

	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<Map>(null);

	const [playing, setPlaying] = useState<boolean>(false);

	const [frames, setFrames] = useState<{ id: number; time: number }[]>([]);
	const currentFrameRef = useRef<number>(0);
	const rainviewerDataRef = useRef<{ host: string; pathFrames: { path: string }[] } | null>(null);

	const LAYER_ID = "rainviewer-radar";
	const SOURCE_ID = "rainviewer-radar";

	const buildTileUrl = (host: string, path: string) => {
		const base = host.replace(/\/$/, "") + (path.startsWith("/") ? path : `/${path}`);
		return `${base}/256/{z}/{x}/{y}/2/1_0.png`;
	};

	const addRadarLayer = (map: Map, frameIdx: number) => {
		const data = rainviewerDataRef.current;
		if (!data || !data.pathFrames[frameIdx]) return;

		const tileUrl = buildTileUrl(data.host, data.pathFrames[frameIdx].path);
		map.addSource(SOURCE_ID, {
			type: "raster",
			tiles: [tileUrl],
			tileSize: 256,
			maxzoom: 7,
		});
		map.addLayer({
			id: LAYER_ID,
			type: "raster",
			source: SOURCE_ID,
			paint: {
				"raster-opacity": 0.8,
				"raster-fade-duration": 200,
				"raster-resampling": "nearest",
			},
		});
	};

	const removeRadarLayer = (map: Map) => {
		if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
		if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
	};

	const handleMapLoad = async () => {
		const map = mapRef.current;
		if (!map) return;

		removeRadarLayer(map);

		const rainviewer = await getRainviewer();
		if (!rainviewer || mapRef.current !== map) return;

		const pathFrames = [...rainviewer.radar.past, ...rainviewer.radar.nowcast];
		rainviewerDataRef.current = {
			host: rainviewer.host,
			pathFrames,
		};

		const lastFrameIdx = pathFrames.length - 1;
		currentFrameRef.current = lastFrameIdx;
		addRadarLayer(map, lastFrameIdx);

		setFrames(pathFrames.map((frame, i) => ({ time: frame.time, id: i })));
	};

	useEffect(() => {
		if (!mapContainerRef.current || !meeting) return;

		let libMap: Map | null = null;
		let cancelled = false;

		(async () => {
			const [coordsC, coordsA] = await Promise.all([
				fetchCoords(`${meeting.Country.Name}, ${meeting.Location} circuit`),
				fetchCoords(`${meeting.Country.Name}, ${meeting.Location} autodrome`),
			]);

			const coords = coordsC || coordsA;

			if (cancelled || !mapContainerRef.current) return;

			libMap = new maplibregl.Map({
				container: mapContainerRef.current,
				style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
				center: coords ? [coords.lon, coords.lat] : undefined,
				zoom: 10,
				canvasContextAttributes: {
					antialias: true,
				},
			});

			libMap.on("load", async () => {
				if (cancelled) return;
				setLoading(false);

				if (coords) {
					new Marker().setLngLat([coords.lon, coords.lat]).addTo(libMap!);
				}

				await handleMapLoad();
			});

			mapRef.current = libMap;
		})();

		return () => {
			cancelled = true;
			if (mapRef.current) {
				mapRef.current.remove();
				mapRef.current = null;
			}
		};
	}, [meeting]);

	const setFrame = (idx: number) => {
		const map = mapRef.current;
		if (!map || currentFrameRef.current === idx) return;

		removeRadarLayer(map);
		addRadarLayer(map, idx);
		currentFrameRef.current = idx;
	};

	return (
		<div className="relative h-full w-full">
			<div ref={mapContainerRef} className="absolute h-full w-full" />

			{!loading && frames.length > 0 && (
				<div className="absolute right-0 bottom-0 left-0 z-20 m-2 flex gap-4 rounded-lg bg-black/80 p-4 backdrop-blur-xs md:right-auto md:w-lg">
					<PlayControls playing={playing} onClick={() => setPlaying((v) => !v)} />

					<Timeline frames={frames} setFrame={setFrame} playing={playing} />
				</div>
			)}

			{loading && <div className="h-full w-full animate-pulse rounded-lg bg-zinc-800" />}
		</div>
	);
}
