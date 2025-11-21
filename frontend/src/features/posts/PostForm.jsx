import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addPost, updatePost } from "./postsSlice";
import Input from "../../components/Input";
import Button from "../../components/Button";

const PostForm = ({ post, onClose }) => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (post) {
      dispatch(updatePost({ id: post.id, title, content }));
    } else {
      dispatch(addPost({ title, content }));
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h2 className="text-xl font-semibold">
        {post ? "Edit Post" : "Create Post"}
      </h2>
      <Input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <textarea
        className="w-full p-2 border rounded"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Content"
      ></textarea>
      <Button type="submit">{post ? "Update" : "Submit"}</Button>
    </form>
  );
};

export default PostForm;
