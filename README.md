## Website Performance Optimization portfolio project

This repo contains a project from the Udacity Front-End Web Developer nanodegree aimed at demonstrating mastery in performance optimization.

To get started, check out the repository, inspect the code,

### Getting started
1. Clone the repo

```bash
cd Your/Target/Directory
git clone https://github.com/christopher-taylor/udacity-fend-mobile-portfolio
```

### Optimizations

The pages optimized for performance are [index.html](https://github.com/christopher-taylor/udacity-fend-mobile-portfolio/blob/master/src/index.html) and [pizza.html](pizza.html). index.html has been optimized to achieve a PageSpeed Insights score of 90 on desktop and mobile. pizza.html has been optimized to hit 60FPS.

A list of full optimizations follows:

##### Index.html
1. Used defer to defer the execution of analytics.js and perfmatters.js until the page is loaded.
1. Created a version of pizzeria.jpg that was 100px wide and loaded that instead since the image has a fixed width.
3. Added media print/screen attributes to the css files so the browser only loads what is neeeded to render.

##### views/style.css
1. Added will-change to force the moving pizzas into a seperate layer so we wouldn't repaint the whole page.
2. Added transform: translateZ to engage the GPU for a better framerate.

##### views/js/main.js
1. Added "use strict"; for safer code.
2. Moved the pizzasDiv declaration outside of the for loop to reduce the number of DOM calls and as a result the pages load time.
3. Added latestKnownScrollY and ticking.
5. Created onScroll which when called adds the window.ScrollY to latestKnownScrollY and calls requestTick()
6. Added requestTick so if the browser is not currently working on updatePositions it will request an animation frame and run updatePositions
7. scroll event now triggers onScroll instead of updatePositions.

Changes 3-6 are linked. Combined they have the effect of decouppling updatePositions from the scroll browser event and adds a middleman who detects if we're already processing a frame, and if so just waits. This managed approach to requesting animation frames prevents very long frames from happening when the browser decides to process multiple scroll events and as a result multiple calls to updatePositions in a frame. [Learn more here](http://www.html5rocks.com/en/tutorials/speed/animations/).
	
###### resizePizzas()
1. Get the pizzaSizeElement outside of the switch just to make the code less ugly.
###### changePizzaSizes()
1. Changed elements size to a % instead of a fixed size. As a result determineDx() has been folded into changePizzaSizes and no longer exists
2. Pulled the query selector statement outside of the loop to reduce the number of dom calls and changed if from QueryAll to getElementById for speed.
3. The switch from determineDx has been moved here and made an if block because switches are kind of fugly.
4. We are now determining newWidth outside of the loop since it is the same for all elements and to do it otherwise is bad.
5. Loop changed to a forEach because it looks so much nicer.

###### updatePositions()
1. Added ticking = false, this tells the code that is okay to request another frame.
2. Changed items declaration from querySelectorAll to getElementsByClassName for speed.
3. mathTerm is now determined by using latestKnownScrollY instead of document.body.scrollTop. This eliminates a dom call and is also part of decoupling our scroll animation from the actual scroll input.
4. Phase is delcared outside of the loop to eliminate a variable being created every iteration of the loop.

###### document.addEventListener('DOMContentLoaded')
1. Reduced the number of cols from 8 to 6
2. Added rows which are dynamically determined based on screen height.
3. We are now creating row * cols pizzas instead of 200.
4. Declared the elem variable outside of the loop to remove the declaration from inside the loop.
5. Fetch the movingPizzas1 query outside of the loop to reduce DOM calls and changed it to getElementById for speed.

##### views/pizza.html
1. Added <meta name="viewport" content="width=device-width, minimum-scale=1.0"> to force devices that support GPU rasterization to use it.