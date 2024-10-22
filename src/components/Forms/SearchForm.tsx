import React, { MouseEvent, useEffect, useState } from "react";
import { PlaneTakeoff, PlaneLanding, ArrowLeftRight, User } from "lucide-react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import Select from "react-select";
import Traveler, { Child } from "../ui/travelerUi";
import { DateRangePicker, DatePicker } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import format from "date-fns/format";
import axios, { isAxiosError } from "axios";
import _ from "lodash";
import { useAuth } from "@clerk/nextjs";
import { FlightOffersResponseRoot } from "@/store";
import { useFlightOffersStore } from "../context/flight-offers-provider";
import { useDebounce } from "@/hooks/useDebounce";
import { addDays } from "date-fns";

const SearchForm = () => {
  const [flightState, setFlightState] = useState({
    isFromOpen: false,
    isToOpen: false,
  });

  const [isRotated, setIsRotated] = useState(false);

  
  const { setFlightOffers, flightOffers, setLoading, setSearched, searched , searchForm , updateSearchFormField } =
    useFlightOffersStore((state) => state);

  const [formState, setFormState] = useState({
    departure: {
      value: "",
      label: "",
    },
    destination: {
      value: "",
      label: "",
    },
    departureDate: new Date(),
    // returnDate: "",
    travelers: 1,
  });

  const [openTraveler, setOpenTraveler] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [departureLocations, setDepartureLocations] = useState([]);
  const [destinationLocations, setDestinationLocations] = useState([]);

  const debouncedSearchTerm = useDebounce(searchTerm);

  const [adults, setAdults] = useState(1); // Initial at least 1 adult
  const [children, setChildren] = useState<Child[]>([]); // Array to track children with their ages

  const handleDepartureSearchChange = (value: string) => {
    if (!value) return;
    axios
      .get(`http://localhost:3000/locations?keyword=${value}`)
      .then((response) => {
        const locations = response.data?.data?.data
          .filter((el:any) => el.subType === "CITY")
          .map((el:any) => ({
            label: el.address.cityName + `(${el.iataCode})`,
            value: el.iataCode,
          }));
        setDepartureLocations(locations);
      })
      .catch((error) => {
        console.error("Error fetching locations:", error);
      });
  };

  const handleDestinationSearchChange = (value: string) => {
    if (!value) return;

    axios
      .get(`http://localhost:3000/locations?keyword=${value}`)
      .then((response) => {
        const locations = response.data?.data?.data
          .filter((el:any) => el.subType === "CITY")
          .map((el:any) => ({
            label: el.address.cityName + `(${el.iataCode})`,
            value: el.iataCode,
          }));
        setDestinationLocations(locations);
      })
      .catch((error) => {
        console.error("Error fetching locations:", error);
      });
  };

  useEffect(() => {
    handleDepartureSearchChange(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    handleDestinationSearchChange(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    console.log("====>>>" , searchForm)

    setLoading(true);

    try {
      const response = (await axios.get("http://localhost:3000/flight-offers", {
        params: {
          originLocationCode: searchForm.origin.value,
          destinationLocationCode: searchForm.destination.value,
          departureDate: searchForm.departureDate,
          adults: searchForm.adult,
          children: searchForm.child,
          returnDate: searchForm.returnDate,
          travelClass: searchForm.travelClass,
          nonStop: searchForm.directFlight 
        },
      })) as { data: FlightOffersResponseRoot };
      setFlightOffers(response.data);

      if (!searched) setSearched(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      if (isAxiosError(error)) {
        console.error("Error message:", error.response?.data?.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   console.log("searched form" , searchForm)
  // }, [searchForm])

  useEffect(() => {
      const tempOrigin = { ...searchForm.origin }; 
      const tempDestination = { ...searchForm.destination };
      
      
      updateSearchFormField("origin", tempDestination);
      updateSearchFormField("destination", tempOrigin);
    
  }, [isRotated]);
  
  
  

  

  return (
    <form className="h-[3.5rem] p-1 bg-[#006ce4] rounded-md grid grid-cols-28 gap-1 relative">
      <div className="bg-white h-full col-span-7 rounded-md cursor-pointer relative">
        <div
          className="flex gap-3 items-center h-full px-2"
          onClick={() => setFlightState({ ...flightState, isFromOpen: true })}
        >
          <PlaneTakeoff />
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">
            {searchForm.origin.label || "Departure"}
          </span>
        </div>
        {flightState.isFromOpen && (
          <div className="flex gap-3 items-center h-full w-full bg-transparent absolute top-full left-0 z-50">
            <Select
              autoFocus
              name="colors"
              onInputChange={(value, { action }) => {
                if (action === "input-change") {
                  setSearchTerm(value);
                }
              }}
              onChange={(value) =>{

                // setFormState({ ...formState, departure: value! })
                console.log("origin selcted")
                updateSearchFormField("origin" , value!)
              }
              }
              blurInputOnSelect={true}
              options={departureLocations}
              className="basic-multi-select w-full"
              classNamePrefix="select"
              onBlur={() => {
                console.log("clicked");
                setSearchTerm("");
                setFlightState({ ...flightState, isFromOpen: false });
              }}
              inputValue={searchTerm}
            />
          </div>
        )}
      </div>

      <div className="bg-white flex h-full justify-center items-center rounded-md col-span-1 cursor-pointer" onClick={()=> setIsRotated(!isRotated)}>
      <ArrowLeftRight
        className={`transform transition-transform duration-300 ${
          isRotated ? 'rotate-180' : ''
        }`}
      />
      </div>

      <div className="bg-white h-full col-span-7 rounded-md cursor-pointer relative">
        <div
          className="flex gap-3 items-center h-full px-2"
          onClick={() => setFlightState({ ...flightState, isToOpen: true })}
        >
          <PlaneLanding />
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">
            {searchForm.destination.label || "Destination"}
          </span>
        </div>
        {flightState.isToOpen && (
          <div className="flex gap-3 items-center h-full w-full bg-transparent absolute top-full left-0 z-50">
            <Select
              autoFocus
              name="colors"
              onInputChange={(value, { action }) => {
                if (action === "input-change") {
                  setSearchTerm(value);
                }
              }}
              onChange={(value) =>
                // setFormState({ ...formState, destination: value! })
                updateSearchFormField("destination" , value!)
                

              }
              blurInputOnSelect={true}
              options={destinationLocations}
              className="basic-multi-select w-full"
              classNamePrefix="select"
              onBlur={() => {
                console.log("clicked");
                setSearchTerm("");
                setFlightState({ ...flightState, isToOpen: false });
              }}
              inputValue={searchTerm}
              placeholder="Search by City or Airport"
            />
          </div>
        )}
      </div>

      <div className="bg-white h-full col-span-5 rounded-md flex items-center px-2 cursor-pointer relative">
        {searchForm.tripType === "ROUNDTRIP" ?
        <DateRangePicker
        className="bg-transparent date-picker"
        editable={false}
        character="-"
        placeholder={format(Date.now(), "EEE, d MMM")}
        renderValue={([start, end]) => {
          return (
            format(start, "EEE, d MMM") + " - " + format(end, "EEE, d MMM")
          );
        }}
        onChange={(value) => {
          updateSearchFormField("departureDate" , value ? addDays(value[0] , 1).toISOString().split("T")[0] : "")
          updateSearchFormField("returnDate" , value ? addDays(value[1] , 1).toISOString().split("T")[0] : "")
        }}
      />
         :
         <DatePicker
          placeholder={format(new Date(), "EEE, d MMM")}
          defaultValue={new Date()}
          value={new Date(searchForm.departureDate)}
          onChange={(value) =>{
            updateSearchFormField("departureDate" , value ? value.toISOString().split("T")[0] : "")
          }
          }
          className="bg-transparent date-picker"
        />
         }
        
        
      </div>

      <div className="bg-white h-full col-span-5 rounded-md flex items-center px-2 cursor-pointer relative">
        <div
          className="flex gap-3 items-center h-full w-full px-2"
          onClick={() => setOpenTraveler(!openTraveler)}
        >
          <User/>
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">
            {adults} Adult{adults > 1 && "s"}, {children.length} Child
          </span>
        </div>
        {openTraveler && (
          <div className="flex gap-3 items-center h-fit w-[20rem] bg-transparent absolute top-full right-0 z-50">
            <Traveler
              adults={adults}
              setAdults={setAdults}
              child={children}
              setChildren={setChildren}
              onDone={() => {
                console.log("Clicked done");
                setOpenTraveler(false);
              }}
            />
          </div>
        )}
      </div>

      <div className="bg-[#2fd24a] h-full rounded-md flex items-center justify-center px-2 col-span-3 cursor-pointer relative">
        <button onClick={(e) => onSubmit(e)} className="text-white">
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchForm;
