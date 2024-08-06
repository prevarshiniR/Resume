import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const navigate = useNavigate();

  const handleFetch = async ({ body }) => {
    // Assuming this function sends a fetch request to your backend
    const response = await fetch("http://localhost:4000/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });
    return response.json();
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      console.log("Sending signup request...");
      const response = await handleFetch({
        body: JSON.stringify({ email, password, name, mobile }),
      });
      console.log("Response received:", response);

      if (response?.status === "Success") {
        console.log("Signup successful, redirecting to login page...");
        navigate("/profile");
      } else {
        console.error("Signup failed:", response?.message);
      }
    } catch (err) {
      console.error("Error during signup:", err);
    }
  };

  return (
    <form onSubmit={handleSignUp}>
      <div>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="mobile">Mobile:</label>
        <input
          type="text"
          id="mobile"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />
      </div>
      <button type="submit">Sign Up</button>
    </form>
  );
};

export default SignUp;
