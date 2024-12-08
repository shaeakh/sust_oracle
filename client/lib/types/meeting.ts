export interface User {
  id: number;
  username: string;
}

export interface Meeting {
  id: number;
  title: string;
  url: string;
  stime: Date;
  etime: Date;
  user: User[];
  location: string;
}
