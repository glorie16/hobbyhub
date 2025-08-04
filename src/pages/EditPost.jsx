import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../Client';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState({ title: '', description: '', img_url: null });
  const [imageFile, setImageFile] = useState(null);

  // fetch existing post data
  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('title, description, img_url')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching post:', error);
        return;
      }
      if (data) {
        setPost({
          title: data.title,
          description: data.description,
          img_url: data.img_url,
        });
      }
    };
    fetchPost();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setPost((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    setImageFile(event.target.files[0]);
  };

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload failed:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath);

    return data?.publicUrl || null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let imageUrl = post.img_url;

    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile);
      if (!uploadedUrl) {
        alert('Image upload failed');
        return;
      }
      imageUrl = uploadedUrl;
    }

    const { error } = await supabase
      .from('posts')
      .update({
        title: post.title,
        description: post.description,
        img_url: imageUrl,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating post:', error);
      alert('Post update failed');
    } else {
      navigate('/home'); 
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Title</label><br />
        <input
          type="text"
          id="title"
          name="title"
          value={post.title}
          onChange={handleChange}
          required
        /><br /><br />

        <label htmlFor="description">Description</label><br />
        <textarea
          rows="5"
          cols="50"
          id="description"
          name="description"
          value={post.description}
          onChange={handleChange}
        /><br /><br />

        <label htmlFor="image">Image</label><br />
        {post.img_url && !imageFile && (
          <img src={post.img_url} alt="Current" style={{ maxWidth: '200px' }} />
        )}
        <input type="file" accept="image/*" onChange={handleFileChange} /><br /><br />

        <input type="submit" value="Submit" />
      </form>
    </div>
  );
};

export default EditPost;