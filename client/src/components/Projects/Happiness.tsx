import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReturnButton from "../Components/return";
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
  const [happinessData, setHappinessData] = useState<any[]>([]);
  const [currentSprint, setCurrentSprint] = useState<{
    endDate: string;
    sprintName?: string;
  } | null>(null);

  const handleNavigation = () => {
    navigate("/happiness");
  };

  useEffect(() => {
    const projectNameFromState = location.state?.projectName;
    if (projectNameFromState) {
      setProjectName(projectNameFromState);
    }
    const storedUserName = localStorage.getItem("username");
    if (storedUserName) {
      setUser((prev) => prev && ({ ...prev , name: storedUserName }));
    }
  }, [location.state]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:3000/course");
        const data = await response.json();
        setCourses(data.map((item: any) => item.CourseName));
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
      const userName = localStorage.getItem("username");
      const userEmail = localStorage.getItem("email");
      if (userName && userEmail) {
        setUser({ name: userName, email: userEmail });
      } else {
        console.warn("User data not found in localStorage");
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchAllSprints = async () => {
      if (!selectedCourse) return;

      try {
        const response = await fetch(
          `http://localhost:3000/courseProject/sprints?courseName=${encodeURIComponent(
            selectedCourse
          )}`
        );
        const sprints = await response.json();

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
        const response = await fetch(
          `http://localhost:3000/courseProject/currentSprint?projectName=${encodeURIComponent(
            projectName
          )}`
        );
        const sprints = await response.json();
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
      const response = await fetch(
        "http://localhost:3000/courseProject/sprints",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            courseName: selectedCourse,
            dates: formattedDates,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error creating sprints: ${errorData.message}`);
        return;
      }
      alert("Sprints created successfully");
    } catch (error) {
      console.error("Error creating sprints:", error);
    }
  };

  const handleHappinessSubmit = async () => {
    try {
      await fetch("http://localhost:3000/courseProject/happiness", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName,
          userEmail: user?.email,
          happiness,
          sprintName: currentSprint?.sprintName,
        }),
      });
      alert("Happiness updated successfully");
    } catch (error) {
      console.error("Error updating happiness:", error);
    }
  };

  const fetchHappinessData = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/courseProject/happiness?projectName=${encodeURIComponent(
          projectName ?? ""
        )}`
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
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

  const formattedData: { [sprintName: string]: any } = {};
  happinessData.forEach((data) => {
    if (!formattedData[data.sprintName]) {
      formattedData[data.sprintName] = { sprintName: data.sprintName };
    }
    formattedData[data.sprintName][data.userEmail] = data.happiness;
  });

  // Convert to array for recharts
  const chartData = Object.values(formattedData);

  return (
    <div onClick={handleNavigation}>
      <ReturnButton />
      <div className="DashboardContainer">
        <h1>Happiness</h1>
      </div>
      <Tabs defaultValue="User" className="Tabs">
        <TabsList className="TabsList">
          <TabsTrigger
            value="Admin"
            onClick={() => setActiveTab("Admin")}
            className={`Admin ${activeTab === "Admin" ? "active" : ""}`}
          >
            Admin
          </TabsTrigger>
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
                plugins={[<TimePicker />]}
              />
            </div>
            <Button className="save" type="submit" onClick={handleDate}>
              Save
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="User">
          <div className="BigContainerUser">
            <div className="UserSentence1">
              Please Enter Before{" "}
              {currentSprint &&
                moment(currentSprint.endDate).format("DD-MM-YYYY HH:mm:ss")}
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
                  const { key, ...otherProps } = props;
                  return (
                    <div key={state.index} {...otherProps}>
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
