// Copyright (c) 2016, David Hwang
MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var observer = new MutationObserver(function(mutations, observer) {
  var githubCommentClassName = "inline-comments";

  mutations.forEach(function(mutation) {
    Array.prototype.forEach.call(mutation.addedNodes, function (addedNode) {
      if (!iterableContains(githubCommentClassName, addedNode.classList))
        return;
      var commentEl = addedNode.firstElementChild;
      var commentBox = commentEl.querySelector("." + githubCommentClassName + " textarea");

      var referenceReminderHTML = '       \
        <div class="comment-arrow-box"> \
          <p class="reference-reminder">                             \
          <span> \
            <span class="why">Why? </span> \
            Consider citing a <span class="reference">reference</span> to help your reviewee. \
          </span> \
        </p>\
        </div>                            \
      ';
      commentBox.insertAdjacentHTML("afterend", referenceReminderHTML)
      // commentBox.placeholder = "Provide a reference if you can!";
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
