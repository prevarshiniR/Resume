import { useState } from "react";

const useFetch = (url, options) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFetch = async (fetchOptions) => {
    setLoading(true);
    try {
      const response = await fetch(url, {
        ...options,
        ...fetchOptions,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong");
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, handleFetch };
};

export default useFetch;