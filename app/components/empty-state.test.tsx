import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { EmptyState } from "~/components/empty-state";
import { render } from "~/test/render";

test("calls onAdd when the button is clicked", async () => {
  const onAdd = vi.fn();
  const user = userEvent.setup();

  render(<EmptyState onAdd={onAdd} />);

  await user.click(
    screen.getByRole("button", { name: /add practice session/i })
  );

  expect(onAdd).toHaveBeenCalledTimes(1);
});
