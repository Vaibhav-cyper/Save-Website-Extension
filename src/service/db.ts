class StoreSite{
    #db:IDBDatabase | null = null;
    #request: IDBOpenDBRequest | null = null;
    #store : IDBObjectStore | undefined;
   

    constructor(){
        this.#request = window.indexedDB.open("SitesDatabase", 1); // open Indexed DB
        // handling error
        this.#request.onerror = (event) => {
            console.error(`Some error occured whie opening DB : ${event}`);
        }
        // handle on upgraded
        this.#request.onupgradeneeded = () =>{
            console.log('DB Open Successfully');
            this.#db = this.#request?.result ?? null;
            if(!this.#db?.objectStoreNames.contains("SitesDatabase")){
                this.#store = this.#db?.createObjectStore("SitesDatabase" ,{keyPath : 'id'})
                this.#store?.createIndex("userId","uuid", {unique :false});
                this.#store?.createIndex("Website Name","Website URL", {unique :false});
                this.#store?.createIndex("Category","Category", {unique :false});
                this.#store?.createIndex("Website Status","Status", {unique : false});
            }
        }

        // handle on success
        this.#request.onsuccess = () =>{
            this.#db = this.#request?.result ?? null;
            let transaction = this.#db?.transaction("SitesDatabase","readwrite");
            this.#store = transaction?.objectStore("SitesDatabase");

        }
    }

    insert(WebsiteName :string , WebsiteURL:string, Category:string[], WebsiteStatus:string){
        const insertRequest = this.#store?.put({
            userId : Date.now(),
            WebsiteName : WebsiteName,
            WebsiteURL : WebsiteURL,
            Category:Category,
            WebsiteStatus:WebsiteStatus
        });

        if (insertRequest) {
            insertRequest.onsuccess = () => {
                console.log("Data Has been added to DB")
            }
            insertRequest.onerror = (event) => {
                console.log(`Error Occured while adding site to DB : ${(event.target as IDBRequest).error}`)
            }
        }
    }

    getAllsites(){
        const getRequest = this.#store?.getAll();
        if (getRequest) {
            getRequest.onsuccess = (e) => {
                return (e.target as IDBRequest).result;
            }
            getRequest.onerror = (event) => {
                console.log(`Error Occured while getting all sites : ${(event.target as IDBRequest).error}`)
            }
        }
    }

}


export const StoreService = new StoreSite();