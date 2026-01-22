import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { createMemoryRouter, RouterProvider } from "react-router";

interface RenderWithRouterOptions {
  route?: string;
  path?: string;
}

export function renderWithRouter(
  ui: ReactElement,
  { route = "/", path = "/" }: RenderWithRouterOptions = {}
) {
  const router = createMemoryRouter([{ path, element: ui }], {
    initialEntries: [route],
  });

  return render(<RouterProvider router={router} />);
}

export { render };
