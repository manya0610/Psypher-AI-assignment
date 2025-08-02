import { currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";

const TIER_ORDER = ["free", "silver", "gold", "platinum"];

function getAllowedTiers(userTier: string) {
  const index = TIER_ORDER.indexOf(userTier);
  return TIER_ORDER.slice(0, index + 1);
}

function isLockedEvent(userTier: string, eventTier: string) {
  return TIER_ORDER.indexOf(eventTier) > TIER_ORDER.indexOf(userTier);
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    sort?: string;
    tier?: string | string[];
  };
}) {
    searchParams= await searchParams;
  const user = await currentUser();
  if (!user) {
    return <div className="p-4 text-red-500">You must be signed in to view events.</div>;
  }

  let userTier = (user.publicMetadata.tier as string) ?? "free";
  const allowedTiers = getAllowedTiers(userTier);

  const currentPage = parseInt(searchParams.page || "1", 10);
  const pageSize = 6;
  const sortDirection = searchParams.sort === "desc" ? "desc" : "asc";
  const filterTiers = Array.isArray(searchParams.tier)
    ? searchParams.tier
    : searchParams.tier
    ? [searchParams.tier]
    : [];

  let query = supabase.from("events").select("*", { count: "exact" });

  if (filterTiers.length > 0) {
    query = query.in("tier", filterTiers);
  } else {
    query = query.in("tier", allowedTiers);
  }

  query = query.order("event_date", { ascending: sortDirection === "asc" });
  query = query.range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

  const { data: events, count, error } = await query;
  const totalPages = count ? Math.ceil(count / pageSize) : 1;

  if (error) {
    return <div className="p-4 text-red-500">Error loading events.</div>;
  }

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Events for {userTier.toUpperCase()} Tier</h1>

      <form method="GET" className="mb-6 flex flex-wrap gap-4 items-center">
        <details className="border px-4 py-2 rounded w-full sm:w-auto">
          <summary className="cursor-pointer font-medium">Filter by Tier</summary>
          <div className="mt-2 flex gap-4 flex-wrap">
            {TIER_ORDER.map((tier) => (
              <label key={tier} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="tier"
                  value={tier}
                  defaultChecked={filterTiers.includes(tier)}
                  className="accent-blue-600"
                />
                <span className="capitalize">{tier}</span>
              </label>
            ))}
          </div>
        </details>

        <select
          name="sort"
          defaultValue={sortDirection}
          className="border px-3 py-2 rounded"
        >
          <option value="asc">Sort by Date ↑</option>
          <option value="desc">Sort by Date ↓</option>
        </select>

        <input type="hidden" name="page" value="1" />

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Apply Filters
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {events.map((event) => {
          const locked = isLockedEvent(userTier, event.tier);

          return (
            <div key={event.id} className="relative rounded-xl shadow-md overflow-hidden bg-white">
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
                  {new Date(event.event_date).toLocaleDateString()}
                </p>
                <p className="text-sm mb-2">{event.description}</p>
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full ${
                    locked ? "bg-gray-200 text-gray-600" : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {event.tier.toUpperCase()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center mt-8 gap-4">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
          const params = new URLSearchParams();

          if (Array.isArray(searchParams.tier)) {
            searchParams.tier.forEach((t) => params.append("tier", t));
          } else if (searchParams.tier) {
            params.set("tier", searchParams.tier);
          }

          if (searchParams.sort) {
            params.set("sort", searchParams.sort);
          }

          params.set("page", pageNum.toString());

          return (
            <Link
              key={pageNum}
              href={`/events?${params.toString()}`}
              className={`px-4 py-2 rounded ${
                pageNum === currentPage ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {pageNum}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
