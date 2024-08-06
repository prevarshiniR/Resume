import React, { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "./components/NavBar";
import "./App.css";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Profile from "./components/Profile";

import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

export function App() {
  const [user, setUser] = useState({});
  const [verified, setVerified] = useState(true);

  useEffect(() => {
    async function tokenVerifier() {
      if (user?.email) {
        const data = {
          token: user.token,
          email: user.email,
        };
        await axios
          .post("/verifyToken", data)
          .then((res) => {
            if (res.status === 200) setVerified(true);
          })
          .catch((err) => {
            const errorStatus = err.response.status;
            if (errorStatus === 401) setVerified(false);
          });
      }
    }

    tokenVerifier(user);
  }, [user]);



  useEffect(() => {
    const theUser = localStorage.getItem("user");
    console.log(theUser);
    if (theUser && !theUser.includes("undefined")) {
      setUser(JSON.parse(theUser));
    }
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            exact
            path="/"
            element={
              user?.email ? (
                <>
                  <NavBar></NavBar>
                  "Homepage"
                </>
              ) : (
                <Home />
              )
            }
          ></Route>
          <Route
            exact
            path="/signup"
            element={user?.email ? <>
              <NavBar></NavBar>
              "Signed In Successfully"
              </>: <Signup />}
          ></Route>
          <Route
            exact
            path="/login"
            element={user?.email ? <>
              <NavBar></NavBar>
      
              <Profile/>
              </> : <Login />}
          ></Route>
          <Route
            exact
            path="/profile"
            element={user?.email ? <>
              <NavBar></NavBar>
              <Profile/>
              </> : <Login />}
          ></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
