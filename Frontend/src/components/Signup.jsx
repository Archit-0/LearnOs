import React, { useState } from "react";
import apiService from "../Api/api.js";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Button, Input, } from "./index.js";
import { useForm } from "react-hook-form";
import { loginSuccess as authLogin } from "../store/authSlice.js";

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState("");

  const onSubmit = async (data) => {
    try {
      setError("");
      const response = await apiService.register(data);
      console.log("Signup response:", response)
      if (response) {
        const user = await apiService.getMe();
        console.log("User:", user);
        if (user) dispatch(authLogin(user));
        navigate("/");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="mx-auto w-full max-w-lg bg-gray-100 rounded-xl p-10 border border-black/10">
        <div className="mb-2 flex justify-center">
          <span className="inline-block w-full max-w-[100px]">
            Logo
          </span>
        </div>
        <h2 className="text-center text-2xl font-bold leading-tight">
          Sign up to create account
        </h2>
        <p className="mt-2 text-center text-base text-black/60">
          Already have an account?&nbsp;
          <Link
            to="/login"
            className="font-medium text-primary transition-all duration-200 hover:underline"
          >
            Sign In
          </Link>
        </p>
        {error && <p className="text-red-600 mt-8 text-center">{error}</p>}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
          <div className="space-y-5">
            <Input
              label="Full Name:"
              placeholder="Enter your full name"
              {...register("name", {
                required: true,
                minLength: 3,
              })}
            />
            <Input
              label="Email:"
              placeholder="Enter your email"
              type="email"
              {...register("email", {
                required: true,
                validate: {
                  matchPattern: (value) =>
                    /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                    "Email address must be a valid address",
                },
              })}
            />
            <Input
              label="Password:"
              type="password"
              placeholder="Enter your password"
              {...register("password", {
                required: true,
                minLength: 6,
              })}
            />
            <Button type="submit" className="w-full">
              Create Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
