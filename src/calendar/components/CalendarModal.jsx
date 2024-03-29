import { useMemo, useState, useEffect } from "react";
import { addHours, differenceInSeconds } from "date-fns";

import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import Modal from "react-modal";

import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import en from "date-fns/locale/en-US";
import { useCalendarStore, useUiStore } from "../../hooks";

registerLocale("en-US", en);

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

Modal.setAppElement("#root");

export const CalendarModal = () => {
  const { isDateModalOpen, closeDateModal } = useUiStore();
  const { activeEvent, startSavingEvent } = useCalendarStore();

  const [formSubmitted, setFormSubmitted] = useState(false);

  const [formValues, setFormValues] = useState({
    title: "",
    notes: "",
    start: new Date(),
    end: addHours(new Date(), 2),
  });

  const titleClass = useMemo(() => {
    if (!formSubmitted) return "";

    return formValues.title.length > 0 ? "" : "is-invalid";
  }, [formValues.title, formSubmitted]);

  useEffect(() => {
    if (activeEvent !== null) {
      setFormValues({ ...activeEvent });
    }
  }, [activeEvent]);

  const onInputChanged = ({ target }) => {
    setFormValues({
      ...formValues,
      [target.name]: target.value,
    });
  };

  const onDateChanged = (event, changing) => {
    setFormValues({
      ...formValues,
      [changing]: event,
    });
  };

  const onCloseModal = () => {
    closeDateModal();
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setFormSubmitted(true);

    const difference = differenceInSeconds(formValues.end, formValues.start);

    if (isNaN(difference) || difference <= 0) {
      Swal.fire(
        "Invalid date",
        "End date must be a date after start date",
        "error"
      );
      return;
    }

    if (formValues.title.length <= 0) return;

    //console.log(formValues);

    await startSavingEvent(formValues);
    closeDateModal();
    setFormSubmitted(false);
  };

  return (
    <Modal
      isOpen={isDateModalOpen}
      onRequestClose={onCloseModal}
      style={customStyles}
      className="modal"
      overlayClassName="modal-fondo"
      closeTimeoutMS={200}
    >
      <h1>Event</h1>
      <hr />
      <form className="container" onSubmit={onSubmit}>
        <div className="form-group mb-2 space-between w-100 d-flex">
          <label
            htmlFor="startDate"
            style={{ marginBottom: "10px", marginRight: "10px" }}
          >
            Start date and time
          </label>
          <DatePicker
            id="startDate"
            selected={formValues.start}
            onChange={(event) => onDateChanged(event, "start")}
            className="form-control"
            dateFormat="Pp"
            showTimeSelect
            locale="en"
            timeCaption="Hour"
          />
        </div>

        <div className="form-group mb-2 space-between w-100">
          <label
            htmlFor="endDate"
            style={{ marginBottom: "10px", marginRight: "10px" }}
          >
            End date and time
          </label>
          <DatePicker
            minDate={formValues.start}
            selected={formValues.end}
            onChange={(event) => onDateChanged(event, "end")}
            className="form-control"
            dateFormat="Pp"
            showTimeSelect
            locale="en"
            timeCaption="Hour"
            id="endDate"
          />
        </div>

        <hr />
        <div className="form-group mb-2">
          <label htmlFor="eventTitle">Event title and notes</label>
          <input
            type="text"
            className={`form-control ${titleClass}`}
            placeholder="Event title"
            name="title"
            autoComplete="off"
            value={formValues.title}
            onChange={onInputChanged}
            id="eventTitle"
          />
          <small id="emailHelp" className="form-text text-muted">
            A short description
          </small>
        </div>

        <div className="form-group mb-2">
          <textarea
            type="text"
            className="form-control"
            placeholder="Notes"
            rows="5"
            name="notes"
            value={formValues.notes}
            onChange={onInputChanged}
          ></textarea>
          <small id="emailHelp" className="form-text text-muted">
            Additional information
          </small>
        </div>

        <div className="form-group mb-2 d-flex justify-content-end">
          <button type="submit" className="btn btn-outline-primary btn-block">
            <i className="far fa-save"></i>
            <span style={{ marginLeft: "5px" }}>Save</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
