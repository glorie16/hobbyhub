import { useState } from 'react'
import { supabase } from '../Client'
import { formatDistanceToNow } from 'date-fns'
//import './Card.css'
import { useNavigate, Link } from 'react-router-dom'


const Card = (props) =>  {
    const [count, setCount] = useState(props.like_count ?? 0)
    const navigate = useNavigate();

  const updateCount = async (event) => {
    event.preventDefault();

    await supabase
      .from("posts")
      .update({ like_count: count + 1 })
      .eq('id', props.id)
    
    setCount((count) => count + 1)
    }
    
    
  const goToEdit = () => {
      navigate('/edit/' + props.id);
      }
      
  
  console.log("Like count:", props.like_count);

  return (
      <div className="Card">
          <button className="editButton" onClick={goToEdit}>Edit</button>
          <h2 className="title">{props.title}</h2>
          <h3 className="author">{"by " + props.author}</h3>
      <small>
        Posted by {props.author} • {formatDistanceToNow(new Date(props.created_at), { addSuffix: true })}
      </small>
          <button className="likeButton" onClick={updateCount} >♥️ {count}</button>
      </div>
  );
};

export default Card