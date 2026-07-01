import { Suspense } from "react";
import SearchContent from "./SearchContent";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-10 text-sm text-gray-500">Loading…</div>}>
      <SearchContent />
    </Suspense>
  );
}
