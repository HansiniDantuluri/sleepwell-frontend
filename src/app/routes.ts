import { createBrowserRouter } from "react-router";
import { SplashScreen } from "./components/SplashScreen";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { LoginScreen } from "./components/LoginScreen";
import { Dashboard } from "./components/Dashboard";
import { PlanMyDay } from "./components/PlanMyDay";
import { FocusMode } from "./components/FocusMode";
import { WindDownMode } from "./components/WindDownMode";
import { ProgressScreen } from "./components/ProgressScreen";
import { SettingsScreen } from "./components/SettingsScreen";

export const router = createBrowserRouter([
  { path: "/", Component: SplashScreen },
  { path: "/login", Component: LoginScreen },
  { path: "/onboarding", Component: OnboardingFlow },
  { path: "/dashboard", Component: Dashboard },
  { path: "/plan", Component: PlanMyDay },
  { path: "/focus", Component: FocusMode },
  { path: "/wind-down", Component: WindDownMode },
  { path: "/progress", Component: ProgressScreen },
  { path: "/settings", Component: SettingsScreen },
]);