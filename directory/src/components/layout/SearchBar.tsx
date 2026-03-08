"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";

export function SearchBar() {
    const router = useRouter();
    const [category, setCategory] = useState("");
    const [city, setCity] = useState("");

    const slugify = (text: string) => {
        return text
            .toLowerCase()
            .trim()
            .replace(/&/g, "and")
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (category && city) {
            const categorySlug = slugify(category);
            const citySlug = slugify(city);
            router.push(`/${categorySlug}/${citySlug}`);
        } else if (category) {
            // Fallback or validation? For now let's just alert
            alert("Please enter both a category and a city to search.");
        }
    };

    return (
        <form onSubmit={handleSearch} className="mx-auto mt-10 flex max-w-3xl items-center gap-2 rounded-2xl border bg-white p-2 shadow-xl">
            <div className="flex flex-1 items-center px-4 gap-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Search category (e.g. Car Repair)..."
                    className="w-full bg-transparent py-3 text-base outline-none"
                />
            </div>
            <div className="h-8 w-px bg-border hidden sm:block"></div>
            <div className="flex items-center px-4 gap-3 hidden sm:flex">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City (e.g. Bangalore)..."
                    className="w-full bg-transparent py-3 text-base outline-none"
                />
            </div>
            <button
                type="submit"
                className="rounded-xl bg-qresolve px-8 py-3 font-semibold text-white hover:scale-[1.02] transition-transform active:scale-95"
            >
                Search
            </button>
        </form>
    );
}
