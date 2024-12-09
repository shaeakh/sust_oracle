import { DateTime } from "luxon";

const utc_to_ur_time_zone = (
  utctime: string | Date,
  urTimeZone: string = "local"
) => {
  // Convert input to DateTime object
  const dt =
    typeof utctime === "string"
      ? DateTime.fromISO(utctime)
      : DateTime.fromJSDate(utctime);

  // Set the timezone and return formatted string
  return dt.setZone(urTimeZone).toLocaleString(DateTime.DATETIME_FULL);
};
