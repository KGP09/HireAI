import React from "react";
import Navbar from "./components/Navbar";
import NavLink from "./components/NavLink";
import { Outlet } from "react-router-dom";
import Footer from "./components/Footer";

export default function Layout() {
  return (
    <>
      <NavLink />
      <Outlet />
      <Footer />
    </>
  );
}
