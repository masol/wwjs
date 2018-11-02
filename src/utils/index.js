module.exports = () => {
  const polyfills = require('./polyfills')

  return {
    /**
     * Name of the module
     * @type {String}
     * @private
     */
    name: 'Utils',

    /**
     * Initialize module
     */
    init () {
      return this
    },

    polyfills
  }
}
