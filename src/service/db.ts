class StoreSite {
  #db: IDBDatabase | null = null;
  #request: IDBOpenDBRequest | null = null;
  #store: IDBObjectStore | undefined;
  #dbReady: Promise<void>;
  //   #WebsiteUrlIndex: IDBIndex | undefined ;

  constructor() {
    this.#dbReady = new Promise((resolve, reject) => {
      this.#request = window.indexedDB.open("SitesDatabase", 2); // open Indexed DB

      // handling error
      this.#request.onerror = (event) => {
        console.error(`Some error occured while opening DB : ${event}`);
        reject(event);
      };

      // handle on upgraded
      this.#request.onupgradeneeded = () => {
        
        this.#db = this.#request?.result ?? null;
        if (!this.#db?.objectStoreNames.contains("SitesDatabase")) {
          this.#store = this.#db?.createObjectStore("SitesDatabase", { keyPath: "WebsiteId" });
          this.#store?.createIndex("WebsiteId", "WebsiteId", { unique: false });
          this.#store?.createIndex("WebsiteName", "WebsiteName", { unique: false });
        }
      };

      // handle on success
      this.#request.onsuccess = () => {
        this.#db = this.#request?.result ?? null;
        resolve();
      };
    });
  }

  close(): void {
    if (this.#db) {
      this.#db.close();
      this.#db = null;
    }
  }

  async insert(userId: string,WebsiteId: string,WebsiteName: string,WebsiteURL: string,Category: string): Promise<void> {
    try {
      // Wait for database to be ready
      await this.#dbReady;

      if (!this.#db) {
        throw new Error("Database not initialized");
      }

      // Create a new transaction for each insert operation
      const transaction = this.#db.transaction("SitesDatabase", "readwrite");
      const store = transaction.objectStore("SitesDatabase");

      const insertRequest = store.put({
        userId: userId,
        WebsiteId: WebsiteId,
        WebsiteName: WebsiteName,
        WebsiteURL: WebsiteURL,
        Category: Category,
      });

      return new Promise((resolve, reject) => {
        insertRequest.onsuccess = () => {
          console.log("Data Has been added to DB");
          resolve();
        };
        insertRequest.onerror = (event) => {
          const error = `Error Occured while adding site to DB : ${(event.target as IDBRequest).error}`;
          console.log(error);
          reject(new Error(error));
        };
      });
    } catch (error) {
      console.error("Failed to insert data:", error);
      throw error;
    }
  }

  async getAllsites(): Promise<any[]> {
    await this.#dbReady;

    if (!this.#db) {
      throw new Error("Database not initialized");
    }

    const transaction = this.#db.transaction("SitesDatabase", "readonly");
    const store = transaction.objectStore("SitesDatabase");

    const getRequest = store.getAll();

    return new Promise((resolve, reject) => {
      getRequest.onsuccess = (e) => {
        resolve((e.target as IDBRequest).result);
      };
      getRequest.onerror = (event) => {
        const error = `Error Occured while getting all sites : ${(event.target as IDBRequest).error}`;
        console.error(error);
        reject(new Error(error));
      };
    });
  }

  async deleteSite(WebsiteURL: string): Promise<any> {
    await this.#dbReady;

    if (!this.#db) {
      throw new Error("Database not initialized");
    }

    // First, find the site by WebsiteURL to get its WebsiteId
    const transaction = this.#db.transaction("SitesDatabase", "readwrite");
    const store = transaction.objectStore("SitesDatabase");

    // Get all sites and find the one with matching WebsiteURL
    const getAllRequest = store.getAll();

    return new Promise((resolve, reject) => {
      getAllRequest.onsuccess = (e) => {
        const allSites = (e.target as IDBRequest).result;
        const siteToDelete = allSites.find((site: any) => site.WebsiteURL === WebsiteURL);

        if (!siteToDelete) {
          reject(new Error(`Site with URL ${WebsiteURL} not found`));
          return;
        }

        // Now delete using the WebsiteId (which is the keyPath)
        const deleteRequest = store.delete(siteToDelete.WebsiteId);

        deleteRequest.onsuccess = () => {
          console.log("Site deleted successfully");
          resolve(siteToDelete);
        };

        deleteRequest.onerror = (event) => {
          const error = `Error occurred while deleting site: ${(event.target as IDBRequest).error}`;
          console.error(error);
          reject(new Error(error));
        };
      };

      getAllRequest.onerror = (event) => {
        const error = `Error occurred while finding site to delete: ${(event.target as IDBRequest).error}`;
        console.error(error);
        reject(new Error(error));
      };
    });
  }
}

export const StoreService = new StoreSite();
