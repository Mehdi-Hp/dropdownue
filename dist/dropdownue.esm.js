import Vue from 'vue';

var EventBus = new Vue();

function hasClickedAway(element, event) {
  return !element.contains(event.target);
}

var DropdownueItem = {
  props: {
    instanceId: {
      type: String,
      required: true
    },
    list: {
      type: Array,
      required: true
    },
    item: {
      type: Object,
      required: true
    }
  },
  data: function data() {
    return {
      isSelected: false,
      isHighlighted: false
    };
  },
  methods: {
    highlight: function highlight(item) {
      item.isHighlighted = true;
    },
    blur: function blur(item) {
      item.isHighlighted = false;
    },
    select: function select(item) {
      var previouslySelected = this.list.find(function (item) {
        return item.isSelected;
      });
      if (previouslySelected) {
        previouslySelected.isSelected = false;
      }
      item.isSelected = !item.isSelected;
      EventBus.$emit(("dropdownue:changeValue" + (this.instanceId)), item.id);
      this.$emit("change", item.id);
    },
    getItemEvents: function getItemEvents(item) {
      var this$1 = this;

      return {
        mouseover: function () {
          this$1.highlight(item);
        },
        mouseout: function () {
          this$1.blur(item);
        },
        click: function () {
          this$1.select(item);
        }
      };
    }
  },
  render: function render() {
    var this$1 = this;

    return this.$scopedSlots.default({
      isSelected: this.item.isSelected,
      isHighlighted: this.item.isHighlighted,

      highlight: this.highlight,
      itemMouseoverEvent: function (item) {
        return this$1.getItemEvents(item).mouseover();
      },
      itemMouseoutEvent: function (item) {
        return this$1.getItemEvents(item).mouseout();
      },
      itemEvents: this.getItemEvents
    });
  }
};

var uuidv4 = require('uuid/v4');

var Dropdownue = {
  props: {
    list: {
      type: Array,
      required: true
    },
    defaultValue: {
      type: String,
      required: false,
      default: undefined
    },
    filterQuery: {
      type: String,
      required: false,
      default: ""
    },
    closeOnSelect: {
      type: Boolean,
      required: false,
      default: true
    },
    closeOnClickaway: {
      type: Boolean,
      required: false,
      default: true
    },
    resetOnSelect: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data: function data() {
    return {
      instanceId: undefined,
      isOpen: false,
      formedListItems: [],
      listItemsToRender: [],
      value: this.defaultValue
    };
  },
  watch: {
    list: {
      immediate: true,
      deep: true,
      handler: function handler(newList) {
        var this$1 = this;

        this.formedListItems = Vue.observable(
          this.list.map(function (item) {
            var newList = Vue.observable(Object.assign({}, item,
              {isSelected: item.isSelected || this$1.value == item.id || false,
              isHighlighted: item.isHighlighted || false}));
            this$1.$emit("updateList", newList);
            return newList;
          })
        );
      }
    },
    isOpen: function isOpen() {
      if (this.isOpen) {
        document.addEventListener("click", this.handleClickAway);
        document.addEventListener("keydown", this.handleClickAway);
      } else {
        document.removeEventListener("click", this.handleClickAway);
        document.removeEventListener("keydone", this.handleClickAway);
      }
    },
    filterQuery: {
      immediate: true,
      handler: function handler(newFilterQuery) {
        this.filter(newFilterQuery);
      }
    }
  },
  created: function created() {
    this.instanceId = uuidv4();
  },
  mounted: function mounted() {
    this.listenOnChangeValue();
  },
  methods: {
    listenOnChangeValue: function listenOnChangeValue() {
      var this$1 = this;

      EventBus.$on(("dropdownue:changeValue" + (this.instanceId)), function (newValue) {
        this$1.select(newValue);
      });
    },
    handleClickAway: function handleClickAway(event) {
      if (hasClickedAway(this.$el, event) || event.key === "Escape") {
        this.close();
      }
    },
    open: function open() {
      this.isOpen = true;
      this.$emit("open");
    },
    close: function close() {
      this.isOpen = false;
      this.$emit("close");
    },
    toggle: function toggle() {
      this.isOpen = !this.isOpen;
      this.$emit("toggle", this.isOpen);
    },
    filter: function filter(query) {
      if (query) {
        this.listItemsToRender = this.formedListItems.filter(function (item) {
          return item.name.includes(query);
        });
      } else {
        this.listItemsToRender = this.formedListItems;
      }
    },
    select: function select(value) {
      this.value = value;
      this.$emit("change", value);
      if (this.closeOnSelect) {
        this.close();
      }
      if (this.resetOnSelect) {
        this.filter("");
      }
    }
  },
  render: function render() {
    return this.$scopedSlots.default({
      instanceId: this.instanceId,
      isOpen: this.isOpen,
      isClosed: !this.isOpen,
      value: this.value,
      listItems: this.listItemsToRender,

      open: this.open,
      close: this.close,
      toggle: this.toggle,
      filter: this.filter
    });
  }
};

export { Dropdownue, DropdownueItem };
