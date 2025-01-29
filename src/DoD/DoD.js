//-->veX Objects Declarations
var veXDODInfo = {};
var veXCurrentTicketInfo = {};
var veXCurrentTicketChecklist = {};
var veXChecklistItems = {};
var veXPhaseMap = {};
var veXTotalCompletedItems = 0;
var veXCurrentTicketCategoryNames = [];
var veXTotalItems = 0;
var veXNodes = {};
var veXPopUpNode = document.createElement("div");
var veXPopUpOverlay = document.createElement("div");
var veXTicketPhaseMutationObserver;
var veXTicketTitleMutationObserver;
var veXTicketTypeMutationObserver;
var veXCurrentPhaseCategories = [];
var veXIsViewInitialised = false;
var veXCurrentCategory = {};
var veXChecklistStates = { 0: "UnSelected", 1: "Completed", 2: "NotCompleted", 3: "NotApplicable" };
var root = document.querySelector(':root');
var utilAPI;
(async () => {
  const utilURL = chrome.runtime.getURL("src/Utility/util.js");
  utilAPI = await import(utilURL);
})();
(async () => {
  const DOMPurifyURL = chrome.runtime.getURL("src/Utility/purify.min.js");
  await import(DOMPurifyURL);
})();
const veXEntityMetaData = {
  'E':
  {
    'name': 'Epic',
    'colorHex': '#7425ad'
  },
  'F':
  {
    'name': 'Feature',
    'colorHex': '#e57828'
  },
  'D':
  {
    'name': 'Defect',
    'colorHex': '#b5224f'
  },
  'ER':
  {
    'name': 'Enhancement',
    'colorHex': '#5555cf'
  },
  'IM':
  {
    'name': 'CPE Incident',
    'colorHex': '#ff404b'
  },
  'I':
  {
    'name': 'CPE Incident',
    'colorHex': '#ff404b'
  },
  'US':
  {
    'name': 'User Story',
    'colorHex': '#ffaa00'
  },
  'INT':
  {
    'name': 'Internal',
    'colorHex': '#be52e4'
  },
  'SK':
  {
    'name': 'Spike',
    'colorHex': '#0baaf3'
  },
  'QS':
  {
    'name': 'Quality Story',
    'colorHex': '#2fc07e'
  },
  'T':
  {
    'name': 'Task',
    'colorHex': '#1365c0'
  }
}

var vexDODUI = `
<header class="veX_header veX_banner">
    <div class="veX_logo_container">
        <img class="veX_logo  " title="Checklist Tool for OpenText ValueEdge" alt="VE Checklist">
    </div>
    <p class="veX_header_title"></p>
</header>
<div class="veX_done_status"></div>
<div class="veX_content_wrapper">
    <div class="veX_sidebar">
        <div class="veX_sidebar_header">
            <div class="veX_ticket_phase">
                <p class="veX_ticket_phase_txt">Not Available</p>
                <div class="veX_all_phases">
                </div>
            </div>
            <div class="veX_done_percentage">0%</div>
        </div>
        <div class="veX_dod_categories">No Item</div>
    </div>
    <div class="veX_main_content">
        <div class="veX_dod_title">No Item</div>
        <div class="veX_dod_list_container">
        </div>
    </div>
</div>
<div class="veX_banner veX_footer">
    <div class="veX_footer_options">
        <div class="veX_footer_icon_container veX_leave_comment_btn">
            <span>Leave Comment</span>
            <img class="veX_add_comment_icon veX_footer_icon  " alt="Leave a Comment" title="This will add a new comment with the selected checklist." src="${chrome.runtime.getURL("icons/add_comment_24.png")}" alt="Add Comment"/>
        </div>
        <!--<div class="veX_footer_icon_container veX_edit_comment_btn">
            <img class="veX_edit_comment_icon veX_footer_icon  " alt="Edit Comment" title="This will allow you to modify the existing comment." src="${chrome.runtime.getURL("icons/rate_review_24.png")}" alt="Edit Comment"/>
            <span>Edit Comment</span>
            </div> -->
    </div>
</div>
`;

//<-- veX Objects Declarations

//->Initialising Mutation Observers to notify whenever DOM changes.
function initTicketTitleMutationObserver() {
  try {
    let targetNode = document.head.querySelector('title');
    if (!targetNode) return;
    let options = { childList: true };
    veXTicketTitleMutationObserver = new MutationObserver(
      (mutationList, observer) => {
        for (const mutation of mutationList) {
          // let currentTitle = mutation.target.innerText;
          // let ticketArr = currentTitle.split(" ");
          // currentTitle = getTicketTitle(currentTitle.slice(ticketArr[0].length + 1))
          // const match = ticketArr[0].match(/^([a-zA-Z]+)(\d+)$/);
          // if(!match) 
          //   break;
          // let curType= veXEntityMetaData[match[1]].name; 
          // if (currentTitle != veXCurrentTicketInfo.title && curType != veXCurrentTicketInfo.type)
            onTicketTitleChange(mutation);
        }
      }
    );
    veXTicketTitleMutationObserver.observe(targetNode, options);
  }
  catch (err) {
    utilAPI.onError(err, "An error occurred during the setup.");
  }
}

