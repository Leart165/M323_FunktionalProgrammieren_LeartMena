import React from "react";

import HomePage from "./features/home/HomePage";
import PredictionGroupPage from "./features/prediction/PredictionGroupPage";
import PredictionPage from "./features/prediction/PredictionPage";
import GroupDetailsPage from "./features/simulation/GroupDetailsPage";
import KnockoutPage from "./features/simulation/KnockoutPage";
import SimulationPage from "./features/simulation/SimulationPage";

function normalizePath(pathname: string): string {
    if (!pathname || pathname === "") {
        return "/";
    }

    const clean = pathname.replace(/\/+$/, "");
    return clean === "" ? "/" : clean;
}

export default function NavigationPage(): React.JSX.Element {
    const [pathname, setPathname] = React.useState<string>(normalizePath(window.location.pathname));

    React.useEffect(() => {
        const onPopState = (): void => {
            setPathname(normalizePath(window.location.pathname));
        };

        window.addEventListener("popstate", onPopState);
        return () => {
            window.removeEventListener("popstate", onPopState);
        };
    }, []);

    const navigate = (to: string): void => {
        const target = normalizePath(to);
        const current = normalizePath(window.location.pathname);

        if (target === current) {
            return;
        }

        window.history.pushState({}, "", target);
        setPathname(target);
    };

    if (pathname.startsWith("/simulation/group/")) {
        const groupId = pathname.split("/").pop() ?? "";
        return <GroupDetailsPage groupId={groupId} onNavigate={navigate} />;
    }

    if (pathname === "/simulation/knockout") {
        return <KnockoutPage onNavigate={navigate} />;
    }

    if (pathname === "/simulation") {
        return <SimulationPage onNavigate={navigate} />;
    }

    if (pathname === "/prediction") {
        return <PredictionPage onNavigate={navigate} />;
    }

    if (pathname === "/prediction/knockout") {
        return <KnockoutPage apiBase="/api/prediction" backRoute="/prediction" onNavigate={navigate} title="PREDICTION BRACKET" allowSimulation={false} />;
    }

    if (pathname.startsWith("/prediction/group/")) {
        const groupId = pathname.split("/").pop() ?? "";
        return <PredictionGroupPage groupId={groupId} onNavigate={navigate} />;
    }

    return <HomePage onNavigate={navigate} />;
}
