import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../Client'
import { useState } from 'react'
import './Header.css' 

function Header({ currentPath, setSearchInput }) {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const hideSearchOn = ['/', '/login'];

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
    }
    
    
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    console.log('Searching for:', searchTerm)
  }

  const showSearch = !hideSearchOn.includes(currentPath);

  return (
    <header className="header">
      <h1 className="logo">
        <Link to="/" className="logo-link">🎨 ArtBase</Link>
      </h1>

      {showSearch &&(
      <form className="search-form" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search art, tutorials..."
          value={searchTerm}
          onChange={e => {
            const value = e.target.value
            setSearchTerm(value)
            props.setSearchInput(value) // Pass the search term to the parent component home.jsx
          }}
          className="search-input"
        />
      </form>
      )}

          
      <nav className="nav">
        {showSearch ? (
          <>
        <Link to="/create-post" className="nav-link">Create Post</Link>
        <Link to="/home" className="nav-link">Home</Link>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </>
        ) : (
          <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/" className="nav-link">Signup</Link>
          </>
        )}
      </nav>
    </header>
  )
}

export default Header