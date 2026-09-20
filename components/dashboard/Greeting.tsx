
"use client";

import { useEffect, useState } from "react";

function getGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) {
    return "Good morning ☀️";
  }

  if (hour >= 12 && hour < 17) {
    return "Good afternoon 🌤️";
  }

  if (hour >= 17 && hour < 21) {
    return "Good evening 🌇";
  }

  return "Good night 🌙";
}

export default function Greeting() {
  const [greeting, setGreeting] = useState("Good morning ☀️");

  useEffect(() => {
    const updateGreeting = () => {
      const currentHour = new Date().getHours();
      setGreeting(getGreeting(currentHour));
    };

    updateGreeting();
  }, []);

  return (
    <h1 className="text-3xl font-bold text-foreground">
      {greeting}
    </h1>
  );
}