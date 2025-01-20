"use client";

import {
  CreateCounter,
  GetCounter,
  IncrementCounter,
} from "@/actions/counter.action";
import { supabase } from "@/lib/supabaseClient";
import { isCounter } from "@/utils/isCounter";
import { useEffect, useState } from "react";
import Loader from "./Loader";
import { Card, CardHeader, CardTitle } from "./ui/card";

export default function CounterCard() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchAndUpdateCounter = async () => {
      try {
        const counter = await GetCounter();

        // Type guard usage
        if (counter && isCounter(counter)) {
          await IncrementCounter();
          setCount(counter.count + 1);
        } else {
          await CreateCounter();
          setCount(0);
        }
      } catch (error) {
        console.error("Failed to fetch or update counter:", error);
      }
    };

    fetchAndUpdateCounter();

    const channel = supabase
      .channel("custom-all-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Counter" },
        (payload) => {
          if (payload.new && isCounter(payload.new)) {
            setCount(payload.new.count);
          }
        }
      )
      .subscribe();

    // Cleanup the subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-md">Visitor Counter</CardTitle>
        <div className="text-lg font-bold">
          {count !== null ? count : <Loader />}
        </div>
      </CardHeader>
    </Card>
  );
}
