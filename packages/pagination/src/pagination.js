import { optionsHelpers } from './_helpers';

const _times = require('lodash.times');

const defaultOptions = {
  fields: {
    query: {
      pageSize: 'pageSize',
      pageNumber: 'pageNumber'
    }
  }
};

export default {
  name: 'Pagination',
  props: {
    totalDocs: {
      type: Number,
      required: true
    },
    pageLimit: {
      type: Number,
      required: true
    },
    areaCount: {
      type: Number,
      required: false,
      default: 5
    },
    options: {
      type: Object,
      required: false,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      currentPage: 1
    };
  },
  watch: {
  },
  computed: {
    normalizedOptions() {
      optionsHelpers.validate.apply(this, [defaultOptions]);
      return optionsHelpers.normalize.apply(this, [defaultOptions]);
    },
    totalPages() {
      return Math.ceil(
        this.totalDocs / this.pageLimit
      );
    },
    tail() {
      return this.currentPage * this.pageLimit;
    },
    hasNextPage() {
      return this.tail < this.totalDocs;
    },
    hasPrevPage() {
      return this.tail > this.pageLimit;
    },
    nextPage() {
      if (this.hasNextPage) {
        return this.currentPage + 1;
      }
      return null;
    },
    prevPage() {
      if (this.hasPrevPage) {
        return this.currentPage - 1;
      }
      return null;
    },
    area() {
      if (this.totalDocs <= this.pageLimit) {
        return [1];
      }
      const start = 1;
      const end = this.totalPages;
      const area = [this.currentPage];
      const areaCount = this.areaCount - 1;
      const idealPreSpan = Math.floor(areaCount / 2);
      const idealPostSpan = Math.ceil(areaCount / 2);
      const { actualPreSpan, preLeftOvers } = (() => {
        const leftPointer = this.currentPage - idealPreSpan;
        if (leftPointer >= start) {
          return { actualPreSpan: leftPointer, preLeftOvers: 0 };
        }
        return { actualPreSpan: this.currentPage - 1, preLeftOvers: idealPreSpan - (this.currentPage - 1) };
      })();
      const { actualPostSpan, postLeftOvers } = (() => {
        const rightPointer = this.currentPage + idealPostSpan;
        if (rightPointer <= end) {
          return { actualPostSpan: rightPointer, postLeftOvers: 0 };
        }
        return { actualPostSpan: end - this.currentPage, postLeftOvers: idealPostSpan - (end - this.currentPage) };
      })();
      _times(actualPreSpan + postLeftOvers, (preSpanNumber) => {
        area.unshift(this.currentPage - preSpanNumber);
      });
      _times(actualPostSpan + preLeftOvers, (postSpanNumber) => {
        area.push(this.currentPage - postSpanNumber);
      });
      return area;
    },
    query() {
      return `${this.normalizedOptions.fields.query.pageSize}=${this.pageLimit}&${this.normalizedOptions.fields.query.pageNumber}=${this.currentPage}`;
    }
  },
  methods: {
    goToNextPage() {
      if (this.nextPage) {
        this.currentPage = this.nextPage;
      } else {
        console.error(`There is no page after page ${this.currentPage}`);
      }
    },
    goToPrevPage() {
      if (this.prevPage) {
        this.currentPage = this.prevPage;
      } else {
        console.error(`There is no page before page ${this.currentPage}`);
      }
    }
  },
  render(h) {
    return this.$scopedSlots.default({
      query: this.query,
      totalPages: this.totalPages,
      tail: this.tail,
      hasNextPage: this.hasNextPage,
      hasPrevPage: this.hasPrevPage,
      nextPage: this.nextPage,
      prevPage: this.prevPage,
      area: this.area,

      goToNextPage: this.goToNextPage,
      goToPrevPage: this.goToPrevPage
    });
  }
};
