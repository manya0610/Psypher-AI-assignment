import Image from "next/image";
import { isLockedEvent } from "../utils/tier";

const tierBadgeStyles: Record<string, string> = {
  free: "bg-gray-200 text-gray-700",
  silver: "bg-gray-300 text-gray-800",
  gold: "bg-yellow-200 text-yellow-800",
  platinum: "bg-purple-200 text-purple-800",
};

export function EventCard({
  event,
  userTier,
}: {
  event: {
    id: string;
    tier: string;
    image_url: string;
    title: string;
    event_date: string;
    description: string;
  };
  userTier: string;
}) {
  const locked = isLockedEvent(userTier, event.tier);
  const badgeClass = tierBadgeStyles[event.tier] || "bg-gray-100 text-gray-700";

  return (
    <div className="relative rounded-xl shadow-md overflow-hidden bg-white">
      <div className="relative w-full h-40">
        <Image
          className={`w-full h-full object-cover transition-all duration-200 ${locked ? "blur-sm" : ""}`}
          src={event.image_url || "/placeholder.jpeg"}
          alt="Event Image"
          width={400}
          height={200}
          priority
        />

        {locked && (
          <div className="absolute inset-0 bg-opacity-50 text-white flex flex-col justify-center items-center text-center px-2">
            <p className="text-sm mb-1">🔒 {event.tier.toUpperCase()} Tier</p>
            <p className="text-xs">Upgrade to access this event</p>
          </div>
        )}
      </div>

      <div className="p-4">
        <h2 className="text-lg font-semibold">{event.title}</h2>
        <p className="text-sm text-gray-500 mb-1">
          {new Date(event.event_date).toLocaleDateString("en-GB")}
        </p>
        <p className="text-sm mb-2">{event.description}</p>

        <span className={`inline-block px-2 py-1 text-xs rounded-full ${badgeClass}`}>
          {event.tier.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
