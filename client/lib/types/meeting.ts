export interface User {
  id: number;
  username: string;
}

export interface Meeting {
  id: number;
  title: string;
  time: string;
  duration: string;
  status: 'scheduled' | 'pending';
}
