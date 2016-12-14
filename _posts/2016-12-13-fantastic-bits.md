---
layout: post
title: Fantastic Bits Post-Mortem
credits:
  - icebox
  - marktellez
  - sethorizer
  - thesauce
  - mrbrown77
  - cosmo
  - inoryy
---

Intro
=====

Overall impressions
-------------------

I really liked this contest, it didn't seem to be as prone to global optimization via metaheuristics
as many of the other games here, which I think is a good thing because it doesn't force everyone to
jump through hoops to get maximal computational power. I also prefer the physical games like Coders
Strike Back over games like Smash The Code or Hypersonic, because having a continuous space of
possible actions introduces interesting problems of its own, such as how to discretise that space.

At first I thought that not getting the spells as input was a bad thing, but this actually made the
game a lot more interesting because you had to work backwards to find out which spells are in effect.

I'd love to see more games like this, maybe one involving orbital mechanic--

<p style="text-align: center; font-size: 40px; color: #B100FF"> ~ ~ ORBITAL SNAFFLES: ENGAGE ~ ~ </p>

<div class="fiddle"><iframe width="100%" height="550" src="//jsfiddle.net/SwagColoredKitteh/hv1g7enf/embedded/result,js/" allowfullscreen="allowfullscreen" frameborder="0"></iframe></div>

... okay, no, that didn't work very well. At least I tried!

Programming language choice
---------------------------

For this contest, I chose to use the programming language Rust, this is mostly because of personal
tastes, but I can say that it has helped me catch a lot of bugs at compile time. The strict type
system and borrow checker have helped me a lot in preventing otherwise very time-consuming bugs.

I also really prefer modeling my datatypes as ADTs over just records. ADTs make it much more
straightforward to model things like collision types, instead of manually having to specify an int
or string as a discriminant for the different cases, I can just use an ADT like:

{% highlight rust linenos %}
pub enum Collision {
  None, // <- no collision has occured
  Entity(EntityId, EntityId), // <- a collision between two entities has occured, these are
                              //    their ids
  WallRebound(EntityId, bool), // <- an entity is rebounding against the wall, here is that
                               //    entity's id and whether the collision was vertical
  PoleRebound(EntityId, PoleId) // <- an entity is rebounding against a pole, here is that
                                //    entity's id and the pole's id
}
{% endhighlight %}

Simulator
=========

Thrust
------

