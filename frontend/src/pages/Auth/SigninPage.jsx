import React from "react";
import AuthLayout from "../../layouts/AuthLayout";
import SigninForm from "../../features/auth/SigninForm";

const SigninPage = () => {
  return (
    <AuthLayout>
      <SigninForm />
    </AuthLayout>
  );
};

export default SigninPage;
