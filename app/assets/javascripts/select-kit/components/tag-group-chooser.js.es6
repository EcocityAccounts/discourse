import MultiSelectComponent from "select-kit/components/multi-select";
import TagsMixin from "select-kit/mixins/tags";
import renderTag from "discourse/lib/render-tag";
import discourseComputed from "discourse-common/utils/decorators";

const { get, isEmpty, run, makeArray } = Ember;

export default MultiSelectComponent.extend(TagsMixin, {
  pluginApiIdentifiers: ["tag-group-chooser"],
  classNames: ["tag-group-chooser", "tag-chooser"],
  isAsync: true,
  filterable: true,
  filterPlaceholder: "category.tag_groups_placeholder",
  limit: null,
  allowAny: false,

  init() {
    this._super(...arguments);

    this.set("templateForRow", rowComponent => {
      const tag = rowComponent.get("computedContent");
      return renderTag(get(tag, "value"), {
        count: get(tag, "originalContent.count"),
        noHref: true
      });
    });
  },

  mutateValues(values) {
    this.set("tagGroups", values.filter(v => v));
  },

  @discourseComputed("tagGroups")
  values(tagGroups) {
    return makeArray(tagGroups);
  },

  @discourseComputed("tagGroups")
  content(tagGroups) {
    return makeArray(tagGroups);
  },

  actions: {
    onFilter(filter) {
      this.expand();
      this.set(
        "searchDebounce",
        run.debounce(this, this._prepareSearch, filter, 200)
      );
    },

    onExpand() {
      if (isEmpty(this.collectionComputedContent)) {
        this.set(
          "searchDebounce",
          run.debounce(this, this._prepareSearch, this.filter, 200)
        );
      }
    },

    onDeselect() {
      this.set(
        "searchDebounce",
        run.debounce(this, this._prepareSearch, this.filter, 200)
      );
    },

    onSelect() {
      this.set(
        "searchDebounce",
        run.debounce(this, this._prepareSearch, this.filter, 50)
      );
    }
  },

  _prepareSearch(query) {
    const data = {
      q: query,
      limit: this.get("siteSettings.max_tag_search_results")
    };

    this.searchTags("/tag_groups/filter/search", data, this._transformJson);
  },

  _transformJson(context, json) {
    let results = json.results.sort((a, b) => a.id > b.id);

    results = results.map(result => {
      return { id: result.text, name: result.text, count: result.count };
    });

    return results;
  }
});
