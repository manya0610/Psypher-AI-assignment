import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

const TIER_ORDER = ['free', 'silver', 'gold', 'platinum'];

function getAllowedTiers(userTier: string) {
  const index = TIER_ORDER.indexOf(userTier);
  return TIER_ORDER.slice(0, index + 1);
}

export default async function EventsPage() {
  // 👇 Fetch current user (server-side only)
  const user = await currentUser();

  if (!user) {
    return <div className="p-4 text-red-500">You must be signed in to view events.</div>;
  }

  const userTier = (user.publicMetadata.tier as string) ?? 'free';
  const allowedTiers = getAllowedTiers(userTier);

  // 👇 Fetch allowed events from Supabase
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .in('tier', allowedTiers)
    .order('event_date', { ascending: true });

  if (error) {
    return <div className="p-4 text-red-500">Error loading events.</div>;
  }
  console.log(events);

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Events for {userTier.toUpperCase()} Tier</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {events.map(event => (
          <div key={event.id} className="bg-white rounded-xl shadow-md overflow-hidden">
            <img
              src={event.image_url || 'https://via.placeholder.com/400x200?text=Event'}
              alt={event.title}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h2 className="text-lg font-semibold">{event.title}</h2>
              <p className="text-sm text-gray-500 mb-2">
                {new Date(event.event_date).toLocaleDateString()}
              </p>
              <p className="text-sm">{event.description}</p>
              <span
                className={`inline-block mt-3 px-2 py-1 text-xs rounded bg-${
                  userTier === event.tier ? 'blue' : 'gray'
                }-100 text-${
                  userTier === event.tier ? 'blue' : 'gray'
                }-800`}
              >
                {event.tier.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
