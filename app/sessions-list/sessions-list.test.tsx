import { screen } from "@testing-library/react";
import { SessionList } from "~/sessions-list/sessions-list";
import { renderWithRouter } from "~/test/render";

const sessions = [
  {
    id: "1",
    activity: "Guitar",
    date: "2024-01-01",
    notes: "Scales",
    minutes: 30,
  },
];

test("renders an empty state when there are no sessions", () => {
  renderWithRouter(<SessionList sessions={[]} />);

  expect(
    screen.getByText(/no practice sessions logged/i)
  ).toBeInTheDocument();
});

test("renders session cards when sessions exist", () => {
  renderWithRouter(<SessionList sessions={sessions} />);

  expect(screen.getByText("Guitar")).toBeInTheDocument();
  expect(screen.getByText("Scales")).toBeInTheDocument();
  expect(screen.getByText("30")).toBeInTheDocument();
  expect(screen.getByText(/minutes/i)).toBeInTheDocument();
});
