import { Button } from "@/components/ui/button";
import { useFormValidation } from "@/hooks/useFormValidation";
import axios from "axios";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { InputField } from "./InputField";

interface RegisterFormProps {
  onToggle: () => void;
  onRegister: (email: string) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onToggle,
  onRegister,
}) => {
  const { values, errors, handleChange, validateForm, isSubmitted } =
    useFormValidation(
      { username: "", email: "", password: "", confirmPassword: "" },
      {
        username: (value) => (!value ? "Username is required" : null),
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
        confirmPassword: (value) =>
          !value
            ? "Confirm Password is required"
            : value !== values.password
            ? "Passwords do not match"
            : null,
      }
    );
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      axios
        .post(`${process.env.NEXT_PUBLIC_IP_ADD}/auth/registration`, {
          username: values.username,
          email: values.email,
          password: values.password,
        })
        .then((res) => {
          if (res.status >= 200 && res.status < 300) {
            setLoading(false);
            onRegister(values.email);
            toast.success("Registration successful");
          } else {
            setLoading(false);
            toast.error(res?.data?.message || "Registration failed");
          }
        })
        .catch((err) => {
          setLoading(false);
          toast.error(err?.response?.data?.message || "Registration failed");
        });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-center">Register</h2>
      <InputField
        label="Username"
        name="username"
        type="text"
        value={values.username}
        onChange={handleChange}
        error={isSubmitted ? errors.username : null}
      />
      <InputField
        label="Email"
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange}
        error={isSubmitted ? errors.email : null}
      />
      <InputField
        label="Password"
        name="password"
        type="password"
        value={values.password}
        onChange={handleChange}
        error={isSubmitted ? errors.password : null}
      />
      <InputField
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        value={values.confirmPassword}
        onChange={handleChange}
        error={isSubmitted ? errors.confirmPassword : null}
      />
      <Button disabled={loading} type="submit" className="w-full">
        <UserPlus className="mr-2 h-4 w-4" /> Register
      </Button>
      <p className="text-center">
        Already have an account?{" "}
        <Button variant="link" onClick={onToggle} className="p-0">
          Sign In
        </Button>
      </p>
    </form>
  );
};
