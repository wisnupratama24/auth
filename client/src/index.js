import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import App from "./App";
import { Register } from "./Pages/Register";
import "react-toastify/dist/ReactToastify.css";
import { Activate } from "./Pages/Activate";
import { Login } from "./Pages/Login";
import { Forget } from "./Pages/Forget";
import { Reset } from "./Pages/Reset";

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route path="/" exact render={(props) => <App {...props} />} />
      <Route
        path="/register"
        exact
        render={(props) => <Register {...props} />}
      />
      <Route
        path="/users/activate/:token"
        exact
        render={(props) => <Activate {...props} />}
      />
      <Route path="/login" exact render={(props) => <Login {...props} />} />
      <Route
        path="/users/password/forget"
        exact
        render={(props) => <Forget {...props} />}
      />
      <Route
        path="/users/password/reset/:token"
        exact
        render={(props) => <Reset {...props} />}
      />
    </Switch>
  </BrowserRouter>,
  document.getElementById("root")
);
