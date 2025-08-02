import { useState } from 'react';
import { supabase } from '../Client';

const CreatePost = () => {
  const [post, setPost] = useState({ title: '', description: '' });
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setPost(prev => ({
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

  const createPost = async (event) => {
    event.preventDefault();

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('No active session:', sessionError);
      alert('Please log in first.');
      return;
    }

    const user = session.user;

    let imageUrl = '';
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
      .insert({
        title: post.title,
        description: post.description,
        img_url: imageUrl,
        user_id: user.id 
      });

    if (error) {
      console.error('Error creating post:', error);
      alert('Post creation failed');
    } else {
      window.location = '/home';
    }
  };

  return (
    <div>
      <form onSubmit={createPost}>
        <label htmlFor="title">Title</label><br />
        <input type="text" id="title" name="title" onChange={handleChange} required /><br /><br />

        <label htmlFor="description">Description</label><br />
        <textarea
          rows="5"
          cols="50"
          id="description"
          name="description"
          onChange={handleChange}
          required
        /><br /><br />

        <label htmlFor="image">Image</label><br />
        <input type="file" accept="image/*" onChange={handleFileChange} /><br /><br />

        <input type="submit" value="Submit" />
      </form>
    </div>
  );
};

export default CreatePost;