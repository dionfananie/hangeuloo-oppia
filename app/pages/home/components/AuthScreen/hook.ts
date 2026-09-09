import { useState } from "react";

export type AuthScreenMode = "login" | "signup";

export default function useAuthScreen(initialMode: AuthScreenMode = "signup") {
	const [mode, setMode] = useState<AuthScreenMode>(initialMode);
	return { mode, setMode };
}
