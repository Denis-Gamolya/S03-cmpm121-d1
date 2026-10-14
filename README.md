# Tap Archery

## Description

Tap Archery was created by Charles Lesser and Justin Tran for CMPM121 as the first assignment. It is an incremental game showcasing typescript modularity.

## Development

The dev code of Tap Archery is hosted primarily in three files - index.html, styles.css, and main.ts

### Index.html

Index.html is where the framework of the html page is hosted. It is recommended not to further edit this file unless specific html elements are required. It imports scripts and the style settings. Adding new elements should be handled in main.ts.

### styles.css

Styles is where we define base behavior for the document. Changes here are replicated project-wise. With them, we can easily change the fonts, backdrops, and more.

### main.ts

Main is where the bulk of the program is located. Imports are handled first, with globals and html pulls following. Global variables are used throughout the program and are referenced often.
The UpgradeButton interface ensures buttons hold both html elements and desired stats. Each is initialized with:

- a display element, which is used in conjunction with the other statistics to generate a proper description.
- a cost, which reflects the current cost to upgrade.
- a stat, of which usage differs based on the particular upgrade button. This is referenced at specific points in the code.
- a stage, which is used to calculate cost of next purchase
- an upgrade function, used to perform a particular upgrade. This is also unique per upgrade button.
  This interface is called on as the engine of upgrades and stat checks in the system. These buttons are set appropriately and added to a list for future traversal.
Initially, this interface was represented as an object containing objects, but iteration and meaningful revision turned it into an interface and then moved the activation functions to the initialization.

The backdrop and target are setup based on the global middlepoint, with a random location for the target determined by the radius of the backdrop - set by the upgrade button.

Arrows are drawn on click and remain for as long as the upgrade allows, then they cease. Score is incremented on first click.

As arrows persist, a timer runs and calculates a persistent score based on upgrades, destroying the object at the end of its elapsed time.

Finally, after helper functions, the html objects are added to the app.
