---
layout: post
title: (Perfectly) Elastic Collision Response Between Circles
credits:
  - sethorizer
  - thesauce
  - mrbrown77
  - icebox
  - player_one
---

Intro
=====

Now that I've covered [Circle Collisions]({{ "/2016/12/07/circle-collision.html" | relative_url }}),
I'm going to talk about how to resolve the collisions we've detected. First, we're going to have to
advance the entire simulation until the collision happens, then we're going to adjust the velocities
of both the involved entities. This is called the collision response.

In this post, we're going to talk about elastic collisions, these can also be called totally or
perfectly elastic collisions.

Intuition
=========

For this post, we're going to have to dive into some mechanics. Let's first define a few things:

  - $$ \vec{p} = m\vec{v} $$ is the momentum of an entity of mass $$ m $$ with velocity $$ v $$
  - $$ E_k = \frac{1}{2}m\|\vec{v}\|^2 $$ is the kinetic energy of that entity
  - $$ \vec{J} = \vec{p} - \vec{q} $$ is the impulse (difference in momentum) between momenta $$ q $$ and $$ p $$

In every collision, momentum is conserved, so in a formula where $$ q_i $$ are the momenta before
and $$ p_i $$ are the momenta after the collision:

$$
  q_1 + q_2 + q_3 + \cdots = p_1 + p_2 + p_3 + \cdots
$$

This is an elastic collision, so in addition to momentum, kinetic energy is also conserved:

$$
  E _ {k,1} + E _ {k,2} + E _ {k,3} + \cdots = E _ {k,1,next} + E _ {k,2,next} + E _ {k,3,next} + \cdots
$$

This formula states that no energy will be converted to something else, such as heat or potential
energy.

Here is an animation of a perfectly elastic collision:

<iframe class="sketch" height="120" src="{{ "/sketches/collision-linear-elastic.html" | relative_url }}"></iframe>

On the other side of the spectrum, there are perfectly inelastic collisions, these lose maximal
kinetic energy to other forms of energy. This also has the effect that post-collision the objects
will stick together. Here is an animation of a perfectly inelastic collision:

<iframe class="sketch" height="120" src="{{ "/sketches/collision-linear-inelastic.html" | relative_url }}"></iframe>

Elastic and inelastic collisions are not the only kinds of collisions that exist, there is an entire
spectrum between both. We can model the elasticity of collisions using a restitution coefficient:

$$
  e = R_c = \frac{u_2 - u_1}{v_2 - v_1}
$$

This is a coefficient between $$ 0 $$ and $$ 1 $$ that describes the elasticity of a collision, for
the rest of this post I will assume that all collisions are perfectly elastic, so that $$ e = 1 $$.
You can also view the coefficient of restitution as the "bounciness" of the collision.

In any collision, the impulse is applied along the collision normal, this means that the momentum
vector, and because of that also the velocity vector,  will only change along that normal. This is
illustrated here:

<iframe class="sketch" height="500" src="{{ "/sketches/collision-2d-normal.html" | relative_url }}"></iframe>

This allows us to turn any 2d collision problem into an equivalent 1d problem.

Derivation
==========

Prelude
-------

Let
$$ \begin{align}
  \vec{X _ {1,2}} &= \text{Center positions of both circles} \\
  \vec{U _ {1,2}} &= \text{Initial velocities of both circles} \\
  \vec{V _ {1,2}} &= \text{Eventual velocities of the both circles} \\
  m _ {1,2}       &= \text{Masses of both circles}
\end{align} $$

Since we can turn this into a 1d collision problem along the collision normal, let's first
calculate the normal:

$$
  \vec{n} = \frac{\vec{X_2} - \vec{X_1}}{\| \vec{X_2} - \vec{X_1} \|} \\
$$

Now let's use the dot product to project the velocities onto the collision normal:

$$ \begin{align}
  u _ {1,2} &= \vec{U _ {1,2}} \cdot \vec{n} \\
  v _ {1,2} &= \vec{V _ {1,2}} \cdot \vec{n}
\end{align} $$

Both impulses are equal and opposite
------------------------------------

