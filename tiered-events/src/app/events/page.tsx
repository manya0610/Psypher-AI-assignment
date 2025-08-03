import { currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { Filters } from "@/components/Filters";
import { getAllowedTiers } from "@/utils/tier";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    sort?: string;
    tier?: string | string[];
    max_per_page?: string;
    start_date?: string;
    end_date?: string;
  };
}) {
  searchParams = await searchParams;
  const user = await currentUser();
  if (!user) {
    return (
      <div className="p-4 text-red-500">
        You must be signed in to view events.
      </div>
    );
  }

  const userTier = (user.publicMetadata.tier as string) ?? "free";
  const allowedTiers = getAllowedTiers(userTier);

  const currentPage = parseInt(searchParams.page || "1", 10);
  const pageSize = parseInt(searchParams.max_per_page || "2", 10);
  const sortDirection = searchParams.sort === "desc" ? "desc" : "asc";
  const startDate = searchParams.start_date;
  const endDate = searchParams.end_date;
  const filterTiers = Array.isArray(searchParams.tier)
    ? searchParams.tier
    : searchParams.tier
    ? [searchParams.tier]
    : [];

  let query = supabase.from("events").select("*", { count: "exact" });

  query = query.in("tier", filterTiers.length > 0 ? filterTiers : allowedTiers);
  query = query.order("event_date", { ascending: sortDirection === "asc" });
  if (startDate) {query = query.gte("event_date", startDate);}
  else{
    query = query.gte("event_date", new Date().toDateString());
  }
  if (endDate) query = query.lte("event_date", endDate);
  query = query.range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

  const { data: events, count, error } = await query;
  const totalPages = count ? Math.ceil(count / pageSize) : 1;

  if (error) {
    return <div className="p-4 text-red-500">Error loading events.</div>;
  }

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
  <h1 className="text-3xl font-bold">Browse Events</h1>
  <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 font-medium">
    Your Tier: {userTier.toUpperCase()}
  </span>
</div>
      <Filters />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} userTier={userTier} />
        ))}
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

          if (searchParams.max_per_page) {
            params.set("max_per_page", searchParams.max_per_page);
          }

          params.set("page", pageNum.toString());

          return (
            <Link
              key={pageNum}
              href={`/events?${params.toString()}`}
              className={`px-4 py-2 rounded ${
                pageNum === currentPage
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
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
