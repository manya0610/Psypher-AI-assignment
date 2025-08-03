'use client';
import { TIER_ORDER } from "@/utils/tier";
import { useSearchParams } from "next/navigation";

export function Filters() {
  const searchParams = useSearchParams();
  const filterTiers = searchParams.getAll("tier");
  const sortDirection = searchParams.get("sort") || "asc";
  const pageSize = searchParams.get("max_per_page") || "6";

  return (
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

      <select name="sort" defaultValue={sortDirection} className="border px-3 py-2 rounded">
        <option value="asc">Sort by Date ↑</option>
        <option value="desc">Sort by Date ↓</option>
      </select>

      <select name="max_per_page" defaultValue={pageSize} className="border px-3 py-2 rounded">
        {[2, 5, 10, 20].map((limit) => (
          <option key={limit} value={limit}>
            {limit} per page
          </option>
        ))}
      </select>

      <input type="hidden" name="page" value="1" />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Apply Filters
      </button>
    </form>
  );
}
