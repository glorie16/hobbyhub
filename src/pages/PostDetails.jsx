import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../Client'
import { formatDistanceToNow } from 'date-fns'

function PostDetails() {
  const { id } = useParams() // get post ID from URL
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [count, setCount] = useState(0) 
  const [updating, setUpdating] = useState(false) //disable button during update
  const [commentsList, setCommentsList] = useState([]) // Initialize comments list
  const [newComment, setNewComment] = useState('') // State for new comment input

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          description,
          created_at,
          like_count,
          img_url,
          profiles (
            id,
            name
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        setError('Failed to fetch post')
        console.error(error)
      } else {
        setPost(data)
        setCount(data.like_count || 0) // initialize count
      }
      setLoading(false)
    }

    fetchPost()
  }, [id])

  const updateCount = async (event) => {
    event.preventDefault()
    if (updating) return // prevent double clicks
    setUpdating(true)

    const newCount = count + 1

    const { error } = await supabase
      .from('posts')
      .update({ like_count: newCount })
      .eq('id', id)

    if (error) {
      console.error('Failed to update like count:', error)
      // Optionally alert user
    } else {
      setCount(newCount)
    }

    setUpdating(false)
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>
  if (!post) return <p>Post not found</p>

  return (
    <div className="PostDetails">
      <h1>{post.title}</h1>
      <p>By {post.profiles?.name || 'Unknown'}</p>
      <p>{post.description}</p>
      {post.img_url && <img src={post.img_url} alt={post.title} style={{ maxWidth: '100%' }} />}
      <small>Posted {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</small>
      <br />
      <button className="likeButton" onClick={updateCount} disabled={updating}>
        ♥️ {count}
      </button>
      <br />
      <Link to="/home">Back to Home</Link>
    </div>
  )
}

export default PostDetails