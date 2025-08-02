import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom' 
import { supabase } from '../Client'        

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate() 

  async function handleLogin(e) {
  e.preventDefault()
  setLoading(true)
  setError(null)

  const { data: signInData, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  setLoading(false)

  if (loginError) {
    setError(loginError.message)
    return
  }

  const user = signInData?.user
  if (!user) {
    setError("User not found after login")
    return
  }

  // 🔧 Sync profile if it doesn't exist
  const { data: profile, error: profileFetchError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    // If profile is missing, create it (fallback to email as name)
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        name: user.user_metadata?.full_name || user.email,
      })

    if (insertError) {
      console.error('Profile creation failed after login:', insertError)
      // optional: show user-friendly error here
    }
  }

  navigate('/home')
  }
  
  return (
    <div className="Login">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <label>
          Email 
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="username"
                  />
                  <br/>
        </label>

        <label style={{ marginTop: '1rem' }}>
          Password
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={loading} style={{ marginTop: '1rem' }}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </div>
  )
}

export default Login