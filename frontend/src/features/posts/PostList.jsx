import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts } from "./postsSlice";
import PostCard from "../../components/PostCard";

const PostList = () => {
  const dispatch = useDispatch();
  const { posts, loading } = useSelector(
    (state) => state.posts || { posts: [], loading: false }
  );

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Latest Posts</h2>
      {loading ? (
        <p>Loading posts...</p>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
};

export default PostList;
