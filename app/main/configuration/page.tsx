"use client";

import { useState } from "react";
import ConfigurationForm from "@/components/configuration/ConfigurationForm";"@/components/configuration/ConfigurationForm";

export default function ConfigurationPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Configuration</h1>
      <ConfigurationForm />
    </div>
  );
}