import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Form from "@radix-ui/react-form";
import * as Tabs from "@radix-ui/react-tabs";
import EmailWidget from "@/components/Components/EmailWidget.tsx";
import PasswordWidget from "@/components/Components/PasswordWidget";
import { API_BASE_URL } from "@/config/api";

const LoginScreen = () => {
  const navigate = useNavigate();
  const [action, setAction] = useState<"Registration" | "Login">("Login");
  const [validationOn, setValidationOn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  // Updates email based on the value from EmailWidget
  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
  };

  const handleSubmit = async () => {
    if (!validationOn) {
      setValidationOn(true);
    }

    if (!email || !password || (action === "Registration" && !name)) {
      return;
    }

    const endpoint = action === "Registration" ? "/user" : "/session";
    const body: { [key: string]: string } = {
      email,
      password,
    };
    // Add name to the body if the action is Registration (not Login)
    if (action === "Registration") {
      body.name = name;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      if (endpoint === "/session") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.name);
        localStorage.setItem("email", data.email);
        localStorage.setItem("githubUsername", data.githubUsername);
      }

      setMessage(data.message || "Success!");
      navigate("/dashboard");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="flex h-full min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-center text-4xl font-bold text-slate-900">
          Welcome to Mini-Meco
        </h1>

        <Tabs.Root
          value={action}
          onValueChange={(value) => {
            setAction(value as "Registration" | "Login");
            setValidationOn(false);
          }}
          className="w-full"
        >
          <Tabs.List className="mb-6 flex gap-2">
            <Tabs.Trigger
              value="Login"
              className="flex-1 rounded-md bg-white px-6 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-slate-100 data-[state=active]:bg-white data-[state=active]:font-semibold data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              Login
            </Tabs.Trigger>
            <Tabs.Trigger
              value="Registration"
              className="flex-1 rounded-md bg-white px-6 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-slate-100 data-[state=active]:bg-white data-[state=active]:font-semibold data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              Sign Up
            </Tabs.Trigger>
          </Tabs.List>

          <div className="rounded-xl bg-white p-8 shadow-xl">
            <Form.Root onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              <Tabs.Content value="Registration" className="space-y-6">
                <Form.Field name="name">
                  <Form.Label className="mb-2 block text-sm font-medium text-slate-700">
                    Name
                  </Form.Label>
                  <Form.Control asChild>
                    <input
                      type="text"
                      placeholder="Please enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-slate-900 transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </Form.Control>
                  {validationOn && !name && (
                    <Form.Message className="mt-2 text-sm text-red-600">
                      Name is required
                    </Form.Message>
                  )}
                </Form.Field>

                <Form.Field name="email">
                  <Form.Label className="mb-2 block text-sm font-medium text-slate-700">
                    Email
                  </Form.Label>
                  <EmailWidget onEmailChange={handleEmailChange} action={action} />
                  {validationOn && !email && (
                    <Form.Message className="mt-2 text-sm text-red-600">
                      Please enter a valid email address
                    </Form.Message>
                  )}
                </Form.Field>

                <Form.Field name="password">
                  <Form.Label className="mb-2 block text-sm font-medium text-slate-700">
                    Password
                  </Form.Label>
                  <PasswordWidget
                    password={password}
                    onPasswordChange={handlePasswordChange}
                    action={action}
                  />
                </Form.Field>

                <Form.Submit asChild>
                  <button
                    type="submit"
                    className="w-full rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Create Account
                  </button>
                </Form.Submit>
              </Tabs.Content>

              <Tabs.Content value="Login" className="space-y-6">
                <Form.Field name="email">
                  <Form.Label className="mb-2 block text-sm font-medium text-slate-700">
                    Email
                  </Form.Label>
                  <EmailWidget onEmailChange={handleEmailChange} action={action} />
                  {validationOn && !email && (
                    <Form.Message className="mt-2 text-sm text-red-600">
                      Please enter a valid email address
                    </Form.Message>
                  )}
                </Form.Field>

                <Form.Field name="password">
                  <Form.Label className="mb-2 block text-sm font-medium text-slate-700">
                    Password
                  </Form.Label>
                  <PasswordWidget
                    password={password}
                    onPasswordChange={handlePasswordChange}
                    action={action}
                  />
                </Form.Field>

                <div className="text-sm text-slate-600">
                  Forget Password?{" "}
                  <a
                    href="/ForgotPassword"
                    className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Click here
                  </a>
                </div>

                <Form.Submit asChild>
                  <button
                    type="submit"
                    className="w-full rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Sign In
                  </button>
                </Form.Submit>
              </Tabs.Content>
            </Form.Root>

            {message && (
              <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                {message}
              </div>
            )}
          </div>
        </Tabs.Root>
      </div>
    </div>
  );
};

export default LoginScreen;
