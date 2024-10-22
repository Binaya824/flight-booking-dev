"use client";

import { useRef, useEffect, useState, use } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { User, Briefcase, Mail, Phone, Luggage } from "lucide-react";
import { FormState } from "@/store";
import { useFlightOffersStore } from "../context/flight-offers-provider";
import format from "date-fns/format";
import { useRouter } from "next/navigation";

import crypto from "crypto-js";
import axios from "axios";

// Function to load script and append in DOM tree.
const loadScript = (src: string) =>
  new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      console.log("razorpay loaded successfully");
      resolve(true);
    };
    script.onerror = () => {
      console.log("error in loading razorpay");
      resolve(false);
    };
    document.body.appendChild(script);
  });

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface FlightInfoProps {
  from: string;
  to: string;
  date: string;
  time: string;
  stops: string;
  airlines: string;
}

export default function FlightItinerary({
  form,
  setForm,
}: {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) {
  const { selectedFlight, travelers, flightOffers } = useFlightOffersStore(
    (state) => state
  );

  const router = useRouter();
  // console.log(searched ,"@@@@@@@@@@@@@@@" , flightOffers)

  const isDirect = selectedFlight?.itineraries?.at(0)?.segments?.length === 0;
  const isReturnType = selectedFlight?.itineraries.length > 0;

  const paymentId = useRef(null);
  const paymentMethod = useRef(null);

  const [orderDetails, setOrderDetails] = useState({
    orderId: "",
    currency: "INR",
    amount: 0,
  });

  useEffect(() => {
    const handlePayEvent = () => handleCreateOrder(100, "USD");

    document.addEventListener("PAY", (event) => {
      console.log(event);
      handlePayEvent();
    });

    return () => {
      document.removeEventListener("PAY", handlePayEvent);
    };
  }, []);

  const [displayRazorpay, setDisplayRazorpay] = useState(false);

  const handleCreateOrder = async (amount: number, currency: string) => {
    const response = await axios.post("http://localhost:3000/order", {
      amount: parseInt(selectedFlight.price.total) * 100, //convert amount into lowest unit. here, Dollar->Cents
      currency,
      flightOffers: [selectedFlight],
      travelers: travelers,
    });

    if (response.data && response.data.order_id) {
      setOrderDetails({
        orderId: response.data.order_id,
        currency: response.data.currency,
        amount: response.data.amount,
      });
      setDisplayRazorpay(true);
    }

    // To load razorpay checkout modal script.

    // Move this useEffect to the top level of the component
  };

  const showRazorpay = async (options: any) => {
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      console.log("Razorpay SDK failed to load. Are you online?");
      return;
    }
    // All information is loaded in options which we will discuss later.
    const rzp1 = new window.Razorpay(options);

    // If you want to retreive the chosen payment method.
    rzp1.on("payment.submit", (response: any) => {
      paymentMethod.current = response.method;
    });

    // To get payment id in case of failed transaction.
    rzp1.on("payment.failed", (response: any) => {
      paymentId.current = response.error.metadata.payment_id;
    });

    // to open razorpay checkout modal.
    rzp1.open();
  };

  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // key id from props
    amount: orderDetails.amount, // Amount in lowest denomination from props
    currency: orderDetails.currency, // Currency from props.
    name: "Ritesh", // Title for your organization to display in checkout modal
    // image, // custom logo  url
    order_id: orderDetails.orderId, // order id from props
    // This handler menthod is always executed in case of succeeded payment
    handler: (response: any) => {
      console.log("succeeded");
      console.log(response);
      paymentId.current = response.razorpay_payment_id;

      // Most important step to capture and authorize the payment. This can be done of Backend server.
      const succeeded =
        crypto
          .HmacSHA256(
            `${orderDetails.orderId}|${response.razorpay_payment_id}`,
            process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET!
          )
          .toString() === response.razorpay_signature;

      // If successfully authorized. Then we can consider the payment as successful.
      if (succeeded) {
        // handlePayment("succeeded", {
        //   orderId,
        //   paymentId,
        //   signature: response.razorpay_signature,
        // });
        router.push("/app")
      } else {
        // handlePayment("failed", {
        //   orderId,
        //   paymentId: response.razorpay_payment_id,
        // });
        router.push("/app")
      }
    },
    modal: {
      confirm_close: true, // this is set to true, if we want confirmation when clicked on cross button.
      // This function is executed when checkout modal is closed
      // There can be 3 reasons when this modal is closed.
      ondismiss: async (reason: any) => {
        const {
          reason: paymentReason,
          field,
          step,
          code,
        } = reason && reason.error ? reason.error : {};
        // Reason 1 - when payment is cancelled. It can happend when we click cross icon or cancel any payment explicitly.
        if (reason === undefined) {
          console.log("cancelled");
          // handlePayment("Cancelled");
        }
        // Reason 2 - When modal is auto closed because of time out
        else if (reason === "timeout") {
          console.log("timedout");
          // handlePayment("timedout");
        }
        // Reason 3 - When payment gets failed.
        else {
          console.log("failed");
          // handlePayment("failed", {
          //   paymentReason,
          //   field,
          //   step,
          //   code,
          // });
        }
      },
    },
    // This property allows to enble/disable retries.
    // This is enabled true by default.
    retry: {
      enabled: false,
    },
    timeout: 900, // Time limit in Seconds
    // theme: {
    //   color: "", // Custom color for your checkout modal.
    // },
  };

  const getAirlines = (oneWay: boolean) => {
    const airlines = selectedFlight?.itineraries?.[
      oneWay ? 0 : 1
    ]?.segments?.map(
      (segment) =>
        flightOffers?.data?.dictionaries?.carriers?.[
          segment?.carrierCode as keyof typeof flightOffers.data.dictionaries.carriers
        ] || "Unknown Airline"
    );
    return airlines?.join(", ") || "N/A";
  };

  useEffect(() => {
    console.log("in razorpay");
    if (displayRazorpay) {
      showRazorpay(options);
    }
  }, [displayRazorpay, options]);

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Flight Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FlightInfo
            from={
              selectedFlight?.itineraries.at(0)?.segments?.at(0)?.departure
                ?.iataCode || "N/A"
            }
            to={
              selectedFlight?.itineraries.at(0)?.segments?.at(-1)?.arrival
                ?.iataCode || "N/A"
            }
            // date="Tue 17 Dec - Wed 18 Dec"
            date={
              format(
                new Date(
                  selectedFlight?.itineraries.at(0)?.segments?.at(0)?.departure
                    ?.at || new Date()
                ),
                "EEE dd MMM"
              ) +
              " - " +
              format(
                new Date(
                  selectedFlight?.itineraries.at(0)?.segments?.at(-1)?.arrival
                    ?.at || new Date()
                ),
                "EEE dd MMM"
              )
            }
            // time="20:30 - 20:20"
            time={
              format(
                new Date(
                  selectedFlight?.itineraries?.at(0)?.segments?.at(0)?.departure
                    ?.at ?? ""
                ),
                "dd MMM"
              ) +
              " - " +
              format(
                new Date(
                  selectedFlight?.itineraries?.at(0)?.segments?.at(-1)?.arrival
                    ?.at ?? ""
                ),
                "dd MMM"
              )
            }
            stops={`${
              selectedFlight?.itineraries?.at(0)?.segments?.length
                ? selectedFlight?.itineraries[0]?.segments.length - 1
                : 0
            } stops · ${
              selectedFlight?.itineraries
                ?.at(0)
                ?.duration?.replace(
                  /PT(\d+)H(\d+)M/,
                  (_: string, h: string, m: string) => `${h}h ${m}m`
                ) || "N/A"
            }`}
            airlines={getAirlines(true)}
          />
          {isReturnType && (
            <>
              <Separator />
              <FlightInfo
                from={
                  selectedFlight?.itineraries.at(-1)?.segments?.at(0)?.departure
                    ?.iataCode || "N/A"
                }
                to={
                  selectedFlight?.itineraries.at(-1)?.segments?.at(-1)?.arrival
                    ?.iataCode || "N/A"
                }
                // date="Tue 17 Dec - Wed 18 Dec"
                date={
                  format(
                    new Date(
                      selectedFlight?.itineraries.at(-1)?.segments?.at(0)
                        ?.departure?.at || new Date()
                    ),
                    "EEE dd MMM"
                  ) +
                  " - " +
                  format(
                    new Date(
                      selectedFlight?.itineraries.at(-1)?.segments?.at(-1)
                        ?.arrival?.at || new Date()
                    ),
                    "EEE dd MMM"
                  )
                }
                // time="20:30 - 20:20"
                time={
                  format(
                    new Date(
                      selectedFlight?.itineraries?.at(-1)?.segments?.at(0)
                        ?.departure?.at ?? ""
                    ),
                    "dd MMM"
                  ) +
                  " - " +
                  format(
                    new Date(
                      selectedFlight?.itineraries?.at(-1)?.segments?.at(-1)
                        ?.arrival?.at ?? ""
                    ),
                    "dd MMM"
                  )
                }
                // stops="2 stops · 37h 20m · Economy"
                stops={`${
                  selectedFlight?.itineraries?.at(-1)?.segments?.length
                    ? selectedFlight?.itineraries[0]?.segments.length - 1
                    : 0
                } stops · ${
                  selectedFlight?.itineraries
                    ?.at(-1)
                    ?.duration?.replace(
                      /PT(\d+)H(\d+)M/,
                      (_: string, h: string, m: string) => `${h}h ${m}m`
                    ) || "N/A"
                }`}
                airlines={getAirlines(false)}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center">
            <Phone className="mr-2 h-4 w-4" />
            <span>
              +91{" "}
              {travelers.find(
                (t) =>
                  t?.contact &&
                  t?.contact?.phones &&
                  t?.contact?.phones.length > 0
              )?.contact?.phones[0].number || "No phone found"}
            </span>
          </div>
          <div className="flex items-center">
            <Mail className="mr-2 h-4 w-4" />
            <span>
              {travelers.find((t) => t?.contact && t?.contact?.emailAddress)
                ?.contact?.emailAddress || "No email found"}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Traveller Details</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedFlight.travelerPricings.map((t, index) => {
            return (
              <div className="mb-4" key={index}>
                <div className="flex items-center" key={index}>
                  <User className="mr-2 h-4 w-4" />
                  <span>
                    {travelers[index]?.name?.firstName +
                      " " +
                      travelers[index]?.name?.lastName}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {`${t.travelerType} · ${travelers[index]?.gender} · ${format(
                    new Date(travelers[index]?.dateOfBirth),
                    "dd MMM yyyy"
                  )}`}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Baggage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">
              Flight to{" "}
              {selectedFlight?.itineraries.at(0)?.segments?.at(-1)?.arrival
                ?.iataCode || "N/A"}
            </h3>
            {selectedFlight?.travelerPricings
              ?.at(0)
              ?.fareDetailsBySegment.map((fareSeg: any) => {
                const baggageAmenities = fareSeg.amenities.filter(
                  (amenity: any) => amenity.amenityType === "BAGGAGE"
                );

                return baggageAmenities.map((amenity: any, index: number) => (
                  <BaggageInfo key={index} description={amenity.description} />
                ));
              })}
          </div>
          {isDirect && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">
                  Flight to{" "}
                  {selectedFlight?.itineraries.at(-1)?.segments?.at(-1)?.arrival
                    ?.iataCode || "N/A"}
                </h3>
                {selectedFlight?.travelerPricings
                  ?.at(0)
                  ?.fareDetailsBySegment.map((fareSeg: any) => {
                    const baggageAmenities = fareSeg.amenities.filter(
                      (amenity: any) => amenity.amenityType === "BAGGAGE"
                    );

                    return baggageAmenities.map(
                      (amenity: any, index: number) => (
                        <BaggageInfo
                          key={index}
                          description={amenity.description}
                        />
                      )
                    );
                  })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FlightInfo({
  from,
  to,
  date,
  time,
  stops,
  airlines,
}: FlightInfoProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="font-semibold">
          {from} to {to}
        </div>
        {/* <Button variant="ghost" size="sm">
          View flight details
        </Button> */}
      </div>
      <div className="text-sm text-muted-foreground">{date}</div>
      <div className="text-sm">{time}</div>
      <div className="text-sm">{stops}</div>
      <div className="text-sm">{airlines}</div>
    </div>
  );
}

function BaggageInfo({ description }: { description: string }) {
  return (
    <div className="mt-2 space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Luggage className="h-4 w-4" />
          <span className="text-sm">{description}</span>
        </div>
        <span className="text-sm text-green-600">Included</span>
      </div>
    </div>
  );
}
