import React from "react";
import { useNavigate } from "react-router-dom";
import ReturnButton from "../Components/return";

const UserAdmin: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate("/user-admin");
  };

  return (
    <div onClick={handleNavigation}>
      <ReturnButton />
      <h3>User Administration</h3>
    </div>
  );
};

export default UserAdmin;
