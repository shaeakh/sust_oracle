import { DateTime } from "luxon";

const utc_to_ur_time = (utctime: string | Date, urTimeZone: string) => {
  // Convert input to DateTime object
  const dt =
    typeof utctime === "string"
      ? DateTime.fromISO(utctime)
      : DateTime.fromJSDate(utctime);

  // Set the timezone and return formatted string
  return dt.setZone(urTimeZone).toFormat("hh:mm a");
};

const utc_to_ur_date = (
  utctime: string | Date,
  urTimeZone: string = "Asia/Dhaka"
) => {
  // Convert input to DateTime object
  const dt =
    typeof utctime === "string"
      ? DateTime.fromISO(utctime)
      : DateTime.fromJSDate(utctime);

  // Set the timezone and return formatted string
  return dt.setZone(urTimeZone).toFormat("LLLL dd, yyyy");
};

const our_time_to_utc_time = (time: string, urTimeZone: string) => {
  // Create DateTime object in the source timezone
  const dt = DateTime.fromFormat(time, "yyyy-MM-dd'T'HH:mm:ss", {
    zone: urTimeZone,
  });

  // Convert to UTC and format
  return dt.toUTC().toFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
};

export { our_time_to_utc_time, utc_to_ur_date, utc_to_ur_time };
