import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchComments, deleteComment } from "./commentsSlice";
import Button from "../../components/Button";

const CommentList = ({ postId }) => {
  const dispatch = useDispatch();
  const { comments, loading } = useSelector((state) => state.comments);

  useEffect(() => {
    dispatch(fetchComments(postId));
  }, [dispatch, postId]);

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Comments</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        comments.map((comment) => (
          <div key={comment.id} className="border p-2 mb-2 rounded-md">
            <p className="text-gray-800">{comment.text}</p>
            <div className="text-sm text-gray-500">
              <span>{comment.author}</span> -{" "}
              <span>{new Date(comment.createdAt).toLocaleString()}</span>
            </div>
            <Button
              className="mt-2"
              onClick={() => dispatch(deleteComment(comment.id))}
            >
              Delete
            </Button>
          </div>
        ))
      )}
    </div>
  );
};

export default CommentList;
