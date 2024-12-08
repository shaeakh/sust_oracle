export interface User {
  id: number;
  username: string;
}

export interface Meeting {
  id: number;
  host_id: number;
  schedule_id: number;
  title: string;
  meeting_url: string | null;
  stime: string;
  etime: string;
  status: boolean;
  user: User[];
}
