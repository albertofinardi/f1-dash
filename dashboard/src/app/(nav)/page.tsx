import Image from "next/image";
import Link from "next/link";

import Button from "@/components/ui/Button";

import icon from "public/tag-logo.svg";

export default function Home() {
	return (
		<div>
			{/*<div className="absolute left-1/2 mx-auto my-4 -translate-x-1/2 rounded-xl border-2 border-red-600 bg-red-950 p-2 text-red-700 shadow-sm">
				<p className="text-sm text-red-600">Due to changes of the F1 API, some data might not be available anymore.</p>
			</div>*/}

			<section className="flex h-screen w-full flex-col items-center pt-20 sm:justify-center sm:pt-0">
				<Image src={icon} alt="f1-dash tag logo" width={200} />

				<h1 className="my-20 text-center text-5xl font-bold">
					Real-time Formula 1 <br />
					telemetry and timing
				</h1>

				<div className="flex flex-wrap gap-4">
					<Link href="/dashboard">
						<Button className="rounded-xl! border-2 border-transparent p-4 font-medium">Go to Dashboard</Button>
					</Link>

					<Link href="/schedule">
						<Button className="rounded-xl! border-2 border-zinc-700 bg-transparent! p-4 font-medium">
							Check Schedule
						</Button>
					</Link>
				</div>
			</section>
		</div>
	);
}