//->Initialising Mutation Observers to notify whenever DOM changes.
function initTicketTypeMutationObserver() {
  try {
    let targetNode = document.querySelector('[ng-if="header.shouldShowEntityLabel"]');
    if (!targetNode) return;
    let options = { childList: true , characterData: true,subtree:true};
    veXTicketTypeMutationObserver = new MutationObserver(
      (mutationList, observer) => {
        for (const mutation of mutationList) {
          // let currentTitle = mutation.target.innerText;
          // let ticketArr = currentTitle.split(" ");
          // currentTitle = getTicketTitle(currentTitle.slice(ticketArr[0].length + 1))
          // const match = ticketArr[0].match(/^([a-zA-Z]+)(\d+)$/);
          // if(!match) 
          //   break;
          // let curType= veXEntityMetaData[match[1]].name; 
          // if (currentTitle != veXCurrentTicketInfo.title && curType != veXCurrentTicketInfo.type)
            onTicketTitleChange(mutation);
        }
      }
    );
    veXTicketTypeMutationObserver.observe(targetNode, options);
  }
  catch (err) {
    utilAPI.onError(err, "An error occurred during the setup.");
  }
}
// function getTicketType(title)
// {
//   if (!title) return "";
//   ticketArr = title.split(" ");
//   if (ticketArr.length < 2) return;
//   const match = ticketArr[0].match(/^([a-zA-Z]+)(\d+)$/);
//   if (!match || match.length < 2) return "";
//   let ticketType = document.querySelector('[ng-if="header.shouldShowEntityLabel"]').innerText;
//   if (!ticketType || ticketType.length == "")
//     return "";
//   ticketType = ticketType.toUpperCase();
// }
function initTicketPhaseMutationObserver() {
  try {
    let targetNode = document.querySelector("[data-aid='entity-life-cycle-widget-phase']").childNodes[3];
    if (!targetNode) return;
    let options = { attributes: true };
    veXTicketPhaseMutationObserver = new MutationObserver(
      (mutationList, observer) => {
        for (const mutation of mutationList) {
          onTicketPhaseChange(mutation);
        }
      }
    );
    veXTicketPhaseMutationObserver.observe(targetNode, options);
  }
  catch (err) {
    utilAPI.onError(err, "An error occurred during the setup.");
  }
}
//<-Initialising Mutation Observers


//->Utility Functions
function veXSetup() {
  try {
    veXPopUpNode.id = "veX-PopUp-Container";
    veXPopUpNode.classList.add("veX_pop_deactive");
    veXPopUpOverlay.id = "veX-PopUp-Overlay";
    veXPopUpNode.innerHTML = vexDODUI;
    document.body.appendChild(veXPopUpNode);
    document.body.appendChild(veXPopUpOverlay);
    veXPopUpOverlay.addEventListener("click", closeveXPopUp);
    initTicketTitleMutationObserver();
    initVEXNodes();
  } catch (err) {
    utilAPI.onError(err, "An error occurred during the setup.");
  }
}

function initVEXNodes() {
  try {
    veXNodes.veXCategoryTitleNode = veXPopUpNode.querySelector('.veX_dod_title');
    veXNodes.veXSidebarParentNode = veXPopUpNode.querySelector('.veX_sidebar');
    veXNodes.veXChecklistParentNode = veXPopUpNode.querySelector('.veX_dod_list_container');
    veXNodes.veXHeaderTitleNode = veXPopUpNode.querySelector(".veX_header_title");
    veXNodes.veXDODcategoriesNode = veXPopUpNode.querySelector(".veX_dod_categories");
    veXNodes.veXTicketPhaseTextNode = veXPopUpNode.querySelector(".veX_ticket_phase_txt");
    veXNodes.veXTicketPhaseNode = veXPopUpNode.querySelector(".veX_ticket_phase");
    veXNodes.veXDonePercentageNode = veXPopUpNode.querySelector(".veX_done_percentage");
    veXNodes.veXPhaseDropDown = veXPopUpNode.querySelector(".veX_all_phases");
  } catch (err) {
    utilAPI.onError(err, "An error occurred during the setup.");
  }

}

function getCurrentTicketInfo(title) {
  try {
    if (!title) return;
    ticketArr = title.split(" ");
    if (ticketArr.length < 2) return;
    const match = ticketArr[0].match(/^([a-zA-Z]+)(\d+)$/);
    if (!match || match.length < 2) return;
    let ticketType = document.querySelector('[ng-if="header.shouldShowEntityLabel"]').innerText;
    if (!ticketType || ticketType.length == "")
      return;
    initTicketTypeMutationObserver();
    ticketType = ticketType.toUpperCase();
    let pageTicketId=document.querySelector(".entity-form-document-view-header-entity-id-container");
    let pageTicketTitle=
    veXCurrentTicketInfo =
    {
      type: veXEntityMetaData[ticketType].name,
      id: match[2],
      color: veXEntityMetaData[ticketType].colorHex,
      title: getTicketTitle(title.slice(ticketArr[0].length + 1)),
      phase: getCurrentTicketPhase()
    }
  }
  catch (err) {
    veXCurrentTicketInfo = {}
    utilAPI.onError(err, "An error occurred while attempting to retrieve the current ticket information.");
  }
}

