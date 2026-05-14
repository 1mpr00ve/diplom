import { createBrowserRouter } from "react-router";
import { Layout } from "./Layout";
import { Home } from "./pages/Home";
import { EventPage } from "./pages/Event";
import { Auth } from "./pages/Auth";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "event/:id", Component: EventPage },
    ],
  },
  {
    path: "/auth",
    Component: Auth,
  }
]);
