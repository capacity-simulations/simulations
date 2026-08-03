L5: Spacetime diagram explorer	
Summary: A 2D spacetime diagram with ct vertical and x horizontal, drawn over a background grid. Students place events on the diagram, draw worldlines for moving objects, and select pairs of events to read off relationships: their (ct, x) coordinates, cΔt, Δx, and whether they are simultaneous (Δt = 0) or at the same location (Δx = 0). A default observer worldline at x = 0 is present.	

Comments:
-See lecture 8 discussion. We don't need two different ST explorers for lecure 5 and 8, really it should just be one sim, with the option to add on layers. It might be the case it makes sense to keep the L8 sim and just hide the spacelike/timelike/null labels for this sim. 

Changes needed: 
- The fonts in this currently are mismatched
- Remove the gray box around the simulation and let it fill the space. 
- Remove E3 -- just having the two events (E1 and E2) and being able to click and move them is sufficient. 
- Remove au units
- Turn off the sweeping ""now ct"" line by default, have it be able to add as an option. 
- Add delta s readout, but do *not* yet include information about time, like space, like null separation.  Display the delta S on the triangle when option ""3 separation"" is selected. "	"- Remove the ""frame S · c = 1"" text. The circle makes it seem like it's a dot product, which it's not, and it's making the sim look glitchy when the two events are made to be simultaneous.
- remove the gray box around this.
- Display the E1 and E2 coordinates on the canvas (beside the point) instead of below the canvas. 
- I think we should remove the ability to add new points. Since there's no way to delete them, I think it's more likely that someone will accidentally create new points and then have to reset the sim, making it less functional. "

L8: Spacetime diagram explorer - Advanced
Summary: Spacetime diagram explorer (from lecture 5)	The lecture 5 sim, with: A default observer worldline at x = 0 is present; a toggle adds light-signal lines from each event to the observer's worldline, displaying both the event's actual t coordinate on the grid and the (later) time at which the observer sees it. Annotate event pairs to state whether they are timelike, lightlike, or spacelike separated	

Comments:
-We should make sure this is visually consistent with the L5 ST explorer -- really it should just be one sim, with the option to add on layers. Maybe it makes sense to keep this one, and add an option to L5 to hide the SL/TL/null labels
- TODO -- I can take a closer look at this and Lecture 5's space-time explorer. I think that it's pretty inefficient to have two different renderings of it as we do currently. And neither actually is quite as clean or visually appealing as other space-time diagrams that we have throughout the course. 

Changes needed:
- for this sim, the layer we want to add on is the ability to select pairs of points and display the spacetime interval and whether they are timelike, null, or spacelike separated
-It's unnecessary to populate with 5 events, start with 2 -- E1 at the origin, E2 placed somewhere. Click and drag the events to see different SL/TL/null separations. 
- The fact that the light cone follows E1 is great -- make sure this stays. 

- The ct and x axes labels should be in their usual spots (ct at the top, x on the right)

L18: Causality misconceptions

Summary:For causality misconceptions, a simulation activity in which students determine the invariant separation of event pairs and predict the frame-dependence (or invariance) of their time ordering, before observing the result	

Comments: This sim might not be used in this lecture, but overlaps a lot with L5 and L8's spacetime explorer's. 
This version (L18) might be good visually to start with as a base (although currently this version has a bit too much text displayed below the sim) 


- v_sim can also be totally removed"