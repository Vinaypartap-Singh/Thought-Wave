"use client";

import { searchUsers } from "@/actions/user.action";
import { useEffect, useState } from "react";
import SearchCard from "./_components/SearchCard";
import Loader from "@/components/Loader";

type Posts = Awaited<ReturnType<typeof searchUsers>>;

export default function Search() {
  const [search, setSearch] = useState(""); // State to store search query
  const [results, setResults] = useState<Posts>([]); // State to store search results
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  const handleSearch = async () => {
    setLoading(true); // Set loading state to true while fetching data
    setError(null); // Clear any previous errors

    try {
      // If search query is empty, fetch all users
      const data =
        search.trim() === ""
          ? await searchUsers("")
          : await searchUsers(search);
      setResults(data); // Update results state
      console.log(data); // Optionally log the results
    } catch (error) {
      setError("Error fetching users"); // Set error state if there's an issue
      console.error(error);
    } finally {
      setLoading(false); // Set loading state to false after the fetch is complete
    }
  };

  // Trigger the search when `search` value changes
  useEffect(() => {
    handleSearch(); // Trigger the search whenever the search query changes
  }, [search]);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-semibold mb-4">Search</h1>

      {/* Search input */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)} // Update search query
        placeholder="Search users by name or username"
        className="border p-2 w-full mb-4 rounded-md"
      />

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center mt-6">
          <Loader />
        </div>
      )}

      {/* Error state */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Display search results */}
      <div>
        {results.length > 0 ? (
          <ul>
            {results.map((user) => (
              <SearchCard user={user} key={user.id} />
            ))}
          </ul>
        ) : (
          <p>No users found.</p>
        )}
      </div>
    </div>
  );
}
