---
layout: post
title: Calculating Circle-Circle Collision Time
credits:
  - nikoliazekter
  - sethorizer
  - thesauce
  - cosmo
  - icebox
---

Intro
=====

The simulator is an important part of how I've approached writing my AI for the Fantastic Bits
contest (and many others). Being able to simulate what will happen after throwing, when moving in
a direction or when casting a spell gives your AI the ability to (sometimes inaccurately) see into
the future. This gives your AI much better capabilities for planning ahead. So before my
post-mortem, I would like to discuss how to approach detecting collisions between two moving
circles and resolving these collisions. This is one of the hardest parts of writing a simulator for
games like Fantastic Bits and Coders Strike Back. In this post, I will discuss collisions between
two circles. Two circles are colliding when the distance between their center points is less than
the sum of their radii, which you can see here:

<iframe class="sketch" height="250" src="{{ "/sketches/circle-collision.html" | relative_url }}"></iframe>

You can detect when a collision between two circles will happen by figuring out when the distance
between their center points reaches the sum of their radii.

Prelude
=======

Let
$$ \begin{align}
  P _ {1,2} &= \text{Center points of both circles} \\
  V _ {1,2} &= \text{Velocities of both circles} \\
  R _ {1,2} &= \text{Radii of both circles} \\
  R _ {sum}  &= R_1 + R_2
\end{align} $$

We can describe the position of both center points after time $$ t $$ using the equation from the
Movement section:

$$ \begin{align}
  \vec{P _ {1,next}} &= \vec{P_1} + t \vec{V_1} \\
  \vec{P _ {2,next}} &= \vec{P_2} + t \vec{V_2}
\end{align} $$

What we wish to know is when both points are at a distance of $$ R _ {sum} $$ from eachother:

$$ \begin{align}
  R _ {sum} &= \|\vec{P _ {2,next}} - \vec{P _ {1,next}}\|                                 \\
            &= \|(\vec{P_2} + t \vec{V_2}) - (\vec{P_1} + t \vec{V_1})\| \\
            &= \|\vec{P_2} - \vec{P_1} + t\vec{V_2} - t\vec{V_1} \|      \\
            &= \|\vec{P_2} - \vec{P_1} + t(\vec{V_2} - \vec{V_1}) \|     \\
            &= \|\vec{\Delta P} + t\vec{\Delta V} \|
\end{align} $$


Equation Using Components
=========================

Now we can decompose these into their components:

$$
  \sqrt{ (\vec{\Delta P} _ x + t \vec{\Delta V} _ x)^2 + (\vec{\Delta P} _ y + t \vec{\Delta V} _ y)^2 } = R _ {sum}
$$

We can square both sides to get rid of that pesky square root:

$$
  (\vec{\Delta P} _ x + t \vec{\Delta V} _ x)^2 + (\vec{\Delta P} _ y + t \vec{\Delta V} _ y)^2 = R _ {sum} ^ 2
$$

Then:

$$
  \vec{\Delta P} _ x ^ 2 + 2t \vec{\Delta P} _ x \vec{\Delta V} _ x + t^2 \vec{\Delta V} _ x ^ 2 +
  \vec{\Delta P} _ y ^ 2 + 2t \vec{\Delta P} _ y \vec{\Delta V} _ y + t^2 \vec{\Delta V} _ y ^ 2
  = R _ {sum} ^ 2
$$

Grouping terms:

$$
  \vec{\Delta P} _ x ^ 2 + \vec{\Delta P} _ y ^ 2 +
  2t ( \vec{\Delta P} _ x \vec{\Delta V} _ x + \vec{\Delta P} _ y \vec{\Delta V} _ y ) +
  t^2 ( \vec{\Delta V} _ x ^ 2 + \vec{\Delta V} _ y ^ 2 )
  = R _ {sum} ^ 2
$$

Written differently:

$$
  \vec{\Delta P} _ x ^ 2 + \vec{\Delta P} _ y ^ 2 +
  2t ( \vec{\Delta P} _ x \vec{\Delta V} _ x + \vec{\Delta P} _ y \vec{\Delta V} _ y ) +
  t^2 ( \vec{\Delta V} _ x ^ 2 + \vec{\Delta V} _ y ^ 2 )
  - R _ {sum} ^ 2 = 0
$$

Now, we can use the discriminant method to solve this quadratic equation:
$$
  D = b ^ 2 - 4 a c
$$

