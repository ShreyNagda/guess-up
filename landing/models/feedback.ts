export interface UserFeedback {
  id?: string;
  rating: number; // 1 to 5 stars
  feedback: string; // actual feedback text
  name: string; // user name
  role: string; // user role (e.g. "House Party Host", "College Student")
  createdAt?: any;
}
