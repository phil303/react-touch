# React-Touchable
React-Touchable is still a WIP. When it's finished, it will contain a set of wrapper components that handle touch events in a more declarative way. Anything I've written below does work though. This can be illustrated with an example.

```javascript
import { Holdable } from 'react-touchable';
<Holdable onHold={handleHold}>
  ({ holdPercent }) => <Button opacity={holdPercent} />
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
  - `defineHold`

### Helpers

##### `defineHold(config?: Object)`

Used in conjuction with `Holdable`, `defineHold` is an optional helper function that creates a configuration for your holdable component. The arguments to it are:

  - `config`: optional. Object with the following keys:
    - `updateEvery`: optional. defaults to 250. Units are in milliseconds.
    - `holdFor`: optional. defaults to 1000. Units are in milliseconds.

#### Example Usage
```javascript
const hold = defineHold({updateEvery: 50, holdFor: 500});
<Holdable onHold={hold(handleHold)}>
  <Button />
</Holdable>
```


### Components

##### `<Holdable />`

Used to create a component that understands holds. `Holdable` will give you a hook for the completion of a hold. You can pass a component or a function as its child.  Passing a function will gain you access to the hold progress.

#### Example Usage:
```javascript
<Holdable onHold={handleHold}>
  ({ holdPercent }) => <Button opacity={holdPercent} />
</Holdable>
```

#### Props
- `onHold?: Function`
When the hold has completed, this callback is fired.

#### Callback Argument Keys
  - `holdPercent`

##### `<Draggable />`

Used to create a component that can be dragged. `Draggable` takes a position style as a prop and will pass updates to the child component via a callback.

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
- `style: Object`
An object that defines the initial position of the draggable component. This is a required property. You can pass any of the following styles to it and they'll be passed back out in the callback with every animation tick.
  
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


### Advanced Usage
Want to be able to drag *and* hold a component? You can wrap react-touchable components with other react-touchable components to achieve this. For example:

```javascript
const hold = defineHold({updateEvery: 50, holdFor: 500});
<Holdable onHold={hold(() => console.log('held out'))}>
  <Draggable style={{translateX: 150, translateY: 200}}>
    {({translateX, translateY, holdPercent}) => {
      return (
        <div style={{transform: `translate3d(${translateX}px, ${translateY}px, 0)`}}>
          <Bubble opacity={holdPercent} />
        </div>
      );
    }}
  </Draggable>
</Holdable>
```
