"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { LuBaggageClaim, LuBriefcase } from "react-icons/lu";
import { BsSuitcase2 } from "react-icons/bs";
import FlightInfo from "@/components/ui/flightInfo";
import { useState } from "react";
import FlightBookingModal from "../Modals/FlightBookingModal";
import format from "date-fns/format";
import { Carriers, Data, Dictionaries } from "@/store";

export default function FlightCard({
  flight,
  dictionaries,
}: {
  flight: Data;
  dictionaries: Dictionaries;
}) {
  const [openViewDetailModal, setOpenViewDetailModal] =
    useState<boolean>(false);

  const isReturnType = flight?.itineraries?.length > 1;

  const getAirlines = (oneWay: boolean) => {
    const airlines = flight.itineraries[oneWay ? 0 : 1].segments.map(
      (segment) => dictionaries.carriers[segment.carrierCode as keyof Carriers]
    );
    return airlines.join(" , ");
  };

  const getBaggage = () => {
    const baggages = flight?.travelerPricings
      ?.at(0)
      ?.fareDetailsBySegment?.at(0)
      ?.amenities?.filter((amenity: any) => amenity.amenityType === "BAGGAGE")
      ?.map((amenity: any) => amenity.description); // Only get the description

    return baggages?.join(" , ");
  };

  return (
    <div className=" h-fit relative w-full flex justify-between">
      <Card className="w-full h-full">
        <CardHeader>
          {/* <div className="flex justify-between items-center">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Cheapest
            </Badge>
            <span className="text-sm text-muted-foreground">
              Flexible ticket upgrade available
            </span>
          </div> */}
          {Array.isArray(getAirlines(true).split(", ")) && (
            <>
              <div className="flex items-center">
                {getAirlines(true)
                  .split(", ")
                  .map((airline) => (
                    <Badge
                      key={airline}
                      variant="secondary"
                      className="bg-green-100 w-max text-green-800 inline-block mr-2"
                    >
                      {airline}
                    </Badge>
                  ))}
              </div>
            </>
          )}

          {!Array.isArray(getAirlines(true).split(", ")) && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {getAirlines(true)}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 1st row */}

          <div className="flex items-center justify-between h-full relative">
            <FlightInfo
              time={format(
                new Date(
                  flight?.itineraries.at(0)?.segments?.at(0)?.departure?.at ||
                    new Date()
                ),
                "HH:mm"
              )}
              date={format(
                new Date(
                  flight?.itineraries.at(0)?.segments?.at(0)?.departure?.at ||
                    new Date()
                ),
                "dd MMM"
              )}
              airport={
                flight?.itineraries.at(0)?.segments?.at(0)?.departure
                  ?.iataCode || "N/A"
              }
              duration={
                flight?.itineraries
                  .at(0)
                  ?.duration?.replace(
                    /PT(\d+)H(\d+)M/,
                    (_, h, m) => `${h}h ${m}m`
                  ) || "N/A"
              }
              airline={getAirlines(true)}
            />
            <div className="flex flex-col items-center justify-center">
              <span className="text-lg font-semibold">
                {flight?.itineraries
                  .at(0)
                  ?.duration?.replace(
                    /PT(\d+)H(\d+)M/,
                    (_, h, m) => `${h}h ${m}m`
                  ) || "N/A"}
              </span>
              <span className="text-sm text-muted-foreground">Duration</span>
            </div>
            <FlightInfo
              time={format(
                new Date(
                  flight?.itineraries.at(0)?.segments?.at(-1)?.arrival?.at ||
                    new Date()
                ),
                "HH:mm"
              )}
              date={format(
                new Date(
                  flight?.itineraries.at(0)?.segments?.at(-1)?.arrival?.at ||
                    new Date()
                ),
                "dd MMM"
              )}
              airport={
                flight?.itineraries.at(0)?.segments?.at(-1)?.arrival
                  ?.iataCode || "N/A"
              }
              isArrival
            />
          </div>

          <Separator />

          {/* 2nd row */}
          {isReturnType && (
            <div className="flex justify-between h-full relative">
              <FlightInfo
                time={format(
                  new Date(
                    flight?.itineraries.at(-1)?.segments?.at(0)?.departure
                      ?.at || new Date()
                  ),
                  "HH:mm"
                )}
                date={format(
                  new Date(
                    flight?.itineraries.at(-1)?.segments?.at(0)?.departure
                      ?.at || new Date()
                  ),
                  "dd MMM"
                )}
                airport={
                  flight?.itineraries.at(-1)?.segments?.at(0)?.departure
                    ?.iataCode || "N/A"
                }
                duration={
                  flight?.itineraries
                    ?.at(-1)
                    ?.duration.replace(
                      /PT(\d+)H(\d+)M/,
                      (_, h, m) => `${h}h ${m}m`
                    ) || "N/A"
                }
                airline={getAirlines(false)}
              />
              <FlightInfo
                time={format(
                  new Date(
                    flight?.itineraries.at(-1)?.segments?.at(-1)?.arrival?.at ||
                      new Date()
                  ),
                  "HH:mm"
                )}
                date={format(
                  new Date(
                    flight?.itineraries.at(-1)?.segments?.at(-1)?.arrival?.at ||
                      new Date()
                  ),
                  "dd MMM"
                )}
                airport={
                  flight?.itineraries.at(-1)?.segments?.at(-1)?.arrival
                    ?.iataCode || "N/A"
                }
                isArrival
              />
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <LuBriefcase className="text-muted-foreground" />
              <BsSuitcase2 className="text-muted-foreground" />
              <LuBaggageClaim className="text-muted-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">
              Included: {getBaggage()}
            </span>
          </div>
        </CardContent>
        <Separator />
        <CardFooter className="flex justify-between items-center p-3">
          <CardTitle className="text-2xl font-bold">
            {flight.price.currency + " " + flight.price.total}
          </CardTitle>
          <Button onClick={() => setOpenViewDetailModal(true)}>
            View details
          </Button>
        </CardFooter>
      </Card>
      <FlightBookingModal
        isOpen={openViewDetailModal}
        setOpenViewDetailModal={setOpenViewDetailModal}
        flight={flight}
        dictionaries={dictionaries}
        isReturnType={isReturnType}
      />
    </div>
  );
}
