// Copyright 2017, University of Colorado Boulder

/**
 * QUnit tests for DerivedProperty
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var axon = require( 'AXON/axon' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var Property = require( 'AXON/Property' );

  QUnit.module( 'DerivedProperty' );

  QUnit.test( 'Test stale values in DerivedProperty', function( assert ) {
    var a = new Property( 1 );
    var b = new Property( 2 );
    var c = new DerivedProperty( [ a, b ], function( a, b ) {return a + b;} );
    a.value = 7;
    assert.equal( c.value, 9 );
  } );

  QUnit.test( 'Test DerivedProperty.unlink', function( assert ) {

    var widthProperty = new Property( 2 );
    var heightProperty = new Property( 3 );
    var areaProperty = new DerivedProperty( [ widthProperty, heightProperty ],
      function( width, height ) { return width * height; } );
    var listener = function( area ) { /*console.log( 'area = ' + area );*/ };
    areaProperty.link( listener );

    assert.equal( widthProperty.changedEmitter.listeners.length, 1 );
    assert.equal( heightProperty.changedEmitter.listeners.length, 1 );
    assert.equal( areaProperty.dependencies.length, 2 );
    assert.equal( areaProperty.dependencyListeners.length, 2 );

    // Unlink the listener
    areaProperty.unlink( listener );
    areaProperty.dispose();

    assert.equal( widthProperty.changedEmitter.listeners.length, 0 );
    assert.equal( heightProperty.changedEmitter.listeners.length, 0 );
    assert.equal( heightProperty.changedEmitter.listeners.length, 0 );

    assert.equal( areaProperty.dependencies, null );
    assert.equal( areaProperty.dependencyListeners, null );
    assert.equal( areaProperty.dependencyValues, null );

  } );


  QUnit.test( 'DerivedProperty.valueEquals', function( assert ) {
    var propA = new axon.Property( 'a' );
    var propB = new axon.Property( 'b' );
    var prop = axon.DerivedProperty.valueEquals( propA, propB );
    assert.equal( prop.value, false );
    propA.value = 'b';
    assert.equal( prop.value, true );
  } );

  QUnit.test( 'DerivedProperty and/or', function( assert ) {

    var propA = new axon.Property( false );
    var propB = new axon.Property( false );
    var propC = new axon.Property( false );
    var propD = new axon.Property( 0 ); // dependency with an invalid (non-boolean) type

    // fail: 'and' with non-boolean Property
    window.assert && assert.throws( function() { return axon.DerivedProperty.and( [ propA, propD ] ); },
      'DerivedProperty.and requires booleans Property values' );

    // fail: 'or' with non-boolean Property
    window.assert && assert.throws( function() { return axon.DerivedProperty.or( [ propA, propD ] ); },
      'DerivedProperty.or requires booleans Property values' );

    // correct usages of 'and' and 'or'
    var and = axon.DerivedProperty.and( [ propA, propB, propC ] );
    var or = axon.DerivedProperty.or( [ propA, propB, propC ] );

    assert.equal( and.value, false );
    assert.equal( or.value, false );

    propA.value = true;
    assert.equal( and.value, false );
    assert.equal( or.value, true );

    propB.value = true;
    assert.equal( and.value, false );
    assert.equal( or.value, true );

    propC.value = true;
    assert.equal( and.value, true );
    assert.equal( or.value, true );

    // fail: setting a dependency to a non-boolean value
    window.assert && assert.throws( function() { propA.value = 0; },
      'DerivedProperty dependency must have boolean value' );
  } );

} );