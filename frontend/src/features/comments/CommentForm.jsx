import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addComment } from "./commentsSlice";
import Input from "../../components/Input";
import Button from "../../components/Button";

const CommentForm = ({ postId }) => {
  const dispatch = useDispatch();
  const [commentText, setCommentText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      dispatch(addComment({ postId, text: commentText }));
      setCommentText("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Add a Comment</h3>
      <Input
        type="text"
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder="Write a comment..."
      />
      <Button type="submit" className="mt-2">
        Submit
      </Button>
    </form>
  );
};

export default CommentForm;
