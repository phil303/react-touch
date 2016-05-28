# React-Touch
[![Build Status](https://img.shields.io/travis/phil303/react-touch/master.svg?style=flat)](https://travis-ci.org/phil303/react-touch)
[![codecov.io](https://codecov.io/github/phil303/react-touch/coverage.svg?branch=master)](https://codecov.io/github/phil303/react-touch?branch=master)
[![NPM Version](https://img.shields.io/npm/v/react-touch.svg?style=flat)](https://www.npmjs.com/package/react-touch) 

React-Touch is a set of wrapper components that handle touch interactions in a more declarative way, abstracting out and giving you hooks into behaviors such as dragging, holding, swiping, and custom gestures. React-Touch also works with mouse events as well.

Here's a quick example of the API.

```jsx
import { Holdable } from 'react-touch';
<Holdable onHoldComplete={handleHold}>
  ({ holdProgress }) => <Button style={{opacity: holdProgress}} />
</Holdable>
```

## Try it out
```
npm install react-touch --save
```

## Demos

  - [Emulating a Smartphone Dashboard](http://phil303.github.io/react-touch/examples/smartphone-dashboard/)

## What Does This Library Do?
If you've ever written mobile web software, then you might've found yourself needing the ability to touch drag a component, measure a hold, or react to a swipe or gesture. This library is a set of wrapper components that abstract out the details of those things so you can wrap your components and move on.

## API
Exports:
  
  - [`defineHold`](#defineholdconfig-object)
  - [`defineSwipe`](#defineswipeconfig-object)
  - [`Holdable`](#holdable-)
  - [`Draggable`](#draggable-)
  - [`Swipeable`](#swipeable-)
  - [`CustomGesture`](#customgesture-)

### Helpers

#### `defineHold(config?: Object)`

Used in conjuction with `Holdable`, `defineHold` is an optional helper function that creates a configuration for your holdable component. The arguments to it are:

  - `config`: Optional. Object with the following keys:
    - `updateEvery`: Optional. Defaults to 250. Units are in milliseconds.
    - `holdFor`: Optional. Defaults to 1000. Units are in milliseconds.

#### Example Usage
```jsx
const hold = defineHold({updateEvery: 50, holdFor: 500});
<Holdable config={hold} onHoldComplete={handleHold}>
  <Button />
</Holdable>
```

#### `defineSwipe(config?: Object)`

Used in conjuction with `Swipeable`, `defineSwipe` is an optional helper function that creates a configuration for your swipeable component. The arguments to it are:

  - `config`: Optional. Object with the following keys:
    - `swipeDistance`: Optional. Defaults to 100. Units are in pixels.

#### Example Usage
```jsx
const swipe = defineSwipe({swipeDistance: 50});
<Swipeable config={swipe} onSwipeLeft={deleteEmail}>
  <Email />
</Swipeable>
```


### Components

#### `<Holdable />`

Used to create a component that understands holds. `Holdable` will give you hooks for the progress and the completion of a hold. You can pass a component or a function as its child. Passing a function will gain you access to the hold progress.

#### Example Usage:
```jsx
<Holdable onHoldComplete={handleHold}>
  ({ holdProgress }) => <Button style={{opacity: holdProgress}} />
</Holdable>
```

#### Props
- `onHoldProgress?: Function`
When the hold makes progress, this callback is fired. Update intervals can be adjusted by the `updateEvery` key in the configuration.

- `onHoldComplete?: Function`
When the hold has completed, this callback is fired. Length of hold can be
adjusted by the `holdFor` key in the configuration.

#### Callback Argument Keys
  - `holdProgress`

#### `<Draggable />`

Used to create a component that can be dragged. `Draggable` requires a `style` prop defining its initial position and will pass updates to the child component via a callback.

#### Example Usage
```jsx
<Draggable style={{translateX: 150, translateY: 200}}>
  {({translateX, translateY}) => {
    return (
      <div style={{transform: `translate3d(${translateX}px, ${translateY}px, 0)`}}>
        <Bubble />
      </div>
    );
  }}
</Draggable>
```

#### Props
- `style: Object` Required. An object that defines the initial position of the draggable component. You can pass any of the following styles to it and they'll be updated and passed back out in the callback with every animation tick.
  
  - `translateX`
  - `translateY`
  - `top`
  - `left`
  - `right`
  - `bottom`

#### Callback Argument Keys
Any of the above keys depending on what you set as your `style`. Additionally:

  - `dx`
  - `dy`

#### `<Swipeable />`

Used to create a component that understands swipes. `Swipeable` gives you hooks to the swipe directions up, down, left, right, with the swipe threshold being customized using the `defineSwipe` helper.

#### Example Usage:
```jsx
<Swipeable onSwipeLeft={deleteEmail}>
  <Email />
</Swipeable>
```

#### Props
- `onSwipeLeft?: Function`
When the swipe threshold has been passed in the left direction, fire this callback.

- `onSwipeRight?: Function`
When the swipe threshold has been passed in the right direction, fire this callback.

- `onSwipeDown?: Function`
When the swipe threshold has been passed in the down direction, fire this callback.

- `onSwipeUp?: Function`
When the swipe threshold has been passed in the up direction, fire this callback.


#### `<CustomGesture />`

Used to create a component that understands a customized gesture. Gestures are passed through the config prop. When the gesture is recognized, `onGesture` will fire.

Gestures are just a combination of discrete linear movements. For instance, a "C" gesture would be composed of a left, down-left, down, down-right, and right. The user doesn't have to do this perfectly, the library will do a distance calculation and fire or not fire the `onGesture` callback based off that. This algorithm is a port of a [Swift library by Didier Brun](https://github.com/didierbrun/DBPathRecognizer).

#### Example Usage:
```jsx
import { CustomGesture, moves } from 'react-touch';

const CIRCLE = [
  moves.RIGHT,
  moves.DOWNRIGHT,
  moves.DOWN,
  moves.DOWNLEFT,
  moves.LEFT,
  moves.UPLEFT,
  moves.UP,
  moves.UPRIGHT,
  moves.RIGHT,
];

<CustomGesture config={CIRCLE} onGesture={unlockApp}>
  <AppLockScreen />
</CustomGesture>
```

#### Props
- `onGesture?: Function`
Callback fired when the gesture is complete.


### Advanced Usage
Want to be able to drag *and* hold a component? You can wrap react-touch components with other react-touch components to achieve this. For example:

```jsx
const hold = defineHold({updateEvery: 50, holdFor: 500});
<Holdable config={hold} onHoldComplete={() => console.log('held out')}>
  <Draggable style={{translateX: 150, translateY: 200}}>
    {({translateX, translateY, holdProgress}) => {
      return (
        <div style={{transform: `translate3d(${translateX}px, ${translateY}px, 0)`}}>
          <Bubble style={{opacity: holdProgress}} />
        </div>
      );
    }}
  </Draggable>
</Holdable>
```

Notice the callback argument keys are the combination of the two parent components. This feature means you don't have to do multiple nested callbacks to achieve the same effect.
