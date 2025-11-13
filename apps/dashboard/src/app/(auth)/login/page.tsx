"use client";

import React from "react";
import LoginForm from "./LoginForm"
import BlockedAccount from "./BlockedAccount"
import InactiveAccount from "./InactiveAccount"
import { useState } from "react";

export default function LoginPage() {
  const [blockedAccount, setBlockedAccount] = useState(false);
  const [inactiveAccount, setInactiveAccount] = useState(false);
  
  const handleGoBack = () => {
    setBlockedAccount(false);
    setInactiveAccount(false);
  };

  if (blockedAccount) {
    return <BlockedAccount onGoBack={handleGoBack} />
  }

  if (inactiveAccount) {
    return <InactiveAccount onGoBack={handleGoBack} />
  }

  return <LoginForm setBlockedAccount={setBlockedAccount} setInactiveAccount={setInactiveAccount} />
}
