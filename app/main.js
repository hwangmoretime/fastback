var getCaretCoordinates = require(
  { baseUrl: chrome.extension.getURL("/") },
  ["app/bower_components/textarea-caret-position/index"]
);


// On first load of the general page.
var generalCommentID = "#new_comment_field";
var generalComment = document.querySelector(generalCommentID);
addReminderListener(generalComment);

// Handles SPA changes (e.g. changing from line-by-line view to general view,
// adding a line-by-line comment)
MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
var observer = new MutationObserver(function(mutations, observer) {
  mutations.forEach(function(mutation) {
    var inlineCommentClassName = "inline-comments";
    var generalCommentContainerClassName = "new-discussion-timeline";

    Array.prototype.forEach.call(mutation.addedNodes, function (addedNode) {
      var commentEl = addedNode.firstElementChild;
      var commentBox;

      if (addedNode.id === "input-textarea-caret-position-mirror-div") {
        // mirrored div added from getCaretCoordinates()
        return;
      }
      if (addedNode.nodeName === "#text") {
        var urlPattern = /.*\[.*\]\(.*\).*/;
        if (urlPattern.exec(addedNode.wholeText) != null) {
          var reminder = document.querySelector(".comment-arrow-box");
          if (reminder != null) {
            reminder.remove();
          }
        }
        return;
      }

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
  if (!element) {
    return;
  }

  // weird hack to get cmd-k to work on first open of first load of the comment page
  element.blur();
  element.focus();
  // weird hack end

  element.addEventListener('input', function () {
    previousReminder = this.parentNode.querySelector(".comment-arrow-box");
    var referenceReminder;
    if (previousReminder) {
      referenceReminder = previousReminder;
    } else {
      referenceReminder = document.createElement('div');
    }

    var coordinates = getCaretCoordinates(this, this.selectionEnd);
    referenceReminder.className = "comment-arrow-box pop-in";
    referenceReminder.style.position = 'absolute';
    referenceReminder.style.top = 18 + coordinates.top + 'px';
    referenceReminder.style.left = coordinates.left + 'px';
    referenceReminder.innerHTML =' \
    <p class="reference-reminder"> \
      <span> \
        <span class="why">Why? </span> \
        <span class="reference">Command+K</span> to cite a reference. \
      </span> \
    </p> \
    ';

    if (!element.reminderAddedAtLeaseOnce) {
      element.insertAdjacentElement("afterend", referenceReminder);
    }
    element.reminderAddedAtLeaseOnce = true;
  });
}


function iterableContains(needle, haystack) {
  for (var i = 0; i < haystack.length; i++) {
    if (haystack[i] == needle)
      return true;
  }
  return false;
}
