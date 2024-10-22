'use client'
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Share2, Luggage, Info } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";

import { format } from "date-fns";
import { Data } from "@/store";
import { useFlightOffersStore } from "../context/flight-offers-provider";

export default function FlightBookingModal({
  isOpen,
  setOpenViewDetailModal,
  flight,
  dictionaries,
  isReturnType,
}: {
  isOpen: boolean;
  setOpenViewDetailModal: React.Dispatch<React.SetStateAction<boolean>>;
  flight: any;
  dictionaries: any;
  isReturnType: boolean;
}) {
  const router = useRouter();
  const { selectedFlight, setSelectedFlight, flightOffers } = useFlightOffersStore((state) => state);

  const handleSelectFlight = (flight: Data) => {
    setSelectedFlight(flight);
    router.push("/app/checkout") // Now setSelectedFlight is callable
  };

  const isDirect = flight.itineraries?.at(0).segments.length === 0;

  return (
    <Dialog open={isOpen} onOpenChange={setOpenViewDetailModal}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            Your flight to{" "}
            {flight.itineraries?.at(0).segments.at(-1).arrival.iataCode}
            {/* this will later change to the destination state */}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[80vh] pr-4">
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <Share2 className="h-4 w-4" />
              <span>Share this flight</span>
            </div>

            {/* Flight to New Delhi */}
            <div>
              <h3 className="font-semibold">
                Flight to{" "}
                {flight.itineraries?.at(0).segments.at(-1).arrival.iataCode}
              </h3>
              <p className="text-sm text-gray-500">
                {isDirect
                  ? "Direct · 13h"
                  : flight?.itineraries
                      .at(0)
                      .duration.replace(
                        /PT(\d+)H(\d+)M/,
                        (_: string, h: string, m: string) => `${h}h ${m}m`
                      )}
              </p>

              {flight.itineraries?.at(0).segments.map((seg: any) => {
                return (
                  <div className="mt-8 space-y-2" key={seg.id}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">
                          {format(new Date(seg?.departure?.at), "dd MMM")} ·{" "}
                          {format(new Date(seg?.departure?.at), "HH:mm")}
                        </p>
                        <p className="text-sm">{seg?.departure?.iataCode}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {dictionaries.carriers[seg.carrierCode]}
                        </p>
                        <p className="text-sm text-gray-500">
                          {seg?.aircraft?.code} · Economy
                        </p>
                        <p className="text-sm text-gray-500">
                          Flight time{" "}
                          {seg.duration.replace(
                            /PT(\d+)H(\d+)M/,
                            (_: string, h: string, m: string) => `${h}h ${m}m`
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">
                          {format(new Date(seg?.arrival?.at), "dd MMM")} ·{" "}
                          {format(new Date(seg?.arrival?.at), "HH:mm")}
                        </p>
                        <p className="text-sm">{seg?.arrival?.iataCode}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Flight to Sydney */}
            {isReturnType && (
              <div>
                <h3 className="font-semibold">
                  Flight to{" "}
                  {flight.itineraries?.at(-1).segments.at(-1).arrival.iataCode}
                </h3>
                <p className="text-sm text-gray-500">
                  {isDirect
                    ? "Direct · 13h"
                    : flight?.itineraries
                        .at(-1)
                        .duration.replace(
                          /PT(\d+)H(\d+)M/,
                          (_: string, h: string, m: string) => `${h}h ${m}m`
                        )}
                </p>

                {flight.itineraries?.at(-1).segments.map((seg: any) => {
                  return (
                    <div className="mt-8 space-y-2" key={seg.id}>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">
                            {format(new Date(seg?.departure?.at), "dd MMM")} ·{" "}
                            {format(new Date(seg?.departure?.at), "HH:mm")}
                          </p>
                          <p className="text-sm">{seg?.departure?.iataCode}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {dictionaries.carriers[seg.carrierCode]}
                          </p>
                          <p className="text-sm text-gray-500">
                            {seg?.aircraft?.code} · Economy
                          </p>
                          <p className="text-sm text-gray-500">
                            Flight time{" "}
                            {seg.duration.replace(
                              /PT(\d+)H(\d+)M/,
                              (_: string, h: string, m: string) => `${h}h ${m}m`
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">
                            {format(new Date(seg?.arrival?.at), "dd MMM")} ·{" "}
                            {format(new Date(seg?.arrival?.at), "HH:mm")}
                          </p>
                          <p className="text-sm">{seg?.arrival?.iataCode}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Included baggage */}

            <div>
              <h3 className="font-semibold">Included baggage</h3>
              <p className="text-sm text-gray-500">
                The total baggage included in the price
              </p>
              {flight?.travelerPricings
                ?.at(0)
                ?.fareDetailsBySegment.map((fareSeg: any) => {
                  const baggageAmenities = fareSeg.amenities.filter(
                    (amenity: any) => amenity.amenityType === "BAGGAGE"
                  );

                  return baggageAmenities.map((amenity: any, index: number) => (
                    <div className="mt-2 space-y-2" key={index}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <Luggage className="h-4 w-4" />
                          <span className="text-sm">{amenity.description}</span>
                        </div>
                        <span className="text-sm text-green-600">Included</span>
                      </div>
                    </div>
                  ));
                })}
            </div>

            {/* CO2e emissions estimate */}
            <div>
              <h3 className="font-semibold flex items-center space-x-1">
                <span>CO2e emissions estimate</span>
                <Info className="h-4 w-4" />
              </h3>
              <p className="text-sm">Typical for this route</p>
            </div>

            {/* Price */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-1">
                <span className="text-2xl font-bold">
                  {flight.price.currency + " " + flight.price.total}
                </span>
                <Info className="h-4 w-4" />
              </div>
              <Button onClick={() => 
                handleSelectFlight(flight)
                }>
                Select
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
