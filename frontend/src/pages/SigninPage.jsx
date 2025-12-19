import React from "react";
import AuthLayout from "../layouts/AuthLayout";
import SigninForm from "../features/auth/SigninForm";

const SigninPage = () => {
  return (
    <AuthLayout>
      <div className="container mx-auto flex justify-center items-center min-h-screen">
        <SigninForm />
      </div>
    </AuthLayout>
  );
};

export default SigninPage;
