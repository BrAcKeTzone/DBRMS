import React from "react";
import AuthLayout from "../layouts/AuthLayout";
import SignupForm from "../features/auth/SignupForm";

const SignupPage = () => {
  return (
    <AuthLayout>
      <div className="w-full flex justify-center items-center min-h-screen">
        <SignupForm />
      </div>
    </AuthLayout>
  );
};

export default SignupPage;
