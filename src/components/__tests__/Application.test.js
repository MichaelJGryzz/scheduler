import React from "react";

import { render, fireEvent } from "@testing-library/react";

import Application from "components/Application";

it("defaults to Monday and changes the schedule when a new day is selected", () => {
  const { queryByText, findByText } = render(<Application />);

  return findByText("Monday").then(() => {
    fireEvent.click(queryByText("Tuesday"));
    expect(queryByText("Leopold Silvers")).toBeInTheDocument();
  });
});
