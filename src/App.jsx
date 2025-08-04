import { useState } from 'react'
import { Route, Routes } from "react-router-dom"
import { UserProvider } from './contexts/UserContext'
import Login from './pages/Login'
import Home from './pages/Home'
import Signup from './pages/Signup'
import CreatePost from './pages/CreatePost'
import PostDetails from './pages/PostDetails'
import EditPost from './pages/EditPost'
import './App.css'

function App() {

  return (
    <div className="App">
      <UserProvider>
        <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-post" element={<CreatePost />} />
          <Route path="post-details/:id" element={<PostDetails />} />
          <Route path="/edit/:id" element={<EditPost />} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </UserProvider>
    </div>
  )
}

export default App
