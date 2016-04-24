var getCaretCoordinates = require(
  { baseUrl: chrome.extension.getURL("/") },
  ["app/bower_components/textarea-caret-position/index"]
);


// // On existing comment boxes (i.e. general)
var generalCommentID = "#new_comment_field";
var generalComment = document.querySelector(generalCommentID);
addReminderListener(generalComment);

// On line-by-line comments.
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
        var urlPattern = /\[.*\]\(url\)/;
        if (urlPattern.exec(addedNode.textContent) != null) {
          previousReminder = document.querySelector(".comment-arrow-box");
          if (previousReminder != null) {
            previousReminder.remove();
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
  element.addEventListener('input', function () {
    previousReminder = this.parentNode.querySelector(".comment-arrow-box");
    var referenceReminder;
    if (previousReminder) {
      referenceReminder = previousReminder;
    } else {
      referenceReminder = document.createElement('div');
    }

    var coordinates = getCaretCoordinates(this, this.selectionEnd);
    referenceReminder.className = "comment-arrow-box";
    referenceReminder.style.position = 'absolute';
    referenceReminder.style.top = 16 + coordinates.top + 'px';
    referenceReminder.style.left = coordinates.left + 'px';
    referenceReminder.innerHTML =' \
    <p class="reference-reminder"> \
      <span> \
        <span class="why">Why? </span> \
        <span class="reference">Command+K</span> to cite a reference. \
      </span> \
    </p> \
    ';

    element.insertAdjacentElement("afterend", referenceReminder);
  });
}


function iterableContains(needle, haystack) {
  for (var i = 0; i < haystack.length; i++) {
    if (haystack[i] == needle)
      return true;
  }
  return false;
}
