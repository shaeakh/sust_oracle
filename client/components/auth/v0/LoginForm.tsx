import { Button } from "@/components/ui/button";
import { useFormValidation } from "@/hooks/useFormValidation";
import axios from "axios";
import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GoLock } from "react-icons/go";
import { HiOutlineMail } from "react-icons/hi";
import { toast } from "react-toastify";
import { InputField } from "./InputField";

interface LoginFormProps {
  onToggle: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggle }) => {
  const { values, errors, handleChange, validateForm, isSubmitted } =
    useFormValidation(
      { email: "", password: "" },
      {
        email: (value) =>
          !value
            ? "Email is required"
            : !/\S+@\S+\.\S+/.test(value)
            ? "Email is invalid"
            : null,
        password: (value) =>
          !value
            ? "Password is required"
            : value.length < 6
            ? "Password must be at least 6 characters"
            : null,
      }
    );
  const [clickable, setClickable] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    setClickable(false);
    e.preventDefault();
    if (validateForm()) {
      axios
        .post(`${process.env.NEXT_PUBLIC_IP_ADD}/auth/login`, {
          email: values.email,
          password: values.password,
        })
        .then((res) => {
          if (res.status >= 200 && res.status < 300) {
            localStorage.setItem("token", res.data.token);
            router.push("/dashboard");
            setClickable(true);
          } else {
            setError(res?.data?.message || "Login failed");
            setClickable(true);
            toast.error(res?.data?.message || "Login failed");
          }
        })
        .catch((err) => {
          setError(err?.response?.data?.message || "Login failed");
          toast.error(error);
          setClickable(true);
        });
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Login</h2>
        <InputField
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          error={isSubmitted ? errors.email : null}
          icon={<HiOutlineMail size={20} />}
        />
        <InputField
          label="Password"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          error={isSubmitted ? errors.password : null}
          icon={<GoLock size={20} />}
        />
        <Button type="submit" className="w-full" disabled={!clickable}>
          <Mail className="mr-2 h-4 w-4" /> Login
        </Button>
      </form>
      <p className="text-center">
        Don&apos;t have an account?{" "}
        <Button variant="link" onClick={onToggle} className="p-0">
          Sign Up
        </Button>
      </p>
    </div>
  );
};
