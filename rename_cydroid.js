let config = Object.freeze({
  sorts: {
    propertyOrdering: "tethered"
  }
});

(async function () {
  
  const R_API = "https://r.earth2.io";

    class Helper {
        constructor() {
        }

        isAvailable (object) { return typeof object !== "undefined" && object !== null && object !== ""; };

        tryParseJSON (data) {
            try {
                let result = JSON.parse(data);
                return result;
            }
            catch (e) {
                return data;
            }
        };

        cleanString (input) {
            let output = "";
            if (this.isAvailable(input)) {
                for (var i = 0; i < input.length; i++) {
                    if (input.charCodeAt(i) <= 255) {
                        output += input.charAt(i);
                    }
                }
            }
            output = output.replaceAll(",", " // ");
            return output;
        };

        getFormattedTime (getDateToo) {
            let now = new Date();

            let hours = now.getHours().toString().padStart(2, '0');
            let minute = now.getMinutes().toString().padStart(2, '0');
            let seconds = now.getSeconds().toString().padStart(2, '0');
            let millisecs = now.getMilliseconds().toString().padStart(3, '0');

            let result = `${hours}:${minute}:${seconds}::${millisecs}`;
            if (getDateToo) {
                let year = now.getFullYear().toString();
                let month = (now.getMonth() + 1).toString().padStart(2, '0');
                let day = now.getDate().toString().padStart(2, '0');
                result = `${year}-${month}-${day}::` + result;
            }
            return result;
        };

        createDownloadFile (prefix, content) {
            let link = document.createElement('a');
            link.download = `${prefix}-${this.getFormattedTime(true).replaceAll(":", "_")}.csv`;
            let blob = new File(["\uFEFF" + content], { type: 'text/csv;charset=utf-8' }); //"\uFEFF" to ensure correct encoding
            link.href = window.URL.createObjectURL(blob);
            if (confirm("do you want to download the results?")) {
                link.click();
            }
        }

        async sleep (ms) {
            await new Promise(r => setTimeout(r, ms));
        }

        isModN (index, num) {
            return (index % num) === 0;
        }

        getWaitTime (index, defaultWaitTime) {
            let result = defaultWaitTime;
            if (index > 0) {
                if (this.isModN(index, 10)) {
                    result = 1024;

                    if (this.isModN(index, 50)) {
                        result = 2048;
                    }
                    if (this.isModN(index, 100)) {
                        result = 4096;
                    }
                    if (this.isModN(index, 200)) {
                        result = 8192;
                    }
                } else if (this.isModN(index, 8)) {
                    result = 1024;

                    if (this.isModN(index, 32)) {
                        result = 4096;
                    }
                    if (this.isModN(index, 64)) {
                        result = 8192;
                    }
                }

                if (result >= 2048) {
                    console.log(`index: [${index}] -> long wait (${result})`);
                }
            }
            return result;
        }
    }
    let helper = new Helper();

    class E2API {
        constructor() {
            this.itemsPerPage = 100;
            this.initReact();
        }

        initReact() {
            window.___reactContext = Array.from(document.querySelectorAll("*"))
                .filter(t => Object.keys(t).some(tk => tk.includes("reactFiber")))
                .map(el => el[Object.keys(el).find(tk => tk.includes("reactFiber"))])
                .find(zu => zu.return?.dependencies?.firstContext?.context)
                .return.dependencies.firstContext.context._currentValue;
        }

        async getAllCydroidIds() {
            console.log("Getting all Cydroid IDs using REST API (getDroidLandfields approach)...");
            let cydroidIds = [];
    
                // Get the first page of landfields
                const firstPageData = await this.getDroidLandFieldFirstPage();
                let landfields = firstPageData.data;
    
                // Get the remaining pages of landfields
                for (let i = 2; i <= firstPageData.pageCount; i++) {
                   
                    console.log(`Fetching page [${i}/${firstPageData.pageCount}]`);
                    
    
                    const landFields = await this.getDroidLandFieldPage(i);
                    landfields = landfields.concat(landFields);
    
                    await helper.sleep(helper.getWaitTime(i, 100)); // Adjust wait time as needed
                }
    
                console.log(`Retrieved droidLandfields from the server.`);
    
                // Extract and return droidIds
                cydroidIds = landfields.map(dl => dl.meta.droidIds).flat();
    
            console.log("Cydroid ID fetching complete.");
            return cydroidIds;
        }
    
        async getDroidLandFieldFirstPage() {
            const query = await ___reactContext.api.apiClient.get(`/droids/landfields?page=1&q=&sortBy=${config.sorts.propertyOrdering}&sortDir=desc`);
            return {
              data: query.data.data,
              pageCount: query.data.meta.pages,
              count: query.data.meta.count
            };
        }
    
        async getDroidLandFieldPage(pageNumber) {
            const query = await ___reactContext.api.apiClient.get(`/droids/landfields?page=${pageNumber}&q=&sortBy=${config.sorts.propertyOrdering}&sortDir=desc`);
            return query.data.data
        }

        async fetchCydroidBatch(ids) {
            try {
                const cydroidData = await ___reactContext.droidsRepositoryStore.fetchDroids({ ids });
                return cydroidData.data;
            } catch (error) {
                console.error("Error fetching Cydroid batch:", error);
                return [];
            }
        }

        async getCydroids() {
            console.log("Getting Cydroids, please wait...");
            const allCydroidIds = await this.getAllCydroidIds();
            const batchSize = 50;
            let cydroids = [];

            for (let i = 0; i < allCydroidIds.length; i += batchSize) {
                const batchIds = allCydroidIds.slice(i, i + batchSize);
                const cydroidBatch = await this.fetchCydroidBatch(batchIds);
                cydroids.push(...cydroidBatch);
            }

            console.log("Cydroid fetching complete.");
            return cydroids;
        }

        async renameCydroid(cydroidId, newName) {
            const api_call = `/droids/${cydroidId}`;
            const payload = { name: newName };

            try {
                const response = await ___reactContext.api.apiClient.put(api_call, payload);

                if (response.status === 200) {
                    console.log(`✅ Cydroid ${cydroidId} renamed to ${newName}`);
                } else {
                    console.error(`❌ Error renaming Cydroid ${cydroidId}: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                console.error(`❌ Unexpected error renaming Cydroid ${cydroidId}:`, error);
            }
        }
    }

    let api = new E2API();

    async function main() {
        const cydroids = await api.getCydroids();
    
        for (const cydroid of cydroids) {
            const cydroidId = cydroid.id;
            const droidAppearance = cydroid.attributes.appearance;
            const jewelSlots = cydroid.attributes.jewelSlots; 
            const extractedAppearance = droidAppearance.substring(0, 5); // Extract first 5 characters
    
            // Mapping of extracted appearances to desired names
            const nameMap = {
                "CD001": "Sphera",
                "CD002": "Motus",
                "CD003": "Cephalo",
                "CD004": "Moleh",
                "CD005": "Salix",
                "CD006": "Fangmaw",
                "CD007": "Dela",
                "CD011": "Fury",
                "CD012": "Guli",
                "CD014": "Zephyr",
                "CD016": "Aurum",
                "CD018": "Gambit",
                "CD020": "Gileumbo",
                "CD022": "Necrosignal",
                "CD023": "Venator",
                "CD024": "Howler",
                "CD025": "Starlight fury",
                "CD027": "Jingo",
                "CD028": "Caelifer",
                "CD029": "Blaizer",
                "CD030": "Ember",
                "CD032": "Zirah",
                "CD034": "Ohr",
                "CD035": "Roteor",
                "CD036": "Scarab",
                "CD037": "Magnetar",
                "CD038": "Alukah" 
            };
    
            let newCydroidName; 
            if (nameMap[extractedAppearance]) {
                newCydroidName = `${nameMap[extractedAppearance]}`;
            } else {
                newCydroidName = `${extractedAppearance}`;  // Use the extracted appearance if not in the map
            }
    
            await api.renameCydroid(cydroidId, newCydroidName);
            await helper.sleep(5000);  
        }
    
        console.log("Cydroid renaming finished.");
    }
    main();

})();