import React from "react";

const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="w-full flex justify-center min-h-svh relative overflow-y-scroll overflow-x-hidden">
        {children}
    </div>
  );
};

export default layout;
