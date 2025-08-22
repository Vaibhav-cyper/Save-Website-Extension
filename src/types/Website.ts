export interface Website {
  userId: string;
  WebsiteId :string;
  WebsiteName: string;
  WebsiteURL: string;
  Category: string;
  WebsiteStatus: string;
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
