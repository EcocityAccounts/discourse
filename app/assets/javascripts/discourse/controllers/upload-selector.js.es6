import { equal } from "@ember/object/computed";
import Controller from "@ember/controller";
import ModalFunctionality from "discourse/mixins/modal-functionality";
import {
  default as discourseComputed,
  observes
} from "discourse-common/utils/decorators";
import {
  allowsAttachments,
  authorizesAllExtensions,
  authorizedExtensions,
  uploadIcon
} from "discourse/lib/utilities";

function uploadTranslate(key) {
  if (allowsAttachments()) {
    key += "_with_attachments";
  }
  return `upload_selector.${key}`;
}

export default Controller.extend(ModalFunctionality, {
  showMore: false,
  imageUrl: null,
  imageLink: null,
  local: equal("selection", "local"),
  remote: equal("selection", "remote"),
  selection: "local",

  @discourseComputed()
  uploadIcon: () => uploadIcon(),

  @discourseComputed()
  title: () => uploadTranslate("title"),

  @discourseComputed("selection")
  tip(selection) {
    const authorized_extensions = authorizesAllExtensions()
      ? ""
      : `(${authorizedExtensions()})`;
    return I18n.t(uploadTranslate(`${selection}_tip`), {
      authorized_extensions
    });
  },

  @observes("selection")
  _selectionChanged() {
    if (this.local) {
      this.set("showMore", false);
    }
  },

  actions: {
    upload() {
      if (this.local) {
        $(".wmd-controls").fileupload("add", {
          fileInput: $("#filename-input")
        });
      } else {
        const imageUrl = this.imageUrl || "";
        const imageLink = this.imageLink || "";
        const toolbarEvent = this.toolbarEvent;

        if (this.showMore && imageLink.length > 3) {
          toolbarEvent.addText(`[![](${imageUrl})](${imageLink})`);
        } else if (imageUrl.match(/\.(jpg|jpeg|png|gif)$/)) {
          toolbarEvent.addText(`![](${imageUrl})`);
        } else {
          toolbarEvent.addText(imageUrl);
        }
      }
      this.send("closeModal");
    },

    toggleShowMore() {
      this.toggleProperty("showMore");
    }
  }
});
