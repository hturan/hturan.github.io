---
title:  "Building a Canvas Universe"
---

I've been fascinated by [Steph Thirion](https://twitter.com/stephbysteph)'s game [*Faraway*](http://www.playfaraway.com) ever since it was entered into Kokoromi's GAMMA IV competition back in 2010. GAMMA IV was a game-making competition with the constraint that all games must use only a single button, spurred on by the popularity and limitations of mobile gaming.

Most single-button games are games of reaction and timing, such as avoiding obstacles by pressing a button to jump whilst moving autonomously. *Faraway* however allows the player to navigate a space in any direction at any velocity by utilizing external forces, in this case the gravitational forces exerted by planets. Being able to navigate a player character using a single button really broadens the types of games we can make with simple control restraints.

In this article I'll walk through creating a similar control system in browser, using the HTML5 Canvas API as a renderer. A bit less exotic than the far-reaches of space, but we'll make do.

## What are we building?
An important first question!

By the end of this article, we’ll have built a full-screen browser experience that allows us to control a player object through a field of stars. The player will be controlled by pressing a button on the keyboard, which will cause gravitational forces between the player and the nearest star to activate, as long as the button is held. When the button is released, the player object maintains its velocity, alowing it to swing from star to star with a tap of the keyboard.

The closest star to the player will be outlined in grey, and the  currently selected star will be outlined in red.

![]({{ site.url }}/assets/images/building-universe-canvas/1.png)

## Canvas Boilerplate
When starting any HTML5 Canvas project, there's some boilerplate to get out of the way. If you've never worked with the `canvas` element before, it's worth taking a look at the [MDN tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial), which will cover nearly everything you'll need to know. My standard boilerplate is as follows:

```js
var canvas = document.getElementById("container");
var ctx = canvas.getContext('2d');

canvas.width = window.innerWidth * window.devicePixelRatio;
canvas.height = window.innerHeight * window.devicePixelRatio;

canvas.style.width = window.innerWidth + 'px';
canvas.style.height = window.innerHeight + 'px';

ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
```

Given an HTML document containing a `<canvas id="container"></canvas>`, the above will get our standard context and scale it to match our device's screen width and pixel ratio (allowing for easy retina support).

## Stars and Players
Canvas is what’s known as an *immidiate mode* context, which means that draw calls stack on top of each other and there’s no way to reference drawn paths. The easiest way to handle this is to wipe the canvas context on each frame and re-render from a stored state.

To render the game state from scratch on each render pass, we'll need to have a representation of the entire game state at any point in time. To help achieve this, we'll store our game objects using plain old JavaScript objects. This allows us to render our game state from a set of structured data, rather than relying on shifting values and render methods. Whilst in this article we’ll be mutating the stored objects, in the future we could make these objects immutable, which would help avoid any accidental changes.

In our universe, we have two key concepts: a `player`, and some `stars`. A `player` is what the user will interact with, to navigate around our universe of `stars`. Here's what a player will look like:

```js
{
  // The player’s current position, start in the center
  position: {x: canvas.width / 2, y: canvas.height / 2},

  // The player’s current motion vector
  motionVector: {x: 0, y: 0},

  // The closest and selected star objects
  closestStar: null,
  selectedStar: null,

  // The player’s recent positions, used to render the trail
  recentPositions: []
}
```

and here’s what a star will look like:

```js
{
  // The star’s current position
  position: {
    x: (Math.random() - 0.5) * canvas.width * 8,
    y: (Math.random() - 0.5) * canvas.height * 8
  },
 
  // The star’s radius
  radius: Math.random() + 0.4

  // The distance between this star and the player (useful for debug displays)
  distance: null
}
```

## Universe Creation
As the saying goes, if you wish to make a universe from scratch, you must first write some `for` loops.

To make things interesting and new each time we play, we'll make use of JavaScript's `Math.random()` function, which spits out a pseudo-random number between 0 and 1. Using the above example of a `star`, you can see how easy it would be to seed the universe with 5,000 stars:

```js
var stars = [];
for (var i = 0; i < 5000; i += 1) {      
  stars.push({
    position: {
      x: (Math.random() - 0.5) * canvas.width * 8,
      y: (Math.random() - 0.5) * canvas.height * 8
    },
    distance: null,
    radius: Math.random() + 0.4
  });
}
```

The randomness in position values comes from `Math.random() - 0.5`, which will result in values ranging from -0.5 to 0.5. We then multiply these values by `canvas.width` and `canvas.height` to create `x` and `y` offsets relative to the `canvas`, and then multiply by an arbitrary value (in this case, `8`) to scatter them far and wide.

![]({{ site.url }}/assets/images/building-universe-canvas/2.png)

## Rendering
At this point, we have some stars and a player, but we can’t see them (outside of the JavaScript console, that is). Let’s render them to the screen and see what we get.

Since we’re using plain JavaScript objects, the best and most memory-efficient approach would be to use separate `renderStar` and `renderPlayer` functions. We could store these functions inside of the objects themselves (allowing us to call `star.render()`), but this would mean a separate function instance for each star, which would eat up memory quickly. By using pure data, we can take a functional approach and pass objects around and render them without any side effects.

For a player:

```js
function renderPlayer(player) {
  // Update the player's recent position
  player.recentPositions.push({x: player.position.x, y: player.position.y});

  // Trim down the recent positions array to limit the trail length
  if (player.recentPositions.length > 20) {
    player.recentPositions.shift();
  }

  // Set our player color
  ctx.fillStyle = "#F24E45";

  // Draw the player body
  ctx.beginPath();
  ctx.arc(
    player.position.x - cameraPosition.x,
    player.position.y - cameraPosition.y,
    5,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Draw the player trail
  ctx.strokeStyle = "#F24E45";
  ctx.beginPath();
  for (var i = 0; i < player.recentPositions.length; i += 1) {
    ctx.lineTo(
      player.recentPositions[i].x - cameraPosition.x,
      player.recentPositions[i].y - cameraPosition.y
    );
  }
  ctx.stroke();
}
```

and for a star:

```js
function renderStar(star) {
  ctx.fillStyle = "white";

  // Draw star body
  ctx.beginPath();
  ctx.arc(
    star.position.x - cameraPosition.x,
    star.position.y - cameraPosition.y,
    3 * star.radius,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Draw 'closest' border if we're not currently selected
  if (star === player.closestStar && star !== player.selectedStar) {
    ctx.strokeStyle = "#2F3343";
    ctx.setLineDash([5, 3]);

    ctx.beginPath();
    ctx.arc(
      star.position.x - cameraPosition.x,
      star.position.y - cameraPosition.y,
      40,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }

  // Draw 'selected' border
  if (star === player.selectedStar) {
    ctx.strokeStyle = "#F24E45";
    ctx.setLineDash([5, 3]);

    ctx.beginPath();
    ctx.arc(
      star.position.x - cameraPosition.x,
      star.position.y - cameraPosition.y,
      40,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }
}
```

There’s not too much complexity in the above functions. `arc()` takes five arguments: `x, y, radius, startAngle, endAngle`, with `Math.PI * 2` being a full circle. For our player’s trail, we can loop over each of our stored `recentPositions` and use `lineTo` to draw a line between them.

## Gravitational Forces
At this point we have a universe! Unfortunately, our universe is lifeless. Let's build the gravitational forces and control methods that will allow us to glide around the universe in style. Time for some high school physics!

[Newton's law of universal gravitation](https://en.wikipedia.org/wiki/Newton%27s_law_of_universal_gravitation) states that `F = (G * m1 * m2) / r^2)`, where `F` is the force between the two masses, `G` is the gravitational constant, `m1` and `m2` are the masses, and `r` is the distance between the two masses.

Now, beacuse we’re creating our own universe, we can ignore `G`.  The gravitational constant exists to link meters to kilograms to newtons, but because we’re in a made-up space, we can use whatever works for us. This leaves us with `F = (m1 * m2) / r^2`.

Since `r` is the distance between the two points, we can use simple trigonometry: `r = Math.sqrt(Math.pow(px-x, 2) + Math.pow(py-y, 2))`.

```js
function calculateGravitationalForce(x, y, m, px, py, pm){
  // Calculate the distance between our two points
  var r = Math.sqrt(Math.pow(px-x, 2) + Math.pow(py-y, 2));

  // Gravitational force = (m1 * m2) / r^2
  var f = (m * pm)/Math.pow(r, 2);

  // Split the force proportionally into x and y axes
  return {
    x: f * ((px-x) / r),
    y: f * ((py-y) / r)
  };
}
```

What we’re going for here isn’t accuracy or technical correctness, but more for good [game feel](https://en.wikipedia.org/wiki/Game_feel). Play around with the values and calculations to add damping and limiting.

![]({{ site.url }}/assets/images/building-universe-canvas/3.png)

## Event Listeners / Control
As per our original outline, we’ll be controlling our player object using a single button. To do this, we’ll add an event listener to the window, watching for `keydown` and `keyup` events.

```js
document.addEventListener('keydown', function () {
  if (!player.selectedStar) {
    player.selectedStar = player.closestStar;
  }
});

document.addEventListener('keyup', function () {
  player.selectedStar = null;
});
```

That’s about as simple as event listeners get. That’s one benefit of simple control schemes: *simple control scheme code*.

## Game Loop
Thanks to [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame), creating a game loop is super simple. [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) works by passing a function that will be called before the next browser repaint. Usually, this means that your function will be called sixty times per second. Our calculations should take much less than 16.6ms, so we’ll have a smooth 60 FPS experience.

We’ll kick of the game by calling an `update` function:

```js
function update () {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update star distances
  closestStar = stars[0];
  for (var i = 0; i < stars.length; i += 1) {
    var star = stars[i];

    // Update star distance
    star.distance = Math.sqrt(Math.pow(player.position.x-star.position.x, 2) + Math.pow(player.position.y - star.position.y, 2));

    if (star.distance < closestStar.distance) {
      closestStar = star;
    }
  }

  // Set the player's closest star
  player.closestStar = closestStar;

  // If we've got a selected star, apply forces
  if (player.selectedStar) {
    // Update player position      
    gravitationalForce = calculateGravitationalForce(player.position.x, player.position.y, player.selectedStar.position.x, player.selectedStar.position.y, 10000, 10000);

    // Apply gravitational force to player's motion
    player.motionVector.x += gravitationalForce.x;
    player.motionVector.y += gravitationalForce.y;
  }

  // Update the player's position based on motion
  player.position.x += player.motionVector.x/4;
  player.position.y += player.motionVector.y/4;

  // Center the camera on the player
  cameraPosition = {
    x: player.position.x - (canvas.width/2),
    y: player.position.y - (canvas.height/2)
  };

  // Render the player
  renderPlayer(player);

  // Render stars
  for (var i = 0; i < stars.length; i += 1) {
    renderStar(stars[i]);
  }

  // Request our next update
  requestAnimationFrame(update);
}
```

There’s a bit to digest in there. In order, we:

- Clear the canvas, ready to render our new game state
- Update each star to store the distance between it and the player
- Set the player’s closest star
- If we’ve got a selected star (a button is pressed), apply gravitational forces to the player’s motion vector
- Update the player’s position based on their motion
- Move the camera to the new player position
- Render the player
- Render each star
- Request the next game update

## Conclusion
We've built a universe! But there's plenty left to do:

### Infinity, and beyond
Universes tend to go on for a long, long time. It's quite easy to hit the edge of ours, as optimisation isn't as fun as creation. Updating 

### Game feel
The current gravitational force implementation is by no means perfect. We should account for the fact that stars aren’t affected by gravitational forces and prioritise how it feels to fly around the universe.

### Performance
Our render pass attempts to draw all stars, but only a few are in view at any point. There should be a simple bounds check when rendering our multiple star instances, checking to see if the star is in view.

### Variety
We've played with varying star size, but there's so much more we can do. Add a randomly-generated `color` property to the star instances and create a colorful universe to explore. Give each `Star` a different gravitational pull, or calculate it based on size. Create solar systems! Implement collision!

I'm sure I'll be doing a few of these as I find the time. Follow along at [hturan/space](https://github.com/hturan/space) on GitHub to see how things progress.

---

Maybe one day we'll be able to play in *Faraway*'s universe. But until that day comes, we can build our own.
