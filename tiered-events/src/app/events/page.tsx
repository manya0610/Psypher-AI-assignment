import { currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

const TIER_ORDER = ["free", "silver", "gold", "platinum"];

function getAllowedTiers(userTier: string) {
  const index = TIER_ORDER.indexOf(userTier);
  return TIER_ORDER.slice(0, index + 1);
}

function isLockedEvent(userTier: string, eventTier: string) {
  return TIER_ORDER.indexOf(eventTier) > TIER_ORDER.indexOf(userTier);
}

export default async function EventsPage() {
  // 👇 Fetch current user (server-side only)
  const user = await currentUser();

  if (!user) {
    return (
      <div className="p-4 text-red-500">
        You must be signed in to view events.
      </div>
    );
  }

  let userTier = (user.publicMetadata.tier as string) ?? "free";
  const allowedTiers = getAllowedTiers(userTier);
  userTier = "gold";
  // 👇 Fetch allowed events from Supabase
  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  if (error) {
    return <div className="p-4 text-red-500">Error loading events.</div>;
  }
  console.log(events);

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Events for {userTier.toUpperCase()} Tier
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {events.map((event) => {
          const locked = isLockedEvent(userTier, event.tier);

          return (
            <div
              key={event.id}
              className="relative rounded-xl shadow-md overflow-hidden bg-white"
            >
              <div className="relative w-full h-40">
                <img
                  src={
                    // event.image_url ||
                    // "https://via.placeholder.com/400x200?text=Event"
                    "/globe.svg"
                  }
                  alt={event.title}
                  className={`w-full h-full object-cover transition-all duration-200 ${
                    locked ? "blur-sm" : ""
                  }`}
                />

                {locked && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 text-white flex flex-col justify-center items-center text-center px-2">
                    <p className="text-sm mb-1">
                      🔒 {event.tier.toUpperCase()} Tier
                    </p>
                    <p className="text-xs">Upgrade to access this event</p>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h2 className="text-lg font-semibold">{event.title}</h2>
                <p className="text-sm text-gray-500 mb-1">
                  {new Date(event.event_date).toLocaleDateString()}
                </p>
                <p className="text-sm mb-2">{event.description}</p>
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full ${
                    locked
                      ? "bg-gray-200 text-gray-600"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {event.tier.toUpperCase()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
