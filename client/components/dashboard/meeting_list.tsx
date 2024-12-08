import React from 'react';

const MeetingList = () => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Upcoming Meetings</h2>
      <div className="space-y-4">
        {/* Sample meetings - replace with actual data */}
        <div className="bg-white/90 p-4 rounded-md shadow">
          <h3 className="font-semibold">Project Review</h3>
          <p className="text-gray-600">Today at 2:00 PM</p>
          <p className="text-sm text-gray-500">Duration: 1 hour</p>
        </div>
        <div className="bg-white/90 p-4 rounded-md shadow">
          <h3 className="font-semibold">Team Sync</h3>
          <p className="text-gray-600">Tomorrow at 10:00 AM</p>
          <p className="text-sm text-gray-500">Duration: 30 minutes</p>
        </div>
      </div>
    </div>
  );
};

export default MeetingList;