function getTicketTitle(title) {
  try {
    if (title.endsWith("- Core Software Delivery Platform")) {
      let x = "- Core Software Delivery Platform".length;
      title = title.slice(0, -x);
    }
  }
  finally {
    return title;
  }
}

function veXReset() {
  try {
    veXCurrentCategory = {};
    veXChecklistItems = {};
    veXCurrentTicketChecklist = {};
    veXCurrentTicketInfo = {};
    veXPhaseMap = {};
    veXTotalCompletedItems = 0;
    veXTotalItems = 0;
    if (veXTicketPhaseMutationObserver) {
      veXTicketPhaseMutationObserver.disconnect();
      veXTicketPhaseMutationObserver = undefined;
    }
    if (veXTicketTypeMutationObserver) {
      veXTicketTypeMutationObserver.disconnect();
      veXTicketTypeMutationObserver = undefined;
    }
    root.style.setProperty('--veX-checkedItemsPercentage', `0%`);
    root.style.setProperty('--veX-fontColorAgainstTicketColor', `#000000`);
    root.style.setProperty('--veX-ticktColor', `#fff`);
  } catch (err) {
    utilAPI.onError(err, "An error occurred while resetting variables");
  }
}

async function initView() {
  try {
    await initHeaderView();
    await initFooterView();
    initSidebarHeaderView();
    initPhaseMap();
    initPhaseDropdownView();
    initCategoriesView(veXCurrentTicketChecklist.categories);
    updateMainContentView();
    initStyle();
    return true;
  }
  catch (err) {
    utilAPI.onError(err, "An error occurred while initiating the view.");
    return false;
  }
}

async function initHeaderView() {
  try {
    veXPopUpNode.querySelector('.veX_logo').src = await chrome.runtime.getURL("icons/fact_check_48_FFFFFF.png");
    veXNodes.veXHeaderTitleNode.innerHTML = veXCurrentTicketInfo.title;
  }
  catch (err) {
    utilAPI.onError(err, "An error occurred while initializing the header view.");
  }
}
async function initFooterView() {
  try {
    veXPopUpNode.querySelector('.veX_add_comment_icon').src = await chrome.runtime.getURL("icons/add_comment_24.png");
    // veXPopUpNode.querySelector('.veX_edit_comment_icon').src = await chrome.runtime.getURL("icons/rate_review_24.png");
    veXPopUpNode.querySelector(".veX_leave_comment_btn").addEventListener("click", onAddToComments)
    // veXPopUpNode.querySelector(".veX_edit_comment_btn").addEventListener("click", async (event) => {
    //  await addDoneListToComments();
    //  if(event)
    //   event.stopPropagation();
    // })

  }
  catch (err) {
    utilAPI.onError(err, "An error occurred while initializing the header view.");
  }
}
async function onAddToComments(event) {
  await addDoneListToComments();
  if (event)
    event.stopPropagation();
}

function initPhaseMap() {
  try {
    let categories = Object.keys(veXCurrentTicketChecklist.categories);
    veXPhaseMap["All Phases"] = {};
    categories.forEach(
      (categoryName) => {
        let phases = veXCurrentTicketChecklist.categories[categoryName]["phases"];
        if (!utilAPI.isEmptyArray(phases)) {
          phases.forEach((phase) => {
            if (phase in veXPhaseMap) {
              veXPhaseMap[phase][categoryName] = veXCurrentTicketChecklist.categories[categoryName];
            }
            else {
              veXPhaseMap[phase] = {};
              veXPhaseMap[phase][categoryName] = veXCurrentTicketChecklist.categories[categoryName];
            }
          });
        }
        veXPhaseMap["All Phases"][categoryName] = veXCurrentTicketChecklist.categories[categoryName];
      });
  }
  catch (err) {
    utilAPI.onError(err, "An error occurred while initializing the veXPhaseMap.")
  }
}

function initStyle() {
  root.style.setProperty('--veX-ticktColor', veXCurrentTicketInfo.color);
  root.style.setProperty('--veX-fontColorAgainstTicketColor', "#FFFFFF");
}

function initSidebarHeaderView() {
  try {
    veXNodes.veXDonePercentageNode.innerHTML = "0%";
    veXNodes.veXTicketPhaseTextNode.innerHTML = "All Phases";
    veXNodes.veXTicketPhaseNode.addEventListener('click', OnTicketPhaseClick);
  }
  catch (err) {
    utilAPI.onError(err, "An error occurred while initializing the sidebar header view.");
  }
}

