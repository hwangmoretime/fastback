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
    // var urlPattern = /.*\[.*\]\(.*\).*/;
    // if (urlPattern.exec(element.value) != null) {
    //   var reminder = element.parentElement.querySelector(".comment-arrow-box");
    //   if (reminder != null && element.dialogueCounter === 1) {
    //     reminder.remove();
    //   }
    // }
    var reminder = element.parentElement.querySelector(".comment-arrow-box");
    if (reminder != null) {
      reminder.remove();
    }

    element.latestMutationTime = new Date();
    setTimeout(function() {
      var time = new Date();
      if (time - element.latestMutationTime >= 400) {
        addReminder(element);
      }
    }, 400);
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
        dialog = `
          Good code-review comments are justified. Press
          <span class="reference">Cmd + K</span> to cite your comment.
        `;
        element.dialogueCounter++;
        break;
    case 2:
        dialog = `
          Why is this the case? Press
          <span class="reference">Cmd + K</span> to cite.
        `;
        element.dialogueCounter++;
        break;
    default:
        dialog = `
          Providing a reference will help
          <span class="username">${getReviewee()}</span> improve their code. Press
          <span class="reference">Cmd + K</span>.
        `;
        element.dialogueCounter = 1;
        break;
  }
  referenceReminder.innerHTML = dialog;

  element.insertAdjacentElement("afterend", referenceReminder);
}


function getReviewee() {
  // TO DO: Handle if the PR is already merged
  return document.querySelector('.pull-header-username').childNodes[0].textContent;
}


function iterableContains(needle, haystack) {
  for (var i = 0; i < haystack.length; i++) {
    if (haystack[i] == needle)
      return true;
  }
  return false;
}
