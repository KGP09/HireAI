import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import {Toaster} from "react-hot-toast";
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";
import Layout from "./Layout";
import PromtComponent from "./components/PromtComponent";
import Practise from "./components/Practise";
import Explore from "./components/Explore";
import Profile from "./components/Profile";
function App() {
  const { checkAuth, authUser, isCheckingAuth } = useAuthStore();
    useEffect(()=>{
    checkAuth()
  } , [checkAuth])

  if(isCheckingAuth && !authUser ){
    return(
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    )
  }
  console.log(authUser);
  return(
        <div data-theme="dark">
          <Routes>
          <Route path='/' element={ authUser ? <Layout/> : <Navigate to="/login" /> }>
            <Route path="" element={<HomePage/>}></Route>
            <Route path={ "/create"} element={<PromtComponent/>}></Route>
            <Route path={ "/practice"} element={<Practise/>}></Route>
            <Route path={ "/explore"} element={<Explore/>}></Route>
            <Route path={ "/profile"} element={<Profile/>}></Route>
          </Route>
            <Route path="/signup" element= { !authUser ? <SignupPage /> : <Navigate to="/"  />  } />
            <Route path="/login" element= { !authUser ? <LoginPage /> :  <Navigate to="/" />  } /> 
          </Routes>
          <Toaster/>
        </div>
  )
}

export default App;
