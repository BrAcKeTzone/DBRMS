import React from "react";

const PostCard = ({ title, content, author }) => {
  return (
    <div className="border p-4 rounded-md shadow-md">
      <h2 className="text-xl font-bold">{title}</h2>
      <p>{content}</p>
      <span className="text-gray-500 text-sm">By {author}</span>
    </div>
  );
};

export default PostCard;
