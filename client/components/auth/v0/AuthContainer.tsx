"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { OtpForm } from "./OtpForm";
import { RegisterForm } from "./RegisterForm";

const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    };
  },
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => {
    return {
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    };
  },
};

export const AuthContainer: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showOtp, setShowOtp] = useState(false);
  const [[page, direction], setPage] = useState([0, 0]);
  const [email, setEmail] = useState("");
  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    paginate(isLogin ? 1 : -1);
  };

  const handleRegister = (email: string) => {
    setEmail(email);
    setShowOtp(true);
    paginate(1);
  };

  const handleVerify = () => {
    setShowOtp(false);
    setIsLogin(true);
    paginate(-1);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md overflow-hidden">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={page}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="w-full"
        >
          {showOtp ? (
            <OtpForm email={email} onVerify={handleVerify} />
          ) : isLogin ? (
            <LoginForm onToggle={toggleForm} />
          ) : (
            <RegisterForm onToggle={toggleForm} onRegister={handleRegister} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
