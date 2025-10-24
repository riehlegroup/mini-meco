import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import TopNavBar from "../common/TopNavBar";
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
import Button from "@/components/common/Button";
import SectionCard from "@/components/common/SectionCard";
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

// Create TimePicker instance outside component to avoid recreating on every render
const timePickerPlugin = <TimePicker key="time-picker" />;

const Happiness: React.FC = (): React.ReactNode => {
  const location = useLocation();

  const [projectName, setProjectName] = useState<string | null>("");
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const [courses, setCourses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [values, setValues] = useState<DateObject[]>([]);
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

  const handleHappinessSubmit = async (ratingValue: number) => {
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
          happiness: ratingValue,
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
    <div className="min-h-screen">
      <TopNavBar title="Happiness" showBackButton={true} showUserInfo={true} />
      <div className="mx-auto max-w-6xl space-y-4 p-4 pt-16">
        <Tabs defaultValue="User" className="w-full">
          <TabsList className="inline-flex h-auto gap-1 bg-slate-100 p-2">
            {userRole === "ADMIN" && (
              <TabsTrigger value="Admin" className="data-[state=active]:bg-white data-[state=active]:shadow">
                Admin
              </TabsTrigger>
            )}
            <TabsTrigger value="User" className="data-[state=active]:bg-white data-[state=active]:shadow">
              User
            </TabsTrigger>
            <TabsTrigger value="Display" className="data-[state=active]:bg-white data-[state=active]:shadow">
              Display
            </TabsTrigger>
          </TabsList>
        <TabsContent value="Admin">
          <SectionCard title="Manage Sprints">
            <div className="space-y-4">
              <Select
                onValueChange={(value) => {
                  setSelectedCourse(value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Project Group" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCourse && (
                <>
                  <div className="rounded-lg border border-slate-200 p-4">
                    <Calendar
                      key={selectedCourse}
                      value={values}
                      onChange={setValues}
                      multiple
                      plugins={[timePickerPlugin]}
                    />
                  </div>
                  <Button onClick={handleDate}>Save Sprints</Button>
                </>
              )}
            </div>
          </SectionCard>
        </TabsContent>
        <TabsContent value="User">
          <SectionCard title="Submit Happiness Rating">
            {!currentSprint ? (
              <div className="rounded-md bg-red-50 p-4 text-center text-sm text-red-700">
                No active sprint available. Please contact an administrator to create sprints first.
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  <div className="text-sm text-slate-600">
                    Please Enter Before{" "}
                    <span className="font-semibold">
                      {moment(currentSprint.endDate).format("DD-MM-YYYY HH:mm:ss")}
                    </span>
                  </div>
                  <div className="space-y-6">
                    <div className="text-lg font-semibold text-slate-900">
                      How happy are you doing this project?
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {[-3, -2, -1, 0, 1, 2, 3].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleHappinessSubmit(rating)}
                          className="flex flex-col items-center gap-1 rounded-lg border-2 border-slate-300 bg-white p-3 text-sm font-semibold transition-all hover:border-primary hover:bg-slate-50 active:bg-primary active:text-white"
                          type="button"
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </SectionCard>
        </TabsContent>
        <TabsContent value="Display">
          <SectionCard title={`Happiness - ${projectName}`}>
            <ResponsiveContainer height={400} width="100%">
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
          </SectionCard>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Happiness;
