goog.module('omid.test.sessionClient.MediaEvents');

const AdSession = goog.require('omid.sessionClient.AdSession');
const argsChecker = goog.require('omid.common.argsChecker');
const VastProperties = goog.require('omid.common.VastProperties');
const MediaEvents = goog.require('omid.sessionClient.MediaEvents');
const {InteractionType, VideoPlayerState, VideoPosition} = goog.require('omid.common.constants');
const {asSpy} = goog.require('omid.test.typingUtils');

/** @type {!MediaEvents} */
let mediaEvents;

/** @type {!AdSession} */
let mockAdSession;

/**
 * Tests that the forwarding function forwards the method call as expected.
 * @param  {string} methodName
 * @param  {function(...?)} f Forwarding function
 * @param  {...?} args Array of arguments to pass to the function.
 */
function testForwardingFunction(methodName, f, ...args) {
  it('should be relayed to the service', () => {
    f.apply(mediaEvents, args);

    expect(mockAdSession.sendOneWayMessage)
        .toHaveBeenCalledWith(methodName, ...args);
  });
}

describe('MediaEventsTest', () => {
  beforeEach(() => {
    mockAdSession = jasmine.createSpyObj(
        'AdSession', [
          'registerMediaEvents',
          'registerAdEvents',
          'sendOneWayMessage',
          'assertSessionRunning',
          'impressionOccurred']);
    spyOn(argsChecker, 'assertNotNullObject');
    spyOn(argsChecker, 'assertNumber');
    spyOn(argsChecker, 'assertNumberBetween');

    mediaEvents = new MediaEvents(mockAdSession);
  });

  describe('constructor', () => {
    it('should verify adSession by calling the argsChecker', () => {
      expect(argsChecker.assertNotNullObject).toHaveBeenCalledWith(
          'MediaEvents.adSession', mockAdSession);
    });
    it('should throw an error if ad session already has media events', () => {
      asSpy(mockAdSession.registerMediaEvents).and.callFake(() => {
        throw new Error();
      });

      expect(() => new MediaEvents(mockAdSession)).toThrow();
    });
  });

  describe('loaded', () => {
    it('should verify vastProperties by calling the argsChecker', () => {
      const vastProperties = new VastProperties(
        /* isSkippable= */ false,
        /* skipOffset= */ 0,
        /* isAutoPlay= */ false,
        /* position= */ VideoPosition.PREROLL);
      mediaEvents.loaded(vastProperties);

      expect(argsChecker.assertNotNullObject).toHaveBeenCalledWith(
          'MediaEvents.loaded.vastProperties', vastProperties);
    });

    it('should be relayed to the service', () => {
      mediaEvents.loaded(new VastProperties(
          /* isSkippable= */ true,
          /* skipOffset= */ 10,
          /* isAutoPlay= */ true,
          /* position= */ VideoPosition.PREROLL));

      expect(mockAdSession.sendOneWayMessage).toHaveBeenCalledWith('loaded', {
        isSkippable: true,
        skipOffset: 10,
        isAutoPlay: true,
        position: 'preroll',
      });
    });
  });

  describe('start', () => {
    it('should verify duration by calling the argsChecker', () => {
      const mediaEvents = new MediaEvents(mockAdSession);
      mediaEvents.start(5, .5);

      expect(argsChecker.assertNumber).toHaveBeenCalledWith(
          'MediaEvents.start.duration', 5);
    });

    it('should verify mediaPlayerVolume by calling the argsChecker', () => {
      const mediaEvents = new MediaEvents(mockAdSession);
      mediaEvents.start(5, .5);

      expect(argsChecker.assertNumberBetween).toHaveBeenCalledWith(
          'MediaEvents.start.mediaPlayerVolume', .5, 0, 1);
    });

    testForwardingFunction(
        'start', MediaEvents.prototype.start, 5 /* duration */,
        0.6 /* volume */);
  });

  describe('volumeChange', () => {
    it('should verify mediaPlayerVolume by calling the argsChecker', () => {
      const mediaEvents = new MediaEvents(mockAdSession);
      mediaEvents.volumeChange(.6);

      expect(argsChecker.assertNumberBetween).toHaveBeenCalledWith(
          'MediaEvents.volumeChange.mediaPlayerVolume', .6, 0, 1);
    });

    testForwardingFunction(
        'volumeChange', MediaEvents.prototype.volumeChange, 0.6 /* volume */);
  });

  describe('playerStateChange', () => {
    it('should verify playerState by calling the argsChecker', () => {
      const mediaEvents = new MediaEvents(mockAdSession);
      const videoPlayerState = VideoPlayerState.FULLSCREEN;
      mediaEvents.playerStateChange(videoPlayerState);

      expect(argsChecker.assertNotNullObject).toHaveBeenCalledWith(
          'MediaEvents.playerStateChange.playerState', videoPlayerState);
    });

    testForwardingFunction(
        'playerStateChange',
        MediaEvents.prototype.playerStateChange,
        VideoPlayerState.FULLSCREEN);
  });

  describe('adUserInteraction', () => {
    it('should verify adUserInteraction by calling the argsChecker', () => {
      const mediaEvents = new MediaEvents(mockAdSession);
      mediaEvents.adUserInteraction(InteractionType.CLICK);

      expect(argsChecker.assertNotNullObject).toHaveBeenCalledWith(
          'MediaEvents.adUserInteraction.interactionType',
          InteractionType.CLICK);
    });

    testForwardingFunction(
        'adUserInteraction',
        MediaEvents.prototype.adUserInteraction,
        InteractionType.CLICK);
  });

  describe('firstQuartile', () => {
    testForwardingFunction(
        'firstQuartile', MediaEvents.prototype.firstQuartile);
  });

  describe('midpoint', () => {
    testForwardingFunction('midpoint', MediaEvents.prototype.midpoint);
  });

  describe('thirdQuartile', () => {
    testForwardingFunction('thirdQuartile',
        MediaEvents.prototype.thirdQuartile);
  });

  describe('complete', () => {
    testForwardingFunction('complete', MediaEvents.prototype.complete);
  });

  describe('pause', () => {
    testForwardingFunction('pause', MediaEvents.prototype.pause);
  });

  describe('resume', () => {
    testForwardingFunction('resume', MediaEvents.prototype.resume);
  });

  describe('bufferStart', () => {
    testForwardingFunction('bufferStart', MediaEvents.prototype.bufferStart);
  });

  describe('bufferFinish', () => {
    testForwardingFunction('bufferFinish', MediaEvents.prototype.bufferFinish);
  });

  describe('skipped', () => {
    testForwardingFunction('skipped', MediaEvents.prototype.skipped);
  });
});
