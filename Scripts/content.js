//**Declaration**
var veXMutationObservers = {};
var veXMutationObserversConfig = {};
var veXDODInfo = {};
var veXEntityMetaData = {};
var veXCurrentTicketInfo = {};
var veXCurrentTicketDOD = {};
var veXCheckedItems = {};
var veXTotalCheckedItems = 0;
var veXTotalItems = 0;
var veXPopUpNode = document.createElement("div");
var veXPopUpOverlay = document.createElement("div");
var root = document.querySelector(':root');

var veXPopUI = `
<header class="veX_header veX_banner">
    <p class="veX_header_title"></p>
</header>
<div class="veX_done_status"></div>
<div class="veX_content_wrapper">
    <div class="veX_sidebar">
    </div>
    <div class="veX_main_content">
        <div class="veX_dod_title"></div>
        <div class="veX_dod_list_container">
            <ul class="veX_dod_list">
            </ul>
        </div>
    </div>
</div>
<div class="veX_banner veX_footer">
    <button class="veX_normal_btn">Leave a Comment</button>
</div>
`;
//**Declaration**


//**Initialising configured Observer**
function initMutationObservers() {
  Object.keys(this.veXMutationObserversConfig).forEach(
    key => {
      let mutationParams = this.veXMutationObserversConfig[key];
      if (mutationParams) {
        let mutationObserver = new MutationObserver(mutationParams.callback);
        if (mutationParams.targetNode && mutationParams.options)
          mutationObserver.observe(mutationParams.targetNode, mutationParams.options);
        this.veXMutationObservers[mutationParams.id] = mutationObserver;
      }
    }
  );
}
//**Initialising configured Observer**


//**Utility Functions**

veXMutationObserversConfig =
{
  titleObserver:
  {
    id: "title",
    targetNode: document.head.querySelector('title'),
    options: { attributes: true, childList: true, subtree: true },
    callback: (mutationList, observer) => {
      for (const mutation of mutationList) {
        onTicketChange();
      }
    }
  }
}

//Common Error Handler 
function onError(error, info) {
  if (!info) {
    notify("Something went wrong, please try again");
  } else {
    notify((`Error from 'VE Xtension':\n${info}\n`));
  }
  console.info(error);
}

function conciseText(text) {
  if (text.length <= 150) return text;
  return text.slice(0, 150) + "...";
}

// function isThisVETicket() {
//   document.querySelector("[title='Global ID - This ID is unique across all Octane workspaces managed by the Software Factory']") ? true : false;
// }

function addDoneListToComments() {
  try {
    let rightSidebarCommentButton = document.querySelector("[data-aid='panel-item-label-commentsPanel']")
    if (rightSidebarCommentButton)
      rightSidebarCommentButton.click();
    setTimeout(() => {
      let dummyAddNewCommentBox = document.querySelector("[data-aid='comments-pane-add-new-comment-placeholder-state']")
      if (dummyAddNewCommentBox)
        dummyAddNewCommentBox.click();
      setTimeout(() => {
        let commentBox = document.querySelector(".mqm-writing-new-comment-div").querySelector(".fr-wrapper").childNodes[0];
        if (commentBox)
          commentBox.innerHTML = draftCommentForCheckedItems();
        setTimeout(() => {
          let commentSubmitButton = document.querySelector("[ng-click='comments.onAddNewCommentClicked()']");
          if (commentSubmitButton) {
            commentSubmitButton.removeAttribute("disabled");
            commentSubmitButton.click();
          }
        }, 100);
      }, 100);
    }, 100);
  }
  catch (ex) {
    onError(ex, "An exception occurred while trying to open comments in response to a click event.")
  }
}

function getCurrentTicketInfo(title) {
  if (!title) return;
  ticketArr = title.split(" ");
  if (ticketArr.length >= 2) {
    const match = ticketArr[0].match(/^([a-zA-Z]+)(\d+)$/);
    if (match) {
      let ticketType = (document.querySelector('[ng-if="header.shouldShowEntityLabel"]').innerText).toUpperCase();
      this.veXCurrentTicketInfo =
      {
        type: veXEntityMetaData[ticketType].name,
        id: match[2],
        color: veXEntityMetaData[ticketType].colorHex,
        title: title.slice(ticketArr[0].length + 1)
      }
    }
    else {
      this.veXCurrentTicketInfo = {};
    }
  }
  else {
    this.veXCurrentTicketInfo = {};
  }
}

