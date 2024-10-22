"use client";
import { useState, useEffect } from "react";
import FlightCard from "@/components/FlightCard/FlightCard";
import Search from "@/components/Search/Search";
import Filters from "@/components/ui/filters";
import flight_search from "@/data/flightOffers";
import { useFlightOffersStore } from "@/components/context/flight-offers-provider";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { setFlightOffers, flightOffers, setLoading, loading, searched } =
    useFlightOffersStore((state) => state);

  console.log("loading :", loading);

  return (
    <div className="w-[80vw] relative">
      <Search />
      <div className="w-full relative mt-5 flex justify-between px-2">
        {flightOffers?.data?.data?.length > 0 && (
          <div className="w-[35%] relative">
            <Filters />
          </div>
        )}

        <div className="w-[64%] relative flex flex-col gap-3">
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : flightOffers?.data?.data?.length === 0 ? (
            <p>No flights available on this route.</p>
          ) : flightOffers?.data ? (
            flightOffers.data.data.map((offer) => (
              <FlightCard
                flight={offer}
                key={offer.id}
                dictionaries={flightOffers.data.dictionaries}
              />
            ))
          ) : (
            <p>Please enter your search criteria to find flights.</p>
          )}
        </div>
      </div>
    </div>
  );
}
