"use client";

import { Provider } from "react-redux";
import React from "react";
import store from "./store";
import { NextUIProvider } from "@nextui-org/system";

type Props = {
  children: React.ReactNode;
};

export default function ReduxProvider({ children }: Props) {
  return (
    <Provider store={store}>
      <NextUIProvider>{children}</NextUIProvider>
    </Provider>
  );
}
