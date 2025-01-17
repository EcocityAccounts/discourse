import discourseComputed from "discourse-common/utils/decorators";
import { isEmpty } from "@ember/utils";
import { lte } from "@ember/object/computed";
import Component from "@ember/component";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { propertyEqual } from "discourse/lib/computed";

export default Component.extend({
  classNames: ["group-members-input"],
  addButton: true,

  @discourseComputed("model.limit", "model.offset", "model.user_count")
  currentPage(limit, offset, userCount) {
    if (userCount === 0) {
      return 0;
    }

    return Math.floor(offset / limit) + 1;
  },

  @discourseComputed("model.limit", "model.user_count")
  totalPages(limit, userCount) {
    if (userCount === 0) {
      return 0;
    }
    return Math.ceil(userCount / limit);
  },

  @discourseComputed("model.usernames")
  disableAddButton(usernames) {
    return !usernames || !(usernames.length > 0);
  },

  showingFirst: lte("currentPage", 1),
  showingLast: propertyEqual("currentPage", "totalPages"),

  actions: {
    next() {
      if (this.showingLast) {
        return;
      }

      const group = this.model;
      const offset = Math.min(
        group.get("offset") + group.get("limit"),
        group.get("user_count")
      );
      group.set("offset", offset);

      return group.findMembers();
    },

    previous() {
      if (this.showingFirst) {
        return;
      }

      const group = this.model;
      const offset = Math.max(group.get("offset") - group.get("limit"), 0);
      group.set("offset", offset);

      return group.findMembers();
    },

    addMembers() {
      if (isEmpty(this.get("model.usernames"))) {
        return;
      }
      this.model.addMembers(this.get("model.usernames")).catch(popupAjaxError);
      this.set("model.usernames", null);
    },

    removeMember(member) {
      const message = I18n.t("groups.manage.delete_member_confirm", {
        username: member.get("username"),
        group: this.get("model.name")
      });

      return bootbox.confirm(
        message,
        I18n.t("no_value"),
        I18n.t("yes_value"),
        confirm => {
          if (confirm) {
            this.model.removeMember(member);
          }
        }
      );
    }
  }
});
