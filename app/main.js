var getCaretCoordinates = require(
  { baseUrl: chrome.extension.getURL("/") },
  ["app/bower_components/textarea-caret-position/index"]
);


var generalCommentID = "#new_comment_field";
var generalCommentContainerClassName = "new-discussion-timeline";
var inlineCommentClassName = "inline-comments";


// On first load of the general page.
var generalComment = document.querySelector(generalCommentID);
addReminderListener(generalComment);


// Handles SPA changes (e.g. changing from line-by-line view to general view,
// adding a line-by-line comment)
MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
var observer = new MutationObserver(function(mutations, observer) {
  mutations.forEach(function(mutation) {
    Array.prototype.forEach.call(mutation.addedNodes, function (addedNode) {
      if (!('classList' in addedNode)) { return; }

      var commentEl = addedNode.firstElementChild;
      var commentBox;
      if (iterableContains(generalCommentContainerClassName, addedNode.classList)) {
        commentBox = addedNode.querySelector(generalCommentID);
      }
      if (iterableContains(inlineCommentClassName, addedNode.classList)) {
        commentBox = commentEl.querySelector("." + inlineCommentClassName + " textarea");
      }
      addReminderListener(commentBox);
    });
  });
});
observer.observe(document, {
  subtree: true,
  childList: true,
});


function addReminderListener(element) {
  if (!element || element.hasReminderListener) { return; }
  element.hasReminderListener = true;

  // weird hack to get cmd-k to work on first open of first load of the comment box
  element.blur();
  element.focus();
  // weird hack end

  element.latestMutationTime = new Date();
  element.addEventListener('input', function () {
    var urlPattern = /.*\[.*\]\(.*\).*/;
    if (urlPattern.exec(element.value) != null) {
      var reminder = element.parentElement.querySelector(".comment-arrow-box");
      if (reminder != null && element.dialogueCounter === 1) {
        reminder.remove();
      }
    }

    element.latestMutationTime = new Date();
    setTimeout(function() {
      var time = new Date();
      if (time - element.latestMutationTime >= 2000) {
        addReminder(element);
      }
    }, 2000);
  });
}


function addReminder(element) {
  previousReminder = element.parentNode.querySelector(".comment-arrow-box");
  var referenceReminder;
  if (previousReminder) {
    referenceReminder = previousReminder;
  } else {
    referenceReminder = document.createElement('div');
  }

  var coordinates = getCaretCoordinates(element, element.selectionEnd);
  referenceReminder.className = "comment-arrow-box pop-in";
  referenceReminder.style.position = 'absolute';
  referenceReminder.style.top = element.offsetTop
                                - element.scrollTop
                                + 18
                                + coordinates.top
                                + 'px';
  referenceReminder.style.left = element.offsetLeft
                                - element.scrollLeft
                                + coordinates.left
                                + 'px';

  var dialog;
  switch(element.dialogueCounter) {
    case 1:
        dialog = 'case 1';
        element.dialogueCounter++;
        break;
    case 2:
        dialog = 'case 2';
        element.dialogueCounter++;
        break;
    case 3:
        dialog = 'case 3';
        element.dialogueCounter++;
        break;
    default:
        dialog = ' \
          <p class="reference-reminder"> \
            <span> \
              <span class="why">Why? </span> \
              <span class="reference">Command+K</span> to cite a reference. \
            </span> \
          </p> \
          ';
        element.dialogueCounter = 1;
        break;
  }
  referenceReminder.innerHTML = dialog;

  element.insertAdjacentElement("afterend", referenceReminder);
}

function iterableContains(needle, haystack) {
  for (var i = 0; i < haystack.length; i++) {
    if (haystack[i] == needle)
      return true;
  }
  return false;
}
