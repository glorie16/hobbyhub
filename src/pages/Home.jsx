import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/Card'
import { supabase } from '../Client'
import Header from '../components/Header'

function Home() {
  const [posts, setPosts] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [currentUserProfile, setCurrentUserProfile] = useState(null)

  // Listen for auth state and set current user
  useEffect(() => {
    const getSessionUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setCurrentUser(session?.user ?? null)
    }
    getSessionUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  // Fetch current user profile when currentUser changes
  useEffect(() => {
    if (!currentUser) {
      setCurrentUserProfile(null)
      return
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('id', currentUser.id)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
      } else {
        setCurrentUserProfile(data)
      }
    }
    fetchProfile()
  }, [currentUser])

  // Fetch posts as before
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          description,
          like_count,    
          created_at,
          profiles (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching posts:', error)
        return
      }

      setPosts(data)
      console.log(JSON.stringify(data, null, 2))
    }
    fetchData()
  }, [])
  

  return (
    <div className="Home">
      <Header />
      <h1>{`Welcome to Arthub, ${currentUserProfile?.name || 'Guest'}`}</h1>
      <div className="post-list">
        {posts.length > 0 ? (
          posts.map(post => (
            <Link key={post.id} to={`/post-details/${post.id}`}>
              <Card
                id={post.id}
                title={post.title}
                author={post.profiles?.name || 'Unknown'}
                description={post.description}
                created_at={post.created_at}
                like_count={post.like_count}
              />
            </Link>
          ))
        ) : (
          <div>
            <h2>No posts yet!</h2>
            <Link to="/create-post">
              <button className="createBtn">Be the first to post!</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home