The law of conservation of momentum states that:

$$ \begin{align}
  q_1 + q_2 &= p_1 + p_2 \\
  m_1 u_1 + m_2 u_2 &= m_1 v_1 + m_2 v_2
\end{align} $$

Rearranging the law of conservation of momentum, we can prove that the impulses on both entities are
indeed equal in magnitude and opposite in direction:

$$ \begin{align}
  m_1 v_1 - m_1 u_1 &= m_2 u_2 - m_2 v_2 \\
  j_1 &= -j_2
\end{align} $$

At collision, an impulse will be applied to both circles, so we can write this as:

$$ \begin{align}
  m_1 v_1 &= m_1 u_1 + j_1 \\
  m_2 v_2 &= m_2 u_2 + j_2
\end{align} $$

Since we know that $$ j_1 = -j_2 $$, we can define $$ j = j_1 = -j_2 $$:

$$ \begin{align}
  m_1 v_1 &= m_1 u_1 + j \\
  m_2 v_2 &= m_2 u_2 - j
\end{align} $$

Finding the magnitude
---------------------

Now we know that we have to find an impulse $$ \vec{J} $$ and that this impulse is applied along the
collision normal, all that's left is to find the magnitude of this $$ J $$, $$ \|\vec{J}\| = j $$.

The kinetic energy along the collision normal is conserved, so we know:

$$
  \frac{m_1}{2} u_1^2 + \frac{m_2}{2} u_2^2 = \frac{m_1}{2} v_1^2 + \frac{m_2}{2} v_2^2
$$

When applying an impulse $$ j $$ to an entity with velocity $$ u $$ and mass $$ m $$, we get:

$$ \begin{align}
  p &= q + j \\
  vm &= um + j \\
  v &= u + \frac{j}{m}
\end{align} $$

We can use this to substitute $$ v _ {1,2} = u _ {1,2} \pm \frac{j}{m} $$:

$$
  \frac{m_1}{2} u_1^2 + \frac{m_2}{2} u_2^2 = \frac{m_1}{2} \left( u_1 + \frac{j}{m_1} \right)^2 + \frac{m_2}{2} \left( u_2 - \frac{j}{m_2} \right)^2
$$

This is an equation with one unknown in $$ j $$, solving this for $$ j $$:

$$ \begin{align}
  \frac{m_1}{2} u_1^2 + \frac{m_2}{2} u_2^2 &= \frac{m_1}{2} \left( u_1 + \frac{j}{m_1} \right)^2 + \frac{m_2}{2} \left( u_2 - \frac{j}{m_2} \right)^2 \\
  m_1 u_1^2 + m_2 u_2^2 &= m_1 \left( u_1 + \frac{j}{m_1} \right)^2 + m_2 \left( u_2 - \frac{j}{m_2} \right)^2 \\
  m_1 u_1^2 + m_2 u_2^2 &= m_1 \left( u_1^2 + 2 u_1 \frac{j}{m_1} + \frac{j^2}{m_1^2} \right) + m_2 \left( u_2^2 - 2 u_2 \frac{j}{m_2} + \frac{j^2}{m_2^2} \right) \\
  m_1 u_1^2 + m_2 u_2^2 &= m_1 u_1^2 + 2 u_1 j + \frac{j^2}{m_1} + m_2 u_2^2 - 2 u_2 j + \frac{j^2}{m_2} \\
  0 &= 2 u_1 j + \frac{j^2}{m_1} - 2 u_2 j + \frac{j^2}{m_2} \\
  0 &= 2j \left(u_1 - u_2\right) + \frac{j^2}{m_1} + \frac{j^2}{m_2} \\
  0 &= 2j \left(u_1 - u_2\right) + \frac{m_2}{m_2} \frac{j^2}{m_1} + \frac{m_1}{m_1} \frac{j^2}{m_2} \\
  0 &= 2j \left(u_1 - u_2\right) + \frac{m_2 j^2}{m_1 m_2} + \frac{m_1 j^2}{m_1 m_2} \\
  0 &= 2j \left(u_1 - u_2\right) + j^2 \frac{m_1 + m_2}{m_1 m_2} \\
  0 &= j \left(2 \left(u_1 - u_2\right) + j \frac{m_1 + m_2}{m_1 m_2} \right) \\
  0 &= 2 \left(u_1 - u_2\right) + j \frac{m_1 + m_2}{m_1 m_2} \\
  - 2 \left(u_1 - u_2\right) &= j \frac{m_1 + m_2}{m_1 m_2} \\
  - 2 \left(u_1 - u_2\right) \frac{m_1 m_2}{m_1 + m_2} &= j \\
  j &= - 2 \left(u_1 - u_2\right) \frac{m_1 m_2}{m_1 + m_2}
