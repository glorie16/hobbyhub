import React, { useEffect, useState, useContext } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { UserContext } from '../contexts/UserContext';
import { supabase } from '../Client'
import { formatDistanceToNow, set } from 'date-fns'

function PostDetails() {
  const { id } = useParams() // get post ID from URL
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [count, setCount] = useState(0)
  const [updating, setUpdating] = useState(false) //disable button during update
  const [commentsList, setCommentsList] = useState([]) // Initialize comments list
  const [newComment, setNewComment] = useState('') // State for new comment input
  const [submitting, setSubmitting] = useState(false);
  const { currentUser } = useContext(UserContext);
  const navigate = useNavigate();

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
          user_id,
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
        setCount(data.like_count || 0) 
      }
      setLoading(false)
    }

    fetchPost()
  }, [id])

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('id, content, created_at, profiles (id, name)')
        .eq('post_id', id)
      
      if (error) {
        console.error('Failed to fetch comments:', error)
      }
      setCommentsList(data || [])
    }
    fetchComments()
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

    const handleEdit = () => {
      navigate('/edit/' + id);
  }
  
  const deletePost = async (event) => {
    event.preventDefault();
    
    const confirmed = window.confirm('Are you sure you want to delete this post?');

    if (!confirmed) return;

    await supabase
          .from('posts')
          .delete()
          .eq('id', id)
        
      navigate('/home');
    }

  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>
  if (!post) return <p>Post not found</p>

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    if (newComment.trim() === "") { // don't allow empty comments
      setSubmitting(false);
      return;
    }

      const { data, error } = await supabase
    .from('comments')
    .insert([
      {
        post_id: id,
        content: newComment,
        author_id: currentUser?.id
      }
    ])
    .select('id, content, created_at, profiles (id, name)');

  if (error) {
    console.error('Failed to post comment:', error);
    setSubmitting(false);
  }

  else {
    const newAddedComment = data[0]; // inserted comment
    setCommentsList(prev => [...prev, newAddedComment]); // append
    setNewComment(''); // clear input
    setSubmitting(false); // reset submitting state
  }
  };
  

  return (
    <div className="PostDetails">
      {currentUser?.id === post.user_id && (
        <>
        <button onClick={handleEdit}>Edit</button>
        <button onClick={deletePost}>Delete</button>
  </>
)}
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
      <div className="comments-section">
        <h2>Comments</h2>
          {commentsList.length > 0 ? (
            commentsList.map(comment => (
              <div className="comment-card" key={comment.id}>
                <p><strong>{comment.profiles?.name || 'Anonymous'}:</strong> {comment.content}</p>
                <small>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</small>
              </div>
            ))
          ) : (
            <p key="no-comments">No comments yet.</p>
          )}
              <form onSubmit={handleCommentSubmit}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
        />
        <button type="submit" disabled={submitting}>Post Comment</button>
      </form>
          </div>
    </div>
  )
}

export default PostDetails