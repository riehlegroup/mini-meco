import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReturnButton from "../Components/return";
import "./UserAdmin.css";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import Edit from "./../../assets/Edit.png";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import Button from "react-bootstrap/esm/Button";

const UserAdmin: React.FC = () => {
  const navigate = useNavigate();

  const [status, setStatus] = useState<string | null>("");
  const [newStatus, setNewStatus] = useState<string | null>("");
  const [users, setUsers] = useState<{ name: string; email: string }[]>([]);

  const [message, setMessage] = useState<string | null>(null);

  const handleNavigation = () => {
    navigate("/user-admin");
  };

  const fetchUserStatus = async (status: string) => {
    try {
      const response = await fetch(
        `http://localhost:3000/getUserStatus?status=${status}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    if (status) {
      fetchUserStatus(status);
    }
  }, [status]);

  const handleUserStatusChange = async (email: string, status: string) => {

    try {
      const response = await fetch("http://localhost:3000/updateUserStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, status }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error("Failed to update user status");
      }

      setMessage(data.message || "Success!");
      if (data.message.includes("successfully")) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      setMessage("Failed to update user status");
    }
  };

  const sendConfirmationEmail = async (email: string) => {
    try {
      const response = await fetch(
        "http://localhost:3000/sendConfirmationEmail",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || "Confirmation email sent successfully!");
        if (data.message.includes("successfully")) {
          window.location.reload();
        }
      } else {
        throw new Error(data.message || "Failed to send confirmation email");
      }
    } catch (error) {
      console.error("Error sending confirmation email:", error);
      setMessage("Failed to send confirmation email");
    }
  };

  const changeAllConfirmedUsersStatus = async (status: string) => {
    
    try {
      const response = await fetch(
        "http://localhost:3000/updateAllConfirmedUsers",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setMessage(
          data.message ||
            `All confirmed users have been changed to ${newStatus}`
        );
        window.location.reload();
      } else {
        throw new Error(data.message || "Failed to update all confirmed users");
      }
    } catch (error) {
      console.error("Error updating all confirmed users:", error);
      setMessage("Failed to update all confirmed users");
    }
  };

  return (
    <div onClick={handleNavigation}>
      <ReturnButton />
      <div className="DashboardContainer">
        <h1>User Admin</h1>
      </div>
      <div className="BigContainerUserAdmin">
        <div className="SelectWrapperUserAdmin">
          <Select onValueChange={(value) => setStatus(value)}>
            <SelectTrigger className="SelectTrigger">
              <SelectValue
                className="SelectValue"
                placeholder="Select Status"
              />
            </SelectTrigger>
            <SelectContent className="SelectContent">
              <SelectItem value={"unconfirmed"}>
                <div className="SelectItem">unconfirmed</div>
              </SelectItem>
              <SelectItem value={"confirmed"}>
                <div className="SelectItem">confirmed</div>
              </SelectItem>
              <SelectItem value={"suspended"}>
                <div className="SelectItem">suspended</div>
              </SelectItem>
              <SelectItem value={"removed"}>
                <div className="SelectItem">removed</div>
              </SelectItem>
            </SelectContent>
          </Select>
          {status === "confirmed" && (
            <Button
              className="removeAll"
              variant="primary"
              onClick={() => changeAllConfirmedUsersStatus("removed")}
            >
              Remove All
            </Button>
          )}
        </div>
        {users.map((user, index) => (
          <React.Fragment key={user.email}>
            <div className="ProjectItem">
              <div className="ProjectName">
                {user.name} ({user.email})
              </div>
              <Dialog>
                <DialogTrigger className="DialogTrigger">
                  <img className="Edit" src={Edit} />
                </DialogTrigger>
                <DialogContent className="DialogContentUserAdmin">
                  <DialogHeader>
                    <DialogTitle className="DialogTitle">
                      Change User Status
                    </DialogTitle>
                  </DialogHeader>
                  <div className="EmailInput">
                    <div className="userUserAdmin">User:</div>
                    <div className="userContent">
                      {user.name} ({user.email})
                    </div>
                  </div>
                  <div className="currentStatusMargin">
                    <div className="currentStatusUserAdmin">
                      Current Status:{" "}
                    </div>
                    <div className="userContent">{status}</div>
                  </div>
                  <div className="EmailInput">
                    <div className="newStatusUserAdmin">New Status: </div>
                    <div className="SelectWrapperUserAdminInsideDIalog">
                      <Select onValueChange={(value) => setNewStatus(value)}>
                        <SelectTrigger className="SelectTrigger">
                          <SelectValue
                            className="SelectValue"
                            placeholder="Select Status"
                          />
                        </SelectTrigger>
                        <SelectContent className="SelectContent">
                          <SelectItem value={"unconfirmed"}>
                            <div className="SelectItem">unconfirmed</div>
                          </SelectItem>
                          <SelectItem value={"confirmed"}>
                            <div className="SelectItem">confirmed</div>
                          </SelectItem>
                          <SelectItem value={"suspended"}>
                            <div className="SelectItem">suspended</div>
                          </SelectItem>
                          <SelectItem value={"removed"}>
                            <div className="SelectItem">removed</div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      className="create"
                      variant="primary"
                      onClick={() => {
                        if (newStatus) {
                          handleUserStatusChange(user.email, newStatus);
                        } else {
                          setMessage(
                            "Please select a status before confirming"
                          );
                        }
                      }}
                    >
                      Confirm
                    </Button>
                    {status === "unconfirmed" && (
                      <Button
                        className="sendConfirmationEmail"
                        variant="primary"
                        onClick={() => sendConfirmationEmail(user.email)}
                      >
                        Send Confirmation Email
                      </Button>
                    )}
                  </DialogFooter>
                  {message && <div className="Message">{message}</div>}
                </DialogContent>
              </Dialog>
            </div>
            {index < users.length - 1 && <hr className="ProjectDivider" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default UserAdmin;
