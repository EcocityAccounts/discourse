import ENV from "discourse-common/config/environment";

//  Track visible elemnts on the screen.
const Eyeline = function Eyeline(selector) {
  this.selector = selector;
};

Eyeline.prototype.update = function() {
  if (ENV.environment === "test") {
    return;
  }

  const docViewTop = $(window).scrollTop(),
    windowHeight = $(window).height(),
    docViewBottom = docViewTop + windowHeight,
    $elements = $(this.selector),
    bottomOffset = $elements.last().offset();

  let atBottom = false;
  if (bottomOffset) {
    atBottom =
      bottomOffset.top <= docViewBottom && bottomOffset.top >= docViewTop;
  }

  return $elements.each((i, elem) => {
    const $elem = $(elem),
      elemTop = $elem.offset().top,
      elemBottom = elemTop + $elem.height();

    let markSeen = false;

    // Make sure the element is visible
    if (!$elem.is(":visible")) return true;

    // It's seen if...
    // ...the element is vertically within the top and botom
    if (elemTop <= docViewBottom && elemTop >= docViewTop) markSeen = true;

    // ...the element top is above the top and the bottom is below the bottom (large elements)
    if (elemTop <= docViewTop && elemBottom >= docViewBottom) markSeen = true;

    // ...we're at the bottom and the bottom of the element is visible (large bottom elements)
    if (atBottom && elemBottom >= docViewTop) markSeen = true;

    if (!markSeen) return true;

    // If you hit the bottom we mark all the elements as seen. Otherwise, just the first one
    if (!atBottom) {
      this.trigger("saw", { detail: $elem });
      if (i === 0) {
        this.trigger("sawTop", { detail: $elem });
      }
      return false;
    }
    if (i === 0) {
      this.trigger("sawTop", { detail: $elem });
    }
    if (i === $elements.length - 1) {
      return this.trigger("sawBottom", { detail: $elem });
    }
  });
};

//  Call this when we know aren't loading any more elements. Mark the rest as seen
Eyeline.prototype.flushRest = function() {
  if (ENV.environment === "test") {
    return;
  }

  $(this.selector).each((i, elem) => this.trigger("saw", { detail: $(elem) }));
};

RSVP.EventTarget.mixin(Eyeline.prototype);

export default Eyeline;
