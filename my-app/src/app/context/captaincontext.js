'use client';

import { createContext, useContext, useState } from 'react';

const DriverContext = createContext();

export const DriverProvider = ({ children }) => {
  const [driverData, setDriverData] = useState({
    fullname: {
      firstname: "",
      lastname: ""
    },
    email: "",
    password: "",
    phonenumber: "",
    vehicle: {
      plate: "",
      type: "",
      model: "",
      color: "",
      year: 0,
      capacity: 0
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  return (
    <DriverContext.Provider value={{ driverData, setDriverData, isLoading, setIsLoading }}>
      {children}
    </DriverContext.Provider>
  );
};

export const useDriver = () => useContext(DriverContext);
