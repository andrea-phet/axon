// Copyright 2017, University of Colorado Boulder

/**
 * Unit tests for axon. Please run once in phet brand and once in brand=phet-io to cover all functionality.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  require( 'AXON/DynamicPropertyTests' );
  require( 'AXON/EventsTests' );
  require( 'AXON/NumberPropertyTests' );
  require( 'AXON/ObservableArrayTests' );
  require( 'AXON/PropertyTests' );
  require( 'AXON/BooleanPropertyTests' );
  require( 'AXON/DerivedPropertyTests' );
  require( 'AXON/StringPropertyTests' );

  // Since our tests are loaded asynchronously, we must direct QUnit to begin the tests
  QUnit.start();
} );