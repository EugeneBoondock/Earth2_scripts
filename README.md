## Cydroid Renamer: Earth2 Script

**Rename your Cydroids based on their appearance/type for better organization and identification!**

### Features

* **Batch Fetching:** Efficiently retrieves all your Cydroids using the Earth2 API.
* **Appearance-Based Renaming:** Renames Cydroids according to the first 5 characters of their appearance (e.g., "CD004").
* **Customizable Name Mapping:** Allows you to map specific appearances to custom names (e.g., rename "CD001" to "Sphera").
* **Waits Between Renames:** Implements delays between renaming actions to avoid potential rate limiting issues with the Earth2 API.

### Requirements

* **Earth2 Account:** You need to be logged in to your Earth2 account in your web browser.
* **Browser Console:** The script is designed to be run directly in your browser's JavaScript console.

### Instructions

1. **Copy the Script:** Copy the entire script code from the `rename_cydroid.js` file. 
2. **Open Earth2 and Console:** Navigate to the Earth2 website and log in to your account. Then, open your browser's developer tools and switch to the "Console" tab.
3. **Paste and Execute:** Paste the script code into the console and press Enter to execute it.
4. **Monitor Progress:** The script will display progress messages in the console as it fetches Cydroids and renames them.

### Customization

*   **`nameMap` Dictionary:** Update the `nameMap` dictionary to customize the names for specific Cydroid appearances.
*   **Wait Time:** Adjust the `helper.sleep(1000)` value in the `main` function to change the delay between renaming actions (in milliseconds).

### Example Usage

```javascript

const nameMap = {
    "CD001": "Sphera",
    "CD002": "Motus",
    // ... (Add more mappings as needed) ... 
};
```

# Disclaimer: Use at own risk hehe

