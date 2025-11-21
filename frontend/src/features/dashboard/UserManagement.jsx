import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, deleteUser } from "./dashboardSlice";
import Button from "../../components/Button";

const UserManagement = () => {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  return (
    <div>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        users.map((user) => (
          <div
            key={user.id}
            className="flex justify-between items-center p-2 border-b"
          >
            <span>
              {user.username} ({user.role})
            </span>
            <Button
              onClick={() => dispatch(deleteUser(user.id))}
              className="bg-red-500 text-white"
            >
              Delete
            </Button>
          </div>
        ))
      )}
    </div>
  );
};

export default UserManagement;