Thrust logic is done by using [Newton's second law of motion](https://en.wikipedia.org/wiki/Newton%27s_laws_of_motion#Newton.27s_second_law): $$ F = m a $$.

You can rewrite this equation as $$ a = \frac{F}{m} $$, or with vectors
$$ \vec{a} = \frac{\vec{F}}{m} $$. From this we can calculate the resulting acceleration from
applying a force. This means we can write our resulting velocity as:

$$
  \vec{V _ {next}} = \vec{V} + \frac{\vec{a}}{m}
$$

In pseudocode:

{% highlight text linenos %}
func apply_thrust(entity: entity, thrust: vec2)
  entity.vel += thrust * (1 / entity.mass)
end
{% endhighlight %}

Movement
--------

The movement logic is pretty straightforward, you add the speed vector to the movement vector,
multiplied by some timestep $$ t $$. This fast-forwards the simulation $$ t $$ turns.

Put in more mathematical terms:

$$
  \vec{ X _ {next} } = \vec{X} + t\vec{V}
$$

Or in pseudocode:

{% highlight text linenos %}
func fast_forward(sim: sim, t: float)
  for each entity in sim.entities
    entity.pos += t * entity.vel
  end
end
{% endhighlight %}

You can look at the JSFiddle below to see the movement logic. Look at the `fastForward` function in
the `Sim` class, specifically.

At the end of the turn, you also round the position and velocity vectors. The way you do this is
that you round to the closest integer, or if the value is halfway between two integers, to the
integer that is closest to 0.

Collision
---------

The collision logic is a lot more involved than the previous two steps, here we have to first
fast-forward to the next collision, then do the collision response, repeating this until the turn
has ended.

I've already explained two important concepts in collision, in these two blog posts:

  - [Calculating Circle-Circle Collision Time]({{ "/2016/12/07/circle-collision.html" | relative_url }})
  - [(Perfectly) Elastic Collision Response Between Circles]({{ "/2016/12/08/elastic-collision.html" | relative_url }})

This algorithm in pseudocode:

{% highlight text linenos %}
func simulate(sim: sim, target_t: float) -> float
  let t = 0
  let collision = null
  while t < target_t
    let earliest_collision_time = target_t - t
    for each entity e1 in sim.entities
      for each entity e2 in sim.entities, starting at the index of e1 + 1
        coll_t = circle_collision_time(e2.pos - e1.pos, e2.vel - e1.vel, e1.radius + e2.radius)
        if coll_t is not null and coll_t < earliest_collision_time
          earliest_collision_time = coll_t
          collision = (e1, e2)
        end
      end
    end
    fast_forward(sim, earliest_collision_time)
    t += earliest_collision_time
    if collision is not null
      let (e1, e2) = collision
      collision_response(sim, e1, e2)
    end
  end
end
{% endhighlight %}

Wall rebounds can be implemented by also checking whether there is an earlier collision with a wall
and if that's the case, fast-forwarding to that instead, then reflecting the velocity vector either
vertically or horizontally, depending on the direction of the collision.

To get the collision time with some wall, you first calculate your velocity towards that wall, if
this is negative, you're moving away from it and there will be no collision, otherwise you're
moving towards it and will hit the wall at $$ t = \frac{\Delta p}{\Delta v} $$.

After you've fast-forwarded to the earliest collision timee and if it's a wall, all you have to do
is invert the relevant coordinate of the velocity vector.

As for the poles, we can model them as infinite mass objects, so we use the same circle-circle
collision time function, but for the collision response, we adjust the formula so that the pole has
an infinite mass. See the elastic collision response post for more information.

And here's a JSFiddle tying it all together:

<div class="fiddle"><iframe width="100%" height="420" src="//jsfiddle.net/SwagColoredKitteh/seyanrgs/embedded/result,js/" allowfullscreen="allowfullscreen" frameborder="0"></iframe></div>

Spells
------

I've modelled my spell logic using a list called active_spells, all spells get appended except
petrificus, which gets prepended, to respect the order in which spells are applied.

This list contains the caster, the target, the kind of spell, when it was casted and its duration.

At the start of each turn, every spell has a chance to do its magic(heh) and after that may get
deleted from the active spells list. At the end of the turn, the wizard's actions are checked and
spells are added if appropriate and the player has enough mana.

AI
==

High-level planner
------------------

My AI uses very simple high-level planner, which starts all the tree searches, spell simulations
and throw simulations. It is mostly the same as the AI I was using in bronze near the start of the
contest. At first it didn't even do the spell simulation, it used the spell logic from my older AI
until I got around to implementing actual spell simulations.

Movement tree search
--------------------

My AI has a parameter, which is a list of angle counts for the tree searches that have to happen at
specific depths. The AI tries moving at full velocity towards that number of equally spaced angles,
then picks the one that gets it closest to its goal. (there was some additional scoring, but it
mostly just moves to its goal)

For example, the list [16, 8, 4] would tell the AI to try 16 angles at the first level, 8 at the
second level and 4 at the third.

Here's a video showing the movements along the search tree:

<video src="{{ "assets/fb-move.webm" | relative_url }}" controls></video>

Throw simulation
----------------

My AI does throwing simulation by simulating a throw at a number of different, equally spaced
angles, then running the simple AI for a while, then seeing which throw scored best. It then picks
that best-scoring throw.

And here's another video, this time showing the tested throwing trajectories:

<video src="{{ "assets/fb-throw.webm" | relative_url }}" controls></video>

And here's an image of what happens when you crank up the search depth:

<img src="{{ "assets/fb-throw.png" | relative_url }}" />

Spell simulation
----------------

The way my AI does its spell simulation is that it first calculates what would happen if it ran a
simple AI for the number of turns it is searching, then calculates what would happen if it first
did any of 3 spells (flipendo, accio, petrificus) on its current target snaffle, then ran that AI.
If the difference in score is positive and big enough, it casts the highest scoring spell.

Finally, here's a video showing the trajectory of the snaffle when no spell gets cast in white and
the trajectories with spell effects in cyan:

<video src="{{ "assets/fb-spell.webm" | relative_url }}" controls></video>

Hyperparameter Tweaking
=======================

And now for the mad science I did during this contest! :D

Near the end of the contest, I started looking at ways to fine-tune all the hyperparameters my AI
used. My AI was parametrised on things like the depth of movement tree searches, how far to look
ahead for spells and throws, scoring thresholds and decay factors.

Of course, near the end, it got pretty hard to guess these hyperparameters, so I built my own
system for ranking my AIs with different hyperparameters. It used the Elo ranking system because
that was the only one I knew of. The Elo ranking system is also pretty straightforward to implement.

There are of course a few big issues with doing this:

  - Where do I get the computing power? (hint: I did not nearly get enough)
  - The AIs will be biased against fighting various versions of themself, this might not be representative of the set of all AIs.
  - Is the Elo ranking system even adequate for ranking AIs? (the answer to this seems to be no but I might've not tried enough iterations) (Edit: answer seems to be yes, after all, thanks inoryy!)

But hey, it's mad science for a reason!

I don't think this got me a very significant improvement, probably because of the lack of computing
power and time. But it was very fun to do this!

Here's a video of the ranking system in action, the colored lines are individual bots and their
height is their rank. Top line is top rank. In most rounds, the bots only battle against bots that
are close to their rank, but every 30 rounds, it's all vs all.

Since this is rather big, I'm going to link you: [video](https://p.fuwafuwa.moe/ekoted.webm)
