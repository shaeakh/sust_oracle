import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
interface OtpFormProps {
  email: string;
  onVerify: () => void;
}

export const OtpForm: React.FC<OtpFormProps> = ({ email, onVerify }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(parseInt(element.value))) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    if (element.nextSibling && element.value !== "") {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join("").length === 6) {
      setLoading(true);
      axios
        .post(`${process.env.NEXT_PUBLIC_IP_ADD}/auth/registration-verify`, {
          email: email,
          otp: otp.join(""),
        })
        .then((res) => {
          if (res.status >= 200 && res.status < 300) {
            setLoading(false);
            onVerify();
            toast.success("Email verified successfully");
          } else {
            setLoading(false);
            toast.error(res?.data?.message || "Email verification failed");
          }
        })
        .catch((err) => {
          setLoading(false);
          toast.error(
            err?.response?.data?.message || "Email verification failed"
          );
        });
    }
  };

  const handle_resend_otp = () => {
    setOtp(["", "", "", "", "", ""]);
    axios
      .post(`${process.env.NEXT_PUBLIC_IP_ADD}/auth/resend-verification`, {
        email: email,
      })
      .then((res) => {
        if (res.status >= 200 && res.status < 300) {
          toast.success("OTP sent has been sent to your email");
        } else {
          toast.error(res?.data?.message || "Failed to resend OTP");
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Failed to resend OTP");
      });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-center">Verify Email</h2>
      <p className="text-center">Enter the 6-digit code sent to your email</p>
      <div className="flex justify-center space-x-2">
        {otp.map((data, index) => (
          <Input
            key={index}
            type="text"
            maxLength={1}
            className="w-12 h-12 text-center text-2xl"
            value={data}
            onChange={(e) => handleChange(e.target, index)}
          />
        ))}
      </div>
      <button className="w-full flex justify-end " onClick={handle_resend_otp}>
        <p className="text-end hover:text-primary mr-2">Resend OTP</p>
      </button>
      <Button disabled={loading} type="submit" className="w-full ">
        <CheckCircle className="mr-2 h-4 w-4" /> Verify OTP
      </Button>
    </form>
  );
};