Where:
$$ \begin{align}
  a &= \vec{\Delta V} _ x ^ 2 + \vec{\Delta V} _ y ^ 2 \\
  b &= 2 ( \vec{\Delta P} _ x \vec{\Delta V} _ x + \vec{\Delta P} _ y \vec{\Delta V} _ y ) \\
  c &= \vec{\Delta P} _ x ^ 2 + \vec{\Delta P} _ y ^ 2 - R _ {sum} ^ 2
\end{align} $$

When we've solved for $$ D $$, we can get 0, 1 or 2 solutions, we have to pick the minimal one,
because we want the earliest collision.

If $$ D $$ is positive, there are 2 solutions:

$$
  t _ {1,2} = \frac{-b \pm \sqrt{D}}{2a}
$$

If $$ D $$ is 0, there is 1 solution, but it can be described by the equation above because
$$ \sqrt{D} $$ will be 0.

If $$ D $$ is negative, there are no solutions, this means the circles will never overlap. In other
words, no collision.

Because we know $$ a $$ will always be positive, since it is composed of the sum of two squares and
$$ D $$ is positive iff there is a collision, we can change this to:

$$
  t _ {min} = \frac{-b - \sqrt{D}}{2a}
$$

Doing this will give you the smallest time $$ t $$ when the circle perimeters will overlap, if they
will ever.

Equation Using Dot Products
===========================

Thank you sethorizer for enlightening me about this!

An alternative (and I think cleaner) way to solve this is to observe the $$ a $$, $$ b $$ and
$$ c $$ equations and see that these can be rewritten as dot products:

$$ \begin{align}
  a &= \Delta V \cdot \Delta V \\
  b &= 2 ( \vec{\Delta P} \cdot \vec{\Delta V} ) \\
  c &= \Delta P \cdot \Delta P - R _ {sum} ^ 2
\end{align} $$

You can also derive this dot product form another way:

$$ \begin{align}
  \| \vec{\Delta P} + t \vec{\Delta V} \| &= R _ {sum} \\
  (\vec{\Delta P} + t \vec{\Delta V}) \cdot (\vec{\Delta P} + t \vec{\Delta V}) &= R _ {sum} ^ 2 \\
  \vec{\Delta P} \cdot \vec{\Delta P} + \vec{\Delta P} \cdot t\vec{\Delta V} + t\vec{\Delta V} \cdot \vec{\Delta P} + t^2 \vec{\Delta V} \cdot \vec{\Delta V} &= R _ {sum} ^ 2
\end{align} $$

Which you can solve as a quadratic equation.

Pseudocode
==========

Function arguments
------------------

`dp: vec2` = $$ \Delta P $$

`dv: vec2` = $$ \Delta V $$

`radius_sum: float` = $$ R _ {sum} $$

With dot products
-----------------

{% highlight text linenos %}
func circle_collision_time(dp: vec2, dv: vec2, radius_sum: float) -> float
  let radius_sum_squared = radius_sum.pow(2)
  let a = dv.dot(dv)
  let b = 2 * dv.dot(dp)
  let c = dp.dot(dp) - radius_sum_squared
  if b >= 0 # They're moving away from eachother.
    return null
  end
  if c <= 0 # They're already colliding.
    return 0
  end
  let d = b.pow(2) - 4 * a * c
  if d < 0 # No solution to the equation, no collision.
           # They're moving towards eachother but will not collide.
    return null
  end
  return (-b - sqrt(d)) / (2 * a)
end
{% endhighlight %}

With components
---------------

{% highlight text linenos %}
func circle_collision_time(dp: vec2, dv: vec2, radius_sum: float) -> float
  let radius_sum_squared = radius_sum.pow(2)
  let a = dv.x.pow(2) + dv.y.pow(2)
  let b = 2 * (dp.x * dv.x + dp.y * dv.y)
  let c = dp.x.pow(2) + dp.y.pow(2)
  if b >= 0 # They're moving away from eachother.
    return null
  end
  if c <= 0 # They're already colliding.
    return 0
  end
  let d = b.pow(2) - 4 * a * c
  if d < 0 # No solution to the equation, no collision.
           # They're moving towards eachother but will not collide.
    return null
  end
  return (-b - sqrt(d)) / (2 * a)
end
{% endhighlight %}

Possible Improvements
=====================

Not using pow
-------------

It's usually faster to explicitly do `a*a` instead of `a.pow(2)`. Some compilers will optimize
this away, while others will leave the slower operation.

Source: [http://stackoverflow.com/questions/2940367/what-is-more-efficient-using-pow-to-square-or-just-multiply-it-with-itself](https://stackoverflow.com/questions/2940367/what-is-more-efficient-using-pow-to-square-or-just-multiply-it-with-itself)