function initPhaseDropdownView() {
  try {
    let veXPhaseDropDown = veXPopUpNode.querySelector(".veX_all_phases");
    veXPhaseDropDown.innerHTML = "";
    if (utilAPI.isEmptyObject(veXPhaseMap)) return;
    let avaliablePhases = Object.keys(veXPhaseMap);
    for (let i = 0; i < avaliablePhases.length; i++) {
      let dropdownListNode = document.createElement('div');
      dropdownListNode.classList.add("veX_phase");
      dropdownListNode.setAttribute("phaseName", avaliablePhases[i]);
      dropdownListNode.textContent = avaliablePhases[i];
      dropdownListNode.addEventListener('click', (event) => {
        let phaseName = event.target.getAttribute('phaseName');
        veXNodes.veXTicketPhaseTextNode.innerText = phaseName;
        initCategoriesView(veXPhaseMap[phaseName]);
        updateMainContentView();
      });
      veXPhaseDropDown.appendChild(dropdownListNode);
    }
  } catch (err) {
    utilAPI.onError(err, "An error occurred while initializing the Phase dropdown");
  }
}

function initCategoriesView(categories) {
  veXNodes.veXDODcategoriesNode.innerHTML = "";
  try {
    if (utilAPI.isEmptyObject(categories)) {
      veXNodes.veXDODcategoriesNode.innerHTML = "No Item";
      return;
    };
    let categoryNames = Object.keys(categories);
    categoryNames.forEach(
      (categoryName) => {
        let sideBarItemNode = document.createElement('button');
        sideBarItemNode.className = "veX-Button";
        sideBarItemNode.setAttribute("categoryName", categoryName);
        sideBarItemNode.addEventListener('click', onCategoryChange);
        sideBarItemNode.textContent = categoryName;
        veXNodes.veXDODcategoriesNode.appendChild(sideBarItemNode);
      }
    );
    veXCurrentCategory = {
      name: categoryNames[0],
      value: categories[categoryNames[0]]
    }
  }
  catch (err) {
    utilAPI.onError(err, "An error occurred while initializing the categories view.");
  }
}

function updateMainContentView() {
  try {
    if (utilAPI.isEmptyObject(veXCurrentCategory)) {
      veXNodes.veXCategoryTitleNode.innerHTML = "No Category Found";
      veXNodes.veXChecklistParentNode.innerHTML = "No Item";
      return;
    }
    veXNodes.veXCategoryTitleNode.innerHTML = veXCurrentCategory.name;
    veXPopUpNode.querySelectorAll('.veX-Button').forEach((buttonNode) => {
      buttonNode.classList.remove("veX-Active-Button");
    });
    veXNodes.veXSidebarParentNode.querySelector(`[categoryName="${veXCurrentCategory.name}"]`).classList.add("veX-Active-Button");
    updateChecklist();
  } catch (err) {
    utilAPI.onError(err, "An error occurred while updating main content view.", true);
  }
}

function initChecklist() {
  veXTotalItems = 0;
  veXChecklistItems = {};
  try {
    let categories = Object.keys(veXCurrentTicketChecklist.categories);
    if (utilAPI.isEmptyArray(categories)) {
      utilAPI.notify("No category found while initializing checklist item");
      return;
    }
    categories.forEach((categoryName) => {
      veXChecklistItems[categoryName] = [];
      let currentCategory = veXCurrentTicketChecklist.categories[categoryName];
      currentCategory.checklist.forEach((listContent) => {
        veXChecklistItems[categoryName].push(
          {
            Note: "",
            ListContent: listContent,
            CursorState:
            {
              "position": 0
            }
          }
        );
        veXTotalItems++;
      }
      );
    });
  } catch (err) {
    utilAPI.onError(err, "An error occurred while initializing the CheckedItems Array.")
  }
}

