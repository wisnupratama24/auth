import React, { useState, useEffect } from "react";
import authSvg from "./../assets/auth.svg";
import { ToastContainer, toast } from "react-toastify";
import { isAuth } from "./../helpers/auth";
import axios from "axios";
import { Redirect } from "react-router-dom";

export const Reset = ({ match }) => {
  const [formData, setFormData] = useState({
    password1: "",
    password2: "",
    token: "",
  });
  const [disabled, isDisabled] = useState(false);
  const { password1, password2, token } = formData;

  useEffect(() => {
    let token = match.params.token;

    if (token) {
      setFormData({ ...formData, token });
    }
  }, []);

  const handleChange = (text) => (e) => {
    setFormData({
      ...formData,
      [text]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    isDisabled(true);
    if (password2 && password1) {
      if (password1 === password2) {
        axios
          .put(`${process.env.REACT_APP_API_URL}/reset`, {
            resetPasswordLink: token,
            newPassword: password1,
          })
          .then((res) => {
            setFormData({
              ...formData,
              password1: "",
              password2: "",
            });
            toast.success(res.data.message);
            isDisabled(false);
          })
          .catch((err) => {
            toast.error(err.response.data.error);
            isDisabled(false);
          });
      } else {
        toast.error("Password don't matches");
        isDisabled(false);
      }
    } else {
      toast.error("Please fill any fields");
      isDisabled(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center">
      {isAuth() ? <Redirect to="/" /> : null}
      <ToastContainer />
      <div className="max-screen-w-xl m-0 sm:m-20 bg-white shadow sm:rounded-lg flex justify-center flex-1">
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
          <div className="mt-12 flex flex-col items-center">
            <h1 className="text-2xl xl:text-3xl font-extrabold">
              Reset Password
            </h1>
            <form
              onSubmit={handleSubmit}
              className="w-full flex-1 mt-8 text-indigo-500"
            >
              <div className="mx-auto max-w-s relative">
                <input
                  type="text"
                  placeholder="Password"
                  value={password1}
                  onChange={handleChange("password1")}
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-3"
                />
                <input
                  type="text"
                  placeholder="Confirm Password"
                  value={password2}
                  onChange={handleChange("password2")}
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-3"
                />
                <button
                  disabled={disabled}
                  type="submit"
                  className={`mt-5 tracking-wide font-semibold ${
                    disabled === true
                      ? "bg-gray-500"
                      : "bg-indigo-500 hover:bg-indigo-700"
                  }
                  text-gray-100 w-full py-4 rounded-lg  transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none`}
                >
                  Reset Password
                </button>
              </div>
              <div className="my-12 border-b text-center">
                <div className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2"></div>
              </div>
              <div className="flex flex-col items-center">
                <a
                  href="/login"
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
