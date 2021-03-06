// Copyright 2015, University of Colorado Boulder

/**
 * Lightweight event & listener abstraction for a single event type.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var axon = require( 'AXON/axon' );
  var EmitterIO = require( 'AXON/EmitterIO' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetioObject = require( 'TANDEM/PhetioObject' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function Emitter( options ) {

    options = _.extend( {
      phetioType: EmitterIO( [] ) // subtypes can override with EmitterIO([...])
    }, options );

    // @private {Function[]} - the listeners to emit to
    this.listeners = [];

    // @private - during emit() keep track of which listeners should receive events in order to manage removal of
    //          - listeners during emit()
    this.listenersToEmitTo = [];

    PhetioObject.call( this, options );
  }

  axon.register( 'Emitter', Emitter );

  return inherit( PhetioObject, Emitter, {

    /**
     * Dispose an Emitter that is no longer used.  Like Property.dispose, this method checks that there are no leaked
     * listeners.
     */
    dispose: function() {

      // See https://github.com/phetsims/axon/issues/124
      this.listeners.length = 0;

      PhetioObject.prototype.dispose.call( this );
    },

    /**
     * Adds a listener
     * @param {function} listener
     * @public
     */
    addListener: function( listener ) {

      assert && assert( this.listeners.indexOf( listener ) === -1, 'Cannot add the same listener twice' );

      // If callbacks are in progress, make a copy of the current list of listeners--the newly added listener
      // will be available for the next emit() but not the one in progress.  This is to match behavior with removeListener
      this.defendCallbacks();

      this.listeners.push( listener );
    },

    /**
     * Removes a listener
     * @param {function} listener
     * @public
     */
    removeListener: function( listener ) {

      var index = this.listeners.indexOf( listener );
      assert && assert( index >= 0, 'tried to removeListener on something that wasn\'t a listener' );

      // If callbacks are in progress, make a copy of the current list of listeners--the removed listener
      // will remain in the list and receive a callback for this emit call, see #72
      this.defendCallbacks();

      this.listeners.splice( index, 1 );
    },

    /**
     * Removes all the listeners
     * @public
     */
    removeAllListeners: function() {
      while ( this.listeners.length > 0 ) {
        this.removeListener( this.listeners[ 0 ] );
      }
    },

    /**
     * If processing callbacks during an emit() call and addListener/removeListener() is called,
     * make a defensive copy of the array of listener before changing the array, and use it for
     * the rest of the callbacks until the emit call has completed.
     * @private
     */
    defendCallbacks: function() {

      for ( var i = this.listenersToEmitTo.length - 1; i >= 0; i-- ) {

        // Once we meet a level that was already defended, we can stop, since all previous levels are also defended
        if ( this.listenersToEmitTo[ i ].defended ) {
          break;
        }
        else {
          var defendedListeners = this.listeners.slice();

          // Mark copies as 'defended' so that it will use the original listeners when emit started and not the modified list.
          defendedListeners.defended = true;
          this.listenersToEmitTo[ i ] = defendedListeners;
        }
      }
    },

    /**
     * Emits a single event.
     * This method is called many times in a simulation and must be well-optimized.
     * @public
     */
    emit: function() {

      var id = this.phetioObjectTandem.isSuppliedAndEnabled() && this.startEvent( 'model', 'emitted' );
      this.listenersToEmitTo.push( this.listeners );
      var lastEntry = this.listenersToEmitTo.length - 1;

      for ( var i = 0; i < this.listenersToEmitTo[ lastEntry ].length; i++ ) {
        this.listenersToEmitTo[ lastEntry ][ i ]();
      }

      this.listenersToEmitTo.pop();
      this.phetioObjectTandem.isSuppliedAndEnabled() && this.endEvent( id );
    },

    /**
     * Emits a single event with one argument.  This is a copy-paste of emit() for performance reasons.
     * @param {*} arg0
     * @public
     */
    emit1: function( arg0 ) {

      // TODO: name the args for the data stream

      var id = this.phetioObjectTandem.isSuppliedAndEnabled() && this.startEvent( 'model', 'emitted', {
        args: [ this.phetioType.parameterTypes[ 0 ].toStateObject( arg0 ) ]
      } );
      this.listenersToEmitTo.push( this.listeners );
      var lastEntry = this.listenersToEmitTo.length - 1;

      for ( var i = 0; i < this.listenersToEmitTo[ lastEntry ].length; i++ ) {
        this.listenersToEmitTo[ lastEntry ][ i ]( arg0 );
      }

      this.listenersToEmitTo.pop();
      this.phetioObjectTandem.isSuppliedAndEnabled() && this.endEvent( id );
    },

    /**
     * Emits a single event with two arguments.  This is a copy-paste of emit() for performance reasons.
     * @param {*} arg0
     * @param {*} arg1
     * @public
     */
    emit2: function( arg0, arg1 ) {
      var id = this.phetioObjectTandem.isSuppliedAndEnabled() && this.startEvent( 'model', 'emitted', {
        args: [
          this.phetioType.parameterTypes[ 0 ].toStateObject( arg0 ),
          this.phetioType.parameterTypes[ 1 ].toStateObject( arg1 )
        ]
      } );
      this.listenersToEmitTo.push( this.listeners );
      var lastEntry = this.listenersToEmitTo.length - 1;

      for ( var i = 0; i < this.listenersToEmitTo[ lastEntry ].length; i++ ) {
        this.listenersToEmitTo[ lastEntry ][ i ]( arg0, arg1 );
      }

      this.listenersToEmitTo.pop();
      this.phetioObjectTandem.isSuppliedAndEnabled() && this.endEvent( id );
    },

    /**
     * Emits a single event with three arguments.  This is a copy-paste of emit() for performance reasons.
     * @param {*} arg0
     * @param {*} arg1
     * @param {*} arg2
     * @public
     */
    emit3: function( arg0, arg1, arg2 ) {
      var id = this.phetioObjectTandem.isSuppliedAndEnabled() && this.startEvent( 'model', 'emitted', {
        args: [
          this.phetioType.parameterTypes[ 0 ].toStateObject( arg0 ),
          this.phetioType.parameterTypes[ 1 ].toStateObject( arg1 ),
          this.phetioType.parameterTypes[ 2 ].toStateObject( arg2 )
        ]
      } );
      this.listenersToEmitTo.push( this.listeners );
      var lastEntry = this.listenersToEmitTo.length - 1;

      for ( var i = 0; i < this.listenersToEmitTo[ lastEntry ].length; i++ ) {
        this.listenersToEmitTo[ lastEntry ][ i ]( arg0, arg1, arg2 );
      }

      this.listenersToEmitTo.pop();
      this.phetioObjectTandem.isSuppliedAndEnabled() && this.endEvent( id );
    },

    /**
     * Emits a single event with three arguments.  This is a copy-paste of emit() for performance reasons.
     * @param {*} arg0
     * @param {*} arg1
     * @param {*} arg2
     * @param {*} arg3
     * @public
     */
    emit4: function( arg0, arg1, arg2, arg3 ) {
      var id = this.phetioObjectTandem.isSuppliedAndEnabled() && this.startEvent( 'model', this.emitterTandem.id, this.ttype, 'emitted', {
        args: [
          this.phetioType.parameterTypes[ 0 ].toStateObject( arg0 ),
          this.phetioType.parameterTypes[ 1 ].toStateObject( arg1 ),
          this.phetioType.parameterTypes[ 2 ].toStateObject( arg2 ),
          this.phetioType.parameterTypes[ 3 ].toStateObject( arg3 )
        ]
      } );
      this.listenersToEmitTo.push( this.listeners );
      var lastEntry = this.listenersToEmitTo.length - 1;

      for ( var i = 0; i < this.listenersToEmitTo[ lastEntry ].length; i++ ) {
        this.listenersToEmitTo[ lastEntry ][ i ]( arg0, arg1, arg2, arg3 );
      }

      this.listenersToEmitTo.pop();
      this.phetioObjectTandem.isSuppliedAndEnabled() && this.endEvent( id );
    },

    /**
     * Checks whether a listener is registered with this Emitter
     * @param {function} listener
     * @returns {boolean}
     * @public
     */
    hasListener: function( listener ) {
      assert && assert( arguments.length === 1, 'Emitter.hasListener should be called with 1 argument' );
      return this.listeners.indexOf( listener ) >= 0;
    },

    /**
     * Returns true if there are any listeners.
     * @returns {boolean}
     * @public
     */
    hasListeners: function() {
      assert && assert( arguments.length === 0, 'Emitter.hasListeners should be called without arguments' );
      return this.listeners.length > 0;
    },

    /**
     * Returns the number of listeners.
     * @returns {number}
     * @public
     */
    getListenerCount: function() {
      return this.listeners.length;
    }
  } );
} );