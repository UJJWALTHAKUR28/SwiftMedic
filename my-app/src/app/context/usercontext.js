// context/UserContext.js
"use client";
import { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({email:'',
    fullName:{
        firstName:'',
        lastName:''
    }
  }); // can store token, role, etc.

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
