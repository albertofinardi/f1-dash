"use client";

import { useEffect, useRef, useState } from "react";

import { useDataStore } from "@/stores/useDataStore";

const iconBase = "h-8 min-w-[3rem] rounded-sm";

function GreenFlagIcon() {
	return <div className={iconBase} style={{ backgroundColor: '#00c21d' }} aria-label="Green flag" />;
}

function YellowFlagIcon() {
	return <div className={iconBase} style={{ backgroundColor: '#FFF700' }} aria-label="Yellow flag" />;
}

function RedFlagIcon() {
	return (
		<div className={`${iconBase} animate-pulse`} style={{ backgroundColor: '#FF1801'}} aria-label="Red flag" />
	);
}

function SafetyCarIcon() {
	return (
		<div
			className={`${iconBase} flex items-center text-center justify-center border-2 border-amber-400 bg-black`}
			aria-label="Safety car"
		>
			<span className="text-sm font-bold uppercase tracking-widest text-amber-400">SC</span>
		</div>
	);
}

function VSCDeployedIcon() {
	return (
		<div
			className={`${iconBase} flex items-center text-center justify-center border-2 border-amber-400 bg-black`}
			aria-label="VSC deployed"
		>
			<span className="text-sm font-bold uppercase tracking-widest text-amber-400">VSC</span>
		</div>
	);
}

function VSCEndingIcon() {
	return (
		<div
			className={`${iconBase} flex items-center text-centerjustify-center border-2 border-amber-400 bg-black animate-pulse`}
			aria-label="VSC ending"
		>
			<span className="text-sm font-bold uppercase tracking-widest text-amber-400">VSC</span>
		</div>
	);
}

export default function TrackInfo() {
	const lapCount = useDataStore((state) => state.state?.LapCount);
	const track = useDataStore((state) => state.state?.TrackStatus);
	const statusCodeRaw = track?.Status;
	const statusCode =
		statusCodeRaw !== undefined && statusCodeRaw !== null && statusCodeRaw !== ""
			? parseInt(String(statusCodeRaw), 10)
			: null;
	const code =
		statusCode !== null && Number.isInteger(statusCode) && statusCode >= 1 && statusCode <= 7
			? statusCode
			: 1;

	const prevCodeRef = useRef<number | null>(null);
	const [pulseFromChange, setPulseFromChange] = useState(false);

	useEffect(() => {
		const prevCode = prevCodeRef.current;
		prevCodeRef.current = code;
		if (prevCode !== null && prevCode !== code) {
			setPulseFromChange(true);
			const t = setTimeout(() => setPulseFromChange(false), 5000);
			return () => clearTimeout(t);
		}
	}, [code]);

	function renderStatusBadge() {
		switch (code) {
			case 1:
				return <GreenFlagIcon />;
			case 2:
			case 3:
				return <YellowFlagIcon />;
			case 5:
				return <RedFlagIcon />;
			case 4:
				return <SafetyCarIcon />;
			case 6:
				return <VSCDeployedIcon />;
			case 7:
				return <VSCEndingIcon />;
			default:
				return <GreenFlagIcon />;
		}
	}

	const showBadge = lapCount != null || track != null;

	return (
		<div className="flex flex-row items-center gap-4 md:justify-self-end">
			{!!lapCount && (
				<p className="text-3xl font-extrabold whitespace-nowrap">
					{lapCount?.CurrentLap} / {lapCount?.TotalLaps}
				</p>
			)}

			{showBadge ? (
				<div className={pulseFromChange ? "animate-pulse" : undefined}>
					{renderStatusBadge()}
				</div>
			) : (
				<div className="relative h-8 w-28 animate-pulse overflow-hidden rounded-lg bg-zinc-800" />
			)}
		</div>
	);
}