function draftCommentForCheckedItems() {
  try {
    let CommentDraftNode = document.createElement('div');
    let CommentHeaderNode = document.createElement("p");
    CommentHeaderNode.innerHTML = "<strong>**Done Checklist**</strong>";
    CommentHeaderNode.style.color = "#22BB33";
    CommentDraftNode.appendChild(CommentHeaderNode);
    for (categoryIndex in veXCheckedItems) {
      let categoryName = veXCurrentTicketDOD.categories[categoryIndex].name;
      let checkList = veXCurrentTicketDOD.categories[categoryIndex].checkList;
      let checkedItems = veXCheckedItems[categoryIndex];
      let currList = [];
      for (let i = 0; i < checkedItems.length; i++) {
        if (checkedItems[i] == 1) {
          currList.push(checkList[i]);
        }
      }
      if (currList.length == 0)
        break;
      let categoryNameNode = document.createElement("p")
      categoryNameNode.innerHTML = `<b>${categoryName}</b>`;
      let checkedListNode = document.createElement("ul");
      checkedListNode.style.listStyleType = "none";
      currList.forEach((item) => {
        let itemNode = document.createElement("li");
        itemNode.innerHTML = `[✔]${item}`
        checkedListNode.appendChild(itemNode);
      });
      CommentDraftNode.appendChild(categoryNameNode);
      CommentDraftNode.appendChild(checkedListNode);
    }
    let finalComment = CommentDraftNode.innerHTML;
    CommentDraftNode.remove();
    return finalComment;
  }
  catch (ex) {
    onError(ex, "error while drafting for comments")
  }

}

function setup() {
  this.veXPopUpNode.id = "veX-PopUp-Container";
  this.veXPopUpOverlay.id = "veX-PopUp-Overlay";
  this.veXPopUpNode.innerHTML = veXPopUI;
  document.body.appendChild(veXPopUpNode);
  document.body.appendChild(veXPopUpOverlay);
  veXPopUpNode.querySelector(".veX_normal_btn").addEventListener("click", addDoneListToComments);
  veXPopUpOverlay.addEventListener("click", closeveXPopUp);
  initMutationObservers();
}


function initView() {
  try {
    this.veXPopUpNode.querySelector(".veX_header_title").innerText = conciseText(this.veXCurrentTicketInfo.title);
    initSidebarView(this.veXCurrentTicketDOD.categories);
    initCheckedItems();
    updateMainContentView(0);
    initStyle();
  }
  catch (err) {
    onError(err, "Error while initiating view");
  }
}

function initSidebarView(categories) {
  let sidebarParentNode = veXPopUpNode.querySelector('.veX_sidebar');
  sidebarParentNode.innerHTML = "";
  let index = 0;
  categories.forEach(
    (category) => {
      let sideBarItemNode = document.createElement('button');
      sideBarItemNode.className = "veX-Button";
      sideBarItemNode.setAttribute('categoryIndex', index);
      sideBarItemNode.addEventListener('click', (event) => {
        updateMainContentView(event.target.getAttribute('categoryIndex'));
      });
      sidebarParentNode.appendChild(sideBarItemNode);
      sidebarParentNode.appendChild(sideBarItemNode);
      sideBarItemNode.textContent = category.name;
      index++;
    }
  );
}

function initCheckedItems() {
  for (let i = 0; i < this.veXCurrentTicketDOD.categories.length; i++) {
    this.veXCheckedItems[i] = [];
    let curCategory = this.veXCurrentTicketDOD.categories[i];
    for (let j = 0; j < curCategory.checkList.length; j++) {
      this.veXCheckedItems[i][j] = 0;
      veXTotalItems++;
    }
  }
}

function updateMainContentView(categoryIndex) {
  let currentCategory = this.veXCurrentTicketDOD.categories[categoryIndex];
  let titleNode = veXPopUpNode.querySelector('.veX_dod_title');
  titleNode.innerText = currentCategory.name;

  veXPopUpNode.querySelectorAll('.veX-Button').forEach((buttonNode) => {
    buttonNode.classList.remove("veX-Active-Button");
  });
  veXPopUpNode.querySelector('.veX_sidebar').querySelector(`[categoryIndex="${categoryIndex}"]`).classList.add("veX-Active-Button");
  updateList(currentCategory.checkList, categoryIndex);
}