\end{align} $$

If you'd rather have it in a form with $$ u_2 - u_1 $$:

$$
  j = 2 \left(u_2 - u_1\right) \frac{m_1 m_2}{m_1 + m_2}
$$

One of the solutions of this equation is 0, which is quite evidently not the answer because there
is a collision response.

And if you're curious about how the coefficient of restitution fits into this:

$$
  j = \left(1 + e\right) \left(u_2 - u_1\right) \frac{m_1 m_2}{m_1 + m_2}
$$

Putting everything together
---------------------------

Putting it all together, we get these equations:

$$ \begin{align}
  \vec{v_1} &= \vec{u_1} + \frac{j}{m_1} \vec{n} \\
  \vec{v_2} &= \vec{u_2} - \frac{j}{m_2} \vec{n}
\end{align} $$

Pseudocode
==========

{% highlight text linenos %}
func collision_response(e1: entity, e2: entity)
  let m1 = e1.mass
  let m2 = e2.mass
  let n = (e2.pos - e1.pos).norm()
  let dv = e2.vel - e1.vel
  let du = dv.dot(n)
  let j = 2 * du * (m1 * m2) / (m1 + m2)
  e1.vel += (j / m1) * n
  e2.vel -= (j / m2) * n
end
{% endhighlight %}

Static Entities
===============

You can model static/unmoving entities as entities with infinite mass:

Let:
$$ \begin{align}
  m _ {1,2} &= \text{Mass of the circles} \\
  u _ {1,2} &= \text{Initial velocities of the circles along the collision normal} \\
  v _ {1,2} &= \text{Eventual velocities of the circles along the collision normal}
\end{align} $$

Then we can solve the limit as $$ m_2 $$ goes to $$ \infty $$:

$$ \begin{align}
  j &= \lim _ { m_2 \rightarrow \infty } \frac{2 m_1 m_2}{m_1 + m_2} \left( u_2 - u_1 \right) \\
    &= 2 m_1 \left( u_2 - u_1 \right) \lim _ { m_2 \rightarrow \infty } \frac{m_2}{m_1 + m_2} \\
    &= 2 m_1 \left( u_2 - u_1 \right) \lim _ { m_2 \rightarrow \infty } \frac{1}{\frac{m_1 + m_2}{m_2}} \\
    &= 2 m_1 \left( u_2 - u_1 \right) \lim _ { m_2 \rightarrow \infty } \frac{1}{\frac{m_1}{m_2} + 1} \\
    &= 2 m_1 \left( u_2 - u_1 \right)
\end{align} $$

This impulse is only applied to one entity.

CodinGame
=========

In physical CodinGame games, the collision response is applied in a two-step fashion, where the
first step is unchanged but the second one has a minimum impulse $$ j _ {min} $$ of whatever the
game defines:

$$ \begin{align}
  j _ {applied} &= \frac{j _ {calc}}{2} + max\left(j _ {min}, \frac{j _ {calc}}{2}\right) \\
                &= max\left(j _ {min} + \frac{j _ {calc}}{2}, \frac{j _ {calc}}{2} + \frac{j _ {calc}}{2}\right) \\
                &= max\left(\frac{j _ {calc}}{2} + j _ {min}, j _ {calc}\right) \\
\end{align} $$

You can pick whichever form you prefer, of course. :)

This means that the law of conservation of momentum is broken for low-impact collisions since
energy gets added in that case.
