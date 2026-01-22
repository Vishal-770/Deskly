"use client";

import { useAuth } from "./useAuth";

const ShowLoginStatus = () => {
  const { authState, loading } = useAuth();

  if (loading) {
    return <div>Loading auth status...</div>;
  }

  if (!authState || !authState.loggedIn) {
    return (
      <div>
        <p>User is not logged in.</p>
      </div>
    );
  }

  return <div>User Logged In</div>;
};

export default ShowLoginStatus;