function updateList(checkList, categoryIndex) {
  let currentCheckList = this.veXCheckedItems[categoryIndex];
  let listParentNode = veXPopUpNode.querySelector('.veX_dod_list');
  listParentNode.innerHTML = "";
  let index = 0;
  checkList.forEach(
    (itemValue) => {
      let listItem = document.createElement('li');
      listItem.setAttribute('listIndex', index);
      listItem.setAttribute('categoryIndex', categoryIndex);
      listItem.addEventListener('click', onListItemClick);
      listItem.textContent = itemValue;
      listParentNode.appendChild(listItem);
      if (currentCheckList[index] == 1) {
        listItem.classList.add('checked');
      }
      index++;
    }
  )
}

function initStyle() {
  root.style.setProperty('--veX-ticktColor', veXCurrentTicketInfo.color);
}
function isEmptyObject(obj) {
  if (obj) {
    return Object.keys(obj).length === 0;
  }
  return true;
}

function notify(message) {
  console.info(message);
  alert(message);
}
//**Utility Functions**


//**Event Handlers**
function closeveXPopUp() {
  veXPopUpOverlay.style.visibility = "hidden";
  veXPopUpNode.style.visibility = 'hidden';
}

function openVexPopUp() {
  veXPopUpOverlay.style.visibility = "visible";
  veXPopUpNode.style.visibility = "visible";
}

function onListItemClick(event) {
  let catIndex = event.target.getAttribute('categoryIndex')
  let listIndex = event.target.getAttribute('listIndex')
  event.target.classList.toggle('checked');
  if (event.target.classList.contains('checked')) {
    veXCheckedItems[catIndex][listIndex] = 1;
    veXTotalCheckedItems++;
  }
  else {
    veXCheckedItems[catIndex][listIndex] = 0;
    veXTotalCheckedItems--;
  }
  root.style.setProperty('--veX-checkedItemsPercentage', `${((veXTotalCheckedItems / veXTotalItems) * 100)}%`);
}

function onTicketChange() {
  try {
    if (isEmptyObject(this.veXDODInfo) && isEmptyObject(this.veXEntityMetaData)) return;
    let newTitle = document.head.querySelector('title').innerText;
    reset();
    getCurrentTicketInfo(newTitle); 
    if (!isEmptyObject(this.veXCurrentTicketInfo)) {
      (async () => {
        if (isEmptyObject(veXDODInfo)) {
          veXDODInfo = await chrome.runtime.sendMessage('loadveXDefinationsData');
        }
      })()
      this.veXCurrentTicketDOD = veXDODInfo[veXCurrentTicketInfo.type];
      if (!isEmptyObject(this.veXCurrentTicketDOD)) {
        initView();
      }
      else {
        reset();
      }
    }
    else {
      //TODO 
      //disableVEXButton();
      reset();
    }
  }
  catch (ex) {
    onError(ex, "error at OnTicketChange Handler");
  }
}

function addClickEventForSideBarTab() {
  let sideBar = document.querySelector('.veX_sidebar');
  let tabs = sideBar.children;
  Array.from(tabs).forEach(tab => {
    tab.addEventListener('click',
      () => {
        // showTab(tab.name);
      }
    );
  });
}

function handleMessage(request, sender, sendResponse) {
  switch (request) {
    case "openVexPopUp":
      if (!isEmptyObject(this.veXCurrentTicketDOD) && !isEmptyObject(this.veXCurrentTicketInfo))
        openVexPopUp();
      else if (!isEmptyObject(this.veXCurrentTicketInfo) && isEmptyObject(this.veXCurrentTicketDOD)) {
        notify(`Unable to find the '${veXCurrentTicketInfo.type}' Defination of Done. Please update it.`);
      }
      else if (isEmptyObject(this.veXCurrentTicketInfo))
        notify("Please open a VE ticket to see the Done checklist")
      else
        onError();
      break;
  }
}

function reset() {
  veXCheckedItems = {};
  veXCurrentTicketDOD = {};
  veXCurrentTicketInfo = {};
  veXTotalCheckedItems = 0;
  veXTotalItems = 0;
  root.style.setProperty('--veX-checkedItemsPercentage', `0%`);
  root.style.setProperty('--veX-ticktColor', `#fff`);
}

//**Event Handlers**
(async () => {
  if (isEmptyObject(veXEntityMetaData)) {
    veXEntityMetaData = await chrome.runtime.sendMessage('getveXEntityMetaData');
  }
})();

(async () => {
  if (isEmptyObject(veXDODInfo)) {
    veXDODInfo = await chrome.runtime.sendMessage('loadveXDefinationsData');
  }
})();

setup();
chrome.runtime.onMessage.addListener(handleMessage);