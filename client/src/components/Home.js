import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import { Button, TextField, Box, Paper, Divider, Typography } from "@mui/material";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import useFetch from "../hooks/useFetch";

const carousel1 = "/static/carousel1.jpg";
const carousel2 = "/static/carousel2.jpg";
const carousel3 = "/static/carousel3.jpg";
const carousel4 = "/static/carousel4.jpg";

const responsive = {
  superLargeDesktop: { breakpoint: { max: 4000, min: 3000 }, items: 5 },
  desktop: { breakpoint: { max: 3000, min: 1024 }, items: 3 },
  tablet: { breakpoint: { max: 1024, min: 464 }, items: 2 },
  mobile: { breakpoint: { max: 464, min: 0 }, items: 1 },
};

const Home = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const { loading, error, handleFetch } = useFetch(process.env.REACT_APP_SIGNUP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const response = await handleFetch({
        body: JSON.stringify({ email, password, name, mobile }),
      });
      console.log(response);
      if (response?.message  === "Signup was successful") {
        localStorage.setItem("user", JSON.stringify(response?.user));
        navigate("/profile");
        
      } else {
        console.error(response?.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <NavBar />
      <Box>
        <Carousel responsive={responsive} infinite showDots autoPlay autoPlaySpeed={3000}>
          <Paper><img src={carousel1} height={400} width={400} alt="carousel1" /></Paper>
          <Paper><img src={carousel2} height={400} width={400} alt="carousel2" /></Paper>
          <Paper><img src={carousel3} height={400} width={400} alt="carousel3" /></Paper>
          <Paper><img src={carousel4} height={400} width={400} alt="carousel4" /></Paper>
        </Carousel>
      </Box>
      <Divider />
      <Box textAlign="center" mt={2}>
        <Typography variant="h4">Create an Account</Typography>
        <form onSubmit={handleSignUp} style={{ margin: "0 auto", maxWidth: "400px" }}>
          {error && <p style={{ color: "red" }}>{error}</p>}
          {loading ? (
            <div>Loading....</div>
          ) : (
            <>
              <TextField
                label="Name"
                variant="outlined"
                fullWidth
                margin="normal"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                label="Email"
                type="email"
                variant="outlined"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label="Mobile"
                variant="outlined"
                fullWidth
                margin="normal"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
              <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Sign Up
              </Button>
            </>
          )}
        </form>
        <Box mt={2}>
          <Typography variant="h6">Already have an account?</Typography>
          <Button component={Link} to="/login" variant="contained" color="primary" fullWidth>
            Email/Password Login
          </Button>
          <Button
            onClick={() => window.google.accounts.id.prompt()}
            variant="contained"
            color="primary"
            fullWidth
            style={{ marginTop: "10px" }}
          >
            
          </Button>
        </Box>
      </Box>
    </div>
  );
};

export default Home;
