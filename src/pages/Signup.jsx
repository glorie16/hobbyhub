import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../Client'

function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  async function handleSignup(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    const user = signUpData?.user || signUpData?.session?.user;

    if (!user || !user.id) {
      console.error('Signup succeeded but user is missing:', user)
      setError('Signup succeeded but user info is missing.')
      setLoading(false)
      return
    }

    // 2. Insert profile record
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: user.id, // must match the auth user's ID
          name: name,
        },
      ])

    if (profileError) {
      console.error('Profile insert error:', profileError.message, profileError)
      setError('Signup succeeded, but failed to save your name.')
      setLoading(false)
      return
    }

    console.log('Profile created successfully!')
    setLoading(false)
    navigate('/home')
  }

  useEffect(() => {
  const syncProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      await supabase.from('profiles').insert({
        id: user.id,
        name: user.user_metadata.full_name || user.email,
      });
    }
  };

  syncProfile();
}, []);

  return (
    <div className="Signup">
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup}>
        <label>
          Name
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            autoComplete="name"
          />
        </label>
        <br />

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </label>
        <br />

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </label>
        <br />

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>

      <p>
        Already have an account? <Link to="/login">Log In</Link>
      </p>
    </div>
  )
}

export default Signup