import React from "react";
import AuthLayout from "../../layouts/AuthLayout";
import SigninForm from "../../components/auth/SigninForm";

const SigninPage = () => {
  return (
    <AuthLayout>
      <SigninForm />
    </AuthLayout>
  );
};

export default SigninPage;
