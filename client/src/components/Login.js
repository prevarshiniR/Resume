import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import { Button, TextField, Box } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import useFetch from "../hooks/useFetch";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { handleGoogle, loading, error, handleFetch } = useFetch(
    process.env.REACT_APP_LOGIN_URL,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }
  );
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Sending login request...");
      const response = await handleFetch({
        body: JSON.stringify({ email, password }),
      });
      console.log("Response received:", response);
  
      if (response?.message === "Login successful") {
        console.log("Login successful, redirecting to profile page...");
        localStorage.setItem("user", JSON.stringify(response?.user));
        navigate(0);
        // Assuming '/profile' is the route for the profile page
      } else {
        console.error("Login failed:", response.message);
      }
    } catch (err) {
      console.error("Error during login:", err);
    }
  };
  

  useEffect(() => {
    /* global google */
    if (window.google) {
      google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleGoogle,
      });

      google.accounts.id.renderButton(document.getElementById("loginDiv"), {
        theme: "filled_black",
        text: "signin_with",
        shape: "pill",
      });

      google.accounts.id.prompt();
    }
  }, [handleGoogle]);

  return (
    <div>
      <NavBar />
      <br />
      <Button component={Link} to="/" variant="contained" color="primary">
        <ArrowBackIcon style={{ marginRight: "5px" }} /> Back
      </Button>
      <br />
      <br />
      <header style={{ textAlign: "center" }}>
        <h1>LOGIN TO CONTINUE</h1>
      </header>
      <br />
      <main
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {error && <p style={{ color: "red" }}>{error}</p>}
        {loading ? (
          <div>Loading....</div>
        ) : (
          <>
            <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "400px" }}>
              <Box mb={2}>
                <TextField
                  label="Email"
                  type="email"
                  variant="outlined"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Box>
              <Box mb={2}>
                <TextField
                  label="Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Box>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Login
              </Button>
            </form>
            <div id="loginDiv" style={{ marginTop: "20px" }}></div>
          </>
        )}
      </main>
      <footer></footer>
    </div>
  );
};

export default Login;
