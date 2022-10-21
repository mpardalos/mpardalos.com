+++
title = "Modular typography"
author = ["Michalis Pardalos"]
tags = ["publish"]
draft = false
+++

This is a system for creating harmonious font sizes in a document --- for example a web page.

> 1.  Choose the typeface for the body copy.
> 2.  Choose an appropriate font-size the body copy—usually 16px (100%).
> 3.  Choose an appropriate line-height for the body text—usually between 1.3–1.5 (depending on screen size).
> 4.  Choose a type scale, often based on a musical or other natural scale.
> 5.  Set up the CSS font-sizes, line-heights, and margins to create the rhythm.
> 6.  Create a set of utility classes to be used throughout your design.

The main idea is to pick a base font size, say 16pt, and then a multiplier, say 1.125, usually based on some natural scale. Font sizes are then set up as follows:

16pt -&gt; 1.125 \* 16 -&gt; 1.125 \* 1.125 \* 16 -&gt; ...

You can also go down:

16pt -&gt; 16 / 1.125 -&gt; 16 / 1.125 / 1.125 -&gt; ...

See <https://learn-the-web.algonquindesign.ca/topics/modular-typography/>
