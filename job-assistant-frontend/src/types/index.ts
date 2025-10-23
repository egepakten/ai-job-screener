export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface Job {
  title: string;
  company: string;
  salary: string;
  description: string;
}