function updateChecklist() {
  try {
    let checklist = veXCurrentCategory.value.checklist;
    veXNodes.veXChecklistParentNode.innerHTML = "";
    if (utilAPI.isEmptyArray(checklist)) {
      return;
    }
    let currentCheckList = veXChecklistItems[veXCurrentCategory.name];
    let index = 0;
    checklist.forEach(
      (itemValue) => {
        let listItem = document.createElement('div');
        let listNodeUI = `
            <div class="veX_done_check">
                <img class="veX_done_icon  " alt="checkbox" title="Checklist" src="${chrome.runtime.getURL("icons/check_box_outline_blank_24dp.png")}">
            </div>
            <div class="veX_list_content">
                <div class="veX_list_text  ">${itemValue}</div>
                <div class="veX_list_actions">
                    <div class="veX_note">
                        <img class="veX_note_icon veX_list_action_icon  " alt="checkbox" title="Add details here. Use HTML tags for formatting and structure." src="${chrome.runtime.getURL("icons/notes_24dp.png")}">
                    </div>
                </div>
            </div>
            <textarea class="veX_checklist_note veX_hide_checklist_note" placeholder="Add details (Markdown Supported)">${currentCheckList[index].Note}</textarea>
        `;
        listItem.innerHTML = listNodeUI;
        listItem.classList.add("veX_list_item")
        listItem.setAttribute('listIndex', index);
        listItem.addEventListener("click", (event) => {
          onListItemClick(event, listItem);
        });
        let currentListState = veXChecklistStates[currentCheckList[index].CursorState.position];
        updateNoteIcon(listItem);
        switch (currentListState) {
          case "UnSelected":
            setUnSelectedState(listItem, index);
            break;
          case "NotCompleted":
            setSelectedState(listItem, index);
            break;
          case "NotApplicable":
            setNotApplicableState(listItem, index);
            break;
          case "Completed":
            setCompletedState(listItem, index);
            break;
        }
        let noteIconNode = listItem.querySelector(".veX_note");
        let doneIconNode = listItem.querySelector(".veX_done_check");
        let noteNode = listItem.querySelector('.veX_checklist_note');
        let naNode = listItem.querySelector('.veX_na');
        noteNode.innerText = DOMPurify.sanitize(currentCheckList[index].Note);
        noteIconNode.addEventListener("click", (event) => {
          onListNoteClick(event, listItem);
        });
        // noteNode.addEventListener('blur',(event)=>{
        //   noteNode.classList.contains("veX_hide_checklist_note");
        // })
        noteNode.addEventListener('click', (event) => {
          event.stopPropagation();
        });

        noteNode.addEventListener('input', () => {
          noteNode.style.height = 'auto'; // Reset height
          noteNode.style.height = `${Math.min(noteNode.scrollHeight, 250)}px`; // Adjust height up to max-height
        });
        listItem.querySelector('.veX_checklist_note').addEventListener('change', (event) => {
          onListNoteChange(event, listItem);
        });
        veXNodes.veXChecklistParentNode.appendChild(listItem);
        index++;
      }
    );
  } catch (err) {
    utilAPI.onError(err, "An error occurred while updating checklist", true);
  }
}

function updateNoteIcon(listItem) {
  try {
    let noteIconNode = listItem.querySelector(".veX_note_icon");
    if (listItem.querySelector('.veX_checklist_note').value.trim() == "") {
      noteIconNode.src = chrome.runtime.getURL("icons/notes_24dp.png");
      noteIconNode.title = "Add details here. Use HTML tags for formatting and structure."
    }
    else {
      noteIconNode.src = chrome.runtime.getURL("icons/edit_note_24dp.png");
      noteIconNode.title = "Edit details here"
    }
  }
  catch (err) {
    utilAPI.onError(err, "An error occurred while updating Note Icon", true);
  }
}
function getChecklistStatus(list) {
  return veXChecklistStates[list.CursorState["position"]];
}

function isCommentAllowed() {
  try {
    let categories = Object.keys(veXChecklistItems);
    for (let i = 0; i < categories.length; i++) {
      let categoryName = categories[i];
      let checklist = veXChecklistItems[categoryName];
      for (let j = 0; j < checklist.length; j++) {
        let item = checklist[j];
        let status = getChecklistStatus(item);
        if (status == "Completed" || status == "NotCompleted" || status == "NotApplicable")
          return true;
      }
    }
    return false;
  }
  catch (err) {
    utilAPI.onError(err, "An error occurred while going through checklist items", true);
  }

}

async function addDoneListToComments() {
  try {
    if (!isCommentAllowed()) {
      utilAPI.notify("Select at least one item 😅", "info", true);
      return;
    }
    let rightSidebarCommentButton = document.querySelector("[data-aid='panel-item-commentsPanel']")
    if (rightSidebarCommentButton) rightSidebarCommentButton.click();
    await utilAPI.delay(500);
    let addNewCommentBox = document.querySelector("[data-aid='comments-pane-add-new-comment-placeholder-state']")
    if (addNewCommentBox)
      addNewCommentBox.click();
    else {
      utilAPI.notify("Unable to locate the new comment box 🙁", "info", true);
      return;
    }
    await utilAPI.delay(500);
    let commentBox = document.querySelector(".mqm-writing-new-comment-div").querySelector(".fr-wrapper").childNodes[0];
    if (commentBox) {
      let finalComment = await draftCommentForCheckedItems();
      if (finalComment) {
        commentBox.innerHTML = finalComment;
        commentBox.blur();
      }
      else {
        utilAPI.notify("Unable to locate the new comment box 🙁", "info", true);
        return;
      }
    }
    else {
      utilAPI.notify("Unable to locate the new comment box 🙁", "info", true);
      return;
    }
    let commentSubmitButton = document.querySelector("[ng-click='comments.onAddNewCommentClicked()']");
    if (commentSubmitButton) {
      commentSubmitButton.removeAttribute("disabled");
      await utilAPI.delay(500);
      closeveXPopUp();
      commentSubmitButton.click();
      utilAPI.notify("Checklist added to comments 😊", "success", true);
    }
  }
  catch (ex) {
    utilAPI.onError(ex, "An exception occurred while trying to open comments in response to a click event", true)
  }
}

