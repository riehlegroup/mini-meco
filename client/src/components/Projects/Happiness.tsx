import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TopNavBar from "../common/TopNavBar";
import "./Happiness.css";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, DateObject } from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import Button from "react-bootstrap/esm/Button";
import ReactSlider from "react-slider";
import moment from "moment";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useUserRole } from "@/hooks/useUserRole";
import AuthStorage from "@/services/storage/auth";
import ApiClient from "@/services/api/client";

const Happiness: React.FC = (): React.ReactNode => {
  const navigate = useNavigate();
  const location = useLocation();

  const [projectName, setProjectName] = useState<string | null>("");
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("User");
  const [courses, setCourses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [values, setValues] = useState<DateObject[]>([]);
  const [happiness, setHappiness] = useState<number>(0);
  const [happinessData, setHappinessData] = useState<Array<{
    id: number;
    projectId: number;
    userId: number;
    happiness: number;
    sprintId: number | null;
    timestamp: string;
    sprintName: string | null;
    userEmail: string;
  }>>([]);
  const [currentSprint, setCurrentSprint] = useState<{
    endDate: string;
    sprintName?: string;
  } | null>(null);
  const userRole = useUserRole();

  const handleNavigation = () => {
    navigate("/happiness");
  };

  useEffect(() => {
    const projectNameFromState = location.state?.projectName;
    if (projectNameFromState) {
      setProjectName(projectNameFromState);
    }
    const authStorage = AuthStorage.getInstance();
    const storedUserName = authStorage.getUserName();
    if (storedUserName) {
      setUser((prev) => prev && ({ ...prev , name: storedUserName }));
    }
  }, [location.state]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const result = await ApiClient.getInstance().get<{
          success: boolean;
          data: Array<{ courseName: string }>;
        }>("/course");
        const data = result.data || [];
        setCourses(data.map((item: { courseName: string }) => item.courseName));
        console.log("Fetched project groups:", data);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchUserData = () => {
      const authStorage = AuthStorage.getInstance();
      const userName = authStorage.getUserName();
      const userEmail = authStorage.getEmail();
      if (userName && userEmail) {
        setUser({ name: userName, email: userEmail });
      } else {
        console.warn("User data not found in storage");
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchAllSprints = async () => {
      if (!selectedCourse) return;

      try {
        const sprints = await ApiClient.getInstance().get<Array<{ endDate: string }>>(
          "/courseProject/sprints",
          { courseName: encodeURIComponent(selectedCourse) }
        );

        setValues(
          sprints.map(
            (sprint: { endDate: string }) =>
              new DateObject({ date: new Date(sprint.endDate) })
          )
        );
      } catch (error) {
        console.error("Error fetching sprints:", error);
      }
    };

    fetchAllSprints();
  }, [selectedCourse]);

  useEffect(() => {
    const fetchCurrentSprints = async () => {
      if (!projectName) return;

      try {
        const sprints = await ApiClient.getInstance().get<Array<{ endDate: string; sprintName?: string }>>(
          "/courseProject/currentSprint",
          { projectName: encodeURIComponent(projectName) }
        );
        const currentDate = new Date();

        const currentSprint = sprints.find(
          (sprint: { endDate: string; sprintName?: string }) =>
            new Date(sprint.endDate) > currentDate
        );

        if (currentSprint) {
          setCurrentSprint(currentSprint);
        }
      } catch (error) {
        console.error("Error fetching sprints:", error);
      }
    };

    fetchCurrentSprints();
  }, [projectName]);

  const handleDate = async () => {
    const formattedDates = values.map((date) =>
      moment(date.toDate()).format("YYYY-MM-DD HH:mm:ss")
    );

    console.log("Selected Dates:", formattedDates);

    try {
      await ApiClient.getInstance().post<{ message: string }>(
        "/courseProject/sprints",
        {
          courseName: selectedCourse,
          dates: formattedDates,
        }
      );
      alert("Sprints created successfully");
    } catch (error) {
      if (error instanceof Error) {
        alert(`Error creating sprints: ${error.message}`);
      }
      console.error("Error creating sprints:", error);
    }
  };

  const handleHappinessSubmit = async () => {
    if (!projectName || !user?.email) {
      alert("Missing project or user information");
      return;
    }

    try {
      await ApiClient.getInstance().post<{ message: string }>(
        "/courseProject/happiness",
        {
          projectName,
          userEmail: user.email,
          happiness,
          sprintName: currentSprint?.sprintName ?? "",
        }
      );
      alert("Happiness updated successfully");
    } catch (error) {
      console.error("Error updating happiness:", error);
    }
  };

  const fetchHappinessData = async () => {
    try {
      const data = await ApiClient.getInstance().get<Array<{
        id: number;
        projectId: number;
        userId: number;
        happiness: number;
        sprintId: number | null;
        timestamp: string;
        sprintName: string | null;
        userEmail: string;
      }>>(
        "/courseProject/happiness",
        { projectName: encodeURIComponent(projectName ?? "") }
      );
      setHappinessData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch happiness data:", error);
    }
  };

  useEffect(() => {
    if (projectName) {
      fetchHappinessData();
    }
  }, [projectName]);

  const emailColors: { [email: string]: string } = {};
  const uniqueEmails = [
    ...new Set(happinessData.map((data) => data.userEmail)),
  ];
  uniqueEmails.forEach((email, index) => {
    emailColors[email] = `hsl(${(index * 360) / uniqueEmails.length
      }, 100%, 50%)`;
  });

  const formattedData: { [sprintName: string]: { sprintName: string; [userEmail: string]: number | string } } = {};
  happinessData.forEach((data) => {
    if (!data.sprintName) return;

    if (!formattedData[data.sprintName]) {
      formattedData[data.sprintName] = { sprintName: data.sprintName };
    }
    formattedData[data.sprintName][data.userEmail] = data.happiness;
  });

  // Convert to array for recharts
  const chartData = Object.values(formattedData);

  return (
    <div onClick={handleNavigation}>
      <TopNavBar title="Happiness" showBackButton={true} showUserInfo={true} />
      <Tabs defaultValue="User" className="Tabs">
        <TabsList className="TabsList">
          {userRole === "ADMIN" && (
            <TabsTrigger
              value="Admin"
              onClick={() => setActiveTab("Admin")}
              className={`Admin ${activeTab === "Admin" ? "active" : ""}`}
            >
              Admin
            </TabsTrigger>
          )}
          <TabsTrigger
            value="User"
            onClick={() => setActiveTab("User")}
            className={`User ${activeTab === "User" ? "active" : ""}`}
          >
            User
          </TabsTrigger>
          <TabsTrigger
            value="Display"
            onClick={() => setActiveTab("Display")}
            className={`Display ${activeTab === "Display" ? "active" : ""}`}
          >
            Display
          </TabsTrigger>
        </TabsList>
        <TabsContent value="Admin">
          <div className="BigContainerAdmin">
            <div className="SelectWrapperHappiness">
              <Select
                onValueChange={(value) => {
                  console.log("Selected Project Group:", value);
                  setSelectedCourse(value);
                }}
              >
                <SelectTrigger className="SelectTrigger">
                  <SelectValue
                    className="SelectValue"
                    placeholder="Select Project Group"
                  />
                </SelectTrigger>
                <SelectContent className="SelectContent">
                  {courses.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            Sprints
            <div className="Calendar">
              <Calendar
                className="custom-calendar"
                value={values}
                onChange={setValues}
                multiple
                plugins={[<TimePicker key="time-picker" />]}
              />
            </div>
            <Button className="save" type="submit" onClick={handleDate}>
              Save
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="User">
          <div className="BigContainerUser">
            {!currentSprint ? (
              <div className="my-5 p-5 text-center text-lg font-bold text-red-700">
                No active sprint available. Please contact an administrator to create sprints first.
              </div>
            ) : (
              <>
                <div className="UserSentence1">
                  Please Enter Before{" "}
                  {moment(currentSprint.endDate).format("DD-MM-YYYY HH:mm:ss")}
                </div>
                <div className="UserSentence2">
                  How happy are you doing this project?
                </div>
                <div className="slider-container">
                  <ReactSlider
                    className="horizontal-slider"
                    marks
                    markClassName="example-mark"
                    min={-3}
                    max={3}
                    thumbClassName="example-thumb"
                    trackClassName="example-track"
                    renderThumb={(props, state) => {
                      const { key, ...restProps } = props;
                      return (
                        <div key={key} {...restProps}>
                          {state.valueNow}
                        </div>
                      );
                    }}
                    onChange={(value) => setHappiness(value)}
                  />
                  <div className="scale">
                    <span>-3</span>
                    <span>-2</span>
                    <span>-1</span>
                    <span>0</span>
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                  </div>
                </div>
                <Button
                  className="confirm"
                  type="submit"
                  onClick={handleHappinessSubmit}
                >
                  Confirm
                </Button>
              </>
            )}
          </div>
        </TabsContent>
        <TabsContent value="Display">
          <div className="BigContainerDisplay">
            <div className="projectTitle">{projectName}</div>
            <ResponsiveContainer height={600} width="100%">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 70, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="1 1" />
                <XAxis dataKey="sprintName" />
                <YAxis domain={[-3, 3]} ticks={[-3, -2, -1, 0, 1, 2, 3]} />

                {uniqueEmails.map((email) => (
                  <Line
                    key={email}
                    type="monotone"
                    dataKey={email}
                    stroke={emailColors[email]}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Happiness;
