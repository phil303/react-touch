# React-Touchable
React-Touchable is still a WIP. When it's finished, it will contain a set of wrapper components that handle touch events in a more declarative way. Anything I've written below does work though. Here's a quick example of the API.

```javascript
import { Holdable } from 'react-touchable';
<Holdable onHoldComplete={handleHold}>
  ({ holdProgress }) => <Button opacity={holdProgress} />
</Holdable>
```

## Try it out
```
git clone https://github.com/phil303/react-touchable
cd react-touchable
npm install
```

## What Does This Library Do?
If you've ever written mobile web software, then you might've found yourself needing the ability to touch drag a component, measure a hold, or handle a swipe. This library aims to make all that simpler by abstracting away the details so you can wrap your component and move on.

## Current API
Exports:
  
  - `Draggable`
  - `Holdable`
  - `Swipeable`
  - `defineHold`
  - `defineSwipe`

### Helpers

#### `defineHold(config?: Object)`

Used in conjuction with `Holdable`, `defineHold` is an optional helper function that creates a configuration for your holdable component. The arguments to it are:

  - `config`: Optional. Object with the following keys:
    - `updateEvery`: Optional. Defaults to 250. Units are in milliseconds.
    - `holdFor`: Optional. Defaults to 1000. Units are in milliseconds.

#### Example Usage
```javascript
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
```javascript
const swipe = defineSwipe({swipeDistance: 50});
<Swipeable config={swipe} onSwipeLeft={deleteEmail}>
  <Email />
</Swipeable>
```


### Components

#### `<Holdable />`

Used to create a component that understands holds. `Holdable` will give you hooks for the progress and the completion of a hold. You can pass a component or a function as its child. Passing a function will gain you access to the hold progress.

#### Example Usage:
```javascript
<Holdable onHoldComplete={handleHold}>
  ({ holdProgress }) => <Button opacity={holdProgress} />
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
```javascript
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
```javascript
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



### Advanced Usage
Want to be able to drag *and* hold a component? You can wrap react-touchable components with other react-touchable components to achieve this. For example:

```javascript
const hold = defineHold({updateEvery: 50, holdFor: 500});
<Holdable config={hold} onHoldComplete={() => console.log('held out')}>
  <Draggable style={{translateX: 150, translateY: 200}}>
    {({translateX, translateY, holdProgress}) => {
      return (
        <div style={{transform: `translate3d(${translateX}px, ${translateY}px, 0)`}}>
          <Bubble opacity={holdProgress} />
        </div>
      );
    }}
  </Draggable>
</Holdable>
```

Notice the callback argument keys are the combination of the two parent components. This feature means you don't have to do multiple nested callbacks to achieve the same effect.
