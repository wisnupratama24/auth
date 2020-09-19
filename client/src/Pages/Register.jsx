import React, { useState } from "react";
import authSvg from "./../assets/auth.svg";
import { ToastContainer, toast } from "react-toastify";
import { authenticate, isAuth } from "./../helpers/auth";
import axios from "axios";
import { Redirect } from "react-router-dom";

export const Register = () => {
  const [formData, setFromData] = useState({
    name: "",
    email: "",
    password1: "",
    password2: "",
  });

  const { email, password1, password2, name } = formData;

  const handleChange = (text) => (e) => {
    setFromData({
      ...formData,
      [text]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && email && password1) {
      if (password1 === password2) {
        axios
          .post(
            `${process.env.REACT_APP_API_URL}/register`,
            {
              name,
              email,
              password1: password1,
            },
            console.log(e)
          )
          .then((res) => {
            setFromData({
              ...formData,
              name: "",
              email: "",
              password1: "",
              password2: "",
            });
            toast.success(res.data.message);
          })
          .catch((err) => {
            toast.error(err.response.data.error);
          });
      } else {
        toast.error("Password don't matches");
      }
    } else {
      toast.error("Please fill any fields");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center">
      {isAuth() ? <Redirect to="/" /> : null}
      <ToastContainer />
      <div className="max-screen-w-xl m-0 sm:m-20 bg-white shadow sm:rounded-lg flex justify-center flex-1">
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
          <div className="mt-12 flex flex-col items-center">
            <h1 className="text-2xl xl:text-3xl font-extrabold">Sign Up</h1>
            <form
              onSubmit={handleSubmit}
              className="w-full flex-1 mt-8 text-indigo-500"
            >
              <div className="mx-auto max-w-s relative">
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={handleChange("name")}
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={handleChange("email")}
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-3"
                />
                <input
                  type="password"
                  placeholder="password"
                  value={password1}
                  onChange={handleChange("password1")}
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-3"
                />
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={password2}
                  onChange={handleChange("password2")}
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-3"
                />

                <button
                  type="submit"
                  className="mt-5 tracking-wide font-semibold bg-indigo-500 text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                >
                  Register
                </button>
              </div>
              <div className="my-12 border-b text-center">
                <div className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
                  Or sign with email or social login
                </div>
              </div>
              <div className="flex flex-col items-center">
                <a
                  href="/"
                  className="w-full max-w-xs font-bold shadow-sm rounded-lg py-3 bg-indigo-100 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline mt-5"
                >
                  Sign In
                </a>
              </div>
            </form>
          </div>
        </div>

        <div className="flex-1 bg-indigo-100 text-center hidden lg:flex">
          <div
            className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${authSvg})` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
