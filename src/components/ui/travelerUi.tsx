"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useFlightOffersStore } from "@/components/context/flight-offers-provider";

// Define Child type
export type Child = {
  id: number;
  age: number;
};

export default function Traveler({
  adults,
  setAdults,
  child,
  setChildren,
  onDone,
}: {
  adults: number;
  setAdults: (value: number | ((prev: number) => number)) => void;
  child: Child[];
  setChildren: (value: Child[] | ((prevChildren: Child[]) => Child[])) => void;
  onDone: () => void;
}) {
  const {updateSearchFormField } =
    useFlightOffersStore((state) => state);
  const MAX_TRAVELERS = 9;

  // Calculate total travelers
  const totalTravelers = adults + child.length;

  const handleIncrementAdults = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (totalTravelers >= MAX_TRAVELERS) return;
    setAdults((prev: number) => Math.min(MAX_TRAVELERS, prev + 1));
  };

  const handleIncrementChildren = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (totalTravelers >= MAX_TRAVELERS) return;
    // Add a new child with default age of 0
    setChildren((prevChildren: Child[]) => {
      return [...prevChildren, { id: prevChildren.length + 1, age: 0 }];
    });
  };

  const handleDecrementAdults = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    setAdults((prev) => Math.max(1, prev - 1)); // At least 1 adult
  };

  const handleDecrementChildren = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    setChildren((prevChildren) => prevChildren.slice(0, -1)); // Remove the last child
  };

  const handleChildAgeChange = (id: number, newAge: number) => {
    setChildren((prevChildren) =>
      prevChildren.map((child) =>
        child.id === id ? { ...child, age: newAge } : child
      )
    );
  };

  const handleDone = ()=>{
    console.log(adults , "+====+" , child)
    updateSearchFormField("adult" , adults)
    updateSearchFormField("child" , child.length)
  }

  return (
    <Card className="w-full max-w-sm mx-auto relative">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Adults section */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="adults">Adults</Label>
              <div className="text-sm text-muted-foreground">Age 18+</div>
            </div>
            <div className="flex items-center">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={handleDecrementAdults}
              >
                -
              </Button>
              <span className="h-8 w-16 mx-2 text-center flex items-center justify-center">
                {adults}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={handleIncrementAdults}
              >
                +
              </Button>
            </div>
          </div>

          {/* Children section */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="children">Children</Label>
              <div className="text-sm text-muted-foreground">Age 0 - 17</div>
            </div>
            <div className="flex items-center">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={handleDecrementChildren}
              >
                -
              </Button>
              <span className="h-8 w-16 mx-2 text-center flex items-center justify-center">
                {child.length}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={handleIncrementChildren}
              >
                +
              </Button>
            </div>
          </div>

          {/* Children Age Input */}
          {child.length > 0 && (
            <div className="space-y-4">
              {child.map((el:any) => (
                <div
                  key={el.id}
                  className="flex items-center justify-between"
                >
                  <Label htmlFor={`child-${el.id}`}>
                    Child {el.id} Age
                  </Label>
                  <Select
                    value={el.age.toString()}
                    onValueChange={(value) =>
                      handleChildAgeChange(el.id, parseInt(value))
                    }
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Select age" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Age</SelectLabel>
                        {Array.from(Array(18).keys()).map((age) => (
                          <SelectItem key={age} value={age.toString()}>
                            {age}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center p-6 pt-0">
        <div>{totalTravelers} travelers</div>
        <Button onClick={()=>{
          handleDone()
          onDone()
        }} type="button">
          Done
        </Button>
      </CardFooter>
    </Card>
  );
}
