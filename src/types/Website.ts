export interface Website {
  id: string;
  name: string;
  url: string;
  category: string;
  dateAdded: Date;
}

export interface FormData {
  name: string;
  url: string;
  category: string;
}

export interface FormErrors {
  name?: string;
  url?: string;
  category?: string;
}
