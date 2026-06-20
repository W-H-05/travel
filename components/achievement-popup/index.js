Component({
  options: {
    styleIsolation: 'shared'
  },
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    achievement: {
      type: Object,
      value: null
    }
  },
  methods: {
    handleClose() {
      this.triggerEvent('close');
    }
  }
});
