const axios = require("axios");
const { getZoomToken } = require("./getZoomToken");
const { DateTime } = require("luxon");

const generateMeetingUrl = async (meetingData) => {
    try {
        const token = await getZoomToken();
        const payload = {
            topic: meetingData.title,
            type: 2,
            start_time: DateTime.fromISO(meetingData.stime).toUTC().toFormat('yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
            duration: 30,
            // calculate timezone offset
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            agenda: "Online Meeting in zoom",
        };
        const response = await axios.post("https://api.zoom.us/v2/users/me/meetings", payload, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const meetingUrl = response.data.join_url;
        const meeting_host_url = response.data.start_url;
        return { meetingUrl, meeting_host_url };
    } catch (error) {
        console.error("Error generating meeting URL:", error);
        throw new Error("Failed to generate meeting URL");
    }
};

module.exports = { generateMeetingUrl };