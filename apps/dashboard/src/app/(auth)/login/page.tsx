"use client";

import React from "react";
import LoginForm from "./LoginForm"
import BlockedAccount from "./BlockedAccount"
import { useState } from "react";

export default function LoginPage() {
  const [blockedAccount, setBlockedAccount] = useState(false);
  
  const handleGoBack = () => {
    setBlockedAccount(false);
  };

  if (blockedAccount) {
    return <BlockedAccount onGoBack={handleGoBack} />
  }

  return <LoginForm setBlockedAccount={setBlockedAccount} />
}
