var getCaretCoordinates = require(
  { baseUrl: chrome.extension.getURL("/") },
  ["app/bower_components/textarea-caret-position/index"]
);

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var observer = new MutationObserver(function(mutations, observer) {
  var githubCommentClassName = "inline-comments";

  mutations.forEach(function(mutation) {
    Array.prototype.forEach.call(mutation.addedNodes, function (addedNode) {
      if (addedNode.nodeName === "#text") {
        var urlPattern = /\[.*\]\(url\)/;
        if (urlPattern.exec(addedNode.textContent) != null) {
          previousReminder = document.querySelector(".comment-arrow-box");
          console.log(previousReminder);
          console.log(previousReminder != null);
          if (previousReminder != null) {
            previousReminder.remove();
          }
        }
      }
      if (addedNode.id === "input-textarea-caret-position-mirror-div" || addedNode.nodeName === "#text") {
        return;
      }
      if (!iterableContains(githubCommentClassName, addedNode.classList)) {
        return;
      }
      var commentEl = addedNode.firstElementChild;
      var commentBox = commentEl.querySelector("." + githubCommentClassName + " textarea");
      commentBox.addEventListener('input', function () {
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

        commentBox.insertAdjacentElement("afterend", referenceReminder);
      })
    });
  });
});

function iterableContains(needle, haystack) {
  for (var i = 0; i < haystack.length; i++) {
    if (haystack[i] == needle)
      return true;
  }
  return false;
}

observer.observe(document, {
  subtree: true,
  childList: true,
});
