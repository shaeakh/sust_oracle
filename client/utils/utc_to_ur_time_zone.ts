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
  const dt = DateTime.fromFormat(time, "hh:mm a", { zone: urTimeZone });
  return dt.toFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
};


export { utc_to_ur_date, utc_to_ur_time,our_time_to_utc_time };
