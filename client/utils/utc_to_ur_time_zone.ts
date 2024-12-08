import { DateTime } from "luxon";

const utc_to_ur_time = (
  utctime: string | Date,
  urTimeZone: string = "Asia/Dhaka"
) => {
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


export { utc_to_ur_time, utc_to_ur_date };