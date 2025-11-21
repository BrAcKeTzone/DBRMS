import React from "react";
import AuthLayout from "../layouts/AuthLayout";
import ForgotPasswordForm from "../features/auth/ForgotPasswordForm";

const ForgotPasswordPage = () => {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
