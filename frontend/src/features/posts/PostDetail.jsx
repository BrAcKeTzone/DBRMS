import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchPostById } from "./postsSlice";
import CommentList from "../comments/CommentList";
import CommentForm from "../comments/CommentForm";

const PostDetail = () => {
  const { postId } = useParams();
  const dispatch = useDispatch();
  const { post, loading } = useSelector((state) => state.posts);

  useEffect(() => {
    dispatch(fetchPostById(postId));
  }, [dispatch, postId]);

  if (loading) return <p>Loading post...</p>;

  return (
    <div>
      {post && (
        <>
          <h2 className="text-2xl font-bold">{post.title}</h2>
          <p className="text-gray-700">{post.content}</p>
          <CommentList postId={postId} />
          <CommentForm postId={postId} />
        </>
      )}
    </div>
  );
};

export default PostDetail;
