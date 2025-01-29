
var notifyAPI;
(async () => {
  const notifyUrl = await chrome.runtime.getURL("src/Notification/Notification.js");
  notifyAPI = await import(notifyUrl);
})();

function isEmptyObject(obj) {
  return obj == null || (typeof obj === 'object' && Object.keys(obj).length === 0)
}

function isEmptyArray(arr) {
  return !Array.isArray(arr) || arr.length === 0;
}

function notify(message, type = "info",display = false) {
  if (display == true) {
    notifyAPI.openToastNode(type, message);
    return;
  }
  console.log(message);
}
/**
 * An util method to show an error message.
 * @param {*} error the exception object
 * @param {*} info the message string to show/log
 * @param {*} display whether to display the message or not
 */
function onError(error, info = "Something went wrong", display = false) {
  console.error(`Error From VE-Checklist: ${error?.message}`);
  console.dir(error);
  notify(`${info}, Please review the console logs for details and report the issue if needed.`, "error", display);
}
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * This function returns a string that says whether
 * we have either stored the JSON locally or we
 * are depending on a remote URL where we fetch
 * the JSON from.
 * @returns {string} either "local" or "url"
 */
async function getChecklistMode() {
	const veX_dod_url = await chrome.storage.sync.get("veX_dod_url");
	if (veX_dod_url?.veX_dod_url && veX_dod_url.veX_dod_url != "") {
		return "url";
	} else {
    console.log("checklist mode local");
		return "local";
	}
}

function validateChecklist(veXChecklistInfo) {
    try {
        if (utilAPI.isEmptyObject(veXChecklistInfo)) {
            utilAPI.notify("The checklist JSON file appears to be empty. Please upload a valid file to continue 👀", "warning", true);
            return false;
        }
        let entitiesArray = Object.keys(veXChecklistInfo);
        for (let i = 0; i < entitiesArray.length; i++) {
            let ticketEntityName = entitiesArray[i];
            let entityChecklist = veXChecklistInfo[ticketEntityName];
            if (utilAPI.isEmptyObject(entityChecklist)) {
                utilAPI.notify(`It looks like the '${ticketEntityName}' entity is empty. Please add the necessary fields to continue.`, "warning", true);
                return false;
            }
            if (!entityChecklist.hasOwnProperty("categories")) {
                utilAPI.notify(`The 'categories' is missing from the '${ticketEntityName}' entity. Please add it, as it is a mandatory field.`, "warning", true);
                return false;
            }
            if (utilAPI.isEmptyObject(entityChecklist["categories"])) {
                utilAPI.notify(`No categories are specified in the '${ticketEntityName}'. Please add atleast one, as it is a mandatory field.`, "warning", true);
                return false;
            }
            if (validateChecklistCategories(entityChecklist["categories"], ticketEntityName) === false)
                return false;
        }
        return true;
    } catch (err) {
        utilAPI.onError(err, undefined, true);
        return false;
    }
}

function validateChecklistCategories(ChecklistCategories, ticketEntityName) {
    try {
        let categories = Object.keys(ChecklistCategories);
        for (let i = 0; i < categories.length; i++) {
            let categoryName = categories[i];
            if (!ChecklistCategories[categoryName].hasOwnProperty("checklist")) {
                utilAPI.notify(`The 'checklist' key is missing in the '${categoryName}' category of the '${ticketEntityName}' entity. Please add it, as it is required.`, "warning", true);
                return false;
            }
            if (utilAPI.isEmptyArray(ChecklistCategories[categoryName].checklist)) {
                utilAPI.notify(`The 'checklist' array is empty in the '${categoryName}' category for the '${ticketEntityName}' entity. Please add it, as it is required."`, "warning", true);
                return false;
            }
            if (ChecklistCategories[categoryName].checklist.every(list => list.length >= 1) === false) {
                utilAPI.notify(`One of the checklist item is empty in the '${categoryName}' category for the '${ticketEntityName}' entity. Please add it, as it is required."`, "warning", true);
                return false;
            }
        }
        return true;
    } catch (err) {
        utilAPI.onError(err, undefined, true);
        return false;
    }
}

async function saveChecklist(veXChecklistInfo, veX_dod_url) {
  try {
      await chrome.storage.sync.clear();
      let entites = Object.keys(veXChecklistInfo);
      for (let i = 0; i < entites.length; i++) {
          let ticketEntityName = entites[i];
          let keyValue = {};
          if (utilAPI.isEmptyObject(veXChecklistInfo[ticketEntityName]))
              return false;
          keyValue[ticketEntityName] = veXChecklistInfo[ticketEntityName];
          await chrome.storage.sync.set(keyValue);
      }
      // re-save the URL as well if it was passed
      if(veX_dod_url) {
        await chrome.storage.sync.set({"veX_dod_url": veX_dod_url});
      }
      return true;
  }
  catch (err) {
      utilAPI.onError(err, undefined, true);
      return false;
  }
}

export {
  onError, notify, isEmptyArray, isEmptyObject,delay, getChecklistMode, validateChecklist, saveChecklist
}