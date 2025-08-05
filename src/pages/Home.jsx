import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../contexts/UserContext'; 
import { Link } from 'react-router-dom'
import Card from '../components/Card'
import { supabase } from '../Client'
import Header from '../components/Header'
import './Home.css'

function Home({ searchInput }) {
  const [posts, setPosts] = useState([])
  // this gets profile info from UserContext, like name
  const { currentUserProfile } = useContext(UserContext);
  const [filteredResults, setFilteredResults] = useState([])
  const [sortBy, setSortBy] = useState('newest')
  const [refreshFlag, setRefreshFlag] = useState(false);

  // Listen for auth state and set current user
   // Fetch posts
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
      // print post/profile data to console for debugging
      console.log(JSON.stringify(data, null, 2))
    }
    fetchData()
  }, [refreshFlag])

  useEffect(() => {
    filterPosts()
  }, [searchInput, posts, sortBy])

  const toggleRefresh = () => setRefreshFlag(prev => !prev);

  // Handle search input change and filter changes
  const filterPosts = () => {
    let filtered = [...posts];
    if (searchInput.trim() !== "") {
       filtered = filtered.filter(post =>
        post.title?.toLowerCase().includes(searchInput.toLowerCase())
      );
    }

    if (sortBy === 'likes') {
      filtered = filtered.sort((a, b) => b.like_count - a.like_count);
    }
    else if (sortBy === 'newest') {
      filtered = filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    setFilteredResults(filtered);
    return;
  }

  return (
    <div className="Home">
      <h1>{`Welcome to Arthub, ${currentUserProfile?.name || 'Guest'}`}</h1>
      
      <div className="sort-buttons">
        <p>Sort by:</p>
        <button
          className={`newest-button ${sortBy === 'newest' ? 'active' : ''}`}
          onClick={() => setSortBy('newest')}>
          Newest
        </button>
        <button
          className={`likes-button ${sortBy === 'likes' ? 'active' : ''}`}
          onClick={() => {
            setSortBy('likes')
            toggleRefresh();
          }}>
          Most Likes
        </button>
      </div>
      <div className="post-list">
        {filteredResults.length > 0 ? (
          filteredResults.map(post => (
            <Link key={post.id} to={`/post-details/${post.id}`}>
              <Card
                id={post.id}
                title={post.title}
                author={post.profiles?.name || 'Unknown'}
                description={post.description}
                created_at={post.created_at}
                like_count={post.like_count}
                onPostUpdated={toggleRefresh}
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