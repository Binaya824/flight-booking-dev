'use client'
import React, { useEffect } from 'react'

import { useFlightOffersStore } from "@/components/context/flight-offers-provider";
import { Button } from './button';
import axios, { isAxiosError } from 'axios';
import { FlightOffersResponseRoot } from '@/store';


const Filters = () => {
    const { setFlightOffers, flightOffers, setLoading, setSearched, searched , searchForm ,filterState,updateFilterStateField, updateSearchFormField } =
    useFlightOffersStore((state) => state);
    useEffect(() => {
        updateFilterStateField("directFlight" , searchForm.directFlight)
    }, [])
    useEffect(() => {
       console.log("filter state" , filterState)
    }, [filterState])

    const handleAirlines = (airline:string)=>{
      const airlineArray = [...filterState.includedAirlines];
      const index = airlineArray.indexOf(airline);

      if (index > -1) {
        airlineArray.splice(index, 1);
      } else {
        airlineArray.push(airline);
      }
      updateFilterStateField("includedAirlines" , airlineArray)
    }

    const handleApply = async()=>{

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
          nonStop: filterState.directFlight,
          includedAirlineCodes: filterState.includedAirlines.join(",")
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
    }
    
  return (
    <div className='w-full rounded-md border p-2'>
        <p className='text-lg font-semibold tracking-wider'>Filters</p>
        <p className='text-tiny tracking-wide font-light'>Showing {flightOffers?.data?.data?.length} results</p>

        <div className="mt-10">
            <h2 className='text-lg font-semibold tracking-wider'>Stops</h2>
            <div className="pl-2 mt-3 flex flex-col gap-2">
                <div className="">
                    <input type="radio" name="stops" id="any" checked={!filterState.directFlight} className='scale-200 mr-3' onChange={(e)=> e.target.checked === true ? updateFilterStateField("directFlight" , false) : null}/>
                    <label htmlFor="any">Any</label>
                </div>
                <div className="">
                    <input type="radio" name="stops" id="nonStop"className='scale-200 mr-3' checked={filterState.directFlight} onChange={(e)=> e.target.checked === true ? updateFilterStateField("directFlight" , true) : null}/>
                    <label htmlFor="nonStop">1 Stop Max</label>
                </div>
            </div>
        </div>

        <div className="my-10">
            <h2 className='text-lg font-semibold tracking-wider'>Airlines</h2>
            <div className="pl-2 mt-3 flex flex-col gap-2">
                <div className="">
                    <input type="checkbox" name="indigo" value="6E" id="any" className='scale-200 mr-4' onChange={(e)=> handleAirlines(e.target.value)}/>
                    <label htmlFor="any">Indigo</label>
                </div>
                <div className="">
                    <input type="checkbox" name="airAsia" value="AK" id="nonStop"className='scale-200 mr-4' onChange={(e)=> handleAirlines(e.target.value)} />
                    <label htmlFor="nonStop">Air India</label>
                </div>
                <div className="">
                    <input type="checkbox" name="akasaAir" value="QP" id="nonStop"className='scale-200 mr-4' onChange={(e)=> handleAirlines(e.target.value)} />
                    <label htmlFor="nonStop">Akasa Air</label>
                </div>
                <div className="">
                    <input type="checkbox" name="vistara" value="UK" id="nonStop"className='scale-200 mr-4' onChange={(e)=> handleAirlines(e.target.value)} />
                    <label htmlFor="nonStop">Vistara</label>
                </div>
                <div className="">
                    <input type="checkbox" name="airAsiax" value="D7" id="nonStop"className='scale-200 mr-4' onChange={(e)=> handleAirlines(e.target.value)} />
                    <label htmlFor="nonStop">Air Asiax</label>
                </div>
            </div>
        </div>
        <div className="text-right">

        <Button onClick={handleApply}>
            Apply
        </Button>
        </div>

    </div>
  )
}

export default Filters