async function draftCommentForCheckedItems() {
  try {
    let dummyCommentNode = document.createElement('div');
    let CommentDraftNode = document.createElement('div');
    dummyCommentNode.appendChild(CommentDraftNode);
    CommentDraftNode.id = "veX_checklist_comment_wrapper";
    CommentDraftNode.classList.add("veX_checklist_comment_wrapper");
    CommentDraftNode.setAttribute("veX_checklist_comment_wrapper", "HI")
    CommentDraftNode.style.color = "#333"
    let CommentHeaderNode = document.createElement("p");
    let donePercentage = ((veXTotalCompletedItems / veXTotalItems).toFixed(2) * 100).toFixed(0);
    CommentHeaderNode.innerHTML = `<strong>Checklist Completion: <span style="color:#008000;">${donePercentage}%</span></strong>`;
    CommentHeaderNode.style.color = "#333";

    CommentDraftNode.appendChild(CommentHeaderNode);
    let categories = Object.keys(veXChecklistItems);
    categories.forEach((categoryName) => {
      let checklist = veXChecklistItems[categoryName];
      if (checklist.every((item) => getChecklistStatus(item) == "UnSelected"))
        return;
      let categoryNameNode = document.createElement("p")
      categoryNameNode.style.borderBottom = "1px dotted gray";
      categoryNameNode.style.paddingBottom = "2px";
      categoryNameNode.style.color = "#333"
      categoryNameNode.style.fontWeight = "bold";
      categoryNameNode.innerHTML = `Category:<b> ${categoryName}</b>`;
      let checkedListNode = document.createElement("div");
      checkedListNode.style.paddingLeft = "0px";
      checkedListNode.style.listStyleType = "none";
      checklist.forEach(async (item) => {
        let status = getChecklistStatus(item);
        if (status != "UnSelected") {
          let itemNode = document.createElement("div");
          itemNode.style.display = "flex";
          itemNode.style.flexDirection = "column";
          itemNode.style.justifyContent = "space-between";
          itemNode.style.alignItems = "flex-start";
          itemNode.innerHTML = `<div style="color: #333; display:flex; justify-content:flex-start; align-items:center;margin-bottom:1px; "><p style="font-weight: bold; color:#333;margin-bottom:0px;"><span style="color:${setColor(item)};">[${setPrefixForList(item)}]</span>&nbsp;&nbsp;${DOMPurify.sanitize(item.ListContent)}</p></div>`
          if (item.Note != "") {
            itemNode.innerHTML += `<div style="margin-bottom:10px;"><b style="color: #333;">Details:</b><br/>${DOMPurify.sanitize(item.Note)}</div>`
          }
          checkedListNode.appendChild(itemNode);
        }
      });
      CommentDraftNode.appendChild(categoryNameNode);
      CommentDraftNode.appendChild(checkedListNode);

    })
    let finalComment = dummyCommentNode.innerHTML;
    dummyCommentNode.remove();
    return finalComment;
  }
  catch (ex) {
    utilAPI.onError(ex, "An error occurred while drafting your comment. Please report the issue", true);
  }
}
function setPrefixForList(item) {
  let status = getChecklistStatus(item);
  switch (status) {
    case "Completed": return "✔";
    case "NotCompleted": return "✗";
    case "NotApplicable": return "NA";
  }
}
function setColor(item) {
  let status = getChecklistStatus(item);
  switch (status) {
    case "Completed": return "#1aa364";
    case "NotCompleted": return "#dd4a40";
    case "NotApplicable": return "#808080"//return "#008080";
    default: return "#000";
  }
}
function getCurrentTicketPhase() {
  try {
    return document.querySelector("[data-aid='entity-life-cycle-widget-phase']").childNodes[3].innerText;
  }
  catch (err) {
    utilAPI.onError(err, undefined, false);
  }
}
function updateDonePercentage() {
  let donePercentage = ((veXTotalCompletedItems / veXTotalItems).toFixed(2) * 100).toFixed(0);
  if (donePercentage > 100)
    donePercentage = 100
  else if (donePercentage == 0)
    donePercentage = 0;
  veXNodes.veXDonePercentageNode.innerHTML = `${donePercentage}%`;
  root.style.setProperty('--veX-checkedItemsPercentage', `${donePercentage}%`);
}
function setNotApplicableState(listItemNode, listIndex) {
  veXChecklistItems[veXCurrentCategory.name][listIndex].NotApplicable = true;
  listItemNode.classList.add("veX_not_applicable");
  listItemNode.classList.remove('veX_selected');
  listItemNode.classList.remove('veX_completed');
  listItemNode.querySelector(".veX_done_icon").src = chrome.runtime.getURL("icons/indeterminate_check_box_24dp_FFFFFF.png");
  listItemNode.querySelector(".veX_done_icon").title = "Not Apllicable";
}
function setUnSelectedState(listItemNode, listIndex) {
  listItemNode.classList.remove('veX_selected');
  listItemNode.classList.remove('veX_completed');
  listItemNode.classList.remove('veX_not_applicable');
  veXChecklistItems[veXCurrentCategory.name][listIndex].Selected = false;
  listItemNode.classList.remove('veX_selected');
  listItemNode.querySelector(".veX_done_icon").src = chrome.runtime.getURL("icons/check_box_outline_blank_24dp.png");
  listItemNode.querySelector(".veX_done_icon").title = "Unselected";
}
function setSelectedState(listItemNode, listIndex) {
  listItemNode.classList.remove('veX_completed');
  listItemNode.classList.remove('veX_not_applicable');
  listItemNode.classList.add('veX_selected');
  veXChecklistItems[veXCurrentCategory.name][listIndex].Selected = true;
  listItemNode.querySelector(".veX_done_icon").src = chrome.runtime.getURL("icons/disabled.png");
  listItemNode.querySelector(".veX_done_icon").title = "Not Done";
}
function setCompletedState(listItemNode, listIndex) {
  veXChecklistItems[veXCurrentCategory.name][listIndex].Completed = true;
  listItemNode.classList.add('veX_completed');
  listItemNode.classList.remove('veX_not_applicable');
  listItemNode.classList.remove('veX_selected');
  veXChecklistItems[veXCurrentCategory.name][listIndex].Completed = true;
  listItemNode.querySelector('.veX_done_check').classList.add("veX_checked");
  listItemNode.querySelector(".veX_done_icon").src = chrome.runtime.getURL("icons/check_box_24dp_FFFFFF.png");
  listItemNode.querySelector(".veX_done_icon").title = "Done"
}
//<-Utility Functions


//->Event Handlers
function closeveXPopUp() {
  try {
    veXPopUpOverlay.style.visibility = "hidden";
    veXPopUpNode.classList.remove("veX_pop_active");
    veXPopUpNode.classList.add("veX_pop_deactive");
  }
  catch (err) {
    utilAPI.onError(err, undefined, true);
  }
}

function openVexPopup() {
  try {
    veXPopUpOverlay.style.visibility = "visible";
    veXPopUpNode.classList.add("veX_pop_active");
    veXPopUpNode.classList.remove("veX_pop_deactive");
  } catch (err) {
    utilAPI.onError(err, undefined, true);
  }
}

function onCategoryChange(event) {
  let categoryName = event.target.getAttribute('categoryName');
  veXCurrentCategory = {
    name: categoryName,
    value: veXCurrentTicketChecklist.categories[categoryName]
  };
  updateMainContentView();
}
function onListItemClick(event, listItemNode) {
  try {
    let currentNode = listItemNode;
    if (!currentNode.querySelector(".veX_checklist_note").classList.contains("veX_hide_checklist_note")) {
      currentNode.querySelector(".veX_checklist_note").classList.add("veX_hide_checklist_note");
      updateNoteIcon(listItemNode);
      event.stopPropagation(currentNode);
      return;
    }
    let currentCheckList = veXChecklistItems[veXCurrentCategory.name];
    let index = listItemNode.getAttribute('listIndex')
    let previousState = veXChecklistStates[currentCheckList[index].CursorState.position];
    if (previousState == "Completed" || previousState == "NotApplicable") {
      veXTotalCompletedItems--;
    }

    currentCheckList[index].CursorState.position = (currentCheckList[index].CursorState.position + 1) % 4;

    let newState = veXChecklistStates[currentCheckList[index].CursorState.position];

    switch (newState) {
      case "UnSelected":
        setUnSelectedState(listItemNode, index);
        break;
      case "NotApplicable":
        veXTotalCompletedItems++;
        setNotApplicableState(listItemNode, index);
        break;
      case "NotCompleted":
        setSelectedState(listItemNode, index);
        break;
      case "Completed":
        veXTotalCompletedItems++;
        setCompletedState(listItemNode, index);
        break;
      default:
        break;
    }
    updateDonePercentage();
    if (event)
      event.stopPropagation();
  } catch (err) {
    utilAPI.onError(err, "An error occurred while processing the click event.", true);
  }
}

function onListNoteClick(event, listItemNode) {
  try {
    let index = listItemNode.getAttribute('listIndex')
    veXNodes.veXChecklistParentNode.querySelectorAll('.veX_list_item').forEach((listNode) => {
      let curIndex = listNode.getAttribute('listIndex');
      let checklistNoteNode = listNode.querySelector('.veX_checklist_note');
      if (curIndex != index) {
        if (!checklistNoteNode.classList.contains("veX_hide_checklist_note")) {
          checklistNoteNode.classList.add("veX_hide_checklist_note");
          updateNoteIcon(listNode);
        }
      }

    });
    listItemNode.querySelector('.veX_checklist_note').classList.toggle("veX_hide_checklist_note");
    updateNoteIcon(listItemNode);
    if (!listItemNode.querySelector('.veX_checklist_note').classList.contains("veX_hide_checklist_note")) {
      listItemNode.querySelector('.veX_checklist_note').focus();
    }
    if (event)
      event.stopPropagation();
  } catch (err) {
    utilAPI.onError(err, "An error occurred while processing the click event.", true);
  }
}
function onListNoteChange(event, listItemNode) {
  try {
    let listIndex = listItemNode.getAttribute('listIndex');
    let noteValue = listItemNode.querySelector('.veX_checklist_note').value;
    veXChecklistItems[veXCurrentCategory.name][listIndex].Note = DOMPurify.sanitize(noteValue);
    if (event)
      event.stopPropagation();
  } catch (err) {
    utilAPI.onError(err, "An error occurred while reading the note", true);
  }
}

async function onTicketTitleChange(change) {
  try {
    veXReset();
    getCurrentTicketInfo(document.head.querySelector('title').innerText);
    if (utilAPI.isEmptyObject(veXCurrentTicketInfo)) {
      return;
    }
    // If we are using a remote URL to maintain the checklist,
    // then refresh the checklist locally first
    const remoteRefreshSuccess = await refreshChecklistFromRemoteIfExists();
    if(!remoteRefreshSuccess) {
      return;
    }
    let tempDOD = await chrome.storage.sync.get(veXCurrentTicketInfo.type);
    if (!utilAPI.isEmptyObject(tempDOD)) {
      veXCurrentTicketChecklist = tempDOD[veXCurrentTicketInfo.type];
    }
    if (!utilAPI.isEmptyObject(veXCurrentTicketChecklist)) {
      initTicketPhaseMutationObserver();
      initChecklist();
      veXIsViewInitialised = initView();
    }
  }
  catch (err) {
    utilAPI.onError(err);
  }
}

/**
 * This function refreshes the checklist
 * from the remote URL if it exists.
 */
async function refreshChecklistFromRemoteIfExists() {
  if(await utilAPI.getChecklistMode() != "url") {
    // We are not using the URL mode.
    // Hence, we need not refresh anything.
    return true;
  }
  try {
    // Get the remote URL from sync storage
    // and fetch the checklist from the remote URL
    const veX_dod_url = await chrome.storage.sync.get("veX_dod_url");
    const response = await fetch(veX_dod_url?.veX_dod_url);
    if (!response.ok) {
        utilAPI.notify("Couldn't fetch JSON from the URL", "warning", true);
        return false;
    }
    // Validate and update the checklist
    const veXChecklistInfo = await response.json();
    if (utilAPI.validateChecklist(veXChecklistInfo) === true && await utilAPI.saveChecklist(veXChecklistInfo, veX_dod_url.veX_dod_url) === true) {
        utilAPI.notify("Checklist refreshed successfully! 🙌🏻", "success", true);
    } else {
      return false;
    }
  } catch (error) {
    utilAPI.onError(error, "Couldn't fetch JSON from the URL", true);
    return false;
  }
  // Return true by default so as to
  // not break any existing functionality
  return true;
}

function onTicketPhaseChange(mutation) {
  try {
    if (!mutation.target) return;
    let newPhase = mutation.target.innerText;
    let reminderMessage = `Reminder: Please update the checklist 🙂`;
    utilAPI.notify(reminderMessage, "info", true);
    //openVexPopup();
  }
  catch (err) {
    utilAPI.onError(err, undefined, true);
  }
}

function OnTicketPhaseClick() {
  try {
    veXPopUpNode.querySelector(".veX_all_phases").classList.toggle("active");
  }
  catch (err) {
    utilAPI.onError(err, undefined, true);
  }
}

function handleMessagesFromServiceWorker(request, sender, sendResponse) {
  try {
    switch (request) {
      case "openVexPopup":
        if (!(utilAPI.isEmptyObject(veXCurrentTicketChecklist) || utilAPI.isEmptyObject(veXCurrentTicketInfo)))
          openVexPopup();
        else if (!utilAPI.isEmptyObject(veXCurrentTicketInfo) && utilAPI.isEmptyObject(veXCurrentTicketChecklist)) {
          utilAPI.notify(`🤔 Unable to find the checklist for '${veXCurrentTicketInfo.type}'`, "info", true);
        }
        else if (utilAPI.isEmptyObject(veXCurrentTicketInfo))
          utilAPI.notify("To see the checklist, please open a ticket 🙂", "info", true)
        else if (veXIsViewInitialised === false) {
          utilAPI.notify("Something went wrong while initializing the view. Please check the logs for more details 😞", "warning", true)
        }
        else
          utilAPI.notify("Something went wrong 😞", "warning", true);
        break;
    }
  }
  catch (err) {
    utilAPI.onError(err, undefined, true);
  }
}

//<-Event Handlers
veXSetup();
chrome.runtime.onMessage.addListener(handleMessagesFromServiceWorker);