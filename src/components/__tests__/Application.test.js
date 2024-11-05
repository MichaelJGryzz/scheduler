import React from "react";

import {
  render,
  cleanup,
  fireEvent,
  findByText,
  findByAltText,
  getByPlaceholderText,
  getByText,
  getByAltText,
  getAllByTestId,
  prettyDOM,
  queryByText,
  queryByAltText,
} from "@testing-library/react";

import Application from "components/Application";

import axios from "axios";

afterEach(cleanup);

describe("Application", () => {
  it("defaults to Monday and changes the schedule when a new day is selected", () => {
    const { queryByText, findByText } = render(<Application />);

    return findByText("Monday").then(() => {
      fireEvent.click(queryByText("Tuesday"));
      expect(queryByText("Leopold Silvers")).toBeInTheDocument();
    });
  });

  it("loads data, books an interview and reduces the spots remaining for Monday by 1", async () => {
    // 1. Render the Application
    const { container } = render(<Application />);
    // 2. Wait until the text "Archie Cohen" is displayed
    await findByText(container, "Archie Cohen");
    // 3. Click the "Add" button on the first empty appointment
    const appointments = getAllByTestId(container, "appointment");
    const appointment = appointments[0];
    fireEvent.click(getByAltText(appointment, "Add"));
    // 4. Enter the name "Lydia Miller-Jones" into the input with the placeholder "Enter Student Name"
    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
      target: { value: "Lydia Miller-Jones" },
    });
    // 5. Click the first interviewer in the list
    fireEvent.click(getByAltText(appointment, "Sylvia Palmer"));
    // 6. Click the "Save" button on that same appointment
    fireEvent.click(getByText(appointment, "Save"));
    // 7. Check that the element with the text "Saving" is displayed
    expect(getByText(appointment, "Saving")).toBeInTheDocument();
    // 8. Wait until the element with the text "Lydia Miller-Jones" is displayed
    await findByText(appointment, "Lydia Miller-Jones");
    // 9. Check that the DayListItem with the text "Monday" also has the text "no spots remaining"
    const day = getAllByTestId(container, "day").find((day) =>
      queryByText(day, "Monday")
    );
    expect(getByText(day, "no spots remaining")).toBeInTheDocument();
  });

  it("loads data, cancels an interview and increases the spots remaining for Monday by 1", async () => {
    // 1. Render the Application
    const { container } = render(<Application />);
    // 2. Wait until the text "Archie Cohen" is displayed
    await findByText(container, "Archie Cohen");
    // 3. Click the "Delete" button on the booked appointment
    const appointment = getAllByTestId(container, "appointment").find(
      (appointment) => queryByText(appointment, "Archie Cohen")
    );

    fireEvent.click(queryByAltText(appointment, "Delete"));
    // 4. Check that the confirmation message is shown
    expect(
      getByText(appointment, "Are you sure you would like to delete?")
    ).toBeInTheDocument();
    // 5. Click the "Confirm" button on the confirmation
    fireEvent.click(queryByText(appointment, "Confirm"));
    // 6. Check that the element with the text "Deleting" is displayed
    expect(getByText(appointment, "Deleting")).toBeInTheDocument();
    // 7. Wait until the element with the "Add" button is displayed
    await findByAltText(appointment, "Add");
    // 8. Check that the DayListItem with the text "Monday" also has the text "2 spots remaining"
    const day = getAllByTestId(container, "day").find((day) =>
      queryByText(day, "Monday")
    );
    expect(getByText(day, "2 spots remaining")).toBeInTheDocument();
  });

  it("loads data, edits an interview and keeps the spots remaining for Monday the same", async () => {
    // 1. Render the Application
    const { container } = render(<Application />);
    // 2. Wait until the text "Archie Cohen" is displayed
    await findByText(container, "Archie Cohen");
    // 3. Click the "Edit" button on the booked appointment
    const appointment = getAllByTestId(container, "appointment").find(
      (appointment) => queryByText(appointment, "Archie Cohen")
    );

    fireEvent.click(queryByAltText(appointment, "Edit"));
    // 4. Check that the form with the interviewer's name and student name is displayed
    expect(
      getByPlaceholderText(appointment, /enter student name/i)
    ).toBeInTheDocument();
    // 5. Change the student name and/or select a different interviewer in the form
    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
      target: { value: "New Student Name" },
    });
    fireEvent.click(getByAltText(appointment, "Sylvia Palmer")); // Select a different interviewer
    // 6. Click the "Save" button to submit the changes
    fireEvent.click(queryByText(appointment, "Save"));
    // 7. Check that the element with the text "Saving" is displayed
    expect(getByText(appointment, "Saving")).toBeInTheDocument();
    // 8. Wait until the updated appointment details are displayed
    await findByText(appointment, "New Student Name");
    // 9. Check that the DayListItem with the text "Monday" still has the text "1 spot remaining"
    const day = getAllByTestId(container, "day").find((day) =>
      queryByText(day, "Monday")
    );
    expect(getByText(day, "1 spot remaining")).toBeInTheDocument();
  });

  it("shows the save error when failing to save an appointment", async () => {
    // 1. Mock the axios.put request to reject, simulating a save error
    axios.put.mockRejectedValueOnce();
    // 2. Render the Application
    const { container } = render(<Application />);
    // 2. Wait until the text "Archie Cohen" is displayed
    await findByText(container, "Archie Cohen");
    // 3. Click the "Add" button on the first empty appointment
    const appointments = getAllByTestId(container, "appointment");
    const appointment = appointments[0];
    fireEvent.click(getByAltText(appointment, "Add"));
    // 4. Enter the name "Lydia Miller-Jones" into the input with the placeholder "Enter Student Name"
    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
      target: { value: "Lydia Miller-Jones" },
    });
    // 6. Click the first interviewer in the list
    fireEvent.click(getByAltText(appointment, "Sylvia Palmer"));
    // 7. Click the "Save" button to attempt to save the appointment
    fireEvent.click(getByText(appointment, "Save"));
    // 8. Check that the element with the text "Saving" is displayed
    expect(getByText(appointment, "Saving")).toBeInTheDocument();
    // 9. Wait for the error message to be displayed
    await findByText(appointment, "Could not book appointment.");
    // 10. Optionally, click the "Close" button on the error message to dismiss it
    fireEvent.click(getByAltText(appointment, "Close"));
    // 11. Ensure the error message is no longer in the document
    expect(
      queryByText(appointment, "Could not book appointment.")
    ).not.toBeInTheDocument();
  });

  it("shows the delete error when failing to delete an existing appointment", async () => {
    // 1. Mock the axios.put request to reject, simulating a save error
    axios.delete.mockRejectedValueOnce();
    // 2. Render the Application
    const { container } = render(<Application />);
    // 3. Wait until the text "Archie Cohen" is displayed
    await findByText(container, "Archie Cohen");
    // 4. Click the "Delete" button on the booked appointment
    const appointment = getAllByTestId(container, "appointment").find(
      (appointment) => queryByText(appointment, "Archie Cohen")
    );
    fireEvent.click(queryByAltText(appointment, "Delete"));
    // 5. Check that the confirmation message is shown
    expect(
      getByText(appointment, "Are you sure you would like to delete?")
    ).toBeInTheDocument();
    // 6. Click the "Confirm" button on the confirmation
    fireEvent.click(queryByText(appointment, "Confirm"));
    // 7. Check that the element with the text "Deleting" is displayed
    expect(getByText(appointment, "Deleting")).toBeInTheDocument();
    // 8. Wait for the error message to be displayed
    await findByText(appointment, "Could not cancel appointment.");
    // 9. Optionally, click the "Close" button on the error message to dismiss it
    fireEvent.click(getByAltText(appointment, "Close"));
    // 11. Ensure the error message is no longer in the document
    expect(
      queryByText(appointment, "Could not cancel appointment.")
    ).not.toBeInTheDocument();
  });
});
