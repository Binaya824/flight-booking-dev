"use client";

import React from "react";
import SearchForm from "../Forms/SearchForm";
import { useState, useEffect } from "react";
import axios from "axios";
import { useFlightOffersStore } from "../context/flight-offers-provider";


export type CabinClass = {
  name: string;
  value: string;
};
const Search = () => {
  const { updateSearchFormField , searchForm } =
    useFlightOffersStore((state) => state);


// Create the array of cabin classes
const cabinClasses: CabinClass[] = [
  { name: "Economy", value: "ECONOMY" },
  { name: "Premium economy", value: "PREMIUM_ECONOMY" },
  { name: "Business", value: "BUSINESS" },
  { name: "First class", value: "FIRST" },
];

  return (
    <div className="w-full px-2 pt-4">
      <h2 className="text-3xl font-bold">Compare and book flights with ease</h2>
      <div className="">
        <p className="my-2">Discover your next dream destination</p>
        <ul className="flex gap-6 mb-2 items-center">
          <li className="flex items-center">
            <input
              type="radio"
              name="tripType"
              id="round-trip"
              value="ROUNDTRIP"
              checked={searchForm.tripType === 'ROUNDTRIP'}
              className="scale-150 mr-3"
              onChange={(e)=> updateSearchFormField("tripType" , e.target.value)}
            />
            <label htmlFor="round-trip">Round Trip</label>
          </li>

          <li className="flex items-center">
            <input
              type="radio"
              name="tripType"
              id="one-way"
              value="ONEWAY"
              checked={searchForm.tripType === 'ONEWAY'}
              className="scale-150 mr-3"
              onChange={(e)=> updateSearchFormField("tripType" , e.target.value)}
            />
            <label htmlFor="one-way">One Way</label>
          </li>

          {/* <li className="flex items-center">
            <input
              type="radio"
              name="tripType"
              id="multi-city"
              className="scale-150 mr-3"
            />
            <label htmlFor="multi-city">Multi City</label>
          </li> */}
          <li className="flex items-center">
            <select
              name="cabinClass"
              defaultValue={cabinClasses[0].name}
              className="p-1 bg-transparent"
              onChange={(e)=> updateSearchFormField("travelClass" , e.target.value)}
            >
              {cabinClasses.map((el, index) => {
                return (
                  <option value={el.value} key={index}>
                    {el.name}
                  </option>
                );
              })}
            </select>
          </li>
          <li className="flex items-center">
            <input
              type="checkbox"
              name="directFlight"
              id="direct-flight"
              className="scale-150 mr-3"
              checked={searchForm.directFlight}
              onChange={(e)=> updateSearchFormField("directFlight" , e.target.checked)}
            />
            <label htmlFor="direct-flight">Direct Flight</label>
          </li>
        </ul>

        <SearchForm />
      </div>
    </div>
  );
};

export default Search